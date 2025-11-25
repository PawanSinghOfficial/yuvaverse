import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const groups = await ctx.db.query("groups").collect();
    return await Promise.all(groups.map(async (g) => {
      let imageUrl = null;
      if (g.image) {
        imageUrl = await ctx.storage.getUrl(g.image);
      }
      return { ...g, imageUrl };
    }));
  },
});

export const get = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.id);
    if (!group) return null;
    let imageUrl = null;
    if (group.image) {
      imageUrl = await ctx.storage.getUrl(group.image);
    }
    return { ...group, imageUrl };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
    type: v.union(v.literal("study"), v.literal("social")),
    isPrivate: v.boolean(),
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (args.isPrivate && !args.password) {
      throw new Error("Password required for private groups");
    }

    const groupId = await ctx.db.insert("groups", {
      ...args,
      creatorId: user._id,
    });

    await ctx.db.insert("group_members", {
      groupId,
      userId: user._id,
      role: "admin",
    });

    return groupId;
  },
});

export const join = mutation({
  args: { 
    groupId: v.id("groups"),
    password: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (group.isPrivate) {
      if (group.password !== args.password) {
        throw new Error("Incorrect password");
      }
    }

    // Check if already a member using by_user index which is likely more efficient for this check
    const existing = await ctx.db
      .query("group_members")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .first();

    if (existing) throw new Error("Already a member");

    await ctx.db.insert("group_members", {
      groupId: args.groupId,
      userId: user._id,
      role: "member",
    });
  },
});

export const getUserMemberships = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("group_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("group_members")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
    
    const users = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return { 
          ...member, 
          user: {
            ...user,
            name: user?.username || user?.name // Use username if available
          }
        };
      })
    );
    
    return users;
  },
});

export const getMessages = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(50);

    const now = Date.now();
    const activeMessages = messages.filter((msg) => !msg.expiresAt || msg.expiresAt > now);

    return await Promise.all(
      activeMessages.map(async (msg) => {
        let contentUrl = undefined;
        if (msg.type === "audio" || msg.type === "image") {
          try {
            contentUrl = await ctx.storage.getUrl(msg.content as Id<"_storage">);
          } catch (e) {
            contentUrl = null;
          }
        }
        return {
          ...msg,
          contentUrl,
        };
      }),
    );
  },
});

export const sendMessage = mutation({
  args: {
    groupId: v.id("groups"),
    content: v.string(),
    type: v.string(),
    expiresInMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    let expiresAt: number | undefined;
    if (args.expiresInMinutes && args.expiresInMinutes > 0) {
      if (group.type !== "study") {
        throw new Error("Disappearing messages are only available in study groups");
      }
      const clampedMinutes = Math.min(args.expiresInMinutes, 60 * 24);
      expiresAt = Date.now() + clampedMinutes * 60 * 1000;
    }

    const { expiresInMinutes, ...message } = args;

    await ctx.db.insert("messages", {
      ...message,
      userId: user._id,
      seenBy: [user._id],
      expiresAt,
    });

    // Award points for participation
    const currentPoints = user.points || 0;
    await ctx.db.patch(user._id, { points: currentPoints + 1 });
  },
});

export const markAsRead = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    const seenBy = message.seenBy || [];
    if (!seenBy.includes(userId)) {
      await ctx.db.patch(args.messageId, {
        seenBy: [...seenBy, userId],
      });
    }
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    if (group.creatorId !== userId) {
      throw new Error("Only the creator can update the group");
    }

    const updates: any = {};
    if (args.name) updates.name = args.name;
    if (args.description) updates.description = args.description;
    if (args.image) updates.image = args.image;

    await ctx.db.patch(args.groupId, updates);
  },
});
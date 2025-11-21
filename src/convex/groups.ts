import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("groups").collect();
  },
});

export const get = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
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

    const existing = await ctx.db
      .query("group_members")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .first();

    if (existing) throw new Error("Already a member");

    await ctx.db.insert("group_members", {
      groupId: args.groupId,
      userId: user._id,
      role: "member",
    });
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
    return await ctx.db
      .query("messages")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(50);
  },
});

export const sendMessage = mutation({
  args: {
    groupId: v.id("groups"),
    content: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.insert("messages", {
      ...args,
      userId: user._id,
    });
    
    // Award points for participation
    const currentPoints = user.points || 0;
    await ctx.db.patch(user._id, { points: currentPoints + 1 });
  },
});
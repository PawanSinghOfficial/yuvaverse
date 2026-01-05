import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: { college: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let groups;
    if (args.college && args.college !== "All") {
      groups = await ctx.db
        .query("groups")
        .withIndex("by_college", (q) => q.eq("college", args.college))
        .collect();
    } else {
      groups = await ctx.db.query("groups").collect();
    }

    return await Promise.all(groups.map(async (g) => {
      let imageUrl = null;
      if (g.image) {
        imageUrl = await ctx.storage.getUrl(g.image);
      }
      const members = await ctx.db.query("group_members")
        .withIndex("by_group", (q) => q.eq("groupId", g._id))
        .collect();
        
      return { 
        ...g, 
        imageUrl,
        members: members.map(m => m.userId),
        xp: g.xp || 0
      };
    }));
  },
});

export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const memberships = await ctx.db
      .query("group_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
      
    return memberships.map(m => m.groupId);
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
    college: v.optional(v.string()),
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
        if (msg.type === "audio" || msg.type === "image" || msg.type === "video") {
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
    college: v.optional(v.string()),
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
    if (args.college) updates.college = args.college;

    await ctx.db.patch(args.groupId, updates);
  },
});

export const removeMember = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    const requesterMembership = await ctx.db
      .query("group_members")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .first();

    const isCreator = group.creatorId === userId;
    const isAdmin = requesterMembership?.role === "admin";

    if (!isCreator && !isAdmin) {
      throw new Error("Unauthorized");
    }

    const targetMembership = await ctx.db
      .query("group_members")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .first();

    if (!targetMembership) throw new Error("Member not found");

    if (targetMembership.userId === group.creatorId) {
        throw new Error("Cannot remove creator");
    }

    if (isAdmin && !isCreator) {
        if (targetMembership.role === "admin") {
            throw new Error("Admins cannot remove other admins");
        }
    }

    await ctx.db.delete(targetMembership._id);
  },
});

export const report = mutation({
  args: { 
    groupId: v.id("groups"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    const reports = group.reports || [];
    if (reports.includes(userId)) {
      throw new Error("You have already reported this group");
    }

    // Add to group_reports table
    await ctx.db.insert("group_reports", {
      groupId: args.groupId,
      reporterId: userId,
      reason: args.reason,
    });

    // Update groups table reports array
    await ctx.db.patch(args.groupId, {
      reports: [...reports, userId],
    });
  },
});

export const getReportedGroups = query({
  args: {},
  handler: async (ctx) => {
    const groups = await ctx.db.query("groups").collect();
    const reportedGroups = groups.filter(g => g.reports && g.reports.length > 0);

    return await Promise.all(reportedGroups.map(async (g) => {
      const reports = await ctx.db
        .query("group_reports")
        .withIndex("by_group", q => q.eq("groupId", g._id))
        .collect();
      
      // Get reporter names
      const reportsWithNames = await Promise.all(reports.map(async (r) => {
        const reporter = await ctx.db.get(r.reporterId);
        return {
          ...r,
          reporterName: reporter?.name || reporter?.username || "Unknown",
        };
      }));

      return {
        ...g,
        detailedReports: reportsWithNames,
      };
    }));
  },
});

export const dismissReports = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    // Clear reports from group
    await ctx.db.patch(args.groupId, {
      reports: [],
    });

    // Delete from group_reports
    const reports = await ctx.db
      .query("group_reports")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect();

    for (const r of reports) {
      await ctx.db.delete(r._id);
    }
  },
});

export const deleteGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") throw new Error("Unauthorized");

    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");

    const reportCount = group.reports?.length || 0;
    if (reportCount < 2 && group.creatorId !== userId) {
       throw new Error("Cannot delete group unless reported twice or you are the creator");
    }

    const members = await ctx.db
      .query("group_members")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
    
    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    // Delete reports
    const reports = await ctx.db
      .query("group_reports")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const r of reports) {
      await ctx.db.delete(r._id);
    }

    await ctx.db.delete(args.groupId);
  },
});
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

const HEARTBEAT_TIMEOUT = 10000; // 10 seconds
const LIBRARY_TIMEOUT = 60000; // 1 minute for library presence

export const heartbeat = mutation({
  args: {
    groupId: v.id("groups"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_group", (q) => 
        q.eq("userId", userId).eq("groupId", args.groupId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: Date.now(),
        isTyping: args.isTyping,
      });
    } else {
      await ctx.db.insert("presence", {
        userId,
        groupId: args.groupId,
        updatedAt: Date.now(),
        isTyping: args.isTyping,
      });
    }
  },
});

export const getGroupPresence = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const recentPresence = await ctx.db
      .query("presence")
      .withIndex("by_group_updated", (q) => 
        q.eq("groupId", args.groupId).gt("updatedAt", now - HEARTBEAT_TIMEOUT)
      )
      .collect();

    // Enrich with user data (avatar)
    const presenceWithUser = await Promise.all(
      recentPresence.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          ...p,
          user: user ? {
            _id: user._id,
            name: user.name,
            username: user.username,
            image: user.image,
          } : null,
        };
      })
    );

    return presenceWithUser.filter(p => p.user !== null);
  },
});

// --- Focus Mode / Library Presence ---

export const updateFocusPresence = mutation({
  args: {
    status: v.union(v.literal("focusing"), v.literal("break"), v.literal("idle")),
    focusDuration: v.optional(v.number()),
    startTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query("focus_presence")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: Date.now(),
        status: args.status,
        focusDuration: args.focusDuration,
        startTime: args.startTime,
      });
    } else {
      await ctx.db.insert("focus_presence", {
        userId,
        updatedAt: Date.now(),
        status: args.status,
        focusDuration: args.focusDuration,
        startTime: args.startTime,
      });
    }

    // Update Daily Quest if status is focusing
    if (args.status === "focusing") {
      await ctx.scheduler.runAfter(0, internal.quests.updateProgress, {
        userId,
        questType: "join_library",
        increment: 1,
      });
    }
  },
});

export const getLibraryUsers = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const activeUsers = await ctx.db
      .query("focus_presence")
      .withIndex("by_updated", (q) => q.gt("updatedAt", now - LIBRARY_TIMEOUT))
      .collect();

    const usersWithInfo = await Promise.all(
      activeUsers.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return {
          ...p,
          user: user ? {
            _id: user._id,
            name: user.name,
            image: user.image,
            username: user.username,
          } : null
        };
      })
    );

    return usersWithInfo.filter((u) => u.user !== null);
  },
});
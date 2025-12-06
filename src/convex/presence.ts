import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const HEARTBEAT_TIMEOUT = 10000; // 10 seconds

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
            avatarConfig: user.avatarConfig,
            image: user.image,
          } : null,
        };
      })
    );

    return presenceWithUser.filter(p => p.user !== null);
  },
});

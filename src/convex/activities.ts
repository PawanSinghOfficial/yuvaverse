import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const log = internalMutation({
  args: {
    type: v.string(),
    data: v.object({
        gameId: v.optional(v.string()),
        score: v.optional(v.number()),
        resourceId: v.optional(v.id("resources")),
        resourceTitle: v.optional(v.string()),
        duration: v.optional(v.number()),
        questCount: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    
    await ctx.db.insert("friend_activities", {
        userId,
        type: args.type,
        data: args.data,
        timestamp: Date.now(),
    });
  },
});

export const getFeed = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get friends
    const friendships = await ctx.db
        .query("friends")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
    
    const friendIds = friendships.map(f => f.friendId);
    
    if (friendIds.length === 0) return [];

    // Get activities for each friend (limit 5 per friend to keep it fast)
    const activities = await Promise.all(friendIds.map(async (fid) => {
        return await ctx.db
            .query("friend_activities")
            .withIndex("by_user_timestamp", (q) => q.eq("userId", fid))
            .order("desc")
            .take(5);
    }));

    // Flatten and sort
    const allActivities = activities.flat().sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

    // Enrich with user info
    return await Promise.all(allActivities.map(async (act) => {
        const user = await ctx.db.get(act.userId);
        return {
            ...act,
            user: {
                name: user?.username || user?.name || "Unknown",
                image: user?.image,
            }
        };
    }));
  },
});

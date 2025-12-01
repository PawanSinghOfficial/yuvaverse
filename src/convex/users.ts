import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const startOfDay = (timestamp: number) => {
  const day = new Date(timestamp);
  day.setHours(0, 0, 0, 0);
  return day.getTime();
};

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateAvatar = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Failed to get image URL");

    await ctx.db.patch(userId, { image: url });
  },
});

export const setUsername = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Check uniqueness
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();
    
    if (existing && existing._id !== userId) {
      throw new Error("Username already taken");
    }

    await ctx.db.patch(userId, { username: args.username });
  },
});

export const syncAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    
    const user = await ctx.db.get(userId);
    if (!user) return;

    if (user.email === "placementandinternships4u@gmail.com" && user.role !== "admin") {
      await ctx.db.patch(userId, { role: "admin" });
    }
  },
});

export const redeemPoints = mutation({
  args: { plan: v.union(v.literal("premium"), v.literal("elite")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const cost = args.plan === "premium" ? 500 : 1000;
    const currentPoints = user.points || 0;

    if (currentPoints < cost) {
      throw new Error("Insufficient points");
    }

    await ctx.db.patch(userId, {
      points: currentPoints - cost,
      tier: args.plan,
    });
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => (u.points || 0) > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
      .map(u => ({
        name: u.username || u.name || "Anonymous",
        points: u.points || 0,
        image: u.image
      }));
  },
});

export const updateStreak = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const today = startOfDay(Date.now());
    const lastActive =
      typeof user.lastActiveDate === "number" ? startOfDay(user.lastActiveDate) : undefined;

    let streak = user.streakCount || 0;
    let shouldPatch = false;
    let increased = false;

    if (lastActive === undefined) {
      streak = 1;
      shouldPatch = true;
      increased = true;
    } else {
      const diffDays = Math.floor((today - lastActive) / DAY_IN_MS);

      if (diffDays === 0) {
        if (user.lastActiveDate !== today) {
          shouldPatch = true;
        }
      } else if (diffDays === 1) {
        streak += 1;
        shouldPatch = true;
        increased = true;
      } else if (diffDays > 1) {
        streak = 1;
        shouldPatch = true;
        // Resetting streak is not an "increase", so increased stays false
      }
    }

    if (shouldPatch) {
      await ctx.db.patch(userId, {
        streakCount: streak,
        lastActiveDate: today,
      });
    }
    
    return { increased, streak };
  },
});

export const completePomodoroSession = mutation({
  args: { durationMinutes: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Award 2 points for completion of pomodoro timer
    const pointsEarned = 2;
    const currentCompleted = user.pomodoroSessionsCompleted || 0;
    const currentPoints = user.points || 0;

    await ctx.db.patch(userId, {
      points: currentPoints + pointsEarned,
      pomodoroSessionsCompleted: currentCompleted + 1,
    });
    
    return pointsEarned;
  },
});

export const abortPomodoroSession = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const currentAborted = user.pomodoroSessionsAborted || 0;
    await ctx.db.patch(userId, {
      pomodoroSessionsAborted: currentAborted + 1,
    });
  },
});

export const completeOnboarding = mutation({
  args: { },
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    await ctx.db.patch(userId, { hasSeenOnboarding: true });
  },
});

export const recordGameResult = mutation({
  args: {
    gameId: v.string(),
    score: v.optional(v.number()),
    win: v.optional(v.boolean()),
    difficulty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Points system based on difficulty
    let winPoints = 10;
    let participationPoints = 2;

    if (args.difficulty === "easy") {
      winPoints = 5;
      participationPoints = 1;
    } else if (args.difficulty === "hard") {
      winPoints = 20;
      participationPoints = 5;
    }

    // Points system: winPoints for a win, participationPoints for playing/participation
    const pointsAwarded = args.win ? winPoints : participationPoints;
    const currentPoints = user.points || 0;
    
    let patchData: any = {
      points: currentPoints + pointsAwarded,
      totalGamesPlayed: (user.totalGamesPlayed || 0) + 1,
    };

    if (args.win) {
      patchData.totalGamesWon = (user.totalGamesWon || 0) + 1;
    }

    // Update High Scores
    if (args.gameId === "snake" && args.score !== undefined) {
      if (args.score > (user.snakeHighScore || 0)) {
        patchData.snakeHighScore = args.score;
      }
    }
    
    if (args.gameId === "math" && args.score !== undefined) {
      if (args.score > (user.mathHighScore || 0)) {
        patchData.mathHighScore = args.score;
      }
    }

    await ctx.db.patch(userId, patchData);
    
    return { 
      pointsAwarded, 
      newHighScore: args.gameId === "snake" ? patchData.snakeHighScore : 
                    args.gameId === "math" ? patchData.mathHighScore : undefined
    };
  },
});
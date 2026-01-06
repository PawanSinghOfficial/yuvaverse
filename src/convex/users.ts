import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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

export const updateProfile = mutation({
  args: {
    branch: v.optional(v.string()),
    college: v.optional(v.string()),
    year: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    await ctx.db.patch(userId, {
      branch: args.branch,
      college: args.college,
      year: args.year,
    });
  },
});

export const syncAdminRole = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;
    
    const user = await ctx.db.get(userId);
    if (!user) return;

    const adminEmails = ["placementandinternships4u@gmail.com", "codedbypawan@gmail.com"];

    if (user.email && adminEmails.includes(user.email) && user.role !== "admin") {
      await ctx.db.patch(userId, { role: "admin" });
    }
  },
});

export const redeemGems = mutation({
  args: { plan: v.union(v.literal("premium"), v.literal("elite")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const cost = args.plan === "premium" ? 500 : 1000;
    const currentGems = user.gems || 0;

    if (currentGems < cost) {
      throw new Error("Insufficient gems");
    }

    await ctx.db.patch(userId, {
      gems: currentGems - cost,
      tier: args.plan,
    });
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => (u.gems || 0) > 0)
      .sort((a, b) => (b.gems || 0) - (a.gems || 0))
      .slice(0, 10)
      .map(u => ({
        _id: u._id,
        name: u.username || u.name || "Anonymous",
        gems: u.gems || 0,
        image: u.image,
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

    // No gems for pomodoro - only arcade games and resource uploads earn gems
    const currentCompleted = user.pomodoroSessionsCompleted || 0;

    await ctx.db.patch(userId, {
      pomodoroSessionsCompleted: currentCompleted + 1,
    });

    // Update Daily Quest
    await ctx.scheduler.runAfter(0, internal.quests.updateProgress, {
        userId,
        questType: "pomodoro",
        increment: 1
    });

    // Log Activity
    await ctx.scheduler.runAfter(0, internal.activities.log, {
        type: "pomodoro_session",
        data: { duration: args.durationMinutes }
    });

    return 0; // No gems earned
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

    // New gems system: Only award gems for 5 consecutive wins
    const currentConsecutiveWins = user.consecutiveWins || 0;
    const currentGems = user.gems || 0;
    let gemsAwarded = 0;
    let newConsecutiveWins = currentConsecutiveWins;

    if (args.win) {
      newConsecutiveWins = currentConsecutiveWins + 1;

      // Award 10 gems for every 5 consecutive wins
      if (newConsecutiveWins >= 5) {
        gemsAwarded = 10;
        newConsecutiveWins = 0; // Reset counter after awarding gems
      }
    } else {
      // Reset consecutive wins on loss
      newConsecutiveWins = 0;
    }

    let patchData: any = {
      gems: currentGems + gemsAwarded,
      consecutiveWins: newConsecutiveWins,
      totalGamesPlayed: (user.totalGamesPlayed || 0) + 1,
    };

    if (args.win) {
      patchData.totalGamesWon = (user.totalGamesWon || 0) + 1;
    }

    // Track High Scores (no gems bonus)
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

    // Update Daily Quests
    await ctx.scheduler.runAfter(0, internal.quests.updateProgress, {
        userId,
        questType: "any_game", // For "Play 3 Games"
        increment: 1
    });

    if (args.win) {
        await ctx.scheduler.runAfter(0, internal.quests.updateProgress, {
            userId,
            questType: `${args.gameId}_win`,
            increment: 1
        });
    }

    // Log Activity if High Score
    const isNewHighScore = (args.gameId === "snake" && args.score !== undefined && args.score > (user.snakeHighScore || 0)) ||
                           (args.gameId === "math" && args.score !== undefined && args.score > (user.mathHighScore || 0));

    if (isNewHighScore && args.score !== undefined) {
        await ctx.scheduler.runAfter(0, internal.activities.log, {
            type: "game_highscore",
            data: { gameId: args.gameId, score: args.score }
        });
    }

    return {
      gemsAwarded,
      consecutiveWins: newConsecutiveWins,
      newHighScore: args.gameId === "snake" ? patchData.snakeHighScore :
                    args.gameId === "math" ? patchData.mathHighScore : undefined
    };
  },
});

export const getUserInternal = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
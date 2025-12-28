import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const QUEST_TYPES = [
  { type: "pomodoro", title: "Complete a Focus Session", target: 1, xp: 20 },
  { type: "snake_win", title: "Win a game of Snake", target: 1, xp: 30 },
  { type: "math_win", title: "Win a Math Challenge", target: 1, xp: 30 },
  { type: "upload", title: "Upload a Resource", target: 1, xp: 50 },
  { type: "play_games", title: "Play 3 Games", target: 3, xp: 15 },
  { type: "generate_flashcards", title: "Generate a Flashcard Set", target: 1, xp: 25 },
  { type: "join_library", title: "Join The Library", target: 1, xp: 10 },
];

export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const dailyQuest = await ctx.db
      .query("daily_quests")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", todayTime))
      .first();

    if (!dailyQuest) throw new Error("No quests found for today");
    if (dailyQuest.rewardsClaimed) throw new Error("Rewards already claimed");

    const allCompleted = dailyQuest.quests.every((q) => q.isCompleted);
    if (!allCompleted) throw new Error("Quests not completed");

    // Award Bonus
    const BONUS_XP = 100;
    const user = await ctx.db.get(userId);
    if (user) {
      await ctx.db.patch(userId, { points: (user.points || 0) + BONUS_XP });
    }

    await ctx.db.patch(dailyQuest._id, { rewardsClaimed: true });
    return BONUS_XP;
  },
});

export const generate = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    // Check if already exists
    const existing = await ctx.db
      .query("daily_quests")
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", todayTime))
      .first();

    if (existing) return existing;

    // Select 3 random quests
    const shuffled = [...QUEST_TYPES].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((q, i) => ({
      id: `quest_${todayTime}_${i}`,
      ...q,
      progress: 0,
      isCompleted: false,
      xpReward: q.xp,
    }));

    const id = await ctx.db.insert("daily_quests", {
      userId,
      date: todayTime,
      quests: selected,
      rewardsClaimed: false,
    });

    return await ctx.db.get(id);
  },
});

export const updateProgress = internalMutation({
  args: {
    userId: v.id("users"),
    questType: v.string(),
    increment: v.number(),
  },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const dailyQuest = await ctx.db
      .query("daily_quests")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId).eq("date", todayTime))
      .first();

    if (!dailyQuest) return;

    let xpToAdd = 0;
    const newQuests = [];
    let updated = false;

    for (const q of dailyQuest.quests) {
        if ((q.type === args.questType || (args.questType === "any_game" && q.type === "play_games")) && !q.isCompleted) {
            const newProgress = Math.min(q.progress + args.increment, q.target);
            if (newProgress !== q.progress) {
                updated = true;
                const isCompleted = newProgress >= q.target;
                if (isCompleted) {
                    xpToAdd += q.xpReward;
                }
                newQuests.push({ ...q, progress: newProgress, isCompleted });
            } else {
                newQuests.push(q);
            }
        } else {
            newQuests.push(q);
        }
    }

    if (updated) {
        await ctx.db.patch(dailyQuest._id, { quests: newQuests });
        if (xpToAdd > 0) {
            const user = await ctx.db.get(args.userId);
            if (user) {
                await ctx.db.patch(args.userId, { points: (user.points || 0) + xpToAdd });
            }
        }
    }
  },
});
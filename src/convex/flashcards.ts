import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api, internal } from "./_generated/api";

export const generate = action({
  args: {
    title: v.string(),
    content: v.optional(v.string()), // Text content to generate from
    sourceType: v.union(v.literal("resource"), v.literal("syllabus_topic"), v.literal("manual")),
    sourceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Mock AI Generation
    // In a real app, this would call OpenAI/Anthropic with the content
    const prompt = `Generate 5 flashcards for: ${args.title}. Content context: ${args.content?.substring(0, 200)}...`;
    
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockCards = [
      { front: `What is the main concept of ${args.title}?`, back: "The main concept involves..." },
      { front: "Key Term 1 Definition", back: "Definition of key term 1 related to the topic." },
      { front: "True or False: This is a fundamental principle.", back: "True, because..." },
      { front: "Explain the relationship between X and Y.", back: "X influences Y by..." },
      { front: "What is a common application of this?", back: "It is commonly used in..." },
    ];

    // Save the set and cards via mutation
    await ctx.runMutation(api.flashcards.saveGeneratedSet, {
      title: args.title,
      description: `Generated from ${args.sourceType}`,
      sourceType: args.sourceType,
      sourceId: args.sourceId,
      cards: mockCards,
    });
  },
});

export const saveGeneratedSet = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    sourceType: v.union(v.literal("resource"), v.literal("syllabus_topic"), v.literal("manual")),
    sourceId: v.optional(v.string()),
    cards: v.array(v.object({ front: v.string(), back: v.string() })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const setId = await ctx.db.insert("flashcard_sets", {
      userId,
      title: args.title,
      description: args.description,
      sourceType: args.sourceType,
      sourceId: args.sourceId,
    });

    for (let i = 0; i < args.cards.length; i++) {
      await ctx.db.insert("flashcards", {
        setId,
        front: args.cards[i].front,
        back: args.cards[i].back,
        order: i,
      });
    }

    // Update Daily Quest
    await ctx.scheduler.runAfter(0, internal.quests.updateProgress, {
      userId,
      questType: "generate_flashcards",
      increment: 1,
    });

    return setId;
  },
});

export const getUserSets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("flashcard_sets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getSetCards = query({
  args: { setId: v.id("flashcard_sets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return []; // Or throw
    
    // Verify ownership
    const set = await ctx.db.get(args.setId);
    if (!set || set.userId !== userId) return [];

    return await ctx.db
      .query("flashcards")
      .withIndex("by_set", (q) => q.eq("setId", args.setId))
      .collect(); // Order isn't strictly guaranteed by index unless we sort in JS or add index on order
  },
});

export const deleteSet = mutation({
  args: { setId: v.id("flashcard_sets") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const set = await ctx.db.get(args.setId);
    if (!set || set.userId !== userId) throw new Error("Unauthorized");

    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_set", (q) => q.eq("setId", args.setId))
      .collect();

    for (const card of cards) {
      await ctx.db.delete(card._id);
    }
    await ctx.db.delete(args.setId);
  },
});
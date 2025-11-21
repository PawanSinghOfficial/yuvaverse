import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submit = mutation({
  args: {
    content: v.string(),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.insert("feedback", {
      content: args.content,
      userId: user._id,
      isAnonymous: args.isAnonymous,
      status: "pending",
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") return [];

    const feedbacks = await ctx.db.query("feedback").order("desc").collect();
    
    // Enrich with user details if not anonymous
    return await Promise.all(feedbacks.map(async (f) => {
      if (f.isAnonymous) return { ...f, user: null };
      const u = await ctx.db.get(f.userId);
      return { ...f, user: u };
    }));
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("feedback"),
    status: v.string(),
    reply: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.patch(args.id, {
      status: args.status,
      reply: args.reply,
    });
  },
});
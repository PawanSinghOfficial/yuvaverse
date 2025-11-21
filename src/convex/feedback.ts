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
    // In a real app, restrict this to admins
    return await ctx.db.query("feedback").order("desc").collect();
  },
});
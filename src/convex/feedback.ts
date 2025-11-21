import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    content: v.string(),
    isAnonymous: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .unique();

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

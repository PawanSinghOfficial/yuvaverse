import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").order("asc").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.number(),
    location: v.string(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if user is society head or admin
    if (user.role !== "society_head" && user.role !== "admin") {
      throw new Error("Only society heads can create events");
    }

    await ctx.db.insert("events", {
      ...args,
      organizerId: user._id,
    });
  },
});

export const deleteEvent = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    await ctx.db.delete(args.id);
  },
});
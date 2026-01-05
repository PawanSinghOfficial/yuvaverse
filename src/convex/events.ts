import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { college: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let events;
    if (args.college && args.college !== "All") {
      events = await ctx.db
        .query("events")
        .withIndex("by_college", (q) => q.eq("college", args.college))
        .collect();
      // Sort by date in memory since we used college index
      events.sort((a, b) => a.date - b.date);
    } else {
      events = await ctx.db.query("events").order("asc").collect();
    }
    return events;
  },
});

export const register = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("event_registrations")
      .withIndex("by_user_and_event", (q) => 
        q.eq("userId", userId).eq("eventId", args.eventId)
      )
      .first();

    if (existing) throw new Error("Already registered");

    await ctx.db.insert("event_registrations", {
      eventId: args.eventId,
      userId,
    });

    // Add to todos
    const event = await ctx.db.get(args.eventId);
    if (event) {
      await ctx.db.insert("todos", {
        userId,
        title: `Event: ${event.title}`,
        date: event.date,
        isCompleted: false,
        eventId: args.eventId,
      });
    }
  },
});

export const unregister = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("event_registrations")
      .withIndex("by_user_and_event", (q) => 
        q.eq("userId", userId).eq("eventId", args.eventId)
      )
      .first();

    if (!existing) throw new Error("Not registered");

    await ctx.db.delete(existing._id);

    // Remove from todos
    const todo = await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("eventId"), args.eventId))
      .first();

    if (todo) {
      await ctx.db.delete(todo._id);
    }
  },
});

export const getUserRegistrations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const registrations = await ctx.db
      .query("event_registrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return registrations.map((r) => r.eventId);
  },
});

export const getRegisteredEvents = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const registrations = await ctx.db
      .query("event_registrations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const events = await Promise.all(
      registrations.map(async (r) => {
        return await ctx.db.get(r.eventId);
      })
    );

    return events.filter((e) => e !== null).sort((a, b) => a!.date - b!.date);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.number(),
    location: v.string(),
    type: v.string(),
    college: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if user is admin
    if (user.role !== "admin") {
      throw new Error("Only admins can create events");
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
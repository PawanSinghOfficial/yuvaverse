import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { semester: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let resources;
    if (args.semester !== undefined) {
      const semester = args.semester;
      resources = await ctx.db
        .query("resources")
        .withIndex("by_semester", (q) => q.eq("semester", semester))
        .order("desc")
        .collect();
    } else {
      resources = await ctx.db.query("resources").order("desc").collect();
    }

    // Enrich with uploader username and file URL
    return await Promise.all(resources.map(async (r) => {
      const uploader = await ctx.db.get(r.uploaderId);
      const url = await ctx.storage.getUrl(r.fileId);
      return {
        ...r,
        uploaderName: uploader?.username || uploader?.name || "Unknown",
        url: url || "#",
      };
    }));
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(),
    subject: v.string(),
    semester: v.number(),
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.insert("resources", {
      ...args,
      uploaderId: user._id,
      downloads: 0,
    });

    // Award points for upload
    const currentPoints = user.points || 0;
    await ctx.db.patch(user._id, { points: currentPoints + 10 });
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    // This is a simple implementation. For production, you might want a separate leaderboard table or index
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => (u.points || 0) > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 10);
  },
});
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const list = query({
  args: { semester: v.optional(v.number()), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let resources;
    if (args.search) {
      resources = await ctx.db
        .query("resources")
        .withSearchIndex("search_title", (q) => {
          let search = q.search("title", args.search!);
          if (args.semester !== undefined) {
            search = search.eq("semester", args.semester);
          }
          return search;
        })
        .collect();
    } else if (args.semester !== undefined) {
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
        likesCount: r.likes?.length || 0,
        dislikesCount: r.dislikes?.length || 0,
        hasLiked: false, // Will be handled in frontend by checking user ID against array if needed, or we can do it here if we pass userId. 
        // For simplicity in list, we return the arrays or counts. 
        // Let's return the arrays so frontend can check `hasLiked`.
      };
    }));
  },
});

export const getFlagged = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") return [];

    const resources = await ctx.db.query("resources").collect();
    // Filter for flagged OR reported resources
    const flagged = resources.filter(r => r.isFlagged || (r.reports && r.reports.length > 0));

    return await Promise.all(flagged.map(async (r) => {
      const uploader = await ctx.db.get(r.uploaderId);
      const url = await ctx.storage.getUrl(r.fileId);
      
      // Get detailed reports if any
      const reports = await ctx.db
        .query("resource_reports")
        .withIndex("by_resource", q => q.eq("resourceId", r._id))
        .collect();
        
      const reportsWithNames = await Promise.all(reports.map(async (rep) => {
        const reporter = await ctx.db.get(rep.reporterId);
        return {
            ...rep,
            reporterName: reporter?.name || reporter?.username || "Unknown"
        };
      }));

      return {
        ...r,
        uploaderName: uploader?.username || uploader?.name || "Unknown",
        url: url || "#",
        detailedReports: reportsWithNames,
      };
    }));
  },
});

export const report = mutation({
  args: { 
    resourceId: v.id("resources"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const resource = await ctx.db.get(args.resourceId);
    if (!resource) throw new Error("Resource not found");

    const reports = resource.reports || [];
    if (reports.includes(userId)) {
      throw new Error("You have already reported this resource");
    }

    // Add to resource_reports table
    await ctx.db.insert("resource_reports", {
      resourceId: args.resourceId,
      reporterId: userId,
      reason: args.reason,
    });

    // Update resources table reports array
    await ctx.db.patch(args.resourceId, {
      reports: [...reports, userId],
    });
  },
});

export const toggleLike = mutation({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const resource = await ctx.db.get(args.resourceId);
    if (!resource) throw new Error("Resource not found");

    const likes = resource.likes || [];
    const dislikes = resource.dislikes || [];
    
    const hasLiked = likes.includes(userId);
    const hasDisliked = dislikes.includes(userId);

    if (hasLiked) {
      // Unlike
      await ctx.db.patch(args.resourceId, {
        likes: likes.filter(id => id !== userId)
      });
      // Optionally decrease points? The prompt says "Increase... if it gets liked". 
      // Usually we don't decrease on unlike to avoid negative feelings, but to prevent farming we might.
      // For now, let's just handle the increase on fresh like.
    } else {
      // Like
      let newDislikes = dislikes;
      if (hasDisliked) {
        newDislikes = dislikes.filter(id => id !== userId);
      }
      
      await ctx.db.patch(args.resourceId, {
        likes: [...likes, userId],
        dislikes: newDislikes
      });

      // Increase uploader points
      const uploader = await ctx.db.get(resource.uploaderId);
      if (uploader) {
        await ctx.db.patch(resource.uploaderId, {
          points: (uploader.points || 0) + 5
        });
      }
    }
  },
});

export const toggleDislike = mutation({
  args: { resourceId: v.id("resources") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const resource = await ctx.db.get(args.resourceId);
    if (!resource) throw new Error("Resource not found");

    const likes = resource.likes || [];
    const dislikes = resource.dislikes || [];
    
    const hasLiked = likes.includes(userId);
    const hasDisliked = dislikes.includes(userId);

    if (hasDisliked) {
      // Remove dislike
      await ctx.db.patch(args.resourceId, {
        dislikes: dislikes.filter(id => id !== userId)
      });
    } else {
      // Dislike
      let newLikes = likes;
      if (hasLiked) {
        newLikes = likes.filter(id => id !== userId);
      }
      
      const newDislikes = [...dislikes, userId];
      const isFlagged = newDislikes.length > 6;

      await ctx.db.patch(args.resourceId, {
        likes: newLikes,
        dislikes: newDislikes,
        isFlagged: isFlagged || resource.isFlagged // Keep flagged if already flagged
      });
    }
  },
});

export const resolveFlag = mutation({
  args: { resourceId: v.id("resources"), action: v.union(v.literal("keep"), v.literal("delete")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    if (args.action === "delete") {
       const resource = await ctx.db.get(args.resourceId);
       if (resource) {
          // Delete reports associated with this resource
          const reports = await ctx.db
            .query("resource_reports")
            .withIndex("by_resource", q => q.eq("resourceId", args.resourceId))
            .collect();
          for (const r of reports) {
            await ctx.db.delete(r._id);
          }

          await ctx.storage.delete(resource.fileId);
          await ctx.db.delete(args.resourceId);
       }
    } else {
      // Keep the resource, clear flag and reports
      const reports = await ctx.db
        .query("resource_reports")
        .withIndex("by_resource", q => q.eq("resourceId", args.resourceId))
        .collect();
      for (const r of reports) {
        await ctx.db.delete(r._id);
      }

      await ctx.db.patch(args.resourceId, {
        isFlagged: false,
        reports: [], // Clear reports
        dislikes: [] // Optional: reset dislikes if admin approves it
      });
    }
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

    // Update Daily Quest
    await ctx.scheduler.runAfter(0, internal.quests.updateProgress, {
        userId,
        questType: "upload",
        increment: 1
    });
  },
});

export const deleteResource = mutation({
  args: { id: v.id("resources") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") throw new Error("Unauthorized");

    const resource = await ctx.db.get(args.id);
    if (resource) {
        // Delete reports associated with this resource
        const reports = await ctx.db
            .query("resource_reports")
            .withIndex("by_resource", q => q.eq("resourceId", args.id))
            .collect();
        for (const r of reports) {
            await ctx.db.delete(r._id);
        }

        // Try to delete from storage if possible, though we might not have the ID directly mapped if not stored
        // But we have fileId
        await ctx.storage.delete(resource.fileId);
        await ctx.db.delete(args.id);
    }
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
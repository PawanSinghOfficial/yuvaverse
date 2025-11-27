import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getSubjects = query({
  args: {
    course: v.string(),
    stream: v.string(),
    semester: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const subjects = await ctx.db
      .query("syllabus_subjects")
      .withIndex("by_stream_semester", (q) => 
        q.eq("stream", args.stream).eq("semester", args.semester)
      )
      .filter((q) => q.eq(q.field("course"), args.course))
      .collect();

    if (!userId) {
      return subjects.map(s => ({ ...s, progress: 0, totalTopics: 0, completedTopics: 0 }));
    }

    const allUserProgress = await ctx.db
      .query("syllabus_progress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const completedTopicIds = new Set(allUserProgress.filter(p => p.isCompleted).map(p => p.topicId));

    return await Promise.all(subjects.map(async (subject) => {
      const units = await ctx.db
        .query("syllabus_units")
        .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
        .collect();
      
      let totalTopics = 0;
      let completedTopics = 0;

      for (const unit of units) {
        const topics = await ctx.db
          .query("syllabus_topics")
          .withIndex("by_unit", (q) => q.eq("unitId", unit._id))
          .collect();
        
        totalTopics += topics.length;
        topics.forEach(topic => {
          if (completedTopicIds.has(topic._id)) {
            completedTopics++;
          }
        });
      }

      const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
      return { ...subject, progress, totalTopics, completedTopics };
    }));
  },
});

export const getSubjectDetails = query({
  args: { subjectId: v.id("syllabus_subjects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const units = await ctx.db
      .query("syllabus_units")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    const unitsWithTopics = await Promise.all(
      units.map(async (unit) => {
        const topics = await ctx.db
          .query("syllabus_topics")
          .withIndex("by_unit", (q) => q.eq("unitId", unit._id))
          .collect();
        
        // Sort topics by order
        topics.sort((a, b) => a.order - b.order);

        // Get progress if user is logged in
        const topicsWithProgress = await Promise.all(
          topics.map(async (topic) => {
            let isCompleted = false;
            if (userId) {
              const progress = await ctx.db
                .query("syllabus_progress")
                .withIndex("by_user_topic", (q) => 
                  q.eq("userId", userId).eq("topicId", topic._id)
                )
                .first();
              isCompleted = !!progress?.isCompleted;
            }
            return { ...topic, isCompleted };
          })
        );

        return { ...unit, topics: topicsWithProgress };
      })
    );

    // Sort units by unitNumber
    unitsWithTopics.sort((a, b) => a.unitNumber - b.unitNumber);

    return unitsWithTopics;
  },
});

export const toggleTopicCompletion = mutation({
  args: { topicId: v.id("syllabus_topics"), isCompleted: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("syllabus_progress")
      .withIndex("by_user_topic", (q) => 
        q.eq("userId", userId).eq("topicId", args.topicId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isCompleted: args.isCompleted });
    } else {
      await ctx.db.insert("syllabus_progress", {
        userId,
        topicId: args.topicId,
        isCompleted: args.isCompleted,
      });
    }
  },
});

export const getUserTotalProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const progress = await ctx.db
      .query("syllabus_progress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    return progress.filter(p => p.isCompleted).length;
  },
});

// Seed function moved to seed_syllabus.ts to reduce file size
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

// Seed function to populate initial data
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data exists
    const existing = await ctx.db.query("syllabus_subjects").first();
    if (existing) return; // Already seeded

    // Create Applied Mathematics-1
    const subjectId = await ctx.db.insert("syllabus_subjects", {
      name: "Applied Mathematics-1",
      code: "BAS-103",
      course: "B.Tech",
      stream: "Common", // Common for 1st year usually
      semester: 1,
    });

    // Unit 1: Matrices and Determinants
    const unit1Id = await ctx.db.insert("syllabus_units", {
      subjectId,
      unitNumber: 1,
      title: "Matrices and Determinants",
    });

    const unit1Topics = [
      "Matrix Algebra: Types of matrices, Addition and Multiplication",
      "Determinants: Properties and Evaluation",
      "Inverse of a Matrix using Elementary Row Operations",
      "Rank of a Matrix",
      "System of Linear Equations: Consistency and Solution",
      "Eigenvalues and Eigenvectors",
      "Cayley-Hamilton Theorem and its applications",
    ];

    for (let i = 0; i < unit1Topics.length; i++) {
      await ctx.db.insert("syllabus_topics", {
        unitId: unit1Id,
        title: unit1Topics[i],
        order: i + 1,
      });
    }

    // Unit 2: Differential Calculus
    const unit2Id = await ctx.db.insert("syllabus_units", {
      subjectId,
      unitNumber: 2,
      title: "Differential Calculus",
    });

    const unit2Topics = [
      "Successive Differentiation: Leibniz Theorem",
      "Partial Differentiation",
      "Euler's Theorem on Homogeneous Functions",
      "Total Derivatives",
      "Jacobians",
      "Taylor's and Maclaurin's Series expansion",
      "Maxima and Minima of functions of two variables",
    ];

    for (let i = 0; i < unit2Topics.length; i++) {
      await ctx.db.insert("syllabus_topics", {
        unitId: unit2Id,
        title: unit2Topics[i],
        order: i + 1,
      });
    }
    
    // Add a dummy subject for IT specific
    const subject2Id = await ctx.db.insert("syllabus_subjects", {
        name: "Programming for Problem Solving",
        code: "BCS-101",
        course: "B.Tech",
        stream: "IT",
        semester: 1,
    });
    
    const unit3Id = await ctx.db.insert("syllabus_units", {
        subjectId: subject2Id,
        unitNumber: 1,
        title: "Introduction to Programming",
    });
    
    await ctx.db.insert("syllabus_topics", {
        unitId: unit3Id,
        title: "Basics of Computer: Hardware and Software",
        order: 1,
    });
    await ctx.db.insert("syllabus_topics", {
        unitId: unit3Id,
        title: "Algorithm and Flowchart",
        order: 2,
    });
  },
});
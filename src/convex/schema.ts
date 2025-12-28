import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  STUDENT: "student",
  SOCIETY_HEAD: "society_head",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.STUDENT),
  v.literal(ROLES.SOCIETY_HEAD),
);
export type Role = Infer<typeof roleValidator>;

export const TIERS = {
  FREEMIUM: "freemium",
  PREMIUM: "premium",
  ELITE: "elite",
} as const;

export const tierValidator = v.union(
  v.literal(TIERS.FREEMIUM),
  v.literal(TIERS.PREMIUM),
  v.literal(TIERS.ELITE),
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      tier: v.optional(tierValidator),
      points: v.optional(v.number()),
      username: v.optional(v.string()),
      streakCount: v.optional(v.number()),
      lastActiveDate: v.optional(v.number()),
      hasSeenOnboarding: v.optional(v.boolean()),
      pomodoroSessionsCompleted: v.optional(v.number()),
      pomodoroSessionsAborted: v.optional(v.number()),

      // Game Stats
      snakeHighScore: v.optional(v.number()),
      mathHighScore: v.optional(v.number()),
      totalGamesPlayed: v.optional(v.number()),
      totalGamesWon: v.optional(v.number()),
    }).index("email", ["email"]).index("by_username", ["username"]), // index for the email. do not remove or modify

    daily_quests: defineTable({
      userId: v.id("users"),
      date: v.number(), // Start of day timestamp
      quests: v.array(v.object({
        id: v.string(),
        type: v.string(), // "pomodoro", "snake_win", "math_win", "upload", "play_games"
        title: v.string(),
        target: v.number(),
        progress: v.number(),
        isCompleted: v.boolean(),
        xpReward: v.number(),
      })),
      rewardsClaimed: v.boolean(),
    }).index("by_user_date", ["userId", "date"]),

    resources: defineTable({
      title: v.string(),
      description: v.optional(v.string()),
      type: v.string(), // pdf, note, etc
      subject: v.string(),
      semester: v.number(),
      fileId: v.id("_storage"),
      uploaderId: v.id("users"),
      downloads: v.number(),
      likes: v.optional(v.array(v.id("users"))),
      dislikes: v.optional(v.array(v.id("users"))),
      isFlagged: v.optional(v.boolean()),
      reports: v.optional(v.array(v.id("users"))),
    })
      .index("by_semester", ["semester"])
      .index("by_uploader", ["uploaderId"])
      .searchIndex("search_title", {
        searchField: "title",
        filterFields: ["semester"],
      }),

    resource_reports: defineTable({
      resourceId: v.id("resources"),
      reporterId: v.id("users"),
      reason: v.string(),
    }).index("by_resource", ["resourceId"]),

    groups: defineTable({
      name: v.string(),
      description: v.optional(v.string()),
      image: v.optional(v.id("_storage")),
      type: v.union(v.literal("study"), v.literal("social")),
      isPrivate: v.boolean(),
      password: v.optional(v.string()),
      creatorId: v.id("users"),
      reports: v.optional(v.array(v.id("users"))),
    }),

    group_members: defineTable({
      groupId: v.id("groups"),
      userId: v.id("users"),
      role: v.union(v.literal("admin"), v.literal("member")),
    }).index("by_group", ["groupId"]).index("by_user", ["userId"]),

    group_reports: defineTable({
      groupId: v.id("groups"),
      reporterId: v.id("users"),
      reason: v.string(),
    }).index("by_group", ["groupId"]),

    messages: defineTable({
      groupId: v.id("groups"),
      userId: v.id("users"),
      content: v.string(),
      type: v.string(), // text, image, audio
      seenBy: v.optional(v.array(v.id("users"))),
      expiresAt: v.optional(v.number()),
    }).index("by_group", ["groupId"]),

    events: defineTable({
      title: v.string(),
      description: v.string(),
      date: v.number(),
      location: v.string(),
      organizerId: v.id("users"),
      type: v.string(),
    }).index("by_date", ["date"]),

    event_registrations: defineTable({
      eventId: v.id("events"),
      userId: v.id("users"),
    }).index("by_user", ["userId"]).index("by_event", ["eventId"]).index("by_user_and_event", ["userId", "eventId"]),

    feedback: defineTable({
      content: v.string(),
      userId: v.id("users"),
      isAnonymous: v.boolean(),
      status: v.string(), // pending, reviewed, resolved, rejected
      reply: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    todos: defineTable({
      userId: v.id("users"),
      title: v.string(),
      date: v.number(),
      isCompleted: v.boolean(),
      eventId: v.optional(v.id("events")),
      reminderTime: v.optional(v.number()),
    }).index("by_user", ["userId"]).index("by_user_and_date", ["userId", "date"]),

    // Syllabus Tracking Tables
    syllabus_subjects: defineTable({
      name: v.string(),
      code: v.optional(v.string()),
      stream: v.string(), // "CSE", "IT", "ECE", "Common"
      semester: v.number(),
      course: v.string(), // "B.Tech"
    }).index("by_stream_semester", ["stream", "semester"]),

    syllabus_units: defineTable({
      subjectId: v.id("syllabus_subjects"),
      unitNumber: v.number(),
      title: v.string(),
    }).index("by_subject", ["subjectId"]),

    syllabus_topics: defineTable({
      unitId: v.id("syllabus_units"),
      title: v.string(),
      order: v.number(),
    }).index("by_unit", ["unitId"]),

    syllabus_progress: defineTable({
      userId: v.id("users"),
      topicId: v.id("syllabus_topics"),
      isCompleted: v.boolean(),
    }).index("by_user_topic", ["userId", "topicId"]).index("by_user", ["userId"]),

    // AI Notebook Tables
    ai_notebooks: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    ai_sources: defineTable({
      notebookId: v.id("ai_notebooks"),
      title: v.string(),
      type: v.string(), // "pdf", "text", "url", "youtube"
      content: v.optional(v.string()), // Extracted text or raw content
      fileId: v.optional(v.id("_storage")),
      summary: v.optional(v.string()),
      isProcessing: v.optional(v.boolean()),
    }).index("by_notebook", ["notebookId"]),

    ai_chats: defineTable({
      notebookId: v.id("ai_notebooks"),
      title: v.string(),
      lastMessageAt: v.number(),
    }).index("by_notebook", ["notebookId"]),

    ai_messages: defineTable({
      chatId: v.id("ai_chats"),
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string(),
    }).index("by_chat", ["chatId"]),

    ai_notes: defineTable({
      notebookId: v.id("ai_notebooks"),
      content: v.string(),
      tags: v.optional(v.array(v.string())),
    }).index("by_notebook", ["notebookId"]),

    ai_quizzes: defineTable({
      notebookId: v.id("ai_notebooks"),
      title: v.string(),
      questions: v.array(v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctAnswer: v.number(), // index
        explanation: v.optional(v.string()),
      })),
      userScore: v.optional(v.number()),
      isCompleted: v.boolean(),
    }).index("by_notebook", ["notebookId"]),

    ai_mindmaps: defineTable({
      notebookId: v.id("ai_notebooks"),
      title: v.string(),
      // Simple node structure for visualization: { id, label, children: [] }
      rootNode: v.object({
        id: v.string(),
        label: v.string(),
        children: v.optional(v.array(v.any())), // Recursive structure is hard to validate strictly in v.object, using v.any for children for flexibility or stringified JSON
      }), 
    }).index("by_notebook", ["notebookId"]),

    flashcard_sets: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      sourceType: v.union(v.literal("resource"), v.literal("syllabus_topic"), v.literal("manual")),
      sourceId: v.optional(v.string()), // ID of the resource or topic
    }).index("by_user", ["userId"]),

    flashcards: defineTable({
      setId: v.id("flashcard_sets"),
      front: v.string(),
      back: v.string(),
      order: v.number(),
    }).index("by_set", ["setId"]),

    presence: defineTable({
      userId: v.id("users"),
      groupId: v.id("groups"),
      updatedAt: v.number(),
      isTyping: v.boolean(),
    })
    .index("by_group_updated", ["groupId", "updatedAt"])
    .index("by_user_group", ["userId", "groupId"]),

    focus_presence: defineTable({
      userId: v.id("users"),
      updatedAt: v.number(),
      status: v.union(v.literal("focusing"), v.literal("break"), v.literal("idle")),
      focusDuration: v.optional(v.number()), // Total duration in minutes
      startTime: v.optional(v.number()), // When they started
    }).index("by_updated", ["updatedAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
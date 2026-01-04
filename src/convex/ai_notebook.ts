import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Notebooks

export const createNotebook = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    initialFileId: v.optional(v.id("_storage")),
    initialFileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const notebookId = await ctx.db.insert("ai_notebooks", {
      userId,
      title: args.title,
      description: args.description,
      icon: args.icon || "📓",
    });

    // Create a default chat for this notebook
    await ctx.db.insert("ai_chats", {
      notebookId,
      title: "General Chat",
      lastMessageAt: Date.now(),
    });

    // Add initial source if provided
    if (args.initialFileId && args.initialFileName) {
      const sourceId = await ctx.db.insert("ai_sources", {
        notebookId,
        title: args.initialFileName,
        type: "pdf",
        content: "", // Will be filled by processor
        fileId: args.initialFileId,
        summary: "Processing PDF content...",
        isProcessing: true,
      });

      await ctx.scheduler.runAfter(0, internal.ai_notebook_actions.processPdfAction, {
        sourceId,
        fileId: args.initialFileId,
      });
    }

    return notebookId;
  },
});

export const getNotebooks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("ai_notebooks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getNotebook = query({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const notebook = await ctx.db.get(args.notebookId);
    if (notebook?.userId !== userId) return null;
    return notebook;
  },
});

export const deleteNotebook = mutation({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    
    const notebook = await ctx.db.get(args.notebookId);
    if (!notebook || notebook.userId !== userId) throw new Error("Unauthorized");

    // Delete associated data (cascade manually)
    const sources = await ctx.db.query("ai_sources").withIndex("by_notebook", q => q.eq("notebookId", args.notebookId)).collect();
    for (const s of sources) {
        if (s.fileId) await ctx.storage.delete(s.fileId);
        await ctx.db.delete(s._id);
    }

    const chats = await ctx.db.query("ai_chats").withIndex("by_notebook", q => q.eq("notebookId", args.notebookId)).collect();
    for (const c of chats) {
        const messages = await ctx.db.query("ai_messages").withIndex("by_chat", q => q.eq("chatId", c._id)).collect();
        for (const m of messages) await ctx.db.delete(m._id);
        await ctx.db.delete(c._id);
    }

    const notes = await ctx.db.query("ai_notes").withIndex("by_notebook", q => q.eq("notebookId", args.notebookId)).collect();
    for (const n of notes) await ctx.db.delete(n._id);

    const quizzes = await ctx.db.query("ai_quizzes").withIndex("by_notebook", q => q.eq("notebookId", args.notebookId)).collect();
    for (const q of quizzes) await ctx.db.delete(q._id);

    const mindmaps = await ctx.db.query("ai_mindmaps").withIndex("by_notebook", q => q.eq("notebookId", args.notebookId)).collect();
    for (const m of mindmaps) await ctx.db.delete(m._id);

    await ctx.db.delete(args.notebookId);
  }
});

// Sources
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const addSource = mutation({
  args: {
    notebookId: v.id("ai_notebooks"),
    title: v.string(),
    type: v.string(),
    content: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const isPdf = args.type === "pdf" && args.fileId;
    
    // Simple mock summary generation
    const summary = args.content 
        ? `Summary of ${args.title}: ${args.content.substring(0, 100)}...` 
        : isPdf ? "Processing PDF content..." : "No content available";

    const sourceId = await ctx.db.insert("ai_sources", {
      notebookId: args.notebookId,
      title: args.title,
      type: args.type,
      content: args.content || "",
      fileId: args.fileId,
      summary: summary,
      isProcessing: isPdf ? true : false,
    });

    if (isPdf && args.fileId) {
      await ctx.scheduler.runAfter(0, internal.ai_notebook_actions.processPdfAction, {
        sourceId,
        fileId: args.fileId,
      });
    }
  },
});

export const updateSourceContent = internalMutation({
  args: {
    sourceId: v.id("ai_sources"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const summary = `Summary: ${args.content.substring(0, 150)}...`;
    await ctx.db.patch(args.sourceId, {
      content: args.content,
      summary: summary,
      isProcessing: false,
    });
  },
});

export const getSourcesInternal = internalQuery({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ai_sources")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .collect();
  },
});

export const getSources = query({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ai_sources")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .collect();
  },
});

export const deleteSource = mutation({
    args: { sourceId: v.id("ai_sources") },
    handler: async (ctx, args) => {
        const source = await ctx.db.get(args.sourceId);
        if (source) {
            if (source.fileId) await ctx.storage.delete(source.fileId);
            await ctx.db.delete(args.sourceId);
        }
    }
});

// Chat
export const getChats = query({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ai_chats")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .order("desc")
      .collect();
  },
});

export const getMessages = query({
  args: { chatId: v.id("ai_chats") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ai_messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();
  },
});

export const saveMessage = internalMutation({
  args: {
    chatId: v.id("ai_chats"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ai_messages", {
      chatId: args.chatId,
      role: args.role,
      content: args.content,
    });
    await ctx.db.patch(args.chatId, { lastMessageAt: Date.now() });
  },
});

export const clearChat = mutation({
    args: { chatId: v.id("ai_chats") },
    handler: async (ctx, args) => {
        const messages = await ctx.db.query("ai_messages").withIndex("by_chat", q => q.eq("chatId", args.chatId)).collect();
        for (const m of messages) {
            await ctx.db.delete(m._id);
        }
    }
});

// Notes
export const saveNote = mutation({
  args: {
    notebookId: v.id("ai_notebooks"),
    content: v.string(),
    noteId: v.optional(v.id("ai_notes")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    if (args.noteId) {
        await ctx.db.patch(args.noteId, { content: args.content });
    } else {
        await ctx.db.insert("ai_notes", {
            notebookId: args.notebookId,
            content: args.content,
        });
    }
  },
});

export const internalSaveNote = internalMutation({
  args: {
    notebookId: v.id("ai_notebooks"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ai_notes", {
        notebookId: args.notebookId,
        content: args.content,
    });
  },
});

export const getNotes = query({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ai_notes")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .order("desc")
      .collect();
  },
});

export const deleteNote = mutation({
    args: { noteId: v.id("ai_notes") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.noteId);
    }
});

// Quizzes
export const getQuizzes = query({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ai_quizzes")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .order("desc")
      .collect();
  },
});

export const saveQuiz = internalMutation({
  args: { 
    notebookId: v.id("ai_notebooks"),
    title: v.string(),
    questions: v.array(v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctAnswer: v.number(),
        explanation: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ai_quizzes", {
        notebookId: args.notebookId,
        title: args.title,
        questions: args.questions,
        isCompleted: false,
    });
  },
});

export const saveQuizResult = mutation({
    args: { quizId: v.id("ai_quizzes"), score: v.number() },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.quizId, {
            userScore: args.score,
            isCompleted: true
        });
    }
});

export const deleteQuiz = mutation({
    args: { quizId: v.id("ai_quizzes") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.quizId);
    }
});

// Mindmaps
export const getMindmaps = query({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ai_mindmaps")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .order("desc")
      .collect();
  },
});

export const saveMindmap = internalMutation({
  args: { 
    notebookId: v.id("ai_notebooks"),
    title: v.string(),
    rootNode: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("ai_mindmaps", {
        notebookId: args.notebookId,
        title: args.title,
        rootNode: args.rootNode,
    });
  },
});

export const deleteMindmap = mutation({
    args: { mindmapId: v.id("ai_mindmaps") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.mindmapId);
    }
});
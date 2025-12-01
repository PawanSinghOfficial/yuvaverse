import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Notebooks
export const createNotebook = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
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

    // Simple mock summary generation
    const summary = args.content 
        ? `Summary of ${args.title}: ${args.content.substring(0, 100)}...` 
        : "Processing document content...";

    await ctx.db.insert("ai_sources", {
      notebookId: args.notebookId,
      title: args.title,
      type: args.type,
      content: args.content,
      fileId: args.fileId,
      summary: summary,
      isProcessing: false,
    });
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

export const sendMessage = mutation({
  args: {
    notebookId: v.id("ai_notebooks"),
    chatId: v.id("ai_chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // 1. Save User Message
    await ctx.db.insert("ai_messages", {
      chatId: args.chatId,
      role: "user",
      content: args.content,
    });

    // 2. "AI" Processing (Mock RAG)
    // Fetch sources to simulate reading them
    const sources = await ctx.db
        .query("ai_sources")
        .withIndex("by_notebook", q => q.eq("notebookId", args.notebookId))
        .collect();

    let aiResponse = "I don't have enough information in the sources to answer that.";
    
    // Simple keyword matching simulation
    const keywords = args.content.toLowerCase().split(" ").filter(w => w.length > 3);
    const relevantSources = sources.filter(s => {
        const text = (s.content || s.title).toLowerCase();
        return keywords.some(k => text.includes(k));
    });

    if (relevantSources.length > 0) {
        aiResponse = `Based on your sources (${relevantSources.map(s => s.title).join(", ")}), here is what I found:\n\n`;
        aiResponse += "The documents contain information relevant to your query. ";
        aiResponse += `Specifically, in "${relevantSources[0].title}", it mentions details about ${keywords[0] || "the topic"}.`;
        aiResponse += "\n\n(Note: This is a simulated AI response. Connect a real LLM provider for full analysis.)";
    } else if (sources.length === 0) {
        aiResponse = "You haven't uploaded any sources yet. Please add some documents so I can answer your questions.";
    } else {
        aiResponse = "I couldn't find specific keywords matching your question in the uploaded sources, but I'm ready to help analyze them further.";
    }

    // 3. Save AI Response
    await ctx.db.insert("ai_messages", {
      chatId: args.chatId,
      role: "assistant",
      content: aiResponse,
    });

    // Update chat timestamp
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

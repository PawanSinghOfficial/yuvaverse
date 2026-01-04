"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { createRequire } from "module";
import { action } from "./_generated/server";
import OpenAI from "openai";

export const processPdfAction = internalAction({
  args: {
    sourceId: v.id("ai_sources"),
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const require = createRequire(import.meta.url);
    const pdf = require("pdf-parse");

    try {
      console.log(`Starting PDF processing for source: ${args.sourceId}`);
      const fileUrl = await ctx.storage.getUrl(args.fileId);
      if (!fileUrl) {
        throw new Error("File not found");
      }

      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const data = await pdf(buffer);
      const text = data.text;

      await ctx.runMutation(internal.ai_notebook.updateSourceContent, {
        sourceId: args.sourceId,
        content: text,
      });
    } catch (error) {
      console.error("Failed to process PDF:", error);
      await ctx.runMutation(internal.ai_notebook.updateSourceContent, {
        sourceId: args.sourceId,
        content: "Failed to extract text from PDF. Please try again or upload a text version.",
      });
    }
  },
});

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set in the environment variables. Please add it in the Convex dashboard.");
  }
  return new OpenAI({ apiKey });
};

export const sendMessage = action({
  args: {
    notebookId: v.id("ai_notebooks"),
    chatId: v.id("ai_chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.ai_notebook.saveMessage, {
      chatId: args.chatId,
      role: "user",
      content: args.content,
    });

    const sources = await ctx.runQuery(internal.ai_notebook.getSourcesInternal, {
      notebookId: args.notebookId,
    });

    const context = sources.map(s => `Title: ${s.title}\nContent: ${s.content}`).join("\n\n");

    try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful study assistant. Answer the user's question based on the provided context. If the answer is not in the context, say so, but try to be helpful using general knowledge if appropriate, while noting it's not from the source." },
                { role: "user", content: `Context:\n${context}\n\nQuestion: ${args.content}` }
            ],
        });

        const aiResponse = completion.choices[0].message.content || "I couldn't generate a response.";

        await ctx.runMutation(internal.ai_notebook.saveMessage, {
            chatId: args.chatId,
            role: "assistant",
            content: aiResponse,
        });
    } catch (error) {
        console.error("OpenAI Error:", error);
        await ctx.runMutation(internal.ai_notebook.saveMessage, {
            chatId: args.chatId,
            role: "assistant",
            content: "Sorry, I encountered an error processing your request. Please check your API key or try again later.",
        });
    }
  },
});

export const generateQuiz = action({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    const sources = await ctx.runQuery(internal.ai_notebook.getSourcesInternal, {
      notebookId: args.notebookId,
    });
    const context = sources.map(s => `Title: ${s.title}\nContent: ${s.content}`).join("\n\n");

    try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Generate a quiz based on the provided text. Return JSON with a 'title' and an array of 'questions'. Each question should have 'question', 'options' (array of 4 strings), 'correctAnswer' (index 0-3), and 'explanation'." },
                { role: "user", content: `Generate a 5-question quiz from this content:\n${context.substring(0, 20000)}` }
            ],
            response_format: { type: "json_object" },
        });

        const response = JSON.parse(completion.choices[0].message.content || "{}");
        
        await ctx.runMutation(internal.ai_notebook.saveQuiz, {
            notebookId: args.notebookId,
            title: response.title || "Generated Quiz",
            questions: response.questions || [],
        });
    } catch (error) {
        console.error("Quiz Generation Error:", error);
        throw new Error("Failed to generate quiz");
    }
  },
});

export const generateMindmap = action({
  args: { notebookId: v.id("ai_notebooks") },
  handler: async (ctx, args) => {
    const sources = await ctx.runQuery(internal.ai_notebook.getSourcesInternal, {
      notebookId: args.notebookId,
    });
    const context = sources.map(s => `Title: ${s.title}\nContent: ${s.content}`).join("\n\n");

    try {
        const openai = getOpenAI();
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Generate a hierarchical mindmap structure based on the text. Return JSON with 'title' and 'rootNode'. 'rootNode' should have 'id', 'label', and 'children' (array of nodes)." },
                { role: "user", content: `Create a mindmap from this content:\n${context.substring(0, 20000)}` }
            ],
            response_format: { type: "json_object" },
        });

        const response = JSON.parse(completion.choices[0].message.content || "{}");

        await ctx.runMutation(internal.ai_notebook.saveMindmap, {
            notebookId: args.notebookId,
            title: response.title || "Generated Mindmap",
            rootNode: response.rootNode || { id: "root", label: "Error", children: [] },
        });
    } catch (error) {
        console.error("Mindmap Generation Error:", error);
        throw new Error("Failed to generate mindmap");
    }
  },
});

export const generateNotes = action({
    args: { notebookId: v.id("ai_notebooks") },
    handler: async (ctx, args) => {
      const sources = await ctx.runQuery(internal.ai_notebook.getSourcesInternal, {
        notebookId: args.notebookId,
      });
      const context = sources.map(s => `Title: ${s.title}\nContent: ${s.content}`).join("\n\n");
  
      try {
          const openai = getOpenAI();
          const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                  { role: "system", content: "Create concise study notes/summary from the provided text. Use markdown formatting." },
                  { role: "user", content: `Summarize this content into study notes:\n${context.substring(0, 20000)}` }
              ],
          });
  
          const content = completion.choices[0].message.content || "Could not generate notes.";
  
          await ctx.runMutation(internal.ai_notebook.internalSaveNote, {
              notebookId: args.notebookId,
              content: content,
          });
      } catch (error) {
          console.error("Notes Generation Error:", error);
          throw new Error("Failed to generate notes");
      }
    },
  });
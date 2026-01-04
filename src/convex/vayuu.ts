"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
};

export const chat = action({
  args: {
    message: v.string(),
    history: v.array(v.object({ role: v.union(v.literal("user"), v.literal("assistant")), content: v.string() })),
    userName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const openai = getOpenAI();
    
    const systemPrompt = `You are Vayuu, a helpful and enthusiastic AI guide for the YuvaVerse campus platform.
    
    About YuvaVerse:
    - It's a gamified campus platform.
    - Features: AI Notebooks (NotebookLM), Collaborative Groups, Arcade Games, Pomodoro Focus, Daily Quests, AI Flashcards.
    - Navigation: Dashboard, Syllabus, Resources, Games, Groups, Calendar, Events.
    
    Your personality:
    - Friendly, encouraging, and helpful.
    - You use emojis occasionally.
    - You help students navigate the platform and answer questions about their studies or the app features.
    
    Specific knowledge:
    - Syllabus: Users can track progress.
    - Resources: Users can upload/download notes and papers.
    - Games: Snake, Tic-Tac-Toe, Math Challenge. Earn points!
    - Groups: Study or social groups.
    - NotebookLM: AI-powered study companion for PDFs/text.
    
    User context:
    - User Name: ${args.userName || "Student"}
    
    Keep responses concise and relevant to the platform.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...args.history.map(msg => ({ role: msg.role, content: msg.content })),
      { role: "user", content: args.message }
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages as any,
      });

      return completion.choices[0].message.content || "I'm having trouble connecting to my brain right now. Try again?";
    } catch (error) {
      console.error("Vayuu chat error:", error);
      return "I'm currently offline due to a technical glitch. Please try again later.";
    }
  },
});

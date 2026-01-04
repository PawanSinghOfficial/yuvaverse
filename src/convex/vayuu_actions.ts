"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import OpenAI from "openai";

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set. Please set it in the Convex dashboard environment variables.");
  }
  return new OpenAI({ apiKey });
};

export const generateResponse = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const openai = getOpenAI();
    
    // Fetch recent history (last 10 messages)
    const messages = await ctx.runQuery(internal.vayuu.getMessagesInternal, { userId: args.userId });
    const user = await ctx.runQuery(internal.users.getUserInternal, { userId: args.userId });

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
    - Friends: Users can connect with friends using a unique 4-digit code.
      - To add a friend: Click the profile icon (top right) -> Select "Friends" -> Enter their 4-digit code in the "Add Friend" tab.
      - To find your code: Click profile icon -> Friends -> Your code is displayed at the top.
    
    User context:
    - User Name: ${user?.name || "Student"}
    
    Keep responses concise and relevant to the platform.`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages as any,
      });

      const responseContent = completion.choices[0].message.content || "I'm having trouble connecting to my brain right now. Try again?";
      
      await ctx.runMutation(internal.vayuu.saveBotResponse, {
        userId: args.userId,
        content: responseContent,
      });

    } catch (error) {
      console.error("Vayuu chat error:", error);
      await ctx.runMutation(internal.vayuu.saveBotResponse, {
        userId: args.userId,
        content: "I'm currently offline due to a technical glitch. Please try again later.",
      });
    }
  },
});
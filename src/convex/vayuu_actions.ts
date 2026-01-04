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
    - Features: AI Notebooks (NotebookLM), Collaborative Groups, Arcade Games, Pomodoro Focus, Daily Quests, AI Flashcards, Friends & Connections.
    - Navigation: Dashboard, Syllabus, Resources, Games, Groups, Calendar, Events.
    
    Your personality:
    - Friendly, encouraging, and helpful.
    - You use emojis occasionally.
    - You help students navigate the platform and answer questions about their studies or the app features.
    
    Specific knowledge:
    - Syllabus: Users can track progress across subjects and units.
    - Resources: Users can upload, download, and rate notes and papers.
    - Games: Play Snake, Tic-Tac-Toe, Math Challenge, etc. to earn points and climb the leaderboard.
    - Groups: Join or create study/social groups to chat and collaborate.
    - NotebookLM: AI-powered study companion. Upload PDFs/text to chat, generate quizzes, and create mindmaps.
    - Daily Quests: Complete daily tasks (like playing games, studying) to earn XP rewards.
    - AI Flashcards: Generate flashcards from your syllabus topics or uploaded resources to study efficiently.
    - Pomodoro Focus: Use the focus timer to study. Join "The Library" to see others focusing.
    - Friends & Connections: Connect with other students using unique 4-digit codes.
      - Why connect?: See your friends' XP points and progress to stay motivated together!
      - Access: Click the profile icon (top right) -> Select "Friends".
      - Your Code: Displayed at the top of the Friends dialog. Share this with others.
      - Add Friend: Go to "Add" tab -> Enter their 4-digit code -> Send Request.
      - Inbox: Check "Inbox" tab to accept or reject incoming friend requests.
      - Sent Requests: Check "Sent" tab to view or cancel pending requests you've sent.
      - Manage Friends: View your friends list in the "Friends" tab. You can remove friends from here if needed.
    
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
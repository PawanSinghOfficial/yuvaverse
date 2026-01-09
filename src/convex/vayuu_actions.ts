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

    // Fetch recent history (last 5 messages for speed)
    const messages = await ctx.runQuery(internal.vayuu.getMessagesInternal, { userId: args.userId });
    const user = await ctx.runQuery(internal.users.getUserInternal, { userId: args.userId });

    const systemPrompt = `You are Vayuu. Answer ONLY YuvaVerse questions in 1-2 sentences max.

Features: Dashboard (stats/gems/leaderboard), Syllabus (track progress), Resources (upload for 10 gems), Arcade (5 wins = 10 gems), Groups (Elite only), AI Notebook (PDFs/quizzes), Pomodoro, Friends, Premium (1500 gems), Elite (3000 gems, themes).

Off-topic? Say: "Not my job! Ask about YuvaVerse! 😏" or similar teasing response.`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    try {
      // Add timeout to OpenAI request
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 5000) // 5 second timeout
      );

      const completionPromise = openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages as any,
        max_tokens: 100, // Very short responses for speed
        temperature: 0.3, // Lower for more predictable, faster responses
      });

      const completion = await Promise.race([completionPromise, timeoutPromise]) as any;

      const responseContent = completion.choices[0].message.content || "I'm having trouble connecting to my brain right now. Try again?";

      await ctx.runMutation(internal.vayuu.saveBotResponse, {
        userId: args.userId,
        content: responseContent,
      });

    } catch (error: any) {
      console.error("Vayuu chat error:", error);
      const errorMessage = error.message === "Request timeout"
        ? "Sorry, I'm taking too long to respond. Please try asking again! 🤔"
        : "I'm currently offline due to a technical glitch. Please try again later. 🔧";

      await ctx.runMutation(internal.vayuu.saveBotResponse, {
        userId: args.userId,
        content: errorMessage,
      });
    }
  },
});
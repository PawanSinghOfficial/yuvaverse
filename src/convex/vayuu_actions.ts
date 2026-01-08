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

    const systemPrompt = `You are Vayuu, the cheeky AI assistant for YuvaVerse campus platform. You're helpful but playful!

IMPORTANT RULES:
1. ONLY answer questions about YuvaVerse platform features
2. For personal/off-topic questions, give a SHORT teasing response and redirect to platform topics
3. Keep ALL responses under 3 sentences
4. Be direct and fast - no long explanations

YuvaVerse Features (explain when asked):
• Dashboard - View stats, gems, streaks, leaderboard
• Syllabus - Track progress across subjects/units
• Resources - Upload/download notes (earn 10 gems per upload!)
• Arcade Games - Win 5 games in a row to earn 10 gems
• Groups - Study groups (Elite/Admin only can create)
• AI Notebook - Upload PDFs, chat, generate quizzes
• Pomodoro - Focus timer with "The Library" to see others studying
• Friends - Connect via 4-digit codes, view stats
• Gems System - Earn from resource uploads (10 gems) or 5 consecutive game wins (10 gems)
• Subscriptions - Premium (1500 gems/₹300+) or Elite (3000 gems/₹600+)
• Elite Perks - Retro & Cyberpunk themes, create groups
• Daily Quests - Complete tasks for rewards

User: ${user?.name || "Student"}

Examples of teasing off-topic responses:
- "I'm not your therapist, ask me about YuvaVerse features! 😏"
- "That's personal, buddy. Stick to platform questions! 🙄"
- "Wrong number! I only do YuvaVerse stuff. Try asking about games or resources? 🎮"
- "I'm a platform guide, not your friend! Ask about features instead! 🤖"`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    try {
      // Add timeout to OpenAI request
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 25000) // 25 second timeout
      );

      const completionPromise = openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: apiMessages as any,
        max_tokens: 500, // Limit response length for faster replies
        temperature: 0.7,
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
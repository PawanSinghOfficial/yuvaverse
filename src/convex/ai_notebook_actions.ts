"use node";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import pdf from "pdf-parse";

export const processPdfAction = internalAction({
  args: {
    sourceId: v.id("ai_sources"),
    fileId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    try {
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

"use node";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";

export const runTests = action({
  args: {},
  handler: async (ctx) => {
    console.log("🚀 Starting AI Notebook Tests...");

    // 1. Upload a dummy PDF
    console.log("1. Uploading dummy PDF...");
    const pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const pdfResponse = await fetch(pdfUrl);
    const pdfBlob = await pdfResponse.blob();
    
    const uploadUrl = await ctx.runMutation(api.ai_notebook.generateUploadUrl);
    const uploadResult = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/pdf" },
      body: pdfBlob,
    });
    const { storageId } = await uploadResult.json();
    console.log("   PDF uploaded, storageId:", storageId);

    // 2. Create Notebook
    console.log("2. Creating Notebook...");
    const notebookId = await ctx.runMutation(internal.ai_notebook.createTestNotebook, {
        title: "Test Notebook",
        fileId: storageId,
        fileName: "dummy.pdf"
    });
    console.log("   Notebook created:", notebookId);

    // 3. Wait for PDF processing
    console.log("3. Waiting for PDF processing...");
    let attempts = 0;
    let processed = false;
    while (attempts < 20 && !processed) {
        const sources = await ctx.runQuery(internal.ai_notebook.getSourcesInternal, { notebookId });
        if (sources.length > 0 && !sources[0].isProcessing) {
            processed = true;
            console.log("   PDF Processed. Content length:", sources[0]?.content?.length);
            console.log("   Content preview:", sources[0]?.content?.substring(0, 100));
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
    }
    
    if (!processed) {
        throw new Error("PDF processing timed out or failed");
    }

    // 4. Test sendMessage
    console.log("4. Testing sendMessage...");
    const chats = await ctx.runQuery(internal.ai_notebook.getChatsInternal, { notebookId });
    const chatId = chats[0]._id;
    
    await ctx.runAction(api.ai_notebook_actions.sendMessage, {
        notebookId,
        chatId,
        content: "What does this document say?"
    });
    
    // Check messages
    const messages = await ctx.runQuery(internal.ai_notebook.getMessagesInternal, { chatId });
    const lastMessage = messages[messages.length - 1];
    console.log("   AI Response:", lastMessage.content);

    // 5. Test generateNotes
    console.log("5. Testing generateNotes...");
    await ctx.runAction(api.ai_notebook_actions.generateNotes, { notebookId });
    
    const notes = await ctx.runQuery(internal.ai_notebook.getNotesInternal, { notebookId });
    console.log("   Notes generated:", notes.length);
    if (notes.length > 0) {
        console.log("   Note content:", notes[0]?.content?.substring(0, 100) + "...");
    }

    console.log("✅ Tests Completed Successfully");
  }
});
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Sparkles, Send, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export function ChatInterface({ notebookId, chatId }: { notebookId: Id<"ai_notebooks">, chatId: Id<"ai_chats"> }) {
    const [input, setInput] = useState("");
    const messages = useQuery(api.ai_notebook.getMessages, { chatId });
    const sources = useQuery(api.ai_notebook.getSources, { notebookId });
    const sendMessage = useMutation(api.ai_notebook.sendMessage);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent, contentOverride?: string) => {
        if (e) e.preventDefault();
        const contentToSend = contentOverride || input;
        if (!contentToSend.trim()) return;
        
        const tempInput = contentToSend;
        setInput("");
        
        try {
            await sendMessage({
                notebookId,
                chatId,
                content: tempInput
            });
        } catch (error) {
            toast.error("Failed to send message");
            if (!contentOverride) setInput(tempInput);
        }
    };

    // Generate suggested questions based on sources
    const suggestedQuestions = sources && sources.length > 0 ? [
        `Summarize the key concepts from "${sources[0].title}"`,
        sources.length > 1 ? `Compare "${sources[0].title}" and "${sources[1].title}"` : `What are the main arguments in "${sources[0].title}"?`,
        "Create a study guide based on these sources",
        "What are the most important dates or figures mentioned?"
    ] : [
        "What is this notebook about?",
        "Help me brainstorm ideas",
        "Explain a complex topic"
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto pb-4">
                    {messages?.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-200">
                                <Sparkles className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">Ready to analyze</h3>
                            <p className="mb-8 max-w-md mx-auto">I've analyzed your {sources?.length || 0} sources. Ask me anything or try one of these suggestions:</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                {suggestedQuestions.map((q, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSend(null as any, q)}
                                        className="text-left p-3 rounded-xl border-2 border-slate-200 bg-white hover:border-purple-500 hover:shadow-[4px_4px_0px_0px_rgba(147,51,234,0.2)] transition-all group"
                                    >
                                        <div className="flex items-start gap-2">
                                            <Lightbulb className="h-4 w-4 text-purple-500 mt-0.5 shrink-0 group-hover:text-purple-700" />
                                            <span className="text-sm font-bold text-slate-700 group-hover:text-purple-900">{q}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages?.map((msg) => (
                        <div key={msg._id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && (
                                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-sm border-2 border-black">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] border-2 ${
                                msg.role === "user" 
                                    ? "bg-black text-white border-black rounded-tr-none" 
                                    : "bg-white border-slate-200 rounded-tl-none text-slate-800"
                            }`}>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 bg-white border-t-2 border-border">
                <form onSubmit={(e) => handleSend(e)} className="max-w-3xl mx-auto relative">
                    <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your sources..."
                        className="pr-12 h-14 text-base rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] border-2 border-black focus-visible:ring-0 focus-visible:border-purple-600 bg-slate-50 focus:bg-white transition-all"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="absolute right-2 top-2 h-10 w-10 rounded-lg shadow-none hover:bg-purple-600 bg-black text-white transition-colors"
                        disabled={!input.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";

export function ChatInterface({ notebookId, chatId }: { notebookId: Id<"ai_notebooks">, chatId: Id<"ai_chats"> }) {
    const [input, setInput] = useState("");
    const messages = useQuery(api.ai_notebook.getMessages, { chatId });
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

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        
        const tempInput = input;
        setInput("");
        
        try {
            await sendMessage({
                notebookId,
                chatId,
                content: tempInput
            });
        } catch (error) {
            toast.error("Failed to send message");
            setInput(tempInput);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto pb-4">
                    {messages?.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Ask anything about your sources</h3>
                            <p>Try asking for a summary, specific details, or connections between documents.</p>
                        </div>
                    )}
                    {messages?.map((msg) => (
                        <div key={msg._id} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && (
                                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                                msg.role === "user" 
                                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                                    : "bg-white border border-slate-200 rounded-tl-none text-slate-800"
                            }`}>
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
                    <Input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question about your sources..."
                        className="pr-12 h-14 text-base rounded-full shadow-sm border-slate-200 focus-visible:ring-purple-500 bg-slate-50 focus:bg-white transition-colors"
                    />
                    <Button 
                        type="submit" 
                        size="icon" 
                        className="absolute right-2 top-2 h-10 w-10 rounded-full shadow-sm"
                        disabled={!input.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}

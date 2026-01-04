import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, Trash2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface VayuuChatProps {
  user?: any;
}

export function VayuuChat({ user }: VayuuChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(api.vayuu.getMessages) || [];
  const sendMessage = useMutation(api.vayuu.sendMessage);
  const clearHistory = useMutation(api.vayuu.clearHistory);

  // Determine if loading: if last message is user, we are waiting for bot
  const isThinking = messages.length > 0 && messages[messages.length - 1].role === "user";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const tempInput = input;
    setInput(""); // Clear input immediately
    
    try {
      await sendMessage({ message: tempInput });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally restore input or show error toast
    }
  };

  const handleClear = async () => {
    if (confirm("Are you sure you want to clear your chat history with Vayuu?")) {
      await clearHistory();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 z-50 w-80 md:w-96 shadow-2xl"
          >
            <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
              <CardHeader className="bg-primary p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1 rounded-full">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-white text-lg">Chat with Vayuu</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleClear} 
                    className="text-white hover:bg-white/20 h-8 w-8"
                    title="Clear History"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 h-8 w-8">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.length === 0 && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-foreground rounded-2xl rounded-bl-none px-4 py-2 text-sm font-medium">
                          Hi! I'm Vayuu. Ask me anything about the YuvaVerse portal! 🚀
                        </div>
                      </div>
                    )}
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm font-medium ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted text-foreground rounded-bl-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isThinking && (
                      <div className="flex justify-start">
                        <div className="bg-muted text-foreground rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs opacity-70">Vayuu is thinking...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-3 bg-muted/20 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex w-full gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Vayuu..."
                    className="bg-background border-black/20 focus-visible:ring-primary"
                    disabled={isThinking}
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || isThinking}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 h-14 w-14 bg-black text-white rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex items-center justify-center border-2 border-white/20 hover:bg-gray-900 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  );
}
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function VayuuChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm Vayuu. Ask me anything about the YuvaVerse portal! 🚀"
    }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // Simple keyword-based response logic
    setTimeout(() => {
      let response = "I'm not sure about that. Try asking about syllabus, resources, games, or your profile!";
      const lowerInput = userMsg.content.toLowerCase();

      if (lowerInput.includes("syllabus")) {
        response = "You can track your academic progress in the Syllabus section. Select your stream and semester to see topics!";
      } else if (lowerInput.includes("resource") || lowerInput.includes("notes") || lowerInput.includes("paper")) {
        response = "Head to the Resources page to find notes, question papers, and books uploaded by the community. You can also upload your own!";
      } else if (lowerInput.includes("game") || lowerInput.includes("play") || lowerInput.includes("arcade")) {
        response = "Need a break? The Arcade Zone features games like Tic-Tac-Toe, Snake, and more. Win games to earn points!";
      } else if (lowerInput.includes("point") || lowerInput.includes("leaderboard") || lowerInput.includes("rank")) {
        response = "You earn points by uploading resources, winning games, and maintaining streaks. Check the Leaderboard on the Dashboard to see where you stand!";
      } else if (lowerInput.includes("group") || lowerInput.includes("chat")) {
        response = "You can join or create Study Groups to collaborate with peers. Premium users can create more groups!";
      } else if (lowerInput.includes("notebook") || lowerInput.includes("ai")) {
        response = "NotebookLM is your AI study companion. Upload documents and get summaries, quizzes, and mind maps generated instantly.";
      } else if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
        response = "Hello there! Ready to study or play today? ⚡";
      } else if (lowerInput.includes("who are you")) {
        response = "I am Vayuu, your personal AI guide for the YuvaVerse campus!";
      }

      const botMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 shadow-2xl"
          >
            <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] overflow-hidden">
              <CardHeader className="bg-primary p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1 rounded-full">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-white text-lg">Chat with Vayuu</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20">
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px] p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
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
                  />
                  <Button type="submit" size="icon" disabled={!input.trim()}>
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
        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-black text-white rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] flex items-center justify-center border-2 border-white/20 hover:bg-gray-900 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  );
}

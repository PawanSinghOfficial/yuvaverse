import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Users, Lock, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function GroupChat() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const group = useQuery(api.groups.get, { id: groupId as Id<"groups"> });
  const messages = useQuery(api.groups.getMessages, { groupId: groupId as Id<"groups"> });
  const sendMessage = useMutation(api.groups.sendMessage);
  const joinGroup = useMutation(api.groups.join);
  const members = useQuery(api.groups.getMembers, { groupId: groupId as Id<"groups"> });

  const isMember = members?.some((m) => m.userId === user?._id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;

    try {
      await sendMessage({
        groupId: groupId as Id<"groups">,
        content: newMessage,
        type: "text",
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleJoin = async () => {
    if (!groupId) return;
    try {
      await joinGroup({ groupId: groupId as Id<"groups"> });
      toast.success("Joined group successfully!");
    } catch (error) {
      toast.error("Failed to join group");
    }
  };

  if (!group) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/groups")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold flex items-center gap-2">
              {group.name}
              {group.isPrivate ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Globe className="h-3 w-3 text-muted-foreground" />}
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> {members?.length || 0} members
            </p>
          </div>
        </div>
        {!isMember && (
          <Button onClick={handleJoin} size="sm">
            Join Group
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages?.slice().reverse().map((msg) => {
            const isMe = msg.userId === user?._id;
            const sender = members?.find(m => m.userId === msg.userId)?.user;
            
            return (
              <div
                key={msg._id}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={sender?.image} />
                  <AvatarFallback>{sender?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col max-w-[70%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {sender?.name || "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted text-foreground rounded-tl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isMember ? "Type a message..." : "Join the group to chat"}
            disabled={!isMember}
            className="flex-1"
          />
          <Button type="submit" disabled={!isMember || !newMessage.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

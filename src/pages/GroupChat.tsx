import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Users, Lock, Globe, Video, Mic, Square, Check, CheckCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function GroupChat() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const group = useQuery(api.groups.get, { id: groupId as Id<"groups"> });
  const messages = useQuery(api.groups.getMessages, { groupId: groupId as Id<"groups"> });
  const sendMessage = useMutation(api.groups.sendMessage);
  const joinGroup = useMutation(api.groups.join);
  const members = useQuery(api.groups.getMembers, { groupId: groupId as Id<"groups"> });
  const markAsRead = useMutation(api.groups.markAsRead);
  const generateUploadUrl = useMutation(api.groups.generateUploadUrl);

  const isMember = members?.some((m) => m.userId === user?._id);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (messages && user) {
      messages.forEach((msg) => {
        if (!msg.seenBy?.includes(user._id)) {
          markAsRead({ messageId: msg._id });
        }
      });
    }
  }, [messages, user, markAsRead]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const sendAudioMessage = async (blob: Blob) => {
    if (!groupId) return;
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();

      await sendMessage({
        groupId: groupId as Id<"groups">,
        content: storageId,
        type: "audio",
      });
    } catch (error) {
      toast.error("Failed to send audio");
    }
  };

  const handleVideoCall = () => {
    window.open(`https://meet.jit.si/YuvaVerse-${groupId}`, '_blank');
  };

  const handleJoin = async () => {
    if (!groupId) return;
    try {
      await joinGroup({ groupId: groupId as Id<"groups"> });
      toast.success("Joined group successfully!");
    } catch (error) {
      toast.error("Failed to join group. If private, join from the Groups page.");
    }
  };

  if (!group) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] bg-background">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/groups")} className="rounded-full hover:bg-primary/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            {group.imageUrl && (
                <Avatar>
                    <AvatarImage src={group.imageUrl} />
                    <AvatarFallback>{group.name[0]}</AvatarFallback>
                </Avatar>
            )}
            <div>
                <h1 className="font-bold flex items-center gap-2">
                {group.name}
                {group.isPrivate ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Globe className="h-3 w-3 text-muted-foreground" />}
                </h1>
                <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-primary">
                    <Users className="h-3 w-3 mr-1" /> {members?.length || 0} members
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                    <SheetTitle>Group Members</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
                    <div className="space-y-4">
                        {members?.map((member) => (
                        <div key={member._id} className="flex items-center gap-3">
                            <Avatar>
                            <AvatarImage src={member.user?.image} />
                            <AvatarFallback>{member.user?.name?.[0] || "?"}</AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-medium">{member.user?.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                    </ScrollArea>
                </SheetContent>
                </Sheet>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {isMember && (
                <Button variant="outline" size="icon" className="rounded-full" onClick={handleVideoCall} title="Start Video Call">
                    <Video className="h-4 w-4" />
                </Button>
            )}
            {!isMember && (
            <Button onClick={handleJoin} size="sm" className="rounded-full">
                Join Group
            </Button>
            )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-secondary/30">
        <div className="space-y-4 max-w-3xl mx-auto pb-4">
          {messages?.slice().reverse().map((msg) => {
            const isMe = msg.userId === user?._id;
            const sender = members?.find(m => m.userId === msg.userId)?.user;
            const isSeen = msg.seenBy && msg.seenBy.length > 1; // Seen by more than just sender
            
            return (
              <div
                key={msg._id}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="h-8 w-8 border-2 border-background shadow-sm">
                  <AvatarImage src={sender?.image} />
                  <AvatarFallback>{sender?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col max-w-[70%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {sender?.name || "Unknown"}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-card text-card-foreground rounded-tl-none"
                    }`}
                  >
                    {msg.type === "text" && msg.content}
                    {msg.type === "audio" && msg.contentUrl && (
                        <audio controls src={msg.contentUrl} className="h-8 w-48" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-muted-foreground/60">
                      {new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                        <span className="text-muted-foreground/60">
                            {isSeen ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />}
                        </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex gap-2 items-center">
          {isMember && (
              <Button 
                variant={isRecording ? "destructive" : "ghost"} 
                size="icon" 
                className="rounded-full shrink-0"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5" />}
              </Button>
          )}
          
          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isRecording ? "Recording..." : (isMember ? "Type a message..." : "Join the group to chat")}
              disabled={!isMember || isRecording}
              className="flex-1 rounded-full bg-secondary/50 border-transparent focus:border-primary/20 focus:bg-background transition-all shadow-inner"
            />
            <Button type="submit" disabled={!isMember || !newMessage.trim()} size="icon" className="rounded-full shrink-0 shadow-md hover:shadow-lg transition-all">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
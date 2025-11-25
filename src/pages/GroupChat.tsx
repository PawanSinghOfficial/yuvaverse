import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Users, Lock, Globe, Video, Mic, Square, Check, CheckCheck, Timer, Settings, Edit, Image as ImageIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

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
  const [disappearingDuration, setDisappearingDuration] = useState("0");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const getExpiresInMinutes = () => {
    const minutes = parseInt(disappearingDuration, 10);
    return Number.isFinite(minutes) && minutes > 0 ? minutes : undefined;
  };

  const group = useQuery(api.groups.get, { id: groupId as Id<"groups"> });
  const messages = useQuery(api.groups.getMessages, { groupId: groupId as Id<"groups"> });
  const sendMessage = useMutation(api.groups.sendMessage);
  const joinGroup = useMutation(api.groups.join);
  const members = useQuery(api.groups.getMembers, { groupId: groupId as Id<"groups"> });
  const markAsRead = useMutation(api.groups.markAsRead);
  const generateUploadUrl = useMutation(api.groups.generateUploadUrl);
  const updateGroup = useMutation(api.groups.updateGroup);

  const isMember = members?.some((m) => m.userId === user?._id);
  const isStudyGroup = group?.type === "study";
  const isCreator = group?.creatorId === user?._id;

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
      const expiresInMinutes = getExpiresInMinutes();
      await sendMessage({
        groupId: groupId as Id<"groups">,
        content: newMessage,
        type: "text",
        expiresInMinutes,
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
      const expiresInMinutes = getExpiresInMinutes();

      await sendMessage({
        groupId: groupId as Id<"groups">,
        content: storageId,
        type: "audio",
        expiresInMinutes,
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

  const handleUpdateGroup = async () => {
    if (!groupId) return;
    try {
      await updateGroup({
        groupId: groupId as Id<"groups">,
        name: editName || undefined,
        description: editDescription || undefined,
      });
      toast.success("Group updated!");
      setIsSettingsOpen(false);
    } catch (error) {
      toast.error("Failed to update group");
    }
  };

  const handleGroupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !groupId) return;

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();
      
      await updateGroup({
        groupId: groupId as Id<"groups">,
        image: storageId,
      });
      toast.success("Group icon updated!");
    } catch (error) {
      toast.error("Failed to update group icon");
    }
  };

  if (!group) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] bg-white">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-white/95 backdrop-blur shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/groups")} className="rounded-full hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative group/icon">
                {group.imageUrl ? (
                    <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarImage src={group.imageUrl} />
                        <AvatarFallback>{group.name[0]}</AvatarFallback>
                    </Avatar>
                ) : (
                    <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarFallback>{group.name[0]}</AvatarFallback>
                    </Avatar>
                )}
                {isCreator && (
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/icon:opacity-100 rounded-full cursor-pointer transition-opacity">
                        <Edit className="h-4 w-4 text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleGroupImageUpload} />
                    </label>
                )}
            </div>
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
            {isCreator && (
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => {
                            setEditName(group.name);
                            setEditDescription(group.description || "");
                        }}>
                            <Settings className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Group Settings</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Group Name</Label>
                                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleUpdateGroup}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
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
      <ScrollArea className="flex-1 p-4 bg-white">
        <div className="space-y-4 max-w-3xl mx-auto pb-4">
          {messages?.slice().reverse().map((msg) => {
            const isMe = msg.userId === user?._id;
            const sender = members?.find((m) => m.userId === msg.userId)?.user;
            const isSeen = msg.seenBy && msg.seenBy.length > 1;
            const isDisappearing = Boolean(msg.expiresAt);
            
            return (
              <div
                key={msg._id}
                className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                <Avatar className="h-8 w-8 border border-gray-100 shadow-sm">
                  <AvatarImage src={sender?.image} />
                  <AvatarFallback>{sender?.name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col max-w-[70%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-medium text-gray-500">
                      {sender?.name || "Unknown"}
                    </span>
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isMe
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-900 rounded-tl-none"
                    } ${isDisappearing ? "border border-amber-500/40" : ""}`}
                  >
                    {msg.type === "text" && msg.content}
                    {msg.type === "audio" && msg.contentUrl && (
                        <audio controls src={msg.contentUrl} className="h-8 w-48" />
                    )}
                  </div>
                  {msg.expiresAt && (
                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-amber-600">
                      <Timer className="h-3 w-3" />
                      Disappears at{" "}
                      {new Date(msg.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMe && (
                        <span className="text-gray-400">
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
      <div className="p-4 border-t bg-white">
        <div className="max-w-3xl mx-auto space-y-3">
          {isStudyGroup && (
            <div className="flex flex-col gap-2 text-xs text-gray-500 sm:flex-row sm:items-center">
              <span className="flex items-center gap-1 font-semibold uppercase tracking-wide">
                <Timer className="h-3 w-3" />
                Disappearing messages
              </span>
              <Select
                value={disappearingDuration}
                onValueChange={setDisappearingDuration}
                disabled={!isMember}
              >
                <SelectTrigger className="h-8 w-full rounded-full bg-gray-50 border-gray-200 focus-visible:ring-0 focus:ring-0 sm:w-64">
                  <SelectValue placeholder="Keep forever" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Keep forever</SelectItem>
                  <SelectItem value="60">Disappear in 1 hour</SelectItem>
                  <SelectItem value="1440">Disappear in 24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-2 items-center">
            {isMember && (
              <Button
                variant={isRecording ? "destructive" : "ghost"}
                size="icon"
                className="rounded-full shrink-0 hover:bg-gray-100"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5 text-gray-500" />}
              </Button>
            )}

            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  isRecording ? "Recording..." : isMember ? "Type a message..." : "Join the group to chat"
                }
                disabled={!isMember || isRecording}
                className="flex-1 rounded-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
              <Button
                type="submit"
                disabled={!isMember || !newMessage.trim()}
                size="icon"
                className="rounded-full shrink-0 shadow-md hover:shadow-lg transition-all bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
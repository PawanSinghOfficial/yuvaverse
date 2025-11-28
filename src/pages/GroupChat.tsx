import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useNavigate } from "react-router";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Users, Lock, Globe, Video, Mic, Square, Check, CheckCheck, Timer, Settings, Edit, Image as ImageIcon, UserMinus, Search, Loader2, Maximize2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [memberToRemove, setMemberToRemove] = useState<Id<"users"> | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

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
  const removeMember = useMutation(api.groups.removeMember);

  const isMember = members?.some((m) => m.userId === user?._id);
  const isStudyGroup = group?.type === "study";
  const isCreator = group?.creatorId === user?._id;
  const currentUserRole = members?.find(m => m.userId === user?._id)?.role;

  const filteredMembers = members?.filter(member => 
    member.user?.name?.toLowerCase().includes(memberSearch.toLowerCase())
  ).sort((a, b) => {
    // 1. Creator always on top
    const isACreator = a.userId === group?.creatorId;
    const isBCreator = b.userId === group?.creatorId;
    if (isACreator && !isBCreator) return -1;
    if (!isACreator && isBCreator) return 1;

    // 2. Admins before members
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (a.role !== "admin" && b.role === "admin") return 1;

    // 3. Alphabetical by name
    return (a.user?.name || "").localeCompare(b.user?.name || "");
  });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file || !groupId) return;

    setIsUploading(true);
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();
      const expiresInMinutes = getExpiresInMinutes();

      await sendMessage({
        groupId: groupId as Id<"groups">,
        content: storageId,
        type: type,
        expiresInMinutes,
      });
      toast.success(`${type === 'image' ? 'Image' : 'Video'} sent!`);
    } catch (error) {
      toast.error(`Failed to send ${type}`);
    } finally {
      setIsUploading(false);
      // Reset input value to allow selecting same file again
      e.target.value = '';
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

  const handleConfirmRemove = async () => {
    if (!groupId || !memberToRemove) return;
    
    try {
        await removeMember({
            groupId: groupId as Id<"groups">,
            userId: memberToRemove
        });
        toast.success("Member removed");
        setMemberToRemove(null);
    } catch (error) {
        toast.error("Failed to remove member");
    }
  };

  if (!group) return <div className="p-8">Loading...</div>;

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-xl border shadow-sm overflow-hidden">
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
                    <div className="my-4 px-1">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search members..."
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <ScrollArea className="h-[calc(100vh-10rem)] mt-0">
                    <div className="space-y-4">
                        {filteredMembers?.map((member) => (
                        <div key={member._id} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                <AvatarImage src={member.user?.image} />
                                <AvatarFallback>{member.user?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div>
                                <p className="font-medium">{member.user?.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                </div>
                            </div>
                            {(isCreator || (currentUserRole === "admin" && member.role !== "admin")) && member.userId !== user?._id && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                    onClick={() => setMemberToRemove(member.userId)}
                                >
                                    <UserMinus className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        ))}
                    </div>
                    </ScrollArea>
                    <AlertDialog open={!!memberToRemove} onOpenChange={(open) => !open && setMemberToRemove(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to remove this member from the group? They will need to rejoin to access the chat.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleConfirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Remove
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
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
                    {msg.type === "image" && msg.contentUrl && (
                        <div className="relative group/image">
                            <img 
                                src={msg.contentUrl} 
                                alt="Shared image" 
                                className="max-w-[240px] max-h-[300px] rounded-lg border border-gray-200 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => setPreviewImage(msg.contentUrl!)}
                            />
                        </div>
                    )}
                    {msg.type === "video" && msg.contentUrl && (
                        <div className="relative group/video">
                            <video 
                                src={msg.contentUrl} 
                                className="max-w-[240px] max-h-[300px] rounded-lg border border-gray-200 bg-black" 
                                controls
                                preload="metadata"
                            />
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/video:opacity-100 transition-opacity rounded-full shadow-sm bg-white/80 hover:bg-white"
                                onClick={() => setPreviewVideo(msg.contentUrl!)}
                                title="Expand video"
                            >
                                <Maximize2 className="h-3 w-3 text-black" />
                            </Button>
                        </div>
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

      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-screen-lg w-auto h-auto p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden">
           <DialogTitle className="sr-only">Image Preview</DialogTitle>
           <img 
             src={previewImage || ""} 
             alt="Preview" 
             className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
           />
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewVideo} onOpenChange={(open) => !open && setPreviewVideo(null)}>
        <DialogContent className="max-w-screen-lg w-auto h-auto p-0 bg-transparent border-none shadow-none flex items-center justify-center overflow-hidden">
           <DialogTitle className="sr-only">Video Preview</DialogTitle>
           <video 
             controls 
             autoPlay
             src={previewVideo || ""} 
             className="max-w-full max-h-[85vh] rounded-md shadow-2xl bg-black"
           />
        </DialogContent>
      </Dialog>

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
              <>
                <Button
                    variant={isRecording ? "destructive" : "ghost"}
                    size="icon"
                    className="rounded-full shrink-0 hover:bg-gray-100"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isUploading}
                >
                    {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-5 w-5 text-gray-500" />}
                </Button>
                <label className={`cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-gray-500" /> : <ImageIcon className="h-5 w-5 text-gray-500" />}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "image")} disabled={isUploading || isRecording} />
                </label>
                <label className={`cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Video className="h-5 w-5 text-gray-500" />
                  <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, "video")} disabled={isUploading || isRecording} />
                </label>
              </>
            )}

            <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  isRecording ? "Recording..." : isUploading ? "Uploading..." : isMember ? "Type a message..." : "Join the group to chat"
                }
                disabled={!isMember || isRecording || isUploading}
                className="flex-1 rounded-full bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white transition-all shadow-inner"
              />
              <Button
                type="submit"
                disabled={!isMember || !newMessage.trim() || isUploading}
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
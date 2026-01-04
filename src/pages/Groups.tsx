import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Lock, Globe, Plus, Loader2, Image as ImageIcon, Flag, AlertTriangle, Trophy, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/use-auth";

export default function Groups() {
  const { user } = useAuth();
  const groups = useQuery(api.groups.list);
  const userGroups = useQuery(api.groups.getUserGroups);
  const createGroup = useMutation(api.groups.create);
  const generateUploadUrl = useMutation(api.groups.generateUploadUrl);
  const joinGroup = useMutation(api.groups.join);
  const reportGroup = useMutation(api.groups.report);
  const deleteGroup = useMutation(api.groups.deleteGroup);
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "study" as "study" | "social",
    isPrivate: false,
    password: "",
    image: null as File | null,
  });

  const [joinPassword, setJoinPassword] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Id<"groups"> | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  
  // Reporting state
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [groupToReport, setGroupToReport] = useState<Id<"groups"> | null>(null);
  const [isConfirmReportOpen, setIsConfirmReportOpen] = useState(false);

  const isMember = (groupId: Id<"groups">) => {
    return userGroups?.includes(groupId);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      let imageId = undefined;
      if (formData.image) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": formData.image.type },
          body: formData.image,
        });
        if (!result.ok) throw new Error("Upload failed");
        const { storageId } = await result.json();
        imageId = storageId;
      }

      await createGroup({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        isPrivate: formData.isPrivate,
        password: formData.isPrivate ? formData.password : undefined,
        image: imageId,
      });
      toast.success("Group created successfully!");
      setIsOpen(false);
      setFormData({ name: "", description: "", type: "study", isPrivate: false, password: "", image: null });
    } catch (error) {
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (groupId: Id<"groups">, isPrivate: boolean) => {
    if (isPrivate) {
      setSelectedGroup(groupId);
      setIsJoinDialogOpen(true);
      return;
    }
    
    try {
      await joinGroup({ groupId });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success("Joined group!");
      navigate(`/groups/${groupId}`);
    } catch (error) {
      toast.error("Failed to join group");
    }
  };

  const handlePrivateJoin = async () => {
    if (!selectedGroup) return;
    try {
      await joinGroup({ groupId: selectedGroup, password: joinPassword });
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success("Joined group!");
      setIsJoinDialogOpen(false);
      setJoinPassword("");
      navigate(`/groups/${selectedGroup}`);
    } catch (error) {
      toast.error("Incorrect password or failed to join");
    }
  };

  const openReportDialog = (groupId: Id<"groups">) => {
    setGroupToReport(groupId);
    setReportReason("");
    setIsReportDialogOpen(true);
  };

  const handleReportSubmitClick = () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting.");
      return;
    }
    setIsConfirmReportOpen(true);
  };

  const handleConfirmReport = async () => {
    if (!groupToReport) return;

    try {
      await reportGroup({ groupId: groupToReport, reason: reportReason });
      toast.success("Group reported to admins.");
      setIsConfirmReportOpen(false);
      setIsReportDialogOpen(false);
      setGroupToReport(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to report group");
    }
  };

  const handleDelete = async (groupId: Id<"groups">) => {
    try {
      await deleteGroup({ groupId });
      toast.success("Group deleted.");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete group");
    }
  };

  return (
    <div className="w-full min-h-full bg-pink-50 dark:bg-background flex flex-col">
      <div className="p-4 md:p-8 space-y-8 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Student Groups</h1>
            <p className="text-lg font-medium text-muted-foreground border border-border bg-white dark:bg-card p-2 inline-block shadow-[4px_4px_0px_0px_var(--shadow)] mt-2">
              Join a squad, collaborate, and conquer quests together.
            </p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase">Create a New Group</DialogTitle>
                <DialogDescription>Form a team and start your journey.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input 
                    id="name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., The Code Warriors"
                    className="border-2 border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    required 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="What's your group about?"
                    className="border-2 border-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Group Image (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="image" 
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFormData({...formData, image: file});
                      }}
                      className="border-2 border-black cursor-pointer file:cursor-pointer file:text-foreground file:border-0 file:bg-transparent file:text-sm file:font-medium"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="private" 
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => setFormData({...formData, isPrivate: checked})}
                  />
                  <Label htmlFor="private">Private Group</Label>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating} className="w-full font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Group
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups?.map((group) => (
            <Card key={group._id} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white dark:bg-card flex flex-col overflow-hidden">
              <div className="h-32 w-full bg-secondary/10 border-b-4 border-black relative">
                {group.imageUrl ? (
                  <img 
                    src={group.imageUrl} 
                    alt={group.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-pink-100 dark:bg-pink-900/20">
                    <Users className="h-12 w-12 text-pink-400/50" />
                  </div>
                )}
                {group.isPrivate && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-background border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Lock className="w-3 h-3 mr-1" /> PRIVATE
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-black uppercase tracking-tight line-clamp-1">{group.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <p className="text-muted-foreground font-medium mb-4 line-clamp-2 text-sm">{group.description}</p>
                  <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{group.members.length} Members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                      <span>{group.xp} XP</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    if (isMember(group._id)) {
                      navigate(`/groups/${group._id}`);
                    } else {
                      handleJoin(group._id, group.isPrivate);
                    }
                  }}
                  className={`w-full font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                    isMember(group._id) 
                      ? "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isMember(group._id) ? "Enter Chat" : "Join Squad"}
                </Button>
              </CardContent>
            </Card>
          ))}
          {groups?.length === 0 && (
              <div className="col-span-full text-center py-20 text-muted-foreground border-4 border-dashed border-black/20 rounded-xl bg-secondary/5">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p className="text-xl font-bold">No groups found.</p>
                  <p>Be the first to create a squad!</p>
              </div>
          )}
        </div>
      </div>

      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle>Join Private Group</DialogTitle>
            <DialogDescription>
              This group is private. Please enter the password to join.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="Enter group password"
                className="border-2 border-black"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)} className="border-2 border-black">Cancel</Button>
            <Button onClick={handlePrivateJoin} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Join Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle>Report Group</DialogTitle>
            <DialogDescription>
              Please provide a reason for reporting this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Why are you reporting this group?"
                className="border-2 border-black"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)} className="border-2 border-black">Cancel</Button>
            <Button variant="destructive" onClick={handleReportSubmitClick} className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Report Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmReportOpen} onOpenChange={setIsConfirmReportOpen}>
        <AlertDialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to report this group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-2 border-black">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReport} className="bg-destructive text-destructive-foreground border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Report</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
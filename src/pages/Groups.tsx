import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Lock, Globe, Plus, Loader2, Image as ImageIcon, Flag, AlertTriangle, Trash2 } from "lucide-react";
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
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/use-auth";

export default function Groups() {
  const { user } = useAuth();
  const groups = useQuery(api.groups.list);
  const memberships = useQuery(api.groups.getUserMemberships);
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
    return memberships?.some((m) => m.groupId === groupId);
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
    <div className="p-4 md:p-8 space-y-8 w-full min-h-full bg-pink-50 dark:bg-background border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Study & Social Groups</h1>
          <p className="text-lg font-medium text-muted-foreground border border-border bg-white dark:bg-card p-2 inline-block shadow-[4px_4px_0px_0px_var(--shadow)] mt-2">
            Connect with peers, join discussions, and collaborate.
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
              <DialogTitle className="text-2xl font-black uppercase">Create a Group</DialogTitle>
              <DialogDescription>Start a new community for study or social activities.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image" className="font-bold uppercase">Group Image (Optional)</Label>
                <div className="flex items-center gap-4">
                    <Input 
                        id="image" 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, image: e.target.files?.[0] || null})}
                        className="cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold uppercase">Group Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., React Learners"
                  className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold uppercase">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this group about?"
                  className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="font-bold uppercase">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v: "study" | "social") => setFormData({...formData, type: v})}
                >
                  <SelectTrigger className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black">
                    <SelectItem value="study">Study Group</SelectItem>
                    <SelectItem value="social">Social Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                <div className="space-y-0.5">
                  <Label className="font-bold uppercase">Private Group</Label>
                  <p className="text-xs text-muted-foreground">Only invited members can join</p>
                </div>
                <Switch 
                  checked={formData.isPrivate}
                  onCheckedChange={(c) => setFormData({...formData, isPrivate: c})}
                  className="data-[state=checked]:bg-black"
                />
              </div>
              {formData.isPrivate && (
                <div className="space-y-2">
                  <Label htmlFor="password">Group Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    required 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Set a password"
                    className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isCreating} className="w-full font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Group
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase">Enter Password</DialogTitle>
              <DialogDescription>This group is private. Please enter the password to join.</DialogDescription>
            </DialogHeader>
            <Input 
              type="password" 
              value={joinPassword} 
              onChange={(e) => setJoinPassword(e.target.value)}
              placeholder="Password"
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            <DialogFooter>
              <Button onClick={handlePrivateJoin} className="w-full font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">Join</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase">Report Group</DialogTitle>
              <DialogDescription>Please explain why you are reporting this group. Admins will review your report.</DialogDescription>
            </DialogHeader>
            <Textarea 
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting (e.g., inappropriate content, spam)..."
              className="min-h-[100px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReportDialogOpen(false)} className="font-bold border-2 border-black">Cancel</Button>
              <Button variant="destructive" onClick={handleReportSubmitClick} className="font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Submit Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isConfirmReportOpen} onOpenChange={setIsConfirmReportOpen}>
          <AlertDialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black uppercase">Confirm Report</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to report this group? False reporting may lead to account restrictions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold border-2 border-black">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmReport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Confirm Report
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => {
          const member = isMember(group._id);
          const reportCount = group.reports?.length || 0;
          const isReported = reportCount > 0;
          const canDelete = user?.role === "admin" && reportCount >= 2;

          return (
            <Card key={group._id} className="flex flex-col overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all relative group bg-card">
              {isReported && (
                <div className="absolute top-2 right-2 z-10 animate-pulse">
                   <div className="bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Reported {reportCount > 1 ? `(${reportCount})` : ""}
                   </div>
                </div>
              )}
              <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5 relative border-b-2 border-black">
                 {group.imageUrl ? (
                    <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary/20">
                        <Users className="h-12 w-12" />
                    </div>
                 )}
              </div>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative -mt-6 px-4">
                <div className="space-y-1 bg-white dark:bg-card border-2 border-black p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <CardTitle className="text-base font-black uppercase">{group.name}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                    {group.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                    <span className="capitalize">{group.type} Group</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col pt-4 px-4 pb-4">
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1 font-medium">
                  {group.description || "No description provided."}
                </p>
                <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1 font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all" 
                      variant={member ? "secondary" : "default"}
                      onClick={() => {
                        if (member) {
                          navigate(`/groups/${group._id}`);
                        } else {
                          handleJoin(group._id, group.isPrivate);
                        }
                      }}
                    >
                      {member ? "View Group" : (group.isPrivate ? "Join Private Group" : "Join Group")}
                    </Button>
                    
                    {canDelete ? (
                        <Button
                            variant="destructive"
                            size="icon"
                            className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            onClick={() => handleDelete(group._id)}
                            title="Delete Reported Group"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-2 border-transparent hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            onClick={() => openReportDialog(group._id)}
                            title="Report Group"
                        >
                            <Flag className="h-4 w-4" />
                        </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          );
        })}
         {groups?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground border-4 border-dashed border-black/20 rounded-xl bg-white/50">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bold">No groups found.</p>
                <p>Create one to get started!</p>
            </div>
        )}
      </div>
    </div>
  );
}
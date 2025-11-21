import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Lock, Globe, Plus, Loader2 } from "lucide-react";
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

export default function Groups() {
  const groups = useQuery(api.groups.list);
  const memberships = useQuery(api.groups.getUserMemberships);
  const createGroup = useMutation(api.groups.create);
  const joinGroup = useMutation(api.groups.join);
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "study" as "study" | "social",
    isPrivate: false,
    password: "",
  });

  const [joinPassword, setJoinPassword] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<Id<"groups"> | null>(null);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);

  const isMember = (groupId: Id<"groups">) => {
    return memberships?.some((m) => m.groupId === groupId);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createGroup({
        ...formData,
        password: formData.isPrivate ? formData.password : undefined,
      });
      toast.success("Group created successfully!");
      setIsOpen(false);
      setFormData({ name: "", description: "", type: "study", isPrivate: false, password: "" });
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
      toast.success("Joined group!");
      setIsJoinDialogOpen(false);
      setJoinPassword("");
      navigate(`/groups/${selectedGroup}`);
    } catch (error) {
      toast.error("Incorrect password or failed to join");
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Study & Social Groups</h1>
          <p className="text-muted-foreground mt-2">Connect with peers, join discussions, and collaborate.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Group</DialogTitle>
              <DialogDescription>Start a new community for study or social activities.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., React Learners"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this group about?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v: "study" | "social") => setFormData({...formData, type: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study">Study Group</SelectItem>
                    <SelectItem value="social">Social Group</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <Label>Private Group</Label>
                  <p className="text-xs text-muted-foreground">Only invited members can join</p>
                </div>
                <Switch 
                  checked={formData.isPrivate}
                  onCheckedChange={(c) => setFormData({...formData, isPrivate: c})}
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
                  />
                </div>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Group
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Password</DialogTitle>
              <DialogDescription>This group is private. Please enter the password to join.</DialogDescription>
            </DialogHeader>
            <Input 
              type="password" 
              value={joinPassword} 
              onChange={(e) => setJoinPassword(e.target.value)}
              placeholder="Password"
            />
            <DialogFooter>
              <Button onClick={handlePrivateJoin}>Join</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups?.map((group) => {
          const member = isMember(group._id);
          return (
            <Card key={group._id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">{group.name}</CardTitle>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {group.isPrivate ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                    <span className="capitalize">{group.type} Group</span>
                  </div>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 flex-1">
                  {group.description || "No description provided."}
                </p>
                <Button 
                  className="w-full mt-4" 
                  variant={member ? "secondary" : "outline"}
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
              </CardContent>
            </Card>
          );
        })}
         {groups?.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
                No groups found. Create one to get started!
            </div>
        )}
      </div>
    </div>
  );
}
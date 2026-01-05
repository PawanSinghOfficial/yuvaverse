import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCog, Medal, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface DashboardProfileProps {
  user: any;
  badge: any;
  streakIncreased: boolean;
}

export function DashboardProfile({ user, badge, streakIncreased }: DashboardProfileProps) {
  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateAvatar = useMutation(api.users.updateAvatar);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [branch, setBranch] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    if (user) {
      setBranch(user.branch || "");
      setCollege(user.college || "");
      setYear(user.year || "");
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ branch, college, year });
      toast.success("Profile updated!");
      setIsEditingProfile(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) throw new Error("Upload failed");
      const { storageId } = await result.json();
      
      await updateAvatar({ storageId });
      toast.success("Avatar updated!");
    } catch (error) {
      toast.error("Failed to update avatar");
    }
  };

  return (
    <div className="flex items-center gap-6" id="dashboard-profile">
       <div className="relative group">
          {user?.image ? (
            <img src={user.image} alt="Avatar" className="h-20 w-20 object-cover border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow)]" />
          ) : (
            <div className="h-20 w-20 bg-secondary flex items-center justify-center text-black font-bold text-3xl border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow)]">
              {user?.name?.[0] || "U"}
            </div>
          )}
          <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-2 border-transparent">
            <span className="text-white text-xs font-bold uppercase">Change</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </label>
          <div className={`absolute -bottom-3 -right-3 h-12 w-12 flex items-center justify-center rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-br ${badge.gradient} text-2xl z-10 transition-transform hover:scale-110 hover:rotate-12`} title={`${badge.label} Badge`}>
            {badge.icon}
          </div>
       </div>
       <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">
              Hello, {user?.username || user?.name?.split(" ")[0] || "Student"}
            </h1>
            <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                  <UserCog className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold uppercase">Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="college">College / University</Label>
                    <Input 
                      id="college"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="e.g. IIT Bombay"
                      className="border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch / Major</Label>
                    <Input 
                      id="branch"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year of Study</Label>
                    <Input 
                      id="year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 2nd Year"
                      className="border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdateProfile} className="w-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">Save Profile</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-foreground font-medium mt-1 bg-card inline-block px-2 border border-border">
            {user?.college ? `${user.college} • ` : ""}
            {user?.branch ? `${user.branch} • ` : ""}
            {user?.year ? `${user.year}` : "Welcome to your digital campus."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Badge className={`bg-gradient-to-r ${badge.gradient} ${badge.accent} border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-1.5 text-sm font-black uppercase tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all`}>
              <Medal className="h-4 w-4 mr-2" />
              {badge.label}
            </Badge>
            <motion.div
              animate={streakIncreased ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              <Badge className="bg-orange-500 text-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 px-3 py-1.5 text-sm font-bold uppercase tracking-wide">
                <Flame className="h-4 w-4 fill-white" />
                {user?.streakCount || 0} day streak
              </Badge>
            </motion.div>
          </div>
       </div>
    </div>
  );
}

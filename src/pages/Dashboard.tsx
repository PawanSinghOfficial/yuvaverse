import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { BookOpen, Calendar, Users, MessageSquare, Trophy, Crown, Star, Flame, Medal, BookCheck } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getBadgeFromPoints, BADGE_LEVELS } from "@/lib/utils";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const upcomingEvents = useQuery(api.events.list) || [];
  const registeredEvents = useQuery(api.events.getRegisteredEvents) || [];
  const recentResources = useQuery(api.resources.list, {}) || [];
  const leaderboard = useQuery(api.users.getLeaderboard) || [];
  const totalTopicsCompleted = useQuery(api.syllabus.getUserTotalProgress) || 0;
  
  const setUsername = useMutation(api.users.setUsername);
  const redeemPoints = useMutation(api.users.redeemPoints);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const updateStreak = useMutation(api.users.updateStreak);

  const [newUsername, setNewUsername] = useState("");
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const [streakIncreased, setStreakIncreased] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const currentPoints = user?.points || 0;
  const badge = getBadgeFromPoints(currentPoints);
  
  // Calculate progress to next badge
  const currentBadgeIndex = BADGE_LEVELS.findIndex(b => currentPoints >= b.minPoints);
  const nextBadge = currentBadgeIndex > 0 ? BADGE_LEVELS[currentBadgeIndex - 1] : null;
  
  let progressPercentage = 100;
  if (nextBadge) {
    const currentLevelMin = BADGE_LEVELS[currentBadgeIndex].minPoints;
    const nextLevelMin = nextBadge.minPoints;
    const range = nextLevelMin - currentLevelMin;
    const gained = currentPoints - currentLevelMin;
    progressPercentage = Math.min(100, Math.max(0, (gained / range) * 100));
  }

  const streakSyncRef = useRef(false);

  useEffect(() => {
    if (!user?._id || streakSyncRef.current) return;
    streakSyncRef.current = true;
    updateStreak().then((result) => {
      if (result?.increased) {
        setStreakIncreased(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF4500'],
          shapes: ['star'],
        });
        toast.success("Daily Streak Increased! 🔥");
      }
    }).catch(() => {
      streakSyncRef.current = false;
    });
  }, [user?._id, updateStreak]);

  const isSocietyHead = user?.role === "society_head";
  const isPremium = user?.tier === "premium" || user?.tier === "elite";

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

  const handleSetUsername = async () => {
    try {
      await setUsername({ username: newUsername });
      toast.success("Username updated!");
      setIsSettingUsername(false);
    } catch (error) {
      toast.error("Failed to update username");
    }
  };

  const handleRedeem = async (plan: "premium" | "elite") => {
    try {
      await redeemPoints({ plan });
      toast.success(`Upgraded to ${plan}!`);
    } catch (error) {
      toast.error("Failed to redeem points. Insufficient balance?");
    }
  };

  return (
    <div className="p-8 space-y-8 bg-yellow-50 dark:bg-background min-h-screen">
      {/* Username Prompt */}
      {!user?.username && (
        <Card className="bg-primary text-primary-foreground border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)]">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-bold text-2xl uppercase">Set your Username</h3>
              <p className="text-sm font-medium opacity-90">Choose a unique username to be identified across YuvaVerse.</p>
            </div>
            <Dialog open={isSettingUsername} onOpenChange={setIsSettingUsername}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">Set Username</Button>
              </DialogTrigger>
              <DialogContent className="border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold uppercase">Choose Username</DialogTitle>
                </DialogHeader>
                <Input 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g., coolstudent123"
                  className="border-2 border-border rounded-none shadow-[4px_4px_0px_0px_var(--shadow)] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px] transition-all"
                />
                <DialogFooter>
                  <Button onClick={handleSetUsername} className="w-full">Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
              <h1 className="text-4xl font-black tracking-tighter uppercase">
                Hello, {user?.username || user?.name?.split(" ")[0] || "Student"}
              </h1>
              <p className="text-foreground font-medium mt-1 bg-card inline-block px-2 border border-border">
                Welcome to your digital campus.
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
        <div className="flex flex-col items-end gap-4">
          {nextBadge && (
            <div className="p-5 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] w-full max-w-xs relative overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <Trophy className="h-24 w-24" />
              </div>
              
              <div className="flex justify-between items-end mb-3 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Next Rank</span>
                  <span className={`text-lg font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${nextBadge.gradient}`}>
                    {nextBadge.label}
                  </span>
                </div>
                <div className="text-right">
                   <span className="text-xs font-black bg-black text-white px-2 py-1 border-2 border-transparent group-hover:border-black group-hover:bg-white group-hover:text-black transition-colors">
                     {Math.round(progressPercentage)}%
                   </span>
                </div>
              </div>
              
              <div className="relative h-6 w-full bg-gray-100 border-2 border-black z-10 shadow-inner">
                <div 
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${nextBadge.gradient} border-r-2 border-black transition-all duration-1000 ease-out relative overflow-hidden`} 
                  style={{ width: `${progressPercentage}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </div>
                <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20 pointer-events-none mix-blend-multiply"></div>
              </div>
              
              <div className="flex justify-between items-center mt-2 relative z-10">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Current: {currentPoints}</span>
                <span className="text-[10px] font-black text-black uppercase">
                  {nextBadge.minPoints - currentPoints} pts to go
                </span>
              </div>
            </div>
          )}
          <Button onClick={() => navigate("/resources")} className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all w-full md:w-auto" id="dashboard-upload-btn">
            <BookOpen className="mr-2 h-4 w-4" />
            Upload Resource
          </Button>
        </div>
      </div>

      {/* Stats / Quick Access Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" id="dashboard-stats-grid">
        <Card className="bg-card hover:bg-indigo-100 dark:hover:bg-indigo-900 cursor-pointer border-2 border-border shadow-[8px_8px_0px_0px_#4f46e5]" onClick={() => navigate("/syllabus")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-black uppercase">Syllabus</CardTitle>
            <BookCheck className="h-6 w-6 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{totalTopicsCompleted}</div>
            <p className="text-sm font-bold text-muted-foreground bg-indigo-200 dark:bg-indigo-800 dark:text-white inline-block px-1 mt-1">Topics Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:bg-violet-100 dark:hover:bg-violet-900 cursor-pointer border-2 border-border shadow-[8px_8px_0px_0px_#8b5cf6]" onClick={() => navigate("/resources")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-black uppercase">Resources</CardTitle>
            <BookOpen className="h-6 w-6 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{recentResources.length}</div>
            <p className="text-sm font-bold text-muted-foreground bg-violet-200 dark:bg-violet-800 dark:text-white inline-block px-1 mt-1">Files available</p>
          </CardContent>
        </Card>
        <Card className="bg-card hover:bg-orange-100 dark:hover:bg-orange-900 cursor-pointer border-2 border-border shadow-[8px_8px_0px_0px_#f97316]" onClick={() => navigate("/events")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-black uppercase">My Events</CardTitle>
            <Calendar className="h-6 w-6 text-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{registeredEvents.length}</div>
            <p className="text-sm font-bold text-muted-foreground bg-orange-200 dark:bg-orange-800 dark:text-white inline-block px-1 mt-1">Registered</p>
          </CardContent>
        </Card>
        
        {isPremium ? (
             <Card className="bg-amber-300 dark:bg-amber-700 border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)]">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-lg font-black uppercase text-black dark:text-white">Premium</CardTitle>
               <Crown className="h-6 w-6 text-black dark:text-white" />
             </CardHeader>
             <CardContent>
               <div className="text-4xl font-black text-black dark:text-white">Active</div>
               <p className="text-sm font-bold text-black/80 dark:text-white/80 mt-1">All features unlocked</p>
             </CardContent>
           </Card>
        ) : (
            <Card className="bg-card hover:bg-emerald-100 dark:hover:bg-emerald-900 cursor-pointer border-2 border-border shadow-[8px_8px_0px_0px_#10b981]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-black uppercase">Points</CardTitle>
                <Trophy className="h-6 w-6 text-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-black">{user?.points || 0}</div>
                <p className="text-sm font-bold text-muted-foreground bg-emerald-200 dark:bg-emerald-800 dark:text-white inline-block px-1 mt-1">Contribution score</p>
            </CardContent>
            </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-6">
          {/* Registered Events Section */}
          {registeredEvents.length > 0 && (
            <Card className="bg-orange-50 dark:bg-card border-2 border-border shadow-[8px_8px_0px_0px_#f97316]" id="dashboard-registered-events">
              <CardHeader>
                <CardTitle className="text-orange-600 flex items-center gap-2 uppercase">
                  <Calendar className="h-6 w-6" />
                  Your Registered Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registeredEvents.map((event) => (
                    <div key={event?._id} className="flex items-start gap-4 border-b-2 border-border pb-4 last:border-0 last:pb-0">
                      <div className="bg-card border border-border p-3 text-center min-w-[70px] shadow-[4px_4px_0px_0px_var(--shadow)]">
                        <span className="block text-xs font-black uppercase text-foreground">
                          {new Date(event!.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="block text-2xl font-black text-foreground">
                          {new Date(event!.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-foreground uppercase">{event!.title}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm font-medium text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event!.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event!.location}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate("/events")} className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)]">
            <CardHeader>
              <CardTitle className="uppercase">Recent Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResources.slice(0, 3).map((resource) => (
                    <div key={resource._id} className="flex items-center justify-between border-b-2 border-border/10 pb-2 last:border-0 last:pb-0 hover:bg-gray-50 dark:hover:bg-neutral-900 p-2 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary text-white border border-border flex items-center justify-center">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-base font-bold">{resource.title}</p>
                                <p className="text-xs font-medium text-muted-foreground uppercase">By {resource.uploaderName}</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold bg-gray-200 dark:bg-neutral-800 px-2 py-1 border border-border">
                            SEM {resource.semester}
                        </div>
                    </div>
                ))}
                {recentResources.length === 0 && (
                    <p className="text-sm font-medium text-muted-foreground">No resources uploaded yet.</p>
                )}
                {recentResources.length > 3 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    onClick={() => navigate("/resources")}
                  >
                    See More Resources
                  </motion.button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Points Redemption */}
          {!isPremium && (
            <Card className="bg-sky-50 dark:bg-card border-2 border-border shadow-[8px_8px_0px_0px_#0ea5e9]" id="dashboard-redeem">
              <CardHeader>
                <CardTitle className="uppercase">Redeem Points</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="bg-card border border-border p-4 space-y-2 shadow-[4px_4px_0px_0px_var(--shadow)]">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black uppercase text-lg">Premium</h4>
                    <Badge className="bg-black dark:bg-white text-white dark:text-black rounded-none">500 pts</Badge>
                  </div>
                  <p className="text-xs font-medium">Unlock exclusive features and badges.</p>
                  <Button size="sm" className="w-full mt-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" onClick={() => handleRedeem("premium")} disabled={(user?.points || 0) < 500}>
                    Redeem
                  </Button>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900 border border-border p-4 space-y-2 shadow-[4px_4px_0px_0px_var(--shadow)]">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black uppercase text-lg text-amber-700 dark:text-amber-300">Elite</h4>
                    <Badge className="bg-amber-600 text-white rounded-none">1000 pts</Badge>
                  </div>
                  <p className="text-xs font-medium">Top tier status and priority support.</p>
                  <Button size="sm" className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" onClick={() => handleRedeem("elite")} disabled={(user?.points || 0) < 1000}>
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-3 space-y-6">
          {/* Leaderboard */}
          <Card className="bg-yellow-100 dark:bg-card border-2 border-border shadow-[8px_8px_0px_0px_#eab308]" id="dashboard-leaderboard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase">
                <Trophy className="h-6 w-6 text-foreground" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((u, i) => {
                  const entryBadge = getBadgeFromPoints(u.points);
                  return (
                    <div key={i} className="flex items-center justify-between bg-card border border-border p-2 shadow-[2px_2px_0px_0px_var(--shadow)]">
                      <div className="flex items-center gap-3">
                        <span className={`font-black text-lg w-8 text-center ${i < 3 ? "text-yellow-600" : "text-gray-500"}`}>
                          #{i + 1}
                        </span>
                        <span className="text-sm font-bold truncate max-w-[100px]">{u.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-foreground">{u.points} pts</span>
                        <div className={`h-8 w-8 rounded-full border-2 border-black flex items-center justify-center text-sm bg-gradient-to-br ${entryBadge.gradient} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`} title={entryBadge.label}>
                          {entryBadge.icon}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && <p className="text-sm font-medium">No contributions yet.</p>}
                
                {leaderboard.length > 3 && (
                  <Dialog open={isLeaderboardOpen} onOpenChange={setIsLeaderboardOpen}>
                    <DialogTrigger asChild>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wider border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        View Full Leaderboard
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] overflow-y-auto border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2">
                          <Trophy className="h-6 w-6 text-yellow-500" />
                          Leaderboard
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 mt-4">
                        {leaderboard.map((u, i) => {
                          const entryBadge = getBadgeFromPoints(u.points);
                          return (
                            <div key={i} className="flex items-center justify-between bg-card border border-border p-3 shadow-[2px_2px_0px_0px_var(--shadow)]">
                              <div className="flex items-center gap-4">
                                <span className={`font-black text-xl w-8 text-center ${i < 3 ? "text-yellow-600" : "text-gray-500"}`}>
                                  #{i + 1}
                                </span>
                                <div className="flex items-center gap-3">
                                  {u.image ? (
                                    <img src={u.image} alt={u.name} className="h-8 w-8 rounded-full border border-black object-cover" />
                                  ) : (
                                    <div className="h-8 w-8 bg-gray-200 rounded-full border border-black flex items-center justify-center font-bold text-xs">
                                      {u.name[0]}
                                    </div>
                                  )}
                                  <span className="font-bold">{u.name}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-black text-foreground">{u.points} pts</span>
                                <span className={`text-xs font-bold px-3 py-1 border-2 border-black bg-gradient-to-r ${entryBadge.gradient} ${entryBadge.accent} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1`}>
                                  {entryBadge.icon} {entryBadge.label}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)]" id="dashboard-upcoming-events">
            <CardHeader>
              <CardTitle className="uppercase">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 {upcomingEvents.slice(0, 3).map((event) => (
                     <div key={event._id} className="flex items-start gap-3 border-b-2 border-border/10 pb-3 last:border-0 last:pb-0">
                         <div className="bg-primary text-white border border-border rounded-none p-2 text-center min-w-[50px]">
                             <span className="block text-xs font-bold uppercase">
                                 {new Date(event.date).toLocaleString('default', { month: 'short' })}
                             </span>
                             <span className="block text-lg font-black">
                                 {new Date(event.date).getDate()}
                             </span>
                         </div>
                         <div>
                             <p className="text-sm font-bold uppercase">{event.title}</p>
                             <p className="text-xs font-medium text-muted-foreground line-clamp-1">{event.location}</p>
                         </div>
                     </div>
                 ))}
                 {upcomingEvents.length === 0 && (
                     <p className="text-sm font-medium text-muted-foreground">No upcoming events.</p>
                 )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
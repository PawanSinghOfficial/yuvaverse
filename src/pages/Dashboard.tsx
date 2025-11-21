import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { BookOpen, Calendar, Users, MessageSquare, Trophy, Crown, Star } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const upcomingEvents = useQuery(api.events.list) || [];
  const recentResources = useQuery(api.resources.list, {}) || [];
  const leaderboard = useQuery(api.users.getLeaderboard) || [];
  
  const setUsername = useMutation(api.users.setUsername);
  const redeemPoints = useMutation(api.users.redeemPoints);

  const [newUsername, setNewUsername] = useState("");
  const [isSettingUsername, setIsSettingUsername] = useState(false);

  const isSocietyHead = user?.role === "society_head";
  const isPremium = user?.tier === "premium" || user?.tier === "elite";

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
    <div className="p-8 space-y-8">
      {/* Username Prompt */}
      {!user?.username && (
        <Card className="bg-primary/10 border-primary">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <h3 className="font-bold text-lg">Set your Username</h3>
              <p className="text-sm text-muted-foreground">Choose a unique username to be identified across YuvaVerse.</p>
            </div>
            <Dialog open={isSettingUsername} onOpenChange={setIsSettingUsername}>
              <DialogTrigger asChild>
                <Button>Set Username</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Choose Username</DialogTitle>
                </DialogHeader>
                <Input 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g., coolstudent123"
                />
                <DialogFooter>
                  <Button onClick={handleSetUsername}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.username || user?.name?.split(' ')[0] || "Student"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening at YuvaVerse today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/resources")}>
            <BookOpen className="mr-2 h-4 w-4" />
            Upload Resource
          </Button>
        </div>
      </div>

      {/* Stats / Quick Access Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-violet-500" onClick={() => navigate("/resources")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentResources.length}</div>
            <p className="text-xs text-muted-foreground">Files available</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-pink-700" onClick={() => navigate("/groups")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Join sessions</p>
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-orange-700" onClick={() => navigate("/events")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming activities</p>
          </CardContent>
        </Card>
        
        {isPremium ? (
             <Card className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Premium Status</CardTitle>
               <Crown className="h-4 w-4 text-amber-600" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">Active</div>
               <p className="text-xs text-amber-600/80 dark:text-amber-400/80">All features unlocked</p>
             </CardContent>
           </Card>
        ) : (
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Points</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{user?.points || 0}</div>
                <p className="text-xs text-muted-foreground">Contribution score</p>
            </CardContent>
            </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentResources.slice(0, 5).map((resource) => (
                    <div key={resource._id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{resource.title}</p>
                                <p className="text-xs text-muted-foreground">By {resource.uploaderName}</p>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Sem {resource.semester}
                        </div>
                    </div>
                ))}
                {recentResources.length === 0 && (
                    <p className="text-sm text-muted-foreground">No resources uploaded yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Points Redemption */}
          {!isPremium && (
            <Card>
              <CardHeader>
                <CardTitle>Redeem Points</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold">Premium</h4>
                    <Badge variant="secondary">500 pts</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Unlock exclusive features and badges.</p>
                  <Button size="sm" className="w-full" onClick={() => handleRedeem("premium")} disabled={(user?.points || 0) < 500}>
                    Redeem
                  </Button>
                </div>
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-amber-600">Elite</h4>
                    <Badge variant="secondary">1000 pts</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Top tier status and priority support.</p>
                  <Button size="sm" className="w-full" onClick={() => handleRedeem("elite")} disabled={(user?.points || 0) < 1000}>
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="col-span-3 space-y-4">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((u, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold w-6 text-center ${i < 3 ? "text-yellow-600" : "text-muted-foreground"}`}>
                        #{i + 1}
                      </span>
                      <span className="text-sm font-medium">{u.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{u.points} pts</span>
                  </div>
                ))}
                {leaderboard.length === 0 && <p className="text-sm text-muted-foreground">No contributions yet.</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 {upcomingEvents.slice(0, 3).map((event) => (
                     <div key={event._id} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                         <div className="bg-muted rounded p-2 text-center min-w-[50px]">
                             <span className="block text-xs font-bold uppercase text-muted-foreground">
                                 {new Date(event.date).toLocaleString('default', { month: 'short' })}
                             </span>
                             <span className="block text-lg font-bold text-primary">
                                 {new Date(event.date).getDate()}
                             </span>
                         </div>
                         <div>
                             <p className="text-sm font-medium">{event.title}</p>
                             <p className="text-xs text-muted-foreground line-clamp-1">{event.location}</p>
                         </div>
                     </div>
                 ))}
                 {upcomingEvents.length === 0 && (
                     <p className="text-sm text-muted-foreground">No upcoming events.</p>
                 )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
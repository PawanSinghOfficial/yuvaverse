import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { BookOpen, Calendar, Users, MessageSquare, Trophy, Crown } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch some stats or data if needed
  const upcomingEvents = useQuery(api.events.list) || [];
  const recentResources = useQuery(api.resources.list, {}) || [];

  const isSocietyHead = user?.role === "society_head";
  const isPremium = user?.tier === "premium" || user?.tier === "elite";

  if (isSocietyHead) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Society Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your society events and members.</p>
          </div>
          <Button onClick={() => navigate("/events")}>
            <Calendar className="mr-2 h-4 w-4" />
            Manage Events
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources Shared</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentResources.length}</div>
              <p className="text-xs text-muted-foreground">Total uploads</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Society Status</CardTitle>
              <Crown className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">Active</div>
              <p className="text-xs text-muted-foreground">Verified Society</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {upcomingEvents.map((event) => (
                   <div key={event._id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                       <div className="flex items-center gap-4">
                           <div className="bg-primary/10 p-3 rounded-lg text-center min-w-[60px]">
                               <span className="block text-xs font-bold uppercase text-primary">
                                   {new Date(event.date).toLocaleString('default', { month: 'short' })}
                               </span>
                               <span className="block text-xl font-bold text-primary">
                                   {new Date(event.date).getDate()}
                               </span>
                           </div>
                           <div>
                               <h4 className="font-semibold">{event.title}</h4>
                               <p className="text-sm text-muted-foreground">{event.location}</p>
                           </div>
                       </div>
                       <div className="text-sm text-muted-foreground">
                           {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </div>
                   </div>
               ))}
               {upcomingEvents.length === 0 && (
                   <p className="text-muted-foreground text-center py-8">No events scheduled.</p>
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || "Student"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening at MSIT today.
          </p>
        </div>
        <Button onClick={() => navigate("/resources")}>
          <BookOpen className="mr-2 h-4 w-4" />
          Upload Resource
        </Button>
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
        <Card className="col-span-4">
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
                              <p className="text-xs text-muted-foreground">{resource.subject}</p>
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
        <Card className="col-span-3">
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
  );
}
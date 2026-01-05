import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCheck, BookOpen, Calendar, Crown, Trophy } from "lucide-react";

interface DashboardStatsProps {
  totalTopicsCompleted: number;
  recentResourcesCount: number;
  registeredEventsCount: number;
  isPremium: boolean;
  userPoints: number;
}

export function DashboardStats({ 
  totalTopicsCompleted, 
  recentResourcesCount, 
  registeredEventsCount, 
  isPremium, 
  userPoints 
}: DashboardStatsProps) {
  const navigate = useNavigate();

  return (
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
          <div className="text-4xl font-black">{recentResourcesCount}</div>
          <p className="text-sm font-bold text-muted-foreground bg-violet-200 dark:bg-violet-800 dark:text-white inline-block px-1 mt-1">Files available</p>
        </CardContent>
      </Card>
      <Card className="bg-card hover:bg-orange-100 dark:hover:bg-orange-900 cursor-pointer border-2 border-border shadow-[8px_8px_0px_0px_#f97316]" onClick={() => navigate("/events")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-black uppercase">My Events</CardTitle>
          <Calendar className="h-6 w-6 text-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-black">{registeredEventsCount}</div>
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
              <div className="text-4xl font-black">{userPoints}</div>
              <p className="text-sm font-bold text-muted-foreground bg-emerald-200 dark:bg-emerald-800 dark:text-white inline-block px-1 mt-1">Contribution score</p>
          </CardContent>
          </Card>
      )}
    </div>
  );
}

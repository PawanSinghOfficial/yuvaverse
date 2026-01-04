import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, BookOpen, Clock, CheckCircle2, Gamepad2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function FriendActivityFeed() {
  const activities = useQuery(api.activities.getFeed);

  if (activities === undefined) {
    return (
      <Card className="h-full border-2 border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
      <CardHeader className="pb-2 border-b-2 border-border bg-muted/20">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="p-1.5 bg-primary/20 rounded-lg border-2 border-primary">
            <Gamepad2 className="w-4 h-4 text-primary" />
          </div>
          Friend Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] p-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
              <div className="p-3 bg-muted rounded-full mb-3">
                <Gamepad2 className="w-6 h-6 opacity-50" />
              </div>
              <p className="text-sm font-medium">No recent activity</p>
              <p className="text-xs mt-1">Connect with friends to see their updates!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-start gap-3 group">
                  <Avatar className="h-8 w-8 border-2 border-border">
                    <AvatarImage src={activity.user.image} />
                    <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none mb-1">
                      {activity.user.name}
                    </p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {getActivityIcon(activity.type)}
                      <span className="truncate">{getActivityText(activity)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function getActivityIcon(type: string) {
  switch (type) {
    case "game_highscore":
      return <Trophy className="w-3 h-3 text-yellow-500" />;
    case "resource_upload":
      return <BookOpen className="w-3 h-3 text-blue-500" />;
    case "pomodoro_session":
      return <Clock className="w-3 h-3 text-green-500" />;
    case "daily_quests_complete":
      return <CheckCircle2 className="w-3 h-3 text-purple-500" />;
    default:
      return <Gamepad2 className="w-3 h-3" />;
  }
}

function getActivityText(activity: any) {
  const { type, data } = activity;
  switch (type) {
    case "game_highscore":
      return `New high score of ${data.score} in ${data.gameId === "snake" ? "Snake" : "Math Challenge"}!`;
    case "resource_upload":
      return `Uploaded a new resource: "${data.resourceTitle}"`;
    case "pomodoro_session":
      return `Completed a ${data.duration}m focus session`;
    case "daily_quests_complete":
      return `Completed all daily quests!`;
    default:
      return "New activity";
  }
}

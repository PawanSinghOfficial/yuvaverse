import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Target } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function DailyQuests() {
  const dailyQuests = useQuery(api.quests.getToday);
  const generateQuests = useMutation(api.quests.generate);

  useEffect(() => {
    if (dailyQuests === null) {
      generateQuests().catch(console.error);
    }
  }, [dailyQuests, generateQuests]);

  if (!dailyQuests) {
    return (
      <Card className="border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)] h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase">
            <Target className="h-6 w-6" />
            Daily Quests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-pink-50 dark:bg-card border-2 border-border shadow-[8px_8px_0px_0px_#ec4899] h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase text-pink-700 dark:text-pink-400">
          <Target className="h-6 w-6" />
          Daily Quests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dailyQuests.quests.map((quest) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-3 border-2 ${
                quest.isCompleted
                  ? "bg-green-100 border-green-600 dark:bg-green-900/20 dark:border-green-500"
                  : "bg-white border-border dark:bg-card"
              } shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {quest.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className={`font-bold text-sm ${quest.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {quest.title}
                    </p>
                    <p className="text-xs font-bold text-pink-600 dark:text-pink-400">
                      +{quest.xpReward} XP
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black bg-black text-white px-2 py-1">
                  {quest.progress}/{quest.target}
                </span>
              </div>
              <Progress 
                value={(quest.progress / quest.target) * 100} 
                className="h-2 border border-black/20" 
                indicatorClassName={quest.isCompleted ? "bg-green-500" : "bg-pink-500"}
              />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

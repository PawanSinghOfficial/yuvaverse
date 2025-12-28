import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Target, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export function DailyQuests() {
  const dailyQuests = useQuery(api.quests.getToday);
  const generateQuests = useMutation(api.quests.generate);
  const claimBonus = useMutation(api.quests.claimDailyBonus);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (dailyQuests === null) {
      generateQuests().catch(console.error);
    }
  }, [dailyQuests, generateQuests]);

  const handleClaimBonus = async () => {
    setIsClaiming(true);
    try {
      const bonus = await claimBonus();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#FFA500', '#FF4500'],
      });
      toast.success(`Daily Bonus Claimed! +${bonus} XP`);
    } catch (error) {
      toast.error("Failed to claim bonus");
    } finally {
      setIsClaiming(false);
    }
  };

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

  const allCompleted = dailyQuests.quests.every(q => q.isCompleted);

  return (
    <Card className="bg-pink-50 dark:bg-card border-2 border-border shadow-[8px_8px_0px_0px_#ec4899] h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between uppercase text-pink-700 dark:text-pink-400">
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Daily Quests
          </div>
          {dailyQuests.rewardsClaimed && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 border border-green-200 rounded-full">
              Completed
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
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

        <AnimatePresence>
          {allCompleted && !dailyQuests.rewardsClaimed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <Button 
                onClick={handleClaimBonus} 
                disabled={isClaiming}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all h-12 text-lg"
              >
                {isClaiming ? "Claiming..." : (
                  <span className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Claim Daily Bonus (+100 XP)
                  </span>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
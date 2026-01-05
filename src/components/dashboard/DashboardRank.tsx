import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardRankProps {
  user: any;
  nextBadge: any;
  progressPercentage: number;
  currentPoints: number;
}

export function DashboardRank({ user, nextBadge, progressPercentage, currentPoints }: DashboardRankProps) {
  const navigate = useNavigate();

  const getProgressColor = (percent: number) => {
    if (percent >= 75) return "bg-gradient-to-r from-green-400 to-emerald-600";
    if (percent >= 40) return "bg-gradient-to-r from-yellow-400 to-orange-500";
    return "bg-gradient-to-r from-red-500 to-rose-600";
  };
  
  return (
    <div className="flex flex-col items-end gap-4">
      {nextBadge && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                id="dashboard-rank-progress"
                className="px-5 py-3 bg-white dark:bg-card border-2 border-black dark:border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] w-full max-w-2xl relative overflow-hidden group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] transition-all cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                tabIndex={0}
                role="progressbar"
                aria-valuenow={Math.round(progressPercentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Progress to ${nextBadge.label} rank: ${Math.round(progressPercentage)}%`}
              >
                <motion.div 
                  className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-1"
                  animate={{ rotate: [10, 15, 10], y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Trophy className="h-32 w-32 text-foreground" />
                </motion.div>
                
                <div className="flex justify-between items-end mb-1.5 relative z-10">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Next Rank</span>
                    </div>
                    <motion.span 
                      className={`text-xl font-black uppercase italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${nextBadge.gradient}`}
                      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      style={{ backgroundSize: "200% auto" }}
                    >
                      {nextBadge.label}
                    </motion.span>
                  </div>
                  <div className="text-right mb-0.5">
                     <motion.span 
                       className="text-xs font-black bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 border-2 border-transparent group-hover:border-black dark:group-hover:border-white group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white transition-colors inline-block"
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                     >
                       {Math.round(progressPercentage)}%
                     </motion.span>
                  </div>
                </div>
                
                <div className="relative h-3.5 w-full bg-gray-100 dark:bg-gray-800 border-2 border-black dark:border-gray-600 z-10 shadow-inner overflow-hidden rounded-sm">
                  <motion.div 
                    className={`absolute top-0 left-0 h-full ${getProgressColor(progressPercentage)} border-r-2 border-black relative`} 
                    initial={{ width: "0%" }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  >
                      <motion.div 
                        className="absolute inset-0 bg-white/30 skew-x-12"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                      />
                  </motion.div>
                  <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20 pointer-events-none mix-blend-multiply"></div>
                </div>
                
                <div className="flex justify-between items-center mt-1.5 relative z-10">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Current: {currentPoints} pts</span>
                  <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-wide">
                    {nextBadge.minPoints - currentPoints} pts to go
                  </span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white border-2 border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
              <p className="font-bold uppercase tracking-wider text-xs">Keep going!</p>
              <p className="text-xs">Earn {nextBadge.minPoints - currentPoints} more points to unlock {nextBadge.label}.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <Button onClick={() => navigate("/resources")} className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] transition-all w-full md:w-auto" id="dashboard-upload-btn">
        <BookOpen className="mr-2 h-4 w-4" />
        Upload Resource
      </Button>
    </div>
  );
}

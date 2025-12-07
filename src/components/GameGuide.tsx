import { Trophy, Medal, Crown, Gamepad2, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function GameGuide() {
  const leaderboard = useQuery(api.users.getLeaderboard);

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Leaderboard Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-slate-900/80 backdrop-blur-sm border-2 border-yellow-500/50 rounded-xl p-6 flex-1"
      >
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h2 className="text-2xl font-black uppercase text-white tracking-tight">Leaderboard</h2>
        </div>
        
        <div className="space-y-4">
          {leaderboard?.map((player, index) => (
            <motion.div
              key={player._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                index === 0 ? 'bg-yellow-500/20 border-yellow-500/50' :
                index === 1 ? 'bg-slate-400/20 border-slate-400/50' :
                index === 2 ? 'bg-orange-700/20 border-orange-700/50' :
                'bg-white/5 border-white/10'
              }`}
            >
              <div className="font-black text-lg w-6 text-center text-white/50">
                {index + 1}
              </div>
              <Avatar className="h-10 w-10 border-2 border-white/20">
                <AvatarImage src={player.image} />
                <AvatarFallback className="bg-primary text-white font-bold">
                  {player.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{player.name}</p>
                <div className="flex items-center gap-2">
                    <p className="text-xs text-white/50 font-medium">{player.points} pts</p>
                    {/* Simulated Trophy Count based on points for visual flair */}
                    <div className="flex items-center gap-0.5 text-yellow-500">
                        <Trophy className="h-3 w-3" />
                        <span className="text-[10px] font-bold">{Math.floor(player.points / 100)}</span>
                    </div>
                </div>
              </div>
              {index === 0 && <Crown className="h-5 w-5 text-yellow-500 animate-pulse" />}
              {index === 1 && <Medal className="h-5 w-5 text-slate-400" />}
              {index === 2 && <Medal className="h-5 w-5 text-orange-700" />}
            </motion.div>
          ))}
          
          {(!leaderboard || leaderboard.length === 0) && (
            <div className="text-center py-8 text-white/30 font-medium">
              No champions yet. Be the first!
            </div>
          )}
        </div>
      </motion.div>

      {/* Rules / Guide Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6"
      >
        <h3 className="text-xl font-black uppercase text-white mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            How to Earn
        </h3>
        <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Victory Bonus</span>
                <span className="font-bold text-green-400">+10 Pts</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Participation</span>
                <span className="font-bold text-blue-400">+2 Pts</span>
            </div>
            <div className="flex items-center justify-between">
                <span>High Score Record</span>
                <span className="font-bold text-yellow-400">+50 Pts</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
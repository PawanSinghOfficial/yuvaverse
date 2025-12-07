import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gamepad2, Brain, Scissors, Calculator, Grid3X3, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import TicTacToe from "@/components/games/TicTacToe";
import MemoryMatch from "@/components/games/MemoryMatch";
import RockPaperScissors from "@/components/games/RockPaperScissors";
import SnakeGame from "@/components/games/SnakeGame";
import MathChallenge from "@/components/games/MathChallenge";
import { GameGuide } from "@/components/GameGuide";
import { useGameSounds } from "@/hooks/use-game-sounds";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Trophy, Medal, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const GAMES = [
  {
    id: "tictactoe",
    title: "Tic Tac Toe",
    description: "Classic X and O strategy game",
    icon: Grid3X3,
    color: "bg-blue-100 text-blue-600",
    component: TicTacToe
  },
  {
    id: "memory",
    title: "Memory Match",
    description: "Test your memory by matching pairs",
    icon: Brain,
    color: "bg-purple-100 text-purple-600",
    component: MemoryMatch
  },
  {
    id: "rps",
    title: "Rock Paper Scissors",
    description: "Battle against Vayuu",
    icon: Scissors,
    color: "bg-red-100 text-red-600",
    component: RockPaperScissors
  },
  {
    id: "snake",
    title: "Snake",
    description: "Eat food and grow longer",
    icon: Gamepad2,
    color: "bg-green-100 text-green-600",
    component: SnakeGame
  },
  {
    id: "math",
    title: "Math Challenge",
    description: "Solve problems against the clock",
    icon: Calculator,
    color: "bg-yellow-100 text-yellow-600",
    component: MathChallenge
  }
];

const ArcadeBackground = () => {
  const icons = [Gamepad2, Brain, Scissors, Calculator, Grid3X3, Sparkles];
  const { scrollY } = useScroll();
  
  // Parallax transforms
  const bgY = useTransform(scrollY, [0, 1000], [0, 200]);
  const gridY = useTransform(scrollY, [0, 1000], [0, 100]);
  const glowY = useTransform(scrollY, [0, 1000], [0, -100]);
  const iconsY = useTransform(scrollY, [0, 1000], [0, -300]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#09090b] -z-10">
      {/* Retro Grid Floor */}
      <motion.div 
        style={{ y: bgY, rotateX: 60 }}
        className="absolute inset-0 opacity-30 perspective-1000"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf6_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf6_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
      </motion.div>

      {/* Moving Grid Effect - Synthwave Style */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{
          y: gridY,
          backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(236, 72, 153, .5) 25%, rgba(236, 72, 153, .5) 26%, transparent 27%, transparent 74%, rgba(34, 211, 238, .5) 75%, rgba(34, 211, 238, .5) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 211, 238, .5) 25%, rgba(34, 211, 238, .5) 26%, transparent 27%, transparent 74%, rgba(236, 72, 153, .5) 75%, rgba(236, 72, 153, .5) 76%, transparent 77%, transparent)",
          backgroundSize: "60px 60px"
        }}
        animate={{
          backgroundPosition: ["0px 0px", "0px 60px"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Neon Glows */}
      <motion.div style={{ y: glowY }} className="absolute inset-0">
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
          className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-cyan-600/30 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-pink-600/30 rounded-full blur-[120px]"
        />
      </motion.div>

      {/* Floating Pixels/Particles */}
      <motion.div style={{ y: iconsY }} className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`pixel-${i}`}
            className={`absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
              i % 3 === 0 ? "bg-yellow-400" : i % 3 === 1 ? "bg-cyan-400" : "bg-fuchsia-400"
            } shadow-[0_0_10px_currentColor]`}
            initial={{
              x: Math.random() * 100 + "%",
              y: "110%",
              opacity: 0,
            }}
            animate={{
              y: "-10%",
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Floating Icons with Neon Effect */}
        {Array.from({ length: 15 }).map((_, i) => {
          const Icon = icons[i % icons.length];
          const color = i % 3 === 0 ? "text-yellow-400" : i % 3 === 1 ? "text-cyan-400" : "text-fuchsia-400";
          return (
            <motion.div
              key={`icon-${i}`}
              className={`absolute ${color} opacity-20 drop-shadow-[0_0_8px_currentColor]`}
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                scale: 0.5 + Math.random(),
                rotate: Math.random() * 360,
              }}
              animate={{
                y: [null, Math.random() * -100],
                rotate: [null, Math.random() * 360],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Icon size={24 + Math.random() * 30} />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Shooting Lasers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`laser-${i}`}
            className={`absolute h-[2px] w-[100px] sm:w-[200px] bg-gradient-to-r from-transparent to-transparent blur-[2px] ${i % 2 === 0 ? "via-cyan-400" : "via-fuchsia-400"}`}
            style={{ top: `${Math.random() * 100}%` }}
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ 
              x: "200vw", 
              opacity: [0, 1, 0] 
            }}
            transition={{
              duration: 2 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Scanner Bar */}
      <motion.div
        className="absolute inset-x-0 h-[100px] bg-gradient-to-b from-transparent via-purple-500/10 to-transparent pointer-events-none z-[1]"
        animate={{ top: ["-20%", "120%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-[5] bg-[size:100%_3px,3px_100%] pointer-events-none" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-[4] pointer-events-none" />
    </div>
  );
};

export default function Games() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const { playSound } = useGameSounds();

  const ActiveGame = GAMES.find(g => g.id === selectedGame)?.component;

  return (
    <div className="p-8 min-h-screen space-y-8 relative overflow-hidden">
      <ArcadeBackground />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-12">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="h-24 w-24 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center border-4 border-white/20 shadow-[0px_0px_20px_0px_rgba(124,58,237,0.5)]"
        >
          <Gamepad2 className="h-12 w-12" />
        </motion.div>
        
        <div className="relative">
          <motion.h1 
            className="text-6xl font-black uppercase tracking-tighter relative z-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Arcade Zone
          </motion.h1>
          <motion.div 
            className="absolute -inset-4 bg-purple-500/20 blur-2xl -z-10 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <motion.p 
          className="text-slate-300 font-medium text-lg max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Take a break from studying and challenge yourself with these mini-games.
          Earn bragging rights (and maybe some fun)!
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-12">
        {/* Games Grid - Horizontal Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
          {GAMES.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ y: -10 }}
              onMouseEnter={() => playSound('hover')}
              className="h-full"
            >
              <Card 
                className="h-full min-h-[240px] cursor-pointer border-2 border-white/10 bg-slate-900/80 backdrop-blur-sm hover:border-primary/50 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.3)] transition-all duration-300 group overflow-hidden flex flex-col"
                onClick={() => {
                  playSound('click');
                  setSelectedGame(game.id);
                }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${game.color.split(" ")[0]}`} />
                
                <CardHeader className="flex flex-row items-start gap-4 pb-2 relative z-10">
                  <motion.div 
                    className={`p-3 rounded-xl border border-white/10 ${game.color} bg-opacity-20 shrink-0`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <game.icon className="h-6 w-6" />
                  </motion.div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight text-white leading-tight pt-1">{game.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 flex-1 flex flex-col justify-between p-6 pt-2">
                  <p className="text-slate-400 font-medium text-sm leading-relaxed">{game.description}</p>
                  <div className="mt-6 flex justify-end">
                    <motion.span 
                      className="text-[10px] font-black uppercase bg-white text-black px-3 py-1.5 rounded-full border-2 border-transparent group-hover:bg-primary group-hover:text-white transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Play
                    </motion.span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Leaderboard Section - Bottom */}
        <div className="w-full">
            <GameGuide />
        </div>
      </div>

      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent className="max-w-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden bg-white">
          <DialogHeader className="p-6 border-b-2 border-black bg-secondary/10">
            <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase">
              {selectedGame && (
                <>
                  {(() => {
                    const game = GAMES.find(g => g.id === selectedGame);
                    if (!game) return null;
                    return (
                      <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <game.icon className="h-8 w-8" />
                        {game.title}
                      </motion.div>
                    );
                  })()}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 bg-secondary/5 min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {ActiveGame && (
                <motion.div
                  key={selectedGame}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  <ActiveGame />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
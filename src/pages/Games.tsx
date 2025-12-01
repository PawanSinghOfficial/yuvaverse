import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gamepad2, Brain, Scissors, Calculator, Grid3X3, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TicTacToe from "@/components/games/TicTacToe";
import MemoryMatch from "@/components/games/MemoryMatch";
import RockPaperScissors from "@/components/games/RockPaperScissors";
import SnakeGame from "@/components/games/SnakeGame";
import MathChallenge from "@/components/games/MathChallenge";
import { GameGuide } from "@/components/GameGuide";

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
    description: "Battle against the CPU",
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

const BackgroundIcons = () => {
  const icons = [Gamepad2, Brain, Scissors, Calculator, Grid3X3, Sparkles];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 15 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        return (
          <motion.div
            key={i}
            className="absolute text-foreground/5"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: 0.5 + Math.random(),
              rotate: Math.random() * 360,
            }}
            animate={{
              y: [null, Math.random() * -100],
              rotate: [null, Math.random() * 360],
            }}
            transition={{
              duration: 20 + Math.random() * 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Icon size={40 + Math.random() * 60} />
          </motion.div>
        );
      })}
    </div>
  );
};

export default function Games() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const ActiveGame = GAMES.find(g => g.id === selectedGame)?.component;

  return (
    <div className="p-8 min-h-screen bg-secondary/20 space-y-8 relative overflow-hidden">
      <BackgroundIcons />
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-12">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
          className="h-24 w-24 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <Gamepad2 className="h-12 w-12" />
        </motion.div>
        
        <div className="relative">
          <motion.h1 
            className="text-6xl font-black uppercase tracking-tighter relative z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Arcade Zone
          </motion.h1>
          <motion.div 
            className="absolute -inset-4 bg-yellow-400/30 blur-2xl -z-10 rounded-full"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        <motion.p 
          className="text-muted-foreground font-medium text-lg max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Take a break from studying and challenge yourself with these mini-games.
          Earn bragging rights (and maybe some fun)!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <GameGuide />
        </motion.div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -10 }}
          >
            <Card 
              className="h-full cursor-pointer border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 bg-white group overflow-hidden"
              onClick={() => setSelectedGame(game.id)}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${game.color.split(" ")[0]}`} />
              
              <CardHeader className="flex flex-row items-center gap-4 pb-2 relative z-10">
                <motion.div 
                  className={`p-4 rounded-xl border-2 border-black ${game.color}`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <game.icon className="h-8 w-8" />
                </motion.div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">{game.title}</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-muted-foreground font-medium text-base">{game.description}</p>
                <div className="mt-6 flex justify-end">
                  <motion.span 
                    className="text-xs font-black uppercase bg-black text-white px-4 py-2 rounded-full border-2 border-transparent group-hover:bg-primary group-hover:text-black group-hover:border-black transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Now
                  </motion.span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
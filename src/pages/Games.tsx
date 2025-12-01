import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gamepad2, Brain, Scissors, Calculator, Grid3X3 } from "lucide-react";
import { motion } from "framer-motion";
import TicTacToe from "@/components/games/TicTacToe";
import MemoryMatch from "@/components/games/MemoryMatch";
import RockPaperScissors from "@/components/games/RockPaperScissors";
import SnakeGame from "@/components/games/SnakeGame";
import MathChallenge from "@/components/games/MathChallenge";

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

export default function Games() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const ActiveGame = GAMES.find(g => g.id === selectedGame)?.component;

  return (
    <div className="p-8 min-h-screen bg-secondary/20 space-y-8">
      <div className="flex flex-col items-center text-center space-y-4 mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="h-20 w-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <Gamepad2 className="h-10 w-10" />
        </motion.div>
        <h1 className="text-5xl font-black uppercase tracking-tighter">Arcade Zone</h1>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl">
          Take a break from studying and challenge yourself with these mini-games.
          Earn bragging rights (and maybe some fun)!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {GAMES.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="h-full cursor-pointer hover:scale-105 transition-transform border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              onClick={() => setSelectedGame(game.id)}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-3 rounded-xl border-2 border-black ${game.color}`}>
                  <game.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-black uppercase">{game.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground font-medium">{game.description}</p>
                <div className="mt-4 flex justify-end">
                  <span className="text-xs font-bold uppercase bg-black text-white px-3 py-1 rounded-full">Play Now</span>
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
                      <>
                        <game.icon className="h-6 w-6" />
                        {game.title}
                      </>
                    );
                  })()}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 bg-secondary/5 min-h-[400px] flex items-center justify-center">
            {ActiveGame && <ActiveGame />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

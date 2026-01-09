import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Hand, Scissors, Scroll, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useGameSounds } from "@/hooks/use-game-sounds";
import { VayuuTease } from "@/components/VayuuTease";

const CHOICES = [
  { id: "rock", label: "Rock", icon: Hand, color: "bg-stone-500" },
  { id: "paper", label: "Paper", icon: Scroll, color: "bg-blue-500" },
  { id: "scissors", label: "Scissors", icon: Scissors, color: "bg-red-500" },
];

export default function RockPaperScissors() {
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [score, setScore] = useState({ user: 0, computer: 0 });
  const [teaseMessage, setTeaseMessage] = useState<string | null>(null);
  const { playSound } = useGameSounds();
  
  const user = useQuery(api.users.currentUser);
  const recordResult = useMutation(api.users.recordGameResult);

  const playGame = async (choiceId: string) => {
    playSound('click');
    const randomChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)].id;
    setUserChoice(choiceId);
    setComputerChoice(randomChoice);

    let isWin = false;
    let resultText = "";

    const username = user?.username || user?.name || "Player";

    if (choiceId === randomChoice) {
      resultText = "Draw!";
      playSound('gameover');
    } else if (
      (choiceId === "rock" && randomChoice === "scissors") ||
      (choiceId === "paper" && randomChoice === "rock") ||
      (choiceId === "scissors" && randomChoice === "paper")
    ) {
      resultText = "You Win!";
      setScore(s => ({ ...s, user: s.user + 1 }));
      isWin = true;
      playSound('win');

      // Teasing message when user wins
      const winTeases = [
        `Rock, Paper, Scissors... You got lucky, ${username}! 🪨📄✂️`,
        `My sensors must be lagging. You won this round! 🤖`,
        `I let you win, ${username}. Don't get used to it! 😉`,
        `Vayuu: 0, ${username}: 1. I'm taking notes! 📝`
      ];
      setTeaseMessage(winTeases[Math.floor(Math.random() * winTeases.length)]);
    } else {
      resultText = "You Lose!";
      setScore(s => ({ ...s, computer: s.computer + 1 }));
      playSound('lose');

      // Teasing message when CPU wins
      const loseTeases = [
        `I read you like a book, ${username}! 📚`,
        `Too slow! Vayuu reigns supreme! 👑`,
        `Is that all you got? Try again! 🤖`,
        `Calculated. Precision. Victory. 😎`
      ];
      setTeaseMessage(loseTeases[Math.floor(Math.random() * loseTeases.length)]);
    }
    
    setResult(resultText);
    
    try {
      const res = await recordResult({
        gameId: "rps",
        win: isWin
      });
      if (res) {
        if (res.gemsAwarded > 0) {
          toast.success(`🎉 5 Consecutive Wins! +${res.gemsAwarded} Gems!`);
        } else if (isWin) {
          const winsLeft = 5 - res.consecutiveWins;
          toast.success(`You Won! ${res.consecutiveWins}/5 wins (${winsLeft} more for 10 gems)`);
        } else {
          // Don't show toast on loss, game already shows result
        }
      }
    } catch (error) {
      console.error("Failed to record result:", error);
    }
  };

  const resetGame = () => {
    setUserChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 w-full max-w-md mx-auto">
      <VayuuTease message={teaseMessage} onClose={() => setTeaseMessage(null)} />
      <div className="flex justify-between w-full text-xl font-black uppercase">
        <div className="text-green-600">You: {score.user}</div>
        <div className="text-red-600">Vayuu: {score.computer}</div>
      </div>

      <div className="h-48 flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {!userChoice ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-muted-foreground font-bold text-lg"
            >
              Choose your weapon!
            </motion.div>
          ) : (
            <div className="flex items-center gap-8">
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-center"
              >
                <p className="text-sm font-bold mb-2">YOU</p>
                {(() => {
                  const choice = CHOICES.find(c => c.id === userChoice);
                  return choice ? (
                    <div className={`h-24 w-24 rounded-full ${choice.color} flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                      <choice.icon className="h-12 w-12 text-white" />
                    </div>
                  ) : null;
                })()}
              </motion.div>

              <div className="text-4xl font-black">VS</div>

              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-center"
              >
                <p className="text-sm font-bold mb-2">VAYUU</p>
                {(() => {
                  const choice = CHOICES.find(c => c.id === computerChoice);
                  return choice ? (
                    <div className={`h-24 w-24 rounded-full ${choice.color} flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                      <choice.icon className="h-12 w-12 text-white" />
                    </div>
                  ) : null;
                })()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {result && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`text-3xl font-black uppercase ${
            result === "You Win!" ? "text-green-600" : result === "You Lose!" ? "text-red-600" : "text-yellow-600"
          }`}
        >
          {result}
        </motion.div>
      )}

      <div className="flex gap-4">
        {userChoice ? (
          <Button onClick={resetGame} size="lg" className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <RotateCcw className="mr-2 h-4 w-4" /> Play Again
          </Button>
        ) : (
          CHOICES.map((choice) => (
            <motion.button
              key={choice.id}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => playGame(choice.id)}
              className={`h-16 w-16 rounded-xl ${choice.color} flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
            >
              <choice.icon className="h-8 w-8 text-white" />
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
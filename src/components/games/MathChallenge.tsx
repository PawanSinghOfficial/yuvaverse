import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Check, Timer } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useGameSounds } from "@/hooks/use-game-sounds";

type Difficulty = "easy" | "medium" | "hard";

export default function MathChallenge() {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operator, setOperator] = useState("+");
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const { playSound } = useGameSounds();
  
  const recordResult = useMutation(api.users.recordGameResult);

  const generateProblem = () => {
    let ops = ["+", "-"];
    let maxNum = 20;

    if (difficulty === "medium") {
      ops = ["+", "-", "*"];
      maxNum = 50;
    } else if (difficulty === "hard") {
      ops = ["+", "-", "*"]; // Could add division but keeping it integer friendly
      maxNum = 100;
    }

    const op = ops[Math.floor(Math.random() * ops.length)];
    setOperator(op);
    
    if (op === "*") {
      const limit = difficulty === "easy" ? 5 : difficulty === "medium" ? 10 : 15;
      setNum1(Math.floor(Math.random() * limit) + 1);
      setNum2(Math.floor(Math.random() * limit) + 1);
    } else {
      setNum1(Math.floor(Math.random() * maxNum) + 1);
      setNum2(Math.floor(Math.random() * maxNum) + 1);
    }
    setAnswer("");
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsActive(true);
    setGameOver(false);
    generateProblem();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleGameOver();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleGameOver = async () => {
    setIsActive(false);
    setGameOver(true);
    playSound('gameover');
    
    try {
      const result = await recordResult({
        gameId: "math",
        score: score,
        win: score > 0, // Consider it a "win" if they got at least some points
        difficulty: difficulty
      });
      
      if (result) {
        toast.success(`Time's Up! You earned ${result.pointsAwarded} points.`);
        if (result.newHighScore && result.newHighScore === score) {
          toast.success("New High Score! 🏆");
        }
      }
    } catch (error) {
      console.error("Failed to record score:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive) return;

    let correctAnswer;
    switch (operator) {
      case "+": correctAnswer = num1 + num2; break;
      case "-": correctAnswer = num1 - num2; break;
      case "*": correctAnswer = num1 * num2; break;
      default: correctAnswer = 0;
    }

    if (parseInt(answer) === correctAnswer) {
      playSound('correct');
      setScore((s) => s + 10);
      generateProblem();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10B981', '#34D399']
      });
    } else {
      // Shake effect or error feedback could go here
      playSound('wrong');
      setAnswer("");
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-md mx-auto">
      <div className="flex justify-between w-full font-black uppercase text-xl items-center">
        <div className="flex items-center gap-2 text-yellow-600">
          <Timer className="h-6 w-6" /> {timeLeft}s
        </div>
        <div className="text-indigo-600">Score: {score}</div>
      </div>

      {!isActive && !gameOver ? (
        <div className="text-center space-y-6 py-8">
          <h3 className="text-2xl font-black uppercase">Ready to Calculate?</h3>
          
          <div className="flex flex-col gap-2 items-center">
            <span className="text-sm font-bold uppercase text-muted-foreground">Select Difficulty</span>
            <div className="flex gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-4 py-2 rounded-lg border-2 border-black font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] ${
                    difficulty === d 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <p className="text-muted-foreground">Solve as many problems as you can in 30 seconds!</p>
          <Button onClick={startGame} size="lg" className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full">
            Start Challenge ({difficulty})
          </Button>
        </div>
      ) : gameOver ? (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4 py-8"
        >
          <h3 className="text-3xl font-black uppercase text-red-500">Time's Up!</h3>
          <p className="text-2xl font-bold">Final Score: {score}</p>
          <Button onClick={startGame} className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <RotateCcw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="flex items-center justify-center gap-4 text-5xl font-black bg-white p-8 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
            <span>{num1}</span>
            <span className="text-primary">{operator}</span>
            <span>{num2}</span>
            <span>=</span>
            <span className="text-muted-foreground">?</span>
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer"
              className="text-center text-2xl font-bold h-14 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              autoFocus
            />
            <Button type="submit" size="icon" className="h-14 w-14 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-green-500 hover:bg-green-600">
              <Check className="h-6 w-6" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
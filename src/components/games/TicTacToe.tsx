import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useGameSounds } from "@/hooks/use-game-sounds";
import { VayuuTease } from "@/components/VayuuTease";

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true); // User is X
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameRecorded, setGameRecorded] = useState(false);
  const [isCpuThinking, setIsCpuThinking] = useState(false);
  const [teaseMessage, setTeaseMessage] = useState<string | null>(null);
  const { playSound } = useGameSounds();
  
  const user = useQuery(api.users.currentUser);
  const recordResult = useMutation(api.users.recordGameResult);

  const calculateWinner = useCallback((squares: any[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  }, []);

  const handleClick = (i: number) => {
    if (winner || board[i] || !xIsNext || isCpuThinking) return;
    playSound('move');
    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setXIsNext(false);
  };

  // CPU Turn
  useEffect(() => {
    if (!xIsNext && !winner && !board.every(Boolean)) {
      setIsCpuThinking(true);
      const timer = setTimeout(() => {
        const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
        
        if (emptyIndices.length > 0) {
          // Simple AI: Try to win, then block, then random
          let move = -1;

          // 1. Try to win
          for (let i of emptyIndices) {
            const testBoard = [...board];
            testBoard[i] = "O";
            if (calculateWinner(testBoard)?.winner === "O") {
              move = i;
              break;
            }
          }

          // 2. Block player
          if (move === -1) {
            for (let i of emptyIndices) {
              const testBoard = [...board];
              testBoard[i] = "X";
              if (calculateWinner(testBoard)?.winner === "X") {
                move = i;
                break;
              }
            }
          }

          // 3. Random
          if (move === -1) {
            move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          }

          const newBoard = [...board];
          newBoard[move] = "O";
          setBoard(newBoard);
          setXIsNext(true);
          playSound('move');
        }
        setIsCpuThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, winner, board, calculateWinner, playSound]);

  useEffect(() => {
    const result = calculateWinner(board);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      if (result.winner === "X") { // User wins
         playSound('win');
         confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
         });

         // Teasing message when user wins
         const username = user?.username || user?.name || "Player";
         const winTeases = [
            `Beginner's luck, ${username}! I'll get you next time. 😤`,
            `Okay, okay, you won. But can you do it again? 🤔`,
            `I was just warming up! Rematch? 🤖`,
            `Vayuu: 0, ${username}: 1. Don't get cocky! 😒`
         ];
         setTeaseMessage(winTeases[Math.floor(Math.random() * winTeases.length)]);

         handleGameEnd(true);
      } else {
         playSound('lose');

         // Teasing message when CPU wins
         const username = user?.username || user?.name || "Player";
         const loseTeases = [
            `Tic-Tac-Toe? More like Tic-Tac-NO, ${username}! ❌`,
            `I can see your moves before you make them, ${username}. 🔮`,
            `Better luck next time, ${username}! 🤖`,
            `Vayuu: 1, ${username}: 0. 😎`
         ];
         setTeaseMessage(loseTeases[Math.floor(Math.random() * loseTeases.length)]);

         handleGameEnd(false);
      }
    } else if (!board.includes(null)) {
      setWinner("Draw");
      playSound('gameover');
      handleGameEnd(false);
    }
  }, [board, calculateWinner, playSound]);

  const handleGameEnd = async (isWin: boolean) => {
    if (gameRecorded) return;
    setGameRecorded(true);

    try {
      const result = await recordResult({
        gameId: "tictactoe",
        win: isWin
      });

      if (result) {
        if (result.gemsAwarded > 0) {
          toast.success(`🎉 5 Consecutive Wins! +${result.gemsAwarded} Gems!`);
        } else if (isWin) {
          const winsLeft = 5 - result.consecutiveWins;
          toast.success(`Victory! ${result.consecutiveWins}/5 wins (${winsLeft} more for 10 gems)`);
        } else {
          toast.error(`Defeat! Streak reset. Try for 5 consecutive wins to earn 10 gems.`);
        }
      }
    } catch (error) {
      console.error("Failed to record result:", error);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setWinningLine(null);
    setGameRecorded(false);
    setIsCpuThinking(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <VayuuTease message={teaseMessage} onClose={() => setTeaseMessage(null)} />
      <div className="flex justify-between items-center w-full max-w-xs">
        <div className={`text-xl font-black ${xIsNext && !winner ? "text-primary scale-110" : "text-muted-foreground"} transition-all`}>
          You (X)
        </div>
        <div className={`text-xl font-black ${!xIsNext && !winner ? "text-primary scale-110" : "text-muted-foreground"} transition-all`}>
          Vayuu (O)
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-black p-3 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
        {board.map((square, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: square ? 1 : 0.95 }}
            whileTap={{ scale: square ? 1 : 0.9 }}
            onClick={() => handleClick(i)}
            disabled={!!square || !xIsNext || !!winner}
            className={`h-24 w-24 bg-white rounded-lg text-5xl font-black flex items-center justify-center transition-colors ${
              winningLine?.includes(i) ? "bg-green-200 text-green-700" : "text-black"
            } ${!square && xIsNext && !winner ? "hover:bg-gray-50 cursor-pointer" : "cursor-default"}`}
          >
            {square && (
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className={square === "X" ? "text-blue-500" : "text-rose-500"}
              >
                {square}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      {winner && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="text-3xl font-black uppercase">
            {winner === "Draw" ? "It's a Draw!" : winner === "X" ? "You Win!" : "Vayuu Wins!"}
          </div>
          <Button onClick={resetGame} className="gap-2 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <RotateCcw className="h-4 w-4" /> Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [gameRecorded, setGameRecorded] = useState(false);
  
  const recordResult = useMutation(api.users.recordGameResult);

  const calculateWinner = (squares: any[]) => {
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
  };

  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    const newBoard = [...board];
    newBoard[i] = xIsNext ? "X" : "O";
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  };

  useEffect(() => {
    const result = calculateWinner(board);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      if (result.winner === "X") { // User wins (assuming user is X)
         confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
         });
         handleGameEnd(true);
      } else {
         handleGameEnd(false);
      }
    } else if (!board.includes(null)) {
      setWinner("Draw");
      handleGameEnd(false);
    }
  }, [board]);

  const handleGameEnd = async (isWin: boolean) => {
    if (gameRecorded) return;
    setGameRecorded(true);
    
    try {
      const result = await recordResult({
        gameId: "tictactoe",
        win: isWin
      });
      
      if (result) {
        toast.success(isWin ? `Victory! +${result.pointsAwarded} Points` : `Game Over. +${result.pointsAwarded} Points`);
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
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex justify-between items-center w-full max-w-xs">
        <div className={`text-xl font-black ${xIsNext && !winner ? "text-primary scale-110" : "text-muted-foreground"} transition-all`}>
          Player X
        </div>
        <div className={`text-xl font-black ${!xIsNext && !winner ? "text-primary scale-110" : "text-muted-foreground"} transition-all`}>
          Player O
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 bg-black p-3 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
        {board.map((square, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(i)}
            className={`h-24 w-24 bg-white rounded-lg text-5xl font-black flex items-center justify-center transition-colors ${
              winningLine?.includes(i) ? "bg-green-200 text-green-700" : "text-black"
            }`}
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
            {winner === "Draw" ? "It's a Draw!" : `${winner} Wins!`}
          </div>
          <Button onClick={resetGame} className="gap-2 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <RotateCcw className="h-4 w-4" /> Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
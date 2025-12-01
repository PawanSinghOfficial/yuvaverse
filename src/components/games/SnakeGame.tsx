import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const GRID_SIZE = 20;
const CELL_SIZE = 20; // px
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: 0 };

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  const recordResult = useMutation(api.users.recordGameResult);

  const generateFood = () => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood());
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
  };

  const startGame = () => {
    setIsPlaying(true);
    setDirection({ x: 1, y: 0 }); // Start moving right
  };

  useEffect(() => {
    if (isPlaying && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, 150);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, gameOver, snake, direction]);

  const moveSnake = () => {
    if (direction.x === 0 && direction.y === 0) return;

    const newHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    // Check collisions
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE ||
      snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
    ) {
      handleGameOver();
      return;
    }

    const newSnake = [newHead, ...snake];

    // Check food
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore((s) => s + 1);
      setFood(generateFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const handleGameOver = async () => {
    setGameOver(true);
    setIsPlaying(false);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    try {
      const result = await recordResult({
        gameId: "snake",
        score: score,
        win: false // Snake is endless, so just participation/score
      });
      
      if (result) {
        toast.success(`Game Over! You earned ${result.pointsAwarded} points.`);
        if (result.newHighScore && result.newHighScore === score) {
          toast.success("New High Score! 🏆");
        }
      }
    } catch (error) {
      console.error("Failed to record score:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp": if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
      case "ArrowDown": if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
      case "ArrowLeft": if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
      case "ArrowRight": if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
    }
  };

  // Mobile controls
  const handleControl = (dx: number, dy: number) => {
    if (dx !== 0 && direction.x === 0) setDirection({ x: dx, y: 0 });
    if (dy !== 0 && direction.y === 0) setDirection({ x: 0, y: dy });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 outline-none" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="flex justify-between w-full max-w-[300px] font-black uppercase">
        <div>Score: {score}</div>
        {gameOver && <div className="text-red-500">Game Over!</div>}
      </div>

      <div 
        className="relative bg-black border-4 border-gray-800 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        {snake.map((segment, i) => (
          <div
            key={i}
            className="absolute bg-green-500 border border-black"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              borderRadius: i === 0 ? "4px" : "0",
            }}
          />
        ))}
        <div
          className="absolute bg-red-500 rounded-full animate-pulse"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE,
          }}
        />
        
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button onClick={startGame} className="font-bold border-2 border-white">
              <Play className="mr-2 h-4 w-4" /> Start Game
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div />
        <Button variant="outline" size="icon" onClick={() => handleControl(0, -1)}><ArrowUp /></Button>
        <div />
        <Button variant="outline" size="icon" onClick={() => handleControl(-1, 0)}><ArrowLeft /></Button>
        <Button variant="outline" size="icon" onClick={() => handleControl(0, 1)}><ArrowDown /></Button>
        <Button variant="outline" size="icon" onClick={() => handleControl(1, 0)}><ArrowRight /></Button>
      </div>

      {gameOver && (
        <Button onClick={resetGame} className="mt-2 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <RotateCcw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      )}
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Brain, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { useGameSounds } from "@/hooks/use-game-sounds";
import { VayuuTease } from "@/components/VayuuTease";

const EMOJIS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"];

type Difficulty = "easy" | "medium" | "hard";
type Turn = "player" | "cpu";

export default function MemoryMatch() {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [scores, setScores] = useState({ player: 0, cpu: 0 });
  const [turn, setTurn] = useState<Turn>("player");
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameRecorded, setGameRecorded] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [cpuMemory, setCpuMemory] = useState<Map<number, string>>(new Map());
  const [teaseMessage, setTeaseMessage] = useState<string | null>(null);
  const { playSound } = useGameSounds();
  
  const user = useQuery(api.users.currentUser);
  const recordResult = useMutation(api.users.recordGameResult);

  const shuffleCards = () => {
    let pairCount = 8;
    if (difficulty === "easy") pairCount = 6;
    if (difficulty === "hard") pairCount = 12;

    const selectedEmojis = EMOJIS.slice(0, pairCount);
    const shuffled = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setScores({ player: 0, cpu: 0 });
    setTurn("player");
    setIsGameOver(false);
    setGameRecorded(false);
    setCpuMemory(new Map());
  };

  useEffect(() => {
    shuffleCards();
  }, [difficulty]);

  // Handle Match Logic
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      
      // Add to CPU memory
      setCpuMemory(prev => {
        const newMemory = new Map(prev);
        newMemory.set(first, cards[first].emoji);
        newMemory.set(second, cards[second].emoji);
        return newMemory;
      });

      if (cards[first].emoji === cards[second].emoji) {
        // Match found
        playSound('correct');
        setCards((prev) =>
          prev.map((card) =>
            card.id === first || card.id === second ? { ...card, isMatched: true } : card
          )
        );
        setFlippedCards([]);
        setScores(prev => ({
          ...prev,
          [turn]: prev[turn] + 1
        }));
        // Keep turn if match found
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
          setTurn(prev => prev === "player" ? "cpu" : "player");
        }, 1000);
      }
    }
  }, [flippedCards, playSound]);

  // CPU Turn Logic
  useEffect(() => {
    if (turn === "cpu" && !isGameOver && flippedCards.length === 0) {
      const makeCpuMove = async () => {
        // Wait a bit before starting turn
        await new Promise(resolve => setTimeout(resolve, 1000));

        const unMatchedCards = cards.filter(c => !c.isMatched);
        if (unMatchedCards.length === 0) return;

        // 1. Check for known pairs in memory
        let firstPickId = -1;
        let secondPickId = -1;

        // Find pairs in memory that are currently unmatched
        const memoryArray = Array.from(cpuMemory.entries()).filter(([id]) => !cards[id].isMatched);
        const emojiCounts: Record<string, number[]> = {};
        
        memoryArray.forEach(([id, emoji]) => {
          if (!emojiCounts[emoji]) emojiCounts[emoji] = [];
          emojiCounts[emoji].push(id);
        });

        const knownPairEmoji = Object.keys(emojiCounts).find(e => emojiCounts[e].length === 2);

        if (knownPairEmoji) {
          // We know a pair!
          [firstPickId, secondPickId] = emojiCounts[knownPairEmoji];
        } else {
          // 2. Pick a random card (prefer unknown ones)
          const unknownCards = unMatchedCards.filter(c => !cpuMemory.has(c.id));
          const candidates = unknownCards.length > 0 ? unknownCards : unMatchedCards;
          
          const firstCard = candidates[Math.floor(Math.random() * candidates.length)];
          firstPickId = firstCard.id;

          // 3. Check if we know the match for this card
          const matchInMemory = memoryArray.find(([id, emoji]) => emoji === firstCard.emoji && id !== firstCard.id);
          
          if (matchInMemory) {
            secondPickId = matchInMemory[0];
          } else {
            // 4. Pick another random card
            const remaining = unMatchedCards.filter(c => c.id !== firstPickId);
            const secondCard = remaining[Math.floor(Math.random() * remaining.length)];
            secondPickId = secondCard.id;
          }
        }

        // Execute moves
        handleCardClick(firstPickId, true);
        await new Promise(resolve => setTimeout(resolve, 800));
        handleCardClick(secondPickId, true);
      };

      makeCpuMove();
    }
  }, [turn, isGameOver, cards, cpuMemory]);

  // Game Over Check
  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched) && !gameRecorded) {
      setIsGameOver(true);
      setGameRecorded(true);
      
      const isWin = scores.player > scores.cpu;
      
      if (isWin) {
        playSound('win');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        playSound('lose');
        if (scores.player < scores.cpu) {
            const username = user?.username || user?.name || "Player";
            const teases = [
                `I have a photographic memory, ${username}. Do you? 📸`,
                `Forgot where that card was, ${username}? 😂`,
                `Vayuu wins again! Better focus next time, ${username}. 🧠`,
                `Too easy for me, ${username}! 🤖`
            ];
            const randomTease = teases[Math.floor(Math.random() * teases.length)];
            setTeaseMessage(randomTease);
        }
      }
      
      recordResult({
        gameId: "memory",
        win: isWin,
        difficulty: difficulty
      }).then((res) => {
        if (res) {
          if (res.gemsAwarded > 0) {
            toast.success(`🎉 5 Consecutive Wins! +${res.gemsAwarded} Gems!`);
          } else if (isWin) {
            const winsLeft = 5 - res.consecutiveWins;
            toast.success(`You Won! ${res.consecutiveWins}/5 wins (${winsLeft} more for 10 gems)`);
          } else {
            toast.error(`Vayuu Won. Streak reset. Try for 5 consecutive wins to earn 10 gems.`);
          }
        }
      }).catch(console.error);
    }
  }, [cards, gameRecorded, scores, difficulty, playSound]);

  const handleCardClick = (id: number, isCpu = false) => {
    if (!isCpu && turn === "cpu") return;
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;
    
    playSound('click');
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, isFlipped: true } : card))
    );
    setFlippedCards((prev) => [...prev, id]);
  };

  const getGridClass = () => {
    if (difficulty === "easy") return "grid-cols-3"; // 4x3
    if (difficulty === "hard") return "grid-cols-6"; // 4x6
    return "grid-cols-4"; // 4x4
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-4xl mx-auto">
      <VayuuTease message={teaseMessage} onClose={() => setTeaseMessage(null)} />
      <div className="flex flex-col w-full gap-4">
        <div className="flex justify-between items-center px-4 bg-secondary/20 p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className={`flex items-center gap-2 text-xl font-black ${turn === "player" ? "text-green-600 scale-110" : "text-muted-foreground"} transition-all`}>
            <User className="h-6 w-6" />
            You: {scores.player}
          </div>
          
          <div className="flex gap-1">
            {turn === "player" && !isGameOver && (
              <span className="text-xs font-bold uppercase bg-green-100 text-green-800 px-2 py-1 rounded animate-pulse">Your Turn</span>
            )}
            {turn === "cpu" && !isGameOver && (
              <span className="text-xs font-bold uppercase bg-red-100 text-red-800 px-2 py-1 rounded animate-pulse">Vayuu Thinking...</span>
            )}
          </div>

          <div className={`flex items-center gap-2 text-xl font-black ${turn === "cpu" ? "text-red-600 scale-110" : "text-muted-foreground"} transition-all`}>
            Vayuu: {scores.cpu}
            <Bot className="h-6 w-6" />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                disabled={flippedCards.length > 0 || scores.player > 0 || scores.cpu > 0}
                className={`px-3 py-1 text-xs font-bold uppercase rounded border-2 border-black transition-all ${
                  difficulty === d 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-white hover:bg-gray-100 disabled:opacity-50"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <Button onClick={shuffleCards} size="sm" variant="outline" className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </div>

      <div className={`grid ${getGridClass()} gap-3`} style={{ perspective: "1000px" }}>
        {cards.map((card) => (
          <div
            key={card.id}
            className="relative h-16 w-16 sm:h-20 sm:w-20 cursor-pointer group"
            onClick={() => handleCardClick(card.id)}
            style={{ perspective: "1000px" }}
          >
            <motion.div
              className="w-full h-full relative"
              initial={false}
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front Face (Brain Icon) */}
              <div 
                className="absolute inset-0 flex items-center justify-center bg-indigo-500 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                style={{ 
                  backfaceVisibility: "hidden", 
                  WebkitBackfaceVisibility: "hidden",
                  zIndex: 2
                }}
              >
                <Brain className="text-white h-8 w-8" />
              </div>

              {/* Back Face (Emoji) */}
              <div 
                className="absolute inset-0 flex items-center justify-center bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-3xl sm:text-4xl"
                style={{ 
                  backfaceVisibility: "hidden", 
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  zIndex: 1
                }}
              >
                {card.emoji}
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {isGameOver && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-4 p-6 bg-white rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        >
          <h3 className={`text-3xl font-black uppercase ${scores.player > scores.cpu ? "text-green-600" : scores.player < scores.cpu ? "text-red-600" : "text-yellow-600"}`}>
            {scores.player > scores.cpu ? "You Won!" : scores.player < scores.cpu ? "Vayuu Won!" : "It's a Draw!"}
          </h3>
          <p className="text-muted-foreground font-bold text-xl mt-2">
            {scores.player} - {scores.cpu}
          </p>
          <Button onClick={shuffleCards} className="mt-4 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Play Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}
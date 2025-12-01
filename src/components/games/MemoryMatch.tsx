import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Brain } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const EMOJIS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"];

type Difficulty = "easy" | "medium" | "hard";

export default function MemoryMatch() {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [gameRecorded, setGameRecorded] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  
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
    setMoves(0);
    setIsWon(false);
    setGameRecorded(false);
  };

  useEffect(() => {
    shuffleCards();
  }, [difficulty]); // Re-shuffle when difficulty changes

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (cards[first].emoji === cards[second].emoji) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === first || card.id === second ? { ...card, isMatched: true } : card
          )
        );
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second ? { ...card, isFlipped: false } : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves((m) => m + 1);
    }
  }, [flippedCards]);

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched) && !gameRecorded) {
      setIsWon(true);
      setGameRecorded(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      recordResult({
        gameId: "memory",
        win: true
      }).then((res) => {
        if (res) toast.success(`Memory Master! +${res.pointsAwarded} Points`);
      }).catch(console.error);
    }
  }, [cards, gameRecorded, recordResult]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;
    
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
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex flex-col w-full max-w-2xl gap-4">
        <div className="flex justify-between items-center px-4">
          <div className="text-xl font-black">Moves: {moves}</div>
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 text-xs font-bold uppercase rounded border-2 border-black transition-all ${
                  difficulty === d 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-white hover:bg-gray-100"
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

      <div className={`grid ${getGridClass()} gap-3`}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className="relative h-16 w-16 sm:h-20 sm:w-20 cursor-pointer"
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={`absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
                card.isFlipped || card.isMatched ? "rotate-y-180" : ""
              }`}
              initial={false}
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-500 rounded-xl" style={{ backfaceVisibility: "hidden", transform: "rotateY(0deg)" }}>
                <Brain className="text-white h-8 w-8" />
              </div>
              <div 
                className="absolute inset-0 flex items-center justify-center bg-white rounded-xl" 
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                {card.emoji}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {isWon && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-4"
        >
          <h3 className="text-2xl font-black text-green-600 uppercase">Memory Master!</h3>
          <p className="text-muted-foreground font-medium">Completed in {moves} moves ({difficulty})</p>
        </motion.div>
      )}
    </div>
  );
}
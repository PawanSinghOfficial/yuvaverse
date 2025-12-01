import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Brain } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

const EMOJIS = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];

export default function MemoryMatch() {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const shuffleCards = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
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
  };

  useEffect(() => {
    shuffleCards();
  }, []);

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
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setIsWon(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [cards]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;
    
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, isFlipped: true } : card))
    );
    setFlippedCards((prev) => [...prev, id]);
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div className="flex justify-between w-full max-w-md px-4">
        <div className="text-xl font-black">Moves: {moves}</div>
        <Button onClick={shuffleCards} size="sm" variant="outline" className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <RotateCcw className="h-4 w-4 mr-2" /> Reset
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            className="relative h-20 w-20 cursor-pointer"
            onClick={() => handleCardClick(card.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className={`absolute inset-0 flex items-center justify-center text-4xl bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ${
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
          <p className="text-muted-foreground font-medium">Completed in {moves} moves</p>
        </motion.div>
      )}
    </div>
  );
}

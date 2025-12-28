import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Trash2, Play, Plus, ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function Flashcards() {
  const sets = useQuery(api.flashcards.getUserSets);
  const deleteSet = useMutation(api.flashcards.deleteSet);
  const [selectedSetId, setSelectedSetId] = useState<Id<"flashcard_sets"> | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: Id<"flashcard_sets">) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this set?")) {
      await deleteSet({ setId: id });
      toast.success("Set deleted");
      if (selectedSetId === id) setSelectedSetId(null);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
          <div className="h-12 w-12 bg-indigo-100 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <BrainCircuit className="h-7 w-7 text-indigo-600" />
          </div>
          Flashcards
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Study smarter with AI-generated flashcards from your resources.
        </p>
      </div>

      {selectedSetId ? (
        <FlashcardPlayer setId={selectedSetId} onBack={() => setSelectedSetId(null)} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create New Placeholder - could link to resources */}
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center hover:bg-gray-100 transition-colors cursor-pointer min-h-[200px]" onClick={() => window.location.href = '/resources'}>
            <div className="h-12 w-12 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-bold text-lg text-gray-600">Create New Set</h3>
            <p className="text-sm text-muted-foreground mt-1">Go to Resources or Syllabus to generate</p>
          </Card>

          {sets?.map((set) => (
            <Card 
              key={set._id} 
              className="group cursor-pointer border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
              onClick={() => setSelectedSetId(set._id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold line-clamp-1">{set.title}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 -mr-2 -mt-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(e, set._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 inline-block px-2 py-1 border border-indigo-100 rounded-sm">
                  {set.sourceType.replace("_", " ")}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                  {set.description || "No description"}
                </p>
                <div className="flex items-center text-sm font-bold text-black group-hover:text-indigo-600 transition-colors">
                  <Play className="h-4 w-4 mr-2 fill-current" />
                  Start Studying
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FlashcardPlayer({ setId, onBack }: { setId: Id<"flashcard_sets">, onBack: () => void }) {
  const cards = useQuery(api.flashcards.getSetCards, { setId });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards) return <div className="p-12 text-center">Loading cards...</div>;
  if (cards.length === 0) return <div className="p-12 text-center">No cards in this set.</div>;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="pl-0 hover:bg-transparent hover:text-indigo-600">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sets
      </Button>

      <div className="flex justify-between items-center">
        <span className="font-bold text-muted-foreground">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300" 
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="perspective-1000 h-[400px] w-full cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div
          className="relative w-full h-full transition-all duration-500 preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden">
            <Card className="h-full w-full flex flex-col items-center justify-center p-8 text-center border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <span className="absolute top-4 left-4 text-xs font-black uppercase text-muted-foreground tracking-widest">Question</span>
              <h3 className="text-2xl font-bold leading-relaxed">{currentCard.front}</h3>
              <p className="absolute bottom-4 text-sm text-muted-foreground font-medium animate-pulse">Click to flip</p>
            </Card>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180" style={{ transform: "rotateY(180deg)" }}>
            <Card className="h-full w-full flex flex-col items-center justify-center p-8 text-center border-2 border-indigo-600 shadow-[8px_8px_0px_0px_#4f46e5] bg-indigo-50">
              <span className="absolute top-4 left-4 text-xs font-black uppercase text-indigo-600 tracking-widest">Answer</span>
              <h3 className="text-2xl font-medium leading-relaxed text-indigo-900">{currentCard.back}</h3>
            </Card>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={handlePrev}
          className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => setIsFlipped(!isFlipped)}
          className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
        >
          <RotateCw className="mr-2 h-4 w-4" />
          Flip
        </Button>
        <Button 
          variant="default" 
          size="lg" 
          onClick={handleNext}
          className="bg-black text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:bg-gray-800"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

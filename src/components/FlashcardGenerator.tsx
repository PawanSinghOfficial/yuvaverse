import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

interface FlashcardGeneratorProps {
  title: string;
  content?: string;
  sourceType: "resource" | "syllabus_topic" | "manual";
  sourceId?: string;
  trigger?: React.ReactNode;
}

export function FlashcardGenerator({ title, content, sourceType, sourceId, trigger }: FlashcardGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const generateFlashcards = useAction(api.flashcards.generate);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateFlashcards({
        title,
        content,
        sourceType,
        sourceId,
      });
      toast.success("Flashcards generated successfully!");
      setIsOpen(false);
      navigate("/flashcards"); // Redirect to flashcards page
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <BrainCircuit className="h-4 w-4" />
            Generate Flashcards
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Generate AI Flashcards
          </DialogTitle>
          <DialogDescription>
            Create a study set automatically from <strong>{title}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center border-2 border-indigo-100">
            <BrainCircuit className="h-12 w-12 text-indigo-600" />
          </div>
          <p className="text-muted-foreground max-w-xs">
            Our AI will analyze the content and generate key questions and answers to help you study.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Now
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight, Check } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Welcome to YuvaVerse!",
    description: "I'm your AI guide. I'm here to show you around your new digital campus. Let's get started!",
  },
  {
    title: "Your Dashboard",
    description: "This is your command center. Track your points, streaks, and upcoming events right here.",
  },
  {
    title: "Resource Library",
    description: "Need notes? Upload and download study materials shared by your peers in the Resources section.",
  },
  {
    title: "Study Groups",
    description: "Collaborate in real-time! Join study groups, chat, and even have video calls with classmates.",
  },
  {
    title: "Events & Calendar",
    description: "Never miss a beat. Register for events and manage your personal to-do list in the Calendar.",
  }
];

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    onClose();
  };

  const handleSkip = async () => {
    await completeOnboarding();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)] bg-card">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary">
               <Bot className="h-10 w-10 text-primary" />
            </div>
            <div>
                <DialogTitle className="text-2xl font-black uppercase">{steps[currentStep].title}</DialogTitle>
                <p className="text-sm font-bold text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-lg font-medium leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip} className="w-full sm:w-auto">
            Skip
          </Button>
          <Button onClick={handleNext} className="w-full sm:w-auto border-2 border-border shadow-[4px_4px_0px_0px_var(--shadow)]">
            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            {currentStep === steps.length - 1 ? <Check className="ml-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

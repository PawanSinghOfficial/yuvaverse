import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import confetti from "canvas-confetti";
import { Sparkles, MessageSquare } from "lucide-react";

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleExitIntent = (e: MouseEvent) => {
      // Trigger when mouse leaves the top of the viewport
      if (e.clientY <= 0) {
        // Ensure we only count this once per session
        if (sessionStorage.getItem("exitIntentChecked")) return;
        sessionStorage.setItem("exitIntentChecked", "true");

        // Increment persistent counter
        let counter = parseInt(localStorage.getItem("exitIntentCount") || "0");
        counter = counter + 1;
        localStorage.setItem("exitIntentCount", counter.toString());

        // Show every 5th time (1 in 5)
        // if (counter % 5 === 0) {
           triggerPopup();
        // }
      }
    };

    document.addEventListener("mouseleave", handleExitIntent);
    return () => document.removeEventListener("mouseleave", handleExitIntent);
  }, []);

  const triggerPopup = () => {
    setIsOpen(true);
    
    // Play pop sound
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3");
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Audio play failed", e));

    // Sparkle animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            More Features Coming Soon!
          </DialogTitle>
          <DialogDescription>
            We are constantly working to improve YuvaVerse.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center py-4">
            <p className="text-center font-medium">
                If you have any suggestions, please fill out the feedback form.
            </p>
        </div>
        <DialogFooter className="sm:justify-center gap-2">
          <Button onClick={() => { setIsOpen(false); navigate("/feedback"); }} className="w-full sm:w-auto">
            <MessageSquare className="mr-2 h-4 w-4" />
            Give Feedback
          </Button>
          <Button variant="ghost" onClick={() => setIsOpen(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Welcome to YuvaVerse!",
    description: "I'm Vayuu, your AI guide. I'm here to show you around your new digital campus. This platform is designed to help you collaborate, learn, and grow. Let's take a quick tour of your dashboard!",
    targetId: null,
  },
  {
    title: "Your Profile & Status",
    description: "This is your personal identity card. Here you can see your current avatar, your earned badge, and your daily streak. Want to change your look? Just click on your avatar to upload a new picture. Keep your streak alive by logging in daily!",
    targetId: "dashboard-profile",
  },
  {
    title: "Quick Upload",
    description: "Have some useful notes or past year papers? Click here to quickly upload resources. Sharing knowledge earns you points, which helps you climb the leaderboard and unlock premium features!",
    targetId: "dashboard-upload-btn",
  },
  {
    title: "Your Command Center",
    description: "This grid gives you a snapshot of everything happening. Check how many resources are available, see active college groups you can join, view your registered events, and track your total points. It's your quick status report.",
    targetId: "dashboard-stats-grid",
  },
  {
    title: "Top Contributors",
    description: "Competition makes us better! This leaderboard shows the top students who are contributing the most to the community. Upload resources and be active to see your name climb up this list.",
    targetId: "dashboard-leaderboard",
  },
  {
    title: "Upcoming Events",
    description: "Never miss out on campus life. This section lists all the upcoming events, workshops, and fests. You can see the date and location at a glance.",
    targetId: "dashboard-upcoming-events",
  },
  {
    title: "Redeem Rewards",
    description: "Your hard work pays off! Use your earned points here to redeem premium tiers. Premium status unlocks exclusive badges and features to make your experience even better.",
    targetId: "dashboard-redeem",
  },
  {
    title: "League Upgrades & Ranks",
    description: "This card tracks your journey to the next league! See exactly how many points you need to level up. Reaching higher ranks unlocks exclusive benefits like creating more college groups (up to 5 for Elite!) and special profile badges.",
    targetId: "dashboard-rank-progress",
  },
  {
    title: "College group & Limits",
    description: "Create and join college groups to collaborate! Creation limits depend on your tier: Freemium users can create 1 group, Premium users 2 groups, and Elite users up to 5 groups. Upgrade your tier to lead more squads!",
    targetId: "sidebar-nav-groups",
  },
  {
    title: "Syllabus Tracker",
    description: "Stay on top of your academics! Select your course, stream, and semester to track your progress topic by topic. Watch your completion percentage grow as you check off topics.",
    targetId: "sidebar-nav-syllabus",
  },
  {
    title: "Focus Mode",
    description: "Boost your productivity with our Pomodoro timer! Choose your ambient sound (Forest, Library, etc.), set your duration, and focus. Completing a session earns you 2 points! But be careful, quitting early counts as an aborted session.",
    targetId: "sidebar-nav-focus",
  },
  {
    title: "AI Notebook",
    description: "Your personal AI study companion. Use this to launch NotebookLM, where you can upload documents and get AI-generated summaries, quizzes, and insights to help you study smarter.",
    targetId: "sidebar-nav-notebook",
  },
  {
    title: "Arcade Zone",
    description: "Take a break and have some fun! Challenge Vayuu in mini-games like Tic-Tac-Toe, Snake, and Memory Match. Earn points for winning and participating to climb the leaderboard!",
    targetId: "sidebar-nav-games",
  },
  {
    title: "Feedback & Suggestions",
    description: "The feedback form is for the features you want in future or any complain regarding the same. We value your input to make YuvaVerse better!",
    targetId: "sidebar-nav-feedback",
  },
  {
    title: "Add Friends & Connect",
    description: "Build your network on YuvaVerse! Search for your classmates and friends, send them friend requests, and stay connected. You can view their profiles, see what they're working on, and collaborate better together!",
    targetId: "friends-dropdown-trigger",
  },
  {
    title: "User Activity Feed",
    description: "Stay updated with what's happening in your community! The activity feed shows recent actions from your friends and connections - new resources uploaded, groups joined, achievements unlocked, and more. It's your social pulse on campus!",
    targetId: "activity-feed-toggle",
  },
  {
    title: "You're All Set!",
    description: "That's the basics! You can also explore the sidebar for more features like the Calendar, College group, and Feedback. Enjoy your journey in YuvaVerse!",
    targetId: null,
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

  useEffect(() => {
    if (!isOpen) {
      // Cleanup highlights when closed
      document.querySelectorAll(".onboarding-highlight").forEach(el => {
        el.classList.remove("onboarding-highlight", "relative", "z-50", "ring-4", "ring-primary", "ring-offset-4", "bg-background");
      });
      // Remove overlay if it exists
      const overlay = document.getElementById("onboarding-overlay");
      if (overlay) overlay.remove();
      return;
    }

    // Cleanup previous step highlight
    document.querySelectorAll(".onboarding-highlight").forEach(el => {
      el.classList.remove("onboarding-highlight", "relative", "z-50", "ring-4", "ring-primary", "ring-offset-4", "bg-background");
    });

    // Add overlay
    let overlay = document.getElementById("onboarding-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "onboarding-overlay";
      overlay.className = "fixed inset-0 bg-black/60 z-40 transition-opacity duration-300";
      document.body.appendChild(overlay);
    }

    const step = steps[currentStep];
    if (step.targetId) {
      const el = document.getElementById(step.targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add highlight classes
        el.classList.add("onboarding-highlight", "relative", "z-50", "ring-4", "ring-primary", "ring-offset-4");
      }
    }
  }, [currentStep, isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const overlay = document.getElementById("onboarding-overlay");
      if (overlay) overlay.remove();
      document.querySelectorAll(".onboarding-highlight").forEach(el => {
        el.classList.remove("onboarding-highlight", "relative", "z-50", "ring-4", "ring-primary", "ring-offset-4", "bg-background");
      });
    };
  }, []);

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

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] w-full max-w-md px-4 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <Card className="border-2 border-border shadow-[8px_8px_0px_0px_var(--shadow)] bg-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center border-2 border-primary shrink-0 overflow-hidden"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                   <img src="https://harmless-tapir-303.convex.cloud/api/storage/8bfd0dc3-0f8f-4844-a6da-045aa56a771a" alt="Vayuu" className="h-full w-full object-cover" />
                </motion.div>
                <div className="overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`title-${currentStep}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CardTitle className="text-xl font-black uppercase leading-tight">{steps[currentStep].title}</CardTitle>
                      <p className="text-xs font-bold text-muted-foreground mt-1">Step {currentStep + 1} of {steps.length}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground hover:text-destructive">
                  <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-2 min-h-[80px]">
            <AnimatePresence mode="wait">
              <motion.p 
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-sm font-medium leading-relaxed text-muted-foreground"
              >
                {steps[currentStep].description}
              </motion.p>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between gap-2 pt-2">
            <Button variant="ghost" onClick={handleSkip} size="sm" className="text-muted-foreground hover:text-foreground">
              Skip Tour
            </Button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                  <Button variant="outline" onClick={() => setCurrentStep(c => c - 1)} size="sm" className="border-2 border-border">
                      Back
                  </Button>
              )}
              <Button onClick={handleNext} size="sm" className="border-2 border-border shadow-[2px_2px_0px_0px_var(--shadow)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  {currentStep === steps.length - 1 ? <Check className="ml-2 h-3 w-3" /> : <ArrowRight className="ml-2 h-3 w-3" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
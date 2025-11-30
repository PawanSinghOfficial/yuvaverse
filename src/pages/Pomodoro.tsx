import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Music,
  Volume2,
  Coffee,
  Trees,
  BookOpen,
  CheckCircle2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const AMBIENT_SOUNDS = [
  {
    id: "forest",
    label: "Forest",
    icon: Trees,
    url: "https://actions.google.com/sounds/v1/nature/forest_wind.ogg",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/20"
  },
  {
    id: "library",
    label: "Library",
    icon: BookOpen,
    url: "https://actions.google.com/sounds/v1/ambiences/quiet_office.ogg", // Closest to library
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/20"
  },
  {
    id: "cafe",
    label: "Cafe",
    icon: Coffee,
    url: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    color: "text-amber-700",
    bg: "bg-amber-100 dark:bg-amber-900/20"
  }
];

const TIMER_OPTIONS = [45, 60, 90, 120];

export default function Pomodoro() {
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [totalTime, setTotalTime] = useState(45 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [volume, setVolume] = useState([50]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  
  const completeSession = useMutation(api.users.completePomodoroSession);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Audio Logic
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  useEffect(() => {
    if (selectedSound) {
      const sound = AMBIENT_SOUNDS.find(s => s.id === selectedSound);
      if (sound && audioRef.current) {
        audioRef.current.src = sound.url;
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedSound]);

  const handleComplete = async () => {
    if (audioRef.current) audioRef.current.pause();
    
    // Play success sound
    if (successAudioRef.current) {
      successAudioRef.current.volume = 0.5;
      successAudioRef.current.play().catch(e => console.error("Success audio failed:", e));
    }

    const durationMinutes = Math.floor(totalTime / 60);
    try {
      const points = await completeSession({ durationMinutes });
      setPointsEarned(points);
    } catch (error) {
      console.error("Failed to award points:", error);
      setPointsEarned(0);
    }

    setShowCompletion(true);
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#F59E0B']
    });
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const setDuration = (minutes: number) => {
    setIsActive(false);
    setTotalTime(minutes * 60);
    setTimeLeft(minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular Progress Calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  // Timer depletes: Start full (offset 0), End empty (offset circumference)
  const dashoffset = circumference * (1 - (timeLeft / totalTime));

  return (
    <div className="p-8 min-h-screen bg-yellow-50/50 dark:bg-background flex flex-col items-center justify-center space-y-8">
      <audio ref={audioRef} loop />
      <audio ref={successAudioRef} src="https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <h1 className="text-5xl font-black uppercase tracking-tighter flex items-center justify-center gap-3">
          <Timer className="h-10 w-10" />
          Focus Mode
        </h1>
        <p className="text-muted-foreground font-medium text-lg">Select your duration and ambient sound to start focusing.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Timer Section */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-8 relative overflow-hidden bg-white dark:bg-card">
            <div className="absolute top-6 right-6 flex gap-2 z-10">
               {TIMER_OPTIONS.map((mins) => (
                 <motion.button
                   key={mins}
                   whileHover={{ scale: 1.05, y: -2 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setDuration(mins)}
                   className={cn(
                     "font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-3 py-1 rounded-md text-sm transition-colors",
                     totalTime === mins * 60 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-white hover:bg-gray-50 text-black"
                   )}
                 >
                   {mins}m
                 </motion.button>
               ))}
            </div>

            <motion.div 
                className="relative mt-8 mb-8"
                animate={isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* SVG Circle */}
              <svg width="320" height="320" className="transform -rotate-90">
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className="text-muted/20"
                />
                <motion.circle
                  cx="160"
                  cy="160"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="transparent"
                  className={cn(
                      "transition-colors duration-500",
                      isActive ? "text-primary drop-shadow-[0_0_10px_rgba(0,0,0,0.2)]" : "text-muted-foreground"
                  )}
                  strokeDasharray={circumference}
                  strokeDashoffset={dashoffset}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: dashoffset }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              
              {/* Time Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                    key={timeLeft}
                    initial={{ opacity: 0.5, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-7xl font-black tracking-tighter tabular-nums"
                >
                  {formatTime(timeLeft)}
                </motion.span>
                <motion.span 
                    animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2 bg-secondary/50 px-3 py-1 rounded-full"
                >
                  {isActive ? "Focusing..." : "Ready to Start"}
                </motion.span>
              </div>
            </motion.div>

            <div className="flex items-center gap-6 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleTimer}
                className={cn(
                  "h-20 w-20 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-colors",
                  isActive ? "bg-amber-400 hover:bg-amber-500" : "bg-green-500 hover:bg-green-600"
                )}
              >
                <AnimatePresence mode="wait">
                    {isActive ? (
                        <motion.div
                            key="pause"
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 90 }}
                        >
                            <Pause className="h-8 w-8 text-black fill-black" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="play"
                            initial={{ scale: 0, rotate: 90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: -90 }}
                        >
                            <Play className="h-8 w-8 text-white fill-white ml-1" />
                        </motion.div>
                    )}
                </AnimatePresence>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: -180 }}
                whileTap={{ scale: 0.9 }}
                onClick={resetTimer}
                className="h-14 w-14 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white hover:bg-gray-100 flex items-center justify-center"
              >
                <RotateCcw className="h-6 w-6 text-black" />
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* Sound Controls */}
        <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6 bg-white dark:bg-card">
              <div>
                <h3 className="text-xl font-black uppercase flex items-center gap-2 mb-6 border-b-4 border-black pb-2">
                  <Music className="h-6 w-6" />
                  Ambience
                </h3>
                <div className="space-y-4">
                  {AMBIENT_SOUNDS.map((sound) => (
                    <motion.button
                      key={sound.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedSound(selectedSound === sound.id ? null : sound.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg",
                        selectedSound === sound.id ? `${sound.bg} border-black ring-2 ring-black ring-offset-2` : "bg-white hover:bg-gray-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-full border-2 border-black bg-white", sound.color)}>
                            <sound.icon className="h-5 w-5" />
                        </div>
                        <span className="font-bold uppercase text-sm">{sound.label}</span>
                      </div>
                      {selectedSound === sound.id && (
                        <div className="flex gap-1 items-end h-4">
                            <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-1 bg-black rounded-full" />
                            <motion.div animate={{ height: [8, 16, 8] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.1 }} className="w-1 bg-black rounded-full" />
                            <motion.div animate={{ height: [6, 10, 6] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1 bg-black rounded-full" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t-4 border-black/10">
                <h3 className="text-sm font-bold uppercase flex items-center gap-2 mb-4 text-muted-foreground">
                  <Volume2 className="h-4 w-4" />
                  Volume Control
                </h3>
                <div className="flex items-center gap-4 bg-secondary/30 p-3 rounded-xl border-2 border-black/5">
                    <VolumeX className="h-4 w-4 text-muted-foreground" />
                    <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="flex-1 cursor-pointer"
                    />
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Card>
        </motion.div>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
        <DialogContent className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center gap-4 pt-4">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </motion.div>
              <span className="text-3xl font-black uppercase tracking-tighter">Session Complete!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground font-medium text-lg">
              Great job! You've focused for <span className="font-bold text-foreground">{totalTime / 60} minutes</span>.
            </p>
            {pointsEarned > 0 && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4 inline-flex items-center gap-2 bg-yellow-100 border-2 border-black px-4 py-2 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="text-2xl">🏆</span>
                <span className="font-black uppercase text-yellow-700">+{pointsEarned} Points Earned</span>
              </motion.div>
            )}
            <p className="text-sm text-muted-foreground mt-4">Take a short break and stretch.</p>
          </div>
          <DialogFooter className="sm:justify-center pb-4">
            <Button 
                onClick={() => setShowCompletion(false)}
                size="lg"
                className="font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-black text-white hover:bg-gray-800"
            >
              Close & Reset Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
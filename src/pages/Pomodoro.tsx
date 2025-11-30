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
  VolumeX,
  Maximize,
  Minimize,
  CloudRain
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
    url: "https://actions.google.com/sounds/v1/nature/birds_in_forest.ogg",
    color: "text-green-600",
    bg: "bg-green-100 dark:bg-green-900/20",
    pageBg: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950",
    vibeIcon: Trees
  },
  {
    id: "library",
    label: "Library",
    icon: BookOpen,
    url: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Library_sounds.ogg",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    pageBg: "bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950 dark:via-gray-950 dark:to-zinc-950",
    vibeIcon: BookOpen
  },
  {
    id: "cafe",
    label: "Cafe",
    icon: Coffee,
    url: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    color: "text-amber-700",
    bg: "bg-amber-100 dark:bg-amber-900/20",
    pageBg: "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950",
    vibeIcon: Coffee
  },
  {
    id: "rain",
    label: "Rain",
    icon: CloudRain,
    url: "https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg",
    color: "text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/10",
    pageBg: "bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950 dark:via-cyan-950 dark:to-sky-950",
    vibeIcon: CloudRain
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const activeSound = AMBIENT_SOUNDS.find(s => s.id === selectedSound);
  const pageBackground = activeSound?.pageBg || "bg-yellow-50/50 dark:bg-background";
  
  const completeSession = useMutation(api.users.completePomodoroSession);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Full Screen Logic
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

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

  // Circular Progress Calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  // Timer depletes: Start full (offset 0), End empty (offset circumference)
  const dashoffset = circumference * (1 - (timeLeft / totalTime));

  const getTimerColor = () => {
    if (!isActive && timeLeft === totalTime) return "text-primary";
    const ratio = timeLeft / totalTime;
    if (ratio > 0.6) return "text-emerald-500";
    if (ratio > 0.25) return "text-amber-500";
    return "text-rose-500";
  };

  const renderTimeDisplay = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return (
      <div className="flex items-center justify-center font-black tracking-tighter tabular-nums text-7xl z-10 relative">
        <span className="w-[1.2em] text-center">{mins.toString().padStart(2, '0')}</span>
        <motion.span 
          animate={isActive ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="mx-1 pb-2"
        >
          :
        </motion.span>
        <span className="w-[1.2em] text-center">{secs.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={cn("p-8 min-h-screen flex flex-col items-center justify-center space-y-8 relative overflow-y-auto transition-colors duration-1000", pageBackground)}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      {/* Vibe Icon Background */}
      <AnimatePresence mode="wait">
        {activeSound && (
          <motion.div
            key={activeSound.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.05, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          >
            <activeSound.icon className="w-[800px] h-[800px] text-black dark:text-white" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Full Screen Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullScreen}
          className="rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
          title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
        >
          {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </Button>
      </div>

      <audio ref={audioRef} loop />
      <audio ref={successAudioRef} src="https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2 relative z-10"
      >
        <h1 className="text-5xl font-black uppercase tracking-tighter flex items-center justify-center gap-3">
          <motion.div
            animate={isActive ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Timer className="h-10 w-10" />
          </motion.div>
          Focus Mode
        </h1>
        <p className="text-muted-foreground font-medium text-lg">Select your duration and ambient sound to start focusing.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl relative z-10">
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
                      "transition-colors duration-1000",
                      getTimerColor(),
                      isActive && "drop-shadow-[0_0_15px_rgba(0,0,0,0.15)]"
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
                <motion.div 
                    key={timeLeft} // Keep key for subtle re-render animations if needed, or remove for smoothness
                    initial={{ opacity: 0.5, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                  {renderTimeDisplay()}
                </motion.div>
                <motion.span 
                    animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={cn(
                      "text-sm font-bold uppercase tracking-widest mt-2 px-3 py-1 rounded-full transition-colors",
                      isActive ? "bg-black text-white" : "bg-secondary/50 text-muted-foreground"
                    )}
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
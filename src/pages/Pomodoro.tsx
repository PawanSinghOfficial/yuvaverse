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
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

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
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleComplete = () => {
    setShowCompletion(true);
    if (audioRef.current) audioRef.current.pause();
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
  const progress = 1 - (timeLeft / totalTime);
  const dashoffset = circumference * (1 - progress); // Inverted for countdown effect

  return (
    <div className="p-8 min-h-screen bg-background flex flex-col items-center justify-center space-y-8">
      <audio ref={audioRef} loop />
      
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Focus Mode</h1>
        <p className="text-muted-foreground font-medium">Select your duration and ambient sound to start focusing.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Timer Section */}
        <Card className="lg:col-span-2 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 flex gap-2">
             {TIMER_OPTIONS.map((mins) => (
               <Button
                 key={mins}
                 variant={totalTime === mins * 60 ? "default" : "outline"}
                 size="sm"
                 onClick={() => setDuration(mins)}
                 className={cn(
                   "font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all",
                   totalTime === mins * 60 ? "bg-primary text-primary-foreground" : "bg-white"
                 )}
               >
                 {mins}m
               </Button>
             ))}
          </div>

          <div className="relative mt-8 mb-8">
            {/* SVG Circle */}
            <svg width="300" height="300" className="transform -rotate-90">
              <circle
                cx="150"
                cy="150"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-muted/20"
              />
              <motion.circle
                cx="150"
                cy="150"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className={cn(
                    "text-primary transition-all duration-1000 ease-linear",
                    isActive && "stroke-primary",
                    !isActive && "stroke-muted-foreground"
                )}
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: dashoffset }}
              />
            </svg>
            
            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
              </span>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2">
                {isActive ? "Focusing..." : "Ready"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              size="lg"
              onClick={toggleTimer}
              className={cn(
                "h-16 w-16 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all",
                isActive ? "bg-amber-500 hover:bg-amber-600" : "bg-green-500 hover:bg-green-600"
              )}
            >
              {isActive ? <Pause className="h-8 w-8 text-white" /> : <Play className="h-8 w-8 text-white ml-1" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={resetTimer}
              className="h-12 w-12 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        {/* Sound Controls */}
        <Card className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
          <div>
            <h3 className="text-xl font-black uppercase flex items-center gap-2 mb-4">
              <Music className="h-5 w-5" />
              Ambience
            </h3>
            <div className="space-y-3">
              {AMBIENT_SOUNDS.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => setSelectedSound(selectedSound === sound.id ? null : sound.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 border-2 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                    selectedSound === sound.id ? `${sound.bg} border-black` : "bg-white hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <sound.icon className={cn("h-5 w-5", sound.color)} />
                    <span className="font-bold uppercase text-sm">{sound.label}</span>
                  </div>
                  {selectedSound === sound.id && (
                    <div className="flex gap-1">
                        <span className="animate-bounce delay-0 h-2 w-1 bg-black block"></span>
                        <span className="animate-bounce delay-100 h-3 w-1 bg-black block"></span>
                        <span className="animate-bounce delay-75 h-2 w-1 bg-black block"></span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t-2 border-border">
            <h3 className="text-sm font-bold uppercase flex items-center gap-2 mb-4 text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              Volume Control
            </h3>
            <div className="flex items-center gap-4">
                <VolumeX className="h-4 w-4 text-muted-foreground" />
                <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                />
                <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </Card>
      </div>

      {/* Completion Dialog */}
      <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
        <DialogContent className="border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex flex-col items-center gap-4 pt-4">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <span className="text-2xl font-black uppercase">Session Complete!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground font-medium">
              Great job! You've focused for {totalTime / 60} minutes.
              Take a short break and stretch.
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
                onClick={() => setShowCompletion(false)}
                className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Close & Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

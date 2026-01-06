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
  CloudRain,
  AlertTriangle,
  PictureInPicture,
  Piano,
  Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { VayuuTease } from "@/components/VayuuTease";
import { GrowingPlant } from "@/components/pomodoro/GrowingPlant";
import { LibrarySeating } from "@/components/pomodoro/LibrarySeating";

const AMBIENT_SOUNDS = [
  {
    id: "lofi",
    label: "Lofi Beats",
    icon: Headphones,
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    color: "text-purple-600",
    bg: "bg-purple-100 dark:bg-purple-900/20",
    pageBg: "bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950 dark:via-fuchsia-950 dark:to-pink-950",
    vibeIcon: Headphones
  },
  {
    id: "piano",
    label: "Ambient Piano",
    icon: Piano,
    url: "https://cdn.pixabay.com/audio/2022/03/24/audio_079699035c.mp3",
    color: "text-blue-600",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    pageBg: "bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950 dark:via-gray-950 dark:to-zinc-950",
    vibeIcon: Piano
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
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [teaseMessage, setTeaseMessage] = useState<string | null>(null);
  const [isPiPActive, setIsPiPActive] = useState(false);
  
  const activeSound = AMBIENT_SOUNDS.find(s => s.id === selectedSound);
  const pageBackground = activeSound?.pageBg || "bg-yellow-50/50 dark:bg-background";
  
  const user = useQuery(api.users.currentUser);
  const completeSession = useMutation(api.users.completePomodoroSession);
  const abortSession = useMutation(api.users.abortPomodoroSession);
  const updatePresence = useMutation(api.presence.updateFocusPresence);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // PiP Refs
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement>(null);

  // Persistence Logic
  useEffect(() => {
    // Load state from localStorage on mount
    const savedEndTime = localStorage.getItem("pomodoroEndTime");
    const savedTotalTime = localStorage.getItem("pomodoroTotalTime");
    const savedIsActive = localStorage.getItem("pomodoroIsActive");

    if (savedEndTime && savedTotalTime && savedIsActive === "true") {
      const endTime = parseInt(savedEndTime, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      setTotalTime(parseInt(savedTotalTime, 10));
      setTimeLeft(remaining);
      setIsActive(true);
    }
  }, []);

  useEffect(() => {
    // Save state to localStorage
    if (isActive) {
      const endTime = Date.now() + timeLeft * 1000;
      localStorage.setItem("pomodoroEndTime", endTime.toString());
      localStorage.setItem("pomodoroTotalTime", totalTime.toString());
      localStorage.setItem("pomodoroIsActive", "true");
    } else {
      localStorage.removeItem("pomodoroEndTime");
      localStorage.removeItem("pomodoroTotalTime");
      localStorage.removeItem("pomodoroIsActive");
    }
  }, [isActive, totalTime]);

  // Refined Persistence:
  const startTimer = () => {
    const endTime = Date.now() + timeLeft * 1000;
    localStorage.setItem("pomodoroEndTime", endTime.toString());
    localStorage.setItem("pomodoroTotalTime", totalTime.toString());
    localStorage.setItem("pomodoroIsActive", "true");
    setIsActive(true);
  };

  const pauseTimer = () => {
    localStorage.removeItem("pomodoroEndTime");
    localStorage.setItem("pomodoroIsActive", "false");
    setIsActive(false);
  };

  const stopTimer = () => {
    localStorage.removeItem("pomodoroEndTime");
    localStorage.removeItem("pomodoroTotalTime");
    localStorage.removeItem("pomodoroIsActive");
    setIsActive(false);
  };

  const handleCompleteWrapped = async () => {
    stopTimer();
    await handleComplete();
  };

  // Request Notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Update document title with timer
  useEffect(() => {
    if (isActive) {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      document.title = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} - Focus`;
    } else {
      document.title = "Focus Mode | YuvaVerse";
    }
    
    return () => {
      document.title = "YuvaVerse";
    };
  }, [isActive, timeLeft]);

  // Add Presence Heartbeat
  useEffect(() => {
    const sendHeartbeat = () => {
      updatePresence({
        status: isActive ? "focusing" : "idle",
        focusDuration: isActive ? totalTime / 60 : undefined,
        startTime: isActive ? (Date.now() - ((totalTime - timeLeft) * 1000)) : undefined,
      });
    };

    // Send immediately on mount/change
    sendHeartbeat();

    // Send every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, [isActive, totalTime, timeLeft, updatePresence]);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
            const newVal = prev - 1;
            // Sync with real time if needed, but simple decrement is okay for short durations.
            // For better accuracy across tabs:
            const savedEndTime = localStorage.getItem("pomodoroEndTime");
            if (savedEndTime) {
                const remaining = Math.max(0, Math.ceil((parseInt(savedEndTime) - Date.now()) / 1000));
                return remaining;
            }
            return newVal;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      handleCompleteWrapped();
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

  // PiP Logic
  const togglePiP = async () => {
    if (!pipVideoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else {
        await pipVideoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch (error) {
      console.error("Failed to toggle PiP:", error);
      toast.error("Picture-in-Picture failed to start");
    }
  };

  // Draw to PiP Canvas
  useEffect(() => {
    const canvas = pipCanvasRef.current;
    const video = pipVideoRef.current;
    
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize video stream from canvas once
    if (video.srcObject === null) {
        const stream = canvas.captureStream(30); // 30 FPS
        video.srcObject = stream;
        video.play().catch(() => {}); // Auto-play hidden video
    }

    const draw = () => {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Background Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2d2d2d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Progress Circle
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 80;
        const progress = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;

        // Background Circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.lineWidth = 15;
        ctx.strokeStyle = '#333333';
        ctx.stroke();

        // Progress Arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, (-Math.PI / 2) + (progress * 2 * Math.PI));
        ctx.lineWidth = 15;
        ctx.strokeStyle = '#22c55e'; // Green-500
        ctx.stroke();

        // Draw Time Text
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        const timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeString, centerX, centerY);

        // Draw Status Text
        ctx.font = '16px sans-serif';
        ctx.fillStyle = isActive ? '#4ade80' : '#9ca3af';
        ctx.fillText(isActive ? "FOCUSING" : "PAUSED", centerX, centerY + 50);
    };

    // Animation Loop
    let animationId: number;
    const animate = () => {
        draw();
        animationId = requestAnimationFrame(animate);
    };
    
    animate();

    return () => cancelAnimationFrame(animationId);
  }, [timeLeft, totalTime, isActive]);


  const handleComplete = async () => {
    if (successAudioRef.current) {
      successAudioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }

    try {
      await completeSession({ durationMinutes: totalTime / 60 });
      setPointsEarned(0); // No gems earned from Pomodoro
      setShowCompletion(true);
      
      if (Notification.permission === "granted") {
        new Notification("Session Complete!", {
          body: `Great job! You focused for ${totalTime / 60} minutes.`,
          icon: "/logo.png"
        });
      }
    } catch (error) {
      console.error("Failed to complete session:", error);
    }
  };

  const handlePauseClick = () => {
    if (isActive) {
      setShowQuitConfirm(true);
    } else {
      startTimer();
    }
  };

  const handleQuitConfirm = async () => {
    stopTimer();
    setShowQuitConfirm(false);
    setTimeLeft(totalTime);
    if (audioRef.current) audioRef.current.pause();
    
    const username = user?.username || user?.name || "Warrior";
    const teases = [
        `Giving up already, ${username}? Focus is a muscle! 💪`,
        `Distracted again, ${username}? Vayuu is watching! 👀`,
        `You can do better than that, ${username}. Try again! 📉`,
        `Focus broken! ${username}, get back in the zone! 🧘`,
        `Quitting is not an option, ${username}! 🚫`
    ];
    const randomTease = teases[Math.floor(Math.random() * teases.length)];
    setTeaseMessage(randomTease);

    try {
      await abortSession({});
      toast.info("Session aborted. Keep trying!");
    } catch (error) {
      console.error("Failed to abort session:", error);
    }
  };

  const resetTimer = () => {
    if (isActive) {
      setShowQuitConfirm(true);
    } else {
      stopTimer();
      setTimeLeft(totalTime);
    }
  };

  const setDuration = (minutes: number) => {
    stopTimer();
    setTotalTime(minutes * 60);
    setTimeLeft(minutes * 60);
  };

  const progressPercentage = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const renderTimeDisplay = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return (
      <div className="flex items-center justify-center font-mono font-bold tracking-tight tabular-nums text-6xl z-10 relative text-foreground mt-8">
        <span className="w-[1.1em] text-center">{mins.toString().padStart(2, '0')}</span>
        <motion.span 
          animate={isActive ? { opacity: [1, 0.2, 1] } : { opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          className="mx-0.5 pb-1"
        >
          :
        </motion.span>
        <span className="w-[1.1em] text-center">{secs.toString().padStart(2, '0')}</span>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={cn("p-8 min-h-full w-full flex flex-col items-center justify-center space-y-8 relative overflow-y-auto transition-colors duration-1000", pageBackground)}>
      <VayuuTease message={teaseMessage} onClose={() => setTeaseMessage(null)} />
      
      {/* Hidden Canvas and Video for PiP */}
      <canvas ref={pipCanvasRef} width={300} height={300} className="hidden" />
      <video ref={pipVideoRef} className="hidden" muted playsInline />

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
      
      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePiP}
          className="rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
          title="Picture-in-Picture Mode"
        >
          <PictureInPicture className="h-5 w-5" />
        </Button>
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
      <audio ref={successAudioRef} src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Bell_ring_high.ogg" />
      
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
        
        {/* Stats Display */}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm font-bold uppercase tracking-wide">
          <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-1 rounded-full border border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed: {user?.pomodoroSessionsCompleted || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-200">
            <VolumeX className="h-4 w-4" />
            <span>Aborted: {user?.pomodoroSessionsAborted || 0}</span>
          </div>
        </div>
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

            {/* Visual Plant Timer */}
            <div className="relative mt-8 mb-4">
                <GrowingPlant progress={progressPercentage} isActive={isActive} />
            </div>
            
            {/* Time Display */}
            <motion.div 
                key={timeLeft}
                initial={{ opacity: 0.5, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {renderTimeDisplay()}
            </motion.div>
            
            <motion.span 
                animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn(
                    "text-xs font-bold uppercase tracking-widest mt-2 mb-8 px-3 py-1 rounded-full transition-colors",
                    isActive ? "bg-black text-white" : "bg-secondary/50 text-muted-foreground"
                )}
            >
                {isActive ? "Focusing..." : "Ready to Start"}
            </motion.span>

            <div className="flex items-center gap-6 z-10">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePauseClick}
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

      {/* Add Library Seating Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full relative z-10"
      >
        <LibrarySeating />
      </motion.div>

      {/* Completion Dialog */}
      <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
        <DialogContent container={containerRef.current} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:max-w-md bg-white">
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
            <p className="text-muted-foreground font-medium text-lg px-4">
              Congratulations on successfully completing your focus session!
            </p>
            <p className="text-sm text-muted-foreground mt-6">Take a short break and stretch. Earn gems by uploading resources or winning 5 arcade games in a row!</p>
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

      {/* Quit Confirmation Dialog */}
      <AlertDialog open={showQuitConfirm} onOpenChange={setShowQuitConfirm}>
        <AlertDialogContent container={containerRef.current} className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black uppercase flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-8 w-8" />
              Are you sure you want to quit?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-foreground/80">
              Warrior, don't quit! Come on, let's focus buddy. Quitting now will mark this session as aborted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
              Keep Focusing
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleQuitConfirm}
              className="font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              I Give Up
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
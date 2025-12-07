import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Calendar, Shield, Linkedin, Mail, BookCheck, BrainCircuit, Trophy, ChevronDown, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";

export default function Landing() {
  const navigate = useNavigate();
  const logoUrl = "https://harmless-tapir-303.convex.cloud/api/storage/db1724ed-9b2f-4ed4-8514-69ae556175c8";

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // Generate random shapes for background
  const shapes = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    type: i % 4, // 0: square, 1: circle, 2: triangle (rotated square), 3: rectangle
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 60,
    color: ['bg-yellow-300', 'bg-pink-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300'][Math.floor(Math.random() * 5)],
    duration: 10 + Math.random() * 20,
    delay: Math.random() * 5
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden isolate">
      <ExitIntentPopup />
      
      {/* Live Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Floating Shapes */}
        {shapes.map((shape) => (
          <motion.div 
            key={shape.id}
            animate={{ 
                y: [0, -30, 0], 
                rotate: [0, 10, -10, 0],
                x: [0, 20, 0]
            }} 
            transition={{ duration: shape.duration, repeat: Infinity, ease: "easeInOut", delay: shape.delay }}
            className={`absolute border-4 border-black opacity-30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] ${shape.color} ${shape.type === 1 ? 'rounded-full' : 'rounded-none'}`}
            style={{
              top: `${shape.y}%`,
              left: `${shape.x}%`,
              width: shape.size,
              height: shape.type === 3 ? shape.size * 1.5 : shape.size,
              transform: shape.type === 2 ? 'rotate(45deg)' : 'none'
            }}
          />
        ))}
      </div>
      
      {/* Navbar */}
      <nav className="py-4 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <img src={logoUrl} alt="YuvaVerse Logo" className="h-10 w-10 object-contain neo-brutal-sm bg-primary/10 p-1" />
          YuvaVerse
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Log in
          </Button>
          <Button onClick={() => navigate("/auth")} className="neo-brutal-sm">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-24 max-w-5xl mx-auto min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center rounded-full border-2 border-black px-3 py-1 text-xs font-bold transition-colors bg-yellow-300 text-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            🚀 Welcome to the Future of Campus Life
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
            Your Digital Campus <br />
            <span className="text-indigo-600 bg-indigo-50 px-2 border-2 border-transparent">Reimagined.</span>
          </h1>
          <p className="text-xl font-medium text-muted-foreground max-w-2xl mx-auto mb-10">
            The all-in-one platform for students. Track your syllabus, get AI study help, play arcade games, and climb the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-14 px-8 text-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all" onClick={() => navigate("/auth")}>
              Join Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground/50"
        >
          <ChevronDown className="h-12 w-12" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 bg-white/50 backdrop-blur-sm border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">Everything You Need to Excel</h2>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">From academic tracking to social connections, we've got your campus life covered.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_#4f46e5]"
            >
              <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-indigo-100 border-2 border-black">
                <BookCheck className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-black mb-2 uppercase">Syllabus Tracker</h3>
              <p className="text-muted-foreground font-medium">Track your B.Tech, BCA, or BBA progress topic-by-topic. Never lose track of what to study next.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_#9333ea]"
            >
              <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-purple-100 border-2 border-black">
                <BrainCircuit className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-black mb-2 uppercase">AI Notebook</h3>
              <p className="text-muted-foreground font-medium">Your personal AI tutor powered by NotebookLM. Upload documents and get instant summaries and quizzes.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_#eab308]"
            >
              <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-yellow-100 border-2 border-black">
                <Gamepad2 className="h-10 w-10 text-yellow-600" />
              </div>
              <h3 className="text-xl font-black mb-2 uppercase">Arcade & Gamification</h3>
              <p className="text-muted-foreground font-medium">Challenge Vayuu in retro mini-games, earn points, unlock badges, and climb the campus leaderboard.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_#0ea5e9]"
            >
              <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-sky-100 border-2 border-black">
                <BookOpen className="h-10 w-10 text-sky-600" />
              </div>
              <h3 className="text-xl font-black mb-2 uppercase">Resource Library</h3>
              <p className="text-muted-foreground font-medium">Access and share notes, practical files, and question papers with your peers.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_#ec4899]"
            >
              <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-pink-100 border-2 border-black">
                <Users className="h-10 w-10 text-pink-600" />
              </div>
              <h3 className="text-xl font-black mb-2 uppercase">Study Groups</h3>
              <p className="text-muted-foreground font-medium">Collaborate in real-time with voice, video, and chat channels dedicated to your subjects.</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_#f97316]"
            >
              <div className="h-20 w-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-orange-100 border-2 border-black">
                <Calendar className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-black mb-2 uppercase">Event Calendar</h3>
              <p className="text-muted-foreground font-medium">Never miss a society meeting, fest, or workshop again. Register and participate easily.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} YuvaVerse.</p>
            
            <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-bold tracking-widest text-muted-foreground/80 mb-1">
                    BUILD FOR STUDENTS, BY STUDENT
                </p>
                <p className="font-serif text-lg font-medium text-foreground">
                    Pawan Singh
                </p>
                <div className="flex items-center gap-4">
                    <a 
                        href="https://www.linkedin.com/in/pawansinghofficial/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <Linkedin className="h-5 w-5" />
                    </a>
                    <a 
                        href="mailto:pawansinghmahori@gmail.com"
                        className="p-2 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <Mail className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
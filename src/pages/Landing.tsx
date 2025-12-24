import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Calendar, Gamepad2, BrainCircuit, BookCheck, ChevronDown } from "lucide-react";
import { Link } from "react-router";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { NinjaCursor } from "@/components/NinjaCursor";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-[#fffdfa] text-slate-900 overflow-x-hidden font-sans selection:bg-yellow-200 selection:text-black relative">
      <NinjaCursor />
      <ExitIntentPopup />

      {/* Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Floating Shapes (Neobrutalist style) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Pink Rectangle */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [-10, -5, -10] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[10%] w-24 h-32 bg-pink-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-12"
        />
        {/* Blue Square */}
        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [10, 15, 10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 left-[20%] w-20 h-20 bg-blue-200 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12"
        />
        {/* Yellow Circle */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/2 w-16 h-16 bg-yellow-200 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        />
        {/* Purple Circle */}
        <motion.div 
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-[15%] w-24 h-24 bg-purple-200 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] opacity-80"
        />
        {/* Yellow Rectangle */}
        <motion.div 
          animate={{ rotate: [5, 10, 5], y: [0, 15, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-20 left-1/2 w-32 h-40 bg-yellow-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-6"
        />
         {/* Blue Square Top Right */}
        <motion.div 
          animate={{ rotate: [-5, 0, -5], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-28 h-28 bg-blue-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-3"
        />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 w-full border-b-2 border-black bg-white">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-red-600 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center font-black text-white text-xl">Y</div>
            <span className="font-black text-2xl tracking-tight">YuvaVerse</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-[#5b6bf9] hover:bg-[#4a5ae8] text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none px-6">
                  GO TO DASHBOARD
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className="font-bold hover:bg-transparent hover:underline">LOG IN</Button>
                </Link>
                <Link to="/auth">
                  <Button className="bg-[#5b6bf9] hover:bg-[#4a5ae8] text-white font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none px-6">
                    GET STARTED
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ffd600] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm font-bold text-black"
          >
            <span>🚀</span> Welcome to the Future of Campus Life
          </motion.div>

          {/* Headline */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] text-black">
            Your Digital Campus <br />
            <span className="relative inline-block px-4 bg-[#e0e7ff] text-[#4f46e5] transform -rotate-2 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mt-2">
              Reimagined.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-black/10">
            The all-in-one platform for students. Track your syllabus, get AI study help, 
            play arcade games, and climb the leaderboard.
          </p>

          <div className="pt-8">
            <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
              <Button className="h-16 px-10 text-xl bg-[#5b6bf9] hover:bg-[#4a5ae8] text-white font-black border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-none">
                {isAuthenticated ? "GO TO DASHBOARD" : "JOIN NOW"} <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-10 w-10 text-black" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-white border-t-2 border-black relative z-10">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Everything You Need</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Supercharge your campus experience with these powerful tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Syllabus Tracker",
                desc: "Track your progress topic by topic. Never miss a deadline.",
                icon: BookCheck,
                color: "bg-blue-100",
                accent: "text-blue-600",
                path: "/syllabus"
              },
              {
                title: "AI Notebook",
                desc: "Upload PDFs and get instant summaries, quizzes, and insights.",
                icon: BrainCircuit,
                color: "bg-purple-100",
                accent: "text-purple-600",
                path: "/notebook"
              },
              {
                title: "Arcade Zone",
                desc: "Play retro games, earn points, and challenge your friends.",
                icon: Gamepad2,
                color: "bg-green-100",
                accent: "text-green-600",
                path: "/games"
              },
              {
                title: "Resource Library",
                desc: "Access and share notes, past papers, and study materials.",
                icon: BookOpen,
                color: "bg-yellow-100",
                accent: "text-yellow-600",
                path: "/resources"
              },
              {
                title: "Study Groups",
                desc: "Collaborate with peers in real-time chat and video rooms.",
                icon: Users,
                color: "bg-pink-100",
                accent: "text-pink-600",
                path: "/groups"
              },
              {
                title: "Event Calendar",
                desc: "Stay updated with campus events, fests, and workshops.",
                icon: Calendar,
                color: "bg-red-100",
                accent: "text-red-600",
                path: "/events"
              }
            ].map((feature, i) => (
              <Link to={isAuthenticated ? feature.path : "/auth"} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, rotate: 1 }}
                  className="p-8 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 h-full"
                >
                  <div className={`h-16 w-16 ${feature.color} border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    <feature.icon className={`h-8 w-8 ${feature.accent}`} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-700 font-medium leading-relaxed">{feature.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t-2 border-black bg-[#f8f9fa]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-black text-white flex items-center justify-center font-bold text-xs rounded-none">Y</div>
            <span className="font-black text-xl">YuvaVerse</span>
          </div>
          <div className="text-slate-600 font-bold">
            © 2024 YuvaVerse. Built by Pawan Singh.
          </div>
        </div>
      </footer>
    </div>
  );
}
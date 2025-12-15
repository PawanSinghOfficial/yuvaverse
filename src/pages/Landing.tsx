import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Calendar, Shield, Linkedin, Mail, BookCheck, BrainCircuit, Trophy, ChevronDown, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { Link } from "react-router";
import { NinjaCursor } from "@/components/NinjaCursor";

export default function Landing() {
  const navigate = useNavigate();
  const logoUrl = "https://harmless-tapir-303.convex.cloud/api/storage/db1724ed-9b2f-4ed4-8514-69ae556175c8";

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-slate-900 overflow-x-hidden selection:bg-red-500/30 relative">
      <NinjaCursor />
      <ExitIntentPopup />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_0%,#e2e8f0_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000,transparent)]" />
        
        {/* Floating Shapes */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-red-500/5 backdrop-blur-3xl rounded-full"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-black/5 bg-white/70 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center font-black text-white">Y</div>
            <span className="font-bold text-xl tracking-tight text-slate-900">YuvaVerse</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-slate-700 hover:text-red-600 hover:bg-black/5">Log in</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-600/20">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 max-w-4xl mx-auto"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-black/5 text-sm font-medium text-red-600 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            🚀 Welcome to the Future of Campus Life
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">
            <motion.span 
              className="block text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-700"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Your Digital
            </motion.span>
            <motion.span 
              className="block text-red-600 drop-shadow-sm"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              Campus Reimagined.
            </motion.span>
          </h1>

          <motion.p 
            className="text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            The all-in-one platform for students. Track your syllabus, get AI study help, 
            play arcade games, and climb the leaderboard.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Link to="/auth">
              <Button size="lg" className="h-14 px-8 text-lg bg-red-600 hover:bg-red-700 text-white border-2 border-transparent shadow-xl shadow-red-600/20 hover:shadow-red-600/40 transition-all duration-300 group">
                Join Now <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Syllabus Tracker",
                desc: "Track your progress topic by topic. Never miss a deadline.",
                icon: BookCheck,
                color: "text-blue-600"
              },
              {
                title: "AI Notebook",
                desc: "Upload PDFs and get instant summaries, quizzes, and insights.",
                icon: BrainCircuit,
                color: "text-purple-600"
              },
              {
                title: "Arcade Zone",
                desc: "Play retro games, earn points, and challenge your friends.",
                icon: Gamepad2,
                color: "text-green-600"
              },
              {
                title: "Resource Library",
                desc: "Access and share notes, past papers, and study materials.",
                icon: BookOpen,
                color: "text-yellow-600"
              },
              {
                title: "Study Groups",
                desc: "Collaborate with peers in real-time chat and video rooms.",
                icon: Users,
                color: "text-pink-600"
              },
              {
                title: "Event Calendar",
                desc: "Stay updated with campus events, fests, and workshops.",
                icon: Calendar,
                color: "text-red-600"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-red-500/10 hover:border-red-200 transition-all duration-300 group"
              >
                <div className={`h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 ${feature.color} group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white/50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-red-600 rounded flex items-center justify-center font-bold text-xs text-white">Y</div>
            <span className="font-bold text-slate-900">YuvaVerse</span>
          </div>
          <div className="text-slate-600 text-sm font-medium">
            © 2024 YuvaVerse. Built by Pawan Singh.
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Linkedin className="h-5 w-5" /></a>
            <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors"><Mail className="h-5 w-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
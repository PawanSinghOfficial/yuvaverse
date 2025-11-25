import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Calendar, Shield, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  const logoUrl = "https://harmless-tapir-303.convex.cloud/api/storage/e34061a8-ff55-4ebe-bc01-5d7cf76ffdf1";

  useEffect(() => {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
    const initialDark = storedTheme ? storedTheme === "dark" : prefersDark;
    root.classList.toggle("dark", initialDark);
    setIsDark(initialDark);
  }, []);

  const handleThemeToggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
            backgroundImage: `url(${logoUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Navbar */}
      <nav className="py-4 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-50 border border-border/60 neu-flat shadow-none">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <img src={logoUrl} alt="YuvaVerse Logo" className="h-10 w-10 object-contain neu-flat rounded-lg bg-primary/10 p-1" />
          YuvaVerse
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-border/50 text-muted-foreground neu-flat"
            onClick={handleThemeToggle}
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" onClick={() => navigate("/auth")}>
            Log in
          </Button>
          <Button onClick={() => navigate("/auth")} className="neu-flat">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-6">
            Welcome to the Future of Campus Life
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Your Digital Campus <br />
            <span className="text-muted-foreground">Reimagined.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The all-in-one platform for students and societies. Access resources, join study groups, and stay updated with campus events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8 text-base" onClick={() => navigate("/auth")}>
              Join Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card p-6 rounded-xl neu-flat"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Resource Library</h3>
              <p className="text-muted-foreground">Access and share notes, practical files, and question papers.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card p-6 rounded-xl neu-flat"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Study Groups</h3>
              <p className="text-muted-foreground">Collaborate in real-time with voice, video, and chat channels.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card p-6 rounded-xl neu-flat"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Event Calendar</h3>
              <p className="text-muted-foreground">Never miss a society meeting, fest, or workshop again.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card p-6 rounded-xl neu-flat"
            >
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Private & Secure</h3>
              <p className="text-muted-foreground">Anonymous feedback and secure social groups for students.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t text-center text-muted-foreground text-sm">
        <p>© {new Date().getFullYear()} YuvaVerse. Built for students, by students.</p>
        <div className="mt-4">
            <Button variant="link" size="sm" className="text-xs text-muted-foreground/50 hover:text-primary" onClick={() => navigate("/admin")}>
                Admin Portal
            </Button>
        </div>
      </footer>
    </div>
  );
}
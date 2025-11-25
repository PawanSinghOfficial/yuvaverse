import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Users, Calendar, Shield, Linkedin, Mail } from "lucide-react";
import { useNavigate } from "react-router";

export default function Landing() {
  const navigate = useNavigate();
  const logoUrl = "https://harmless-tapir-303.convex.cloud/api/storage/db1724ed-9b2f-4ed4-8514-69ae556175c8";
  const backgroundUrl = "https://harmless-tapir-303.convex.cloud/api/storage/e34061a8-ff55-4ebe-bc01-5d7cf76ffdf1";

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden isolate">
      {/* Background Image */}
      <div 
        className="fixed inset-0 -z-10 opacity-10 pointer-events-none"
        style={{
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
      />
      
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
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-24 max-w-5xl mx-auto">
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
      <section className="relative z-10 py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card p-6 neo-brutal"
            >
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center mb-4 text-primary border border-border shadow-[2px_2px_0px_0px_var(--shadow)]">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Resource Library</h3>
              <p className="text-muted-foreground">Access and share notes, practical files, and question papers.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card p-6 neo-brutal"
            >
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center mb-4 text-primary border border-border shadow-[2px_2px_0px_0px_var(--shadow)]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Study Groups</h3>
              <p className="text-muted-foreground">Collaborate in real-time with voice, video, and chat channels.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card p-6 neo-brutal"
            >
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center mb-4 text-primary border border-border shadow-[2px_2px_0px_0px_var(--shadow)]">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Event Calendar</h3>
              <p className="text-muted-foreground">Never miss a society meeting, fest, or workshop again.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-card p-6 neo-brutal"
            >
              <div className="h-12 w-12 bg-primary/10 flex items-center justify-center mb-4 text-primary border border-border shadow-[2px_2px_0px_0px_var(--shadow)]">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Private & Secure</h3>
              <p className="text-muted-foreground">Anonymous feedback and secure social groups for students.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} YuvaVerse.</p>
            
            <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">
                    BUILD FOR STUDENTS, BY STUDENTS
                </p>
                <p className="font-serif text-lg font-medium text-foreground">
                    Built by Pawan Singh
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
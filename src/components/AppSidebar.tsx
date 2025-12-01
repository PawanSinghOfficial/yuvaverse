import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  Home,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  Shield,
  GraduationCap,
  Lock,
  BrainCircuit,
  BookCheck,
  Timer
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { getBadgeFromPoints } from "@/lib/utils";
import { Bot } from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onGuideClick?: () => void;
}

export function AppSidebar({ className, onGuideClick }: SidebarProps) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const badge = getBadgeFromPoints(user?.points || 0);
  const logoUrl = "https://harmless-tapir-303.convex.cloud/api/storage/db1724ed-9b2f-4ed4-8514-69ae556175c8";

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      color: "text-sky-500",
    },
    {
      label: "Syllabus Tracker",
      icon: BookCheck,
      href: "/syllabus",
      color: "text-indigo-600",
    },
    {
      label: "Resources",
      icon: BookOpen,
      href: "/resources",
      color: "text-violet-500",
    },
    {
      label: "Study Groups",
      icon: Users,
      href: "/groups",
      color: "text-pink-700",
    },
    {
      label: "Events",
      icon: Calendar,
      href: "/events",
      color: "text-orange-700",
    },
    {
      label: "Calendar",
      icon: Calendar,
      href: "/calendar",
      color: "text-yellow-600",
    },
    {
      label: "Focus Mode",
      icon: Timer,
      href: "/focus",
      color: "text-teal-600",
    },
    {
      label: "AI Notebook",
      icon: BrainCircuit,
      href: "/notebook",
      color: "text-purple-600",
    },
    {
      label: "Feedback",
      icon: MessageSquare,
      href: "/feedback",
      color: "text-emerald-500",
    },
  ];

  if (user?.role === "admin") {
    routes.push({
      label: "Admin Portal",
      icon: Shield,
      href: "/admin",
      color: "text-red-500",
    });
  }

  return (
    <div className={cn("space-y-4 py-4 flex flex-col h-full bg-secondary/10 border-r-0 shadow-lg", className)}>
      <div className="px-3 py-2">
        <Link to="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-10 w-10 mr-3">
             <img src={logoUrl} alt="YuvaVerse" className="h-full w-full object-contain neo-brutal-sm bg-primary/10 p-1" />
          </div>
          <h1 className="text-2xl font-bold">
            YuvaVerse
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              to={route.href}
              id={`sidebar-nav-${route.href.replace("/", "")}`}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 transition hover:neo-brutal-sm",
                pathname === route.href ? "text-primary bg-primary/10 neo-brutal-sm" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
          
          <button
            className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/10 transition hover:neo-brutal-sm"
            onClick={onGuideClick}
          >
             <div className="flex items-center flex-1">
                <img src="https://harmless-tapir-303.convex.cloud/api/storage/8bfd0dc3-0f8f-4844-a6da-045aa56a771a" alt="Jojo" className="h-6 w-6 mr-3 rounded-full object-cover border border-indigo-500" />
                Jojo
             </div>
          </button>
        </div>
      </div>
      
      <div className="mt-auto px-3 py-2">
         <div className="bg-card neo-brutal p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  {user?.image ? (
                    <img src={user.image} alt={user.name || "User"} className="h-10 w-10 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-border">
                        {user?.name?.[0] || "U"}
                    </div>
                  )}
                  <div className={`absolute -bottom-1 -right-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gradient-to-r ${badge.gradient} text-white shadow-lg`}>
                    {badge.icon}
                  </div>
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.username || user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate capitalize">{user?.role || "Student"}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{user?.points || 0} Points</span>
                <span className="capitalize text-primary font-semibold">{user?.tier || "Freemium"}</span>
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground/70">
              Badge: {badge.label}
            </p>
        </div>

        <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={() => signOut()}
        >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
        </Button>
      </div>
    </div>
  );
}
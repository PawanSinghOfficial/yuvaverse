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
  Lock
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      color: "text-sky-500",
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
    <div className={cn("space-y-4 py-4 flex flex-col h-full bg-secondary/10 border-r", className)}>
      <div className="px-3 py-2">
        <Link to="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative h-8 w-8 mr-4">
             <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                Y
             </div>
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
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href ? "text-primary bg-primary/10" : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="mt-auto px-3 py-2">
         <div className="bg-card border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {user?.name?.[0] || "U"}
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
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  Home,
  LogOut,
  MessageSquare,
  Shield,
  Users,
  Timer,
  BrainCircuit,
  BookCheck,
  Gamepad2,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { getBadgeFromPoints } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onGuideClick?: () => void;
}

export function AppSidebar({ onGuideClick, ...props }: AppSidebarProps) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const badge = getBadgeFromPoints(user?.points || 0);
  const logoUrl = "https://harmless-tapir-303.convex.cloud/api/storage/db1724ed-9b2f-4ed4-8514-69ae556175c8";
  const { state } = useSidebar();

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
      label: "Arcade Zone",
      icon: Gamepad2,
      href: "/games",
      color: "text-rose-500",
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
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <img src={logoUrl} alt="YuvaVerse" className="size-6 object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">YuvaVerse</span>
                  <span className="truncate text-xs">Campus Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === route.href}
                tooltip={route.label}
                className={cn(
                  pathname === route.href && "bg-primary/10 text-primary font-medium"
                )}
              >
                <Link to={route.href} id={`sidebar-nav-${route.href.replace("/", "")}`}>
                  <route.icon className={cn("h-4 w-4", route.color)} />
                  <span>{route.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onGuideClick} tooltip="Vayuu Guide">
              <div className="flex h-4 w-4 items-center justify-center rounded-full overflow-hidden border border-indigo-500">
                 <img src="https://harmless-tapir-303.convex.cloud/api/storage/8bfd0dc3-0f8f-4844-a6da-045aa56a771a" alt="Vayuu" className="h-full w-full object-cover" />
              </div>
              <span>Vayuu Guide</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-lg bg-card border shadow-sm transition-all",
              state === "collapsed" ? "justify-center p-0 border-0 shadow-none bg-transparent" : ""
            )}>
              <div className="relative shrink-0">
                {(user?.role === "admin" || user?.tier === "premium" || user?.tier === "elite") ? (
                  <div className="relative p-[2px]">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 animate-[spin_3s_linear_infinite]" />
                    <div className="relative bg-background rounded-full p-[2px]">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image} alt={user?.name} />
                        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                ) : (
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "absolute -bottom-1 -right-1 text-[10px] font-semibold px-1 py-0 rounded-full bg-gradient-to-r text-white shadow-lg z-10 flex items-center justify-center h-4 min-w-4",
                  badge.gradient
                )}>
                  {badge.icon}
                </div>
              </div>
              
              {state !== "collapsed" && (
                <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden">
                  <span className="truncate font-semibold">{user?.username || user?.name}</span>
                  <span className="truncate text-xs text-muted-foreground capitalize">{user?.role || "Student"}</span>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{user?.points || 0} pts</span>
                    <span className="capitalize text-primary font-medium">{user?.tier || "Free"}</span>
                  </div>
                </div>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Sign Out">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
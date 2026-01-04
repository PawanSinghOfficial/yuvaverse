import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LogoDropdown } from "@/components/LogoDropdown";
import { VayuuChat } from "@/components/VayuuChat";
import Resources from "@/pages/Resources";
import CalendarPage from "@/pages/Calendar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function DashboardLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const syncAdmin = useMutation(api.users.syncAdminRole);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      syncAdmin();
      if (user.hasSeenOnboarding === false || user.hasSeenOnboarding === undefined) {
        setIsGuideOpen(true);
      }
    }
  }, [isAuthenticated, user, syncAdmin]);

  const handleGuideClick = () => {
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
    }
    setIsGuideOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar 
        onGuideClick={handleGuideClick} 
        onResourcesClick={() => setIsResourcesOpen(true)}
        onCalendarClick={() => setIsCalendarOpen(true)}
      />
      <SidebarInset>
        <div className="flex items-center gap-4 px-4 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20">
          <SidebarTrigger />
          <div className="flex-1" />
          <LogoDropdown />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent p-0">
          <Outlet />
        </div>
      </SidebarInset>
      
      <OnboardingGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <VayuuChat />
      <ExitIntentPopup />

      <Sheet open={isResourcesOpen} onOpenChange={setIsResourcesOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[85vw] p-0 overflow-y-auto border-l-4 border-black">
          <Resources />
        </SheetContent>
      </Sheet>

      <Sheet open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[85vw] p-0 overflow-y-auto border-l-4 border-black">
          <CalendarPage />
        </SheetContent>
      </Sheet>
    </SidebarProvider>
  );
}
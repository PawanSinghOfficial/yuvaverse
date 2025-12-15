import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const syncAdmin = useMutation(api.users.syncAdminRole);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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
      <ExitIntentPopup />
      <div className="flex w-full bg-background h-screen overflow-hidden">
        <AppSidebar onGuideClick={handleGuideClick} className="w-72 hidden md:flex shrink-0 border-r h-full" />
        <SidebarInset className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 pb-10 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <Outlet />
          </main>
          <OnboardingGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
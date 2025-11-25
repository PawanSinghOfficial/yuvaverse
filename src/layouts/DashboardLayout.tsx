import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { OnboardingGuide } from "@/components/OnboardingGuide";

export default function DashboardLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
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
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
        <AppSidebar onGuideClick={() => setIsGuideOpen(true)} />
      </div>
      <main className="md:pl-72 pb-10">
        <Outlet />
      </main>
      <OnboardingGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
}
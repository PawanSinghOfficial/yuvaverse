import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Resources from "./pages/Resources.tsx";
import Groups from "./pages/Groups.tsx";
import Events from "./pages/Events.tsx";
import DashboardLayout from "./layouts/DashboardLayout.tsx";
import GroupChat from "./pages/GroupChat.tsx";
import Feedback from "./pages/Feedback.tsx";
import Admin from "./pages/Admin.tsx";
import CalendarPage from "./pages/Calendar.tsx";
import NotebookLM from "./pages/NotebookLM.tsx";
import Syllabus from "./pages/Syllabus.tsx";
import Pomodoro from "./pages/Pomodoro";
import Games from "./pages/Games";
import AvatarEditor from "./pages/AvatarEditor";
import "./types/global.d.ts";

// Force light mode
document.documentElement.classList.remove("dark");
localStorage.removeItem("theme");

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
            
            {/* Protected Routes */}
            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/syllabus" element={<Syllabus />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/:groupId" element={<GroupChat />} />
                <Route path="/events" element={<Events />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/notebook" element={<NotebookLM />} />
                <Route path="/focus" element={<Pomodoro />} />
                <Route path="/games" element={<Games />} />
                <Route path="/pomodoro" element={<Pomodoro />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);
// simple logo dropdown component that can be used to go to the landing page or sign out for the user

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Home, LogOut, User, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { FriendsDialog } from "./FriendsDialog";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function LogoDropdown() {
  const { isAuthenticated, signOut, user } = useAuth();
  const navigate = useNavigate();
  const [showFriends, setShowFriends] = useState(false);
  
  // Fetch incoming requests for notification badge
  const requests = useQuery(api.friends.getIncomingRequests);
  const requestCount = requests?.length || 0;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full overflow-visible border-2 border-transparent hover:border-primary/20 relative">
          {isAuthenticated && user?.image ? (
             <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user.image} alt={user.name || "User"} />
                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
             </Avatar>
          ) : (
            <img
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
          )}
          {isAuthenticated && requestCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold border-2 border-background z-10 animate-in zoom-in duration-300">
              {requestCount > 9 ? "9+" : requestCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)]">
        {isAuthenticated && user && (
            <>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
            </>
        )}
        <DropdownMenuItem onClick={handleGoHome} className="cursor-pointer font-medium">
          <Home className="mr-2 h-4 w-4" />
          Landing Page
        </DropdownMenuItem>
        {isAuthenticated && (
          <>
            <DropdownMenuItem onClick={() => setShowFriends(true)} className="cursor-pointer font-medium justify-between">
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Friends
              </div>
              {requestCount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full h-5 min-w-5 flex items-center justify-center">
                  {requestCount}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive font-bold"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    <FriendsDialog open={showFriends} onOpenChange={setShowFriends} />
    </>
  );
}
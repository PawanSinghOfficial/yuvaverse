import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Lock, Trophy, MoreVertical, Flag } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GroupCardProps {
  group: {
    _id: Id<"groups">;
    name: string;
    description?: string;
    imageUrl: string | null;
    isPrivate: boolean;
    members: Id<"users">[];
    xp: number;
  };
  isMember: boolean;
  onJoin: (groupId: Id<"groups">, isPrivate: boolean) => void;
  onEnter: (groupId: Id<"groups">) => void;
  onReport: (groupId: Id<"groups">) => void;
}

export function GroupCard({ group, isMember, onJoin, onEnter, onReport }: GroupCardProps) {
  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all bg-white dark:bg-card flex flex-col overflow-hidden relative group">
      <div className="h-32 w-full bg-secondary/10 border-b-4 border-black relative">
        {group.imageUrl ? (
          <img 
            src={group.imageUrl} 
            alt={group.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-pink-100 dark:bg-pink-900/20">
            <Users className="h-12 w-12 text-pink-400/50" />
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-2">
            {group.isPrivate && (
                <Badge variant="outline" className="bg-background border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <Lock className="w-3 h-3 mr-1" /> PRIVATE
                </Badge>
            )}
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 border-2 border-black hover:bg-background shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <DropdownMenuItem onClick={() => onReport(group._id)} className="text-destructive focus:text-destructive font-bold cursor-pointer">
                        <Flag className="mr-2 h-4 w-4" />
                        Report Group
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-black uppercase tracking-tight line-clamp-1">{group.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col justify-between gap-4">
        <div>
          <p className="text-muted-foreground font-medium mb-4 line-clamp-2 text-sm">{group.description}</p>
          <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{group.members.length} Members</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span>{group.xp} XP</span>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => {
            if (isMember) {
              onEnter(group._id);
            } else {
              onJoin(group._id, group.isPrivate);
            }
          }}
          className={`w-full font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
            isMember 
              ? "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800" 
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isMember ? "Enter Chat" : "Join Squad"}
        </Button>
      </CardContent>
    </Card>
  );
}

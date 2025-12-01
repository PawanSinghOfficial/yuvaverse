import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trophy, Star, Gamepad2 } from "lucide-react";

export function GameGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white text-black font-bold">
          <img 
            src="https://harmless-tapir-303.convex.cloud/api/storage/8bfd0dc3-0f8f-4844-a6da-045aa56a771a" 
            alt="Jojo" 
            className="h-6 w-6 rounded-full border border-black"
          />
          Jojo's Game Rules
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase">
            <img 
              src="https://harmless-tapir-303.convex.cloud/api/storage/8bfd0dc3-0f8f-4844-a6da-045aa56a771a" 
              alt="Jojo" 
              className="h-12 w-12 rounded-full border-2 border-black"
            />
            Arcade Guide
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="bg-blue-50 p-4 rounded-xl border-2 border-black relative ml-2">
            <div className="absolute -left-2 top-6 w-4 h-4 bg-blue-50 border-l-2 border-b-2 border-black transform rotate-45"></div>
            <p className="font-medium text-lg italic">
              "Welcome to the Arcade Zone! Take a break and earn points while having fun!"
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-yellow-100 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-black uppercase">Victory Bonus</h4>
                <p className="text-muted-foreground">Win a game to earn <span className="font-bold text-green-600">+10 Points</span></p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-purple-100 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0">
                <Gamepad2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-black uppercase">Participation</h4>
                <p className="text-muted-foreground">Just playing earns you <span className="font-bold text-blue-600">+2 Points</span></p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-red-100 rounded-xl border-2 border-black flex items-center justify-center flex-shrink-0">
                <Star className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-black uppercase">High Scores</h4>
                <p className="text-muted-foreground">Set new records in Snake & Math Challenge!</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

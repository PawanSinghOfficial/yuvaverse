import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { BrainCircuit, Coffee, User } from "lucide-react";

export function LibrarySeating() {
  const users = useQuery(api.presence.getLibraryUsers);

  if (!users) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 p-6 bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-xl border-2 border-black/10 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black uppercase flex items-center gap-2">
          <span className="text-2xl">🤫</span>
          The Library
          <span className="text-sm font-medium normal-case text-muted-foreground ml-2 bg-secondary px-2 py-0.5 rounded-full">
            {users.length} {users.length === 1 ? "person" : "people"} focusing
          </span>
        </h3>
        <div className="flex gap-4 text-xs font-bold uppercase text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Focusing
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> On Break
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300"></span> Idle
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-gray-200 rounded-lg">
          <p>The library is empty. Be the first to take a seat!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {users.map((presence) => (
            <motion.div
              key={presence._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className={`
                relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 bg-white
                ${presence.status === 'focusing' ? 'border-green-500 shadow-[4px_4px_0px_0px_#22c55e]' : ''}
                ${presence.status === 'break' ? 'border-amber-500 shadow-[4px_4px_0px_0px_#f59e0b]' : ''}
                ${presence.status === 'idle' ? 'border-gray-200 shadow-[4px_4px_0px_0px_#e5e7eb]' : ''}
              `}>
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-black">
                    <AvatarImage src={presence.user?.image} />
                    <AvatarFallback className="bg-indigo-100 font-bold">
                      {presence.user?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`
                    absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px]
                    ${presence.status === 'focusing' ? 'bg-green-500 text-white' : ''}
                    ${presence.status === 'break' ? 'bg-amber-500 text-white' : ''}
                    ${presence.status === 'idle' ? 'bg-gray-300 text-gray-600' : ''}
                  `}>
                    {presence.status === 'focusing' && <BrainCircuit className="w-3 h-3" />}
                    {presence.status === 'break' && <Coffee className="w-3 h-3" />}
                    {presence.status === 'idle' && <User className="w-3 h-3" />}
                  </div>
                </div>
                
                <div className="text-center w-full">
                  <p className="font-bold text-sm truncate w-full" title={presence.user?.name}>
                    {presence.user?.name?.split(' ')[0] || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {presence.status === 'focusing' && presence.focusDuration ? (
                      `${presence.focusDuration}m Session`
                    ) : (
                      <span className="capitalize">{presence.status}</span>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

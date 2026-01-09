import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VayuuTeaseProps {
  message: string | null;
  onClose: () => void;
}

export function VayuuTease({ message, onClose }: VayuuTeaseProps) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          duration: 0.4
        }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full mx-4"
      >
        <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] border-4 border-black dark:border-white">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 relative">
            {/* Vayuu Avatar */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full border-4 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] overflow-hidden flex items-center justify-center"
              >
                <img
                  src="https://harmless-tapir-303.convex.cloud/api/storage/8bfd0dc3-0f8f-4844-a6da-045aa56a771a"
                  alt="Vayuu"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-2 right-2 h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-black dark:border-white"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Message Content */}
            <div className="mt-6 text-center">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-bold text-foreground leading-relaxed"
              >
                {message}
              </motion.p>
            </div>

            {/* Vayuu Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex items-center justify-center gap-2"
            >
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
              <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Vayuu Says
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
            </motion.div>
          </div>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
          className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full border-2 border-black dark:border-white opacity-80"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.3, 1]
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 2.5, repeat: Infinity }
          }}
          className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full border-2 border-black dark:border-white opacity-80"
        />
      </motion.div>
    </AnimatePresence>
  );
}

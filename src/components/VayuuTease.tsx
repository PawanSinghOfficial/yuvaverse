import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface VayuuTeaseProps {
  message: string | null;
  onClose: () => void;
}

export function VayuuTease({ message, onClose }: VayuuTeaseProps) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Show for 4 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 100, rotate: -10 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.5, y: 100, rotate: 10, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative max-w-sm mx-4 pointer-events-auto"
          >
            <div className="relative bg-white border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_#ef4444] flex flex-col items-center gap-4 z-10 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <button 
                onClick={onClose}
                className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full transition-colors border-2 border-transparent hover:border-black"
              >
                <X className="w-4 h-4" />
              </button>

              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full border-4 border-black overflow-hidden bg-indigo-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <img 
                    src="https://harmless-tapir-303.convex.cloud/api/storage/8bfd0dc3-0f8f-4844-a6da-045aa56a771a" 
                    alt="Vayuu" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
                  className="absolute -top-2 -right-2 text-2xl filter drop-shadow-md"
                >
                  😈
                </motion.div>
              </motion.div>

              <div className="text-center space-y-2 relative z-10">
                <div className="inline-block bg-red-500 text-white px-3 py-1 rounded-full border-2 border-black font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
                  Vayuu Says
                </div>
                <p className="font-black text-xl leading-tight italic text-slate-800 drop-shadow-sm">
                  "{message}"
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
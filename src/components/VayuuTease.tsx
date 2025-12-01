import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
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
      }, 3000); // Show for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4 max-w-sm mx-4 pointer-events-auto">
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-red-100 p-4 rounded-full border-2 border-black"
            >
              <Bot className="w-12 h-12 text-red-600" />
            </motion.div>
            <div className="text-center space-y-2">
              <h3 className="font-black text-xl uppercase text-red-600">Vayuu Says:</h3>
              <p className="font-bold text-lg">{message}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

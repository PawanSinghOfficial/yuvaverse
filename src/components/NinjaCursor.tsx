import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function NinjaCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] flex items-center justify-center text-2xl"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
      }}
    >
      <div className="relative">
        <span className="relative z-10">🥷</span>
        <div className="absolute inset-0 bg-black/10 blur-sm rounded-full transform translate-y-2 scale-x-125" />
      </div>
    </motion.div>
  );
}
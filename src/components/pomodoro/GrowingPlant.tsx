import { motion } from "framer-motion";
import { Sprout, Flower2, Trees, Leaf } from "lucide-react";

interface GrowingPlantProps {
  progress: number; // 0 to 100
  isActive: boolean;
}

export const GrowingPlant = ({ progress, isActive }: GrowingPlantProps) => {
  // Determine stage based on progress (0% is start, 100% is finish)
  // We want the plant to grow as time passes (progress increases)
  // Assuming progress passed here is % completed (0 -> 100)
  
  const getStage = () => {
    if (progress < 10) return "seed";
    if (progress < 30) return "sprout";
    if (progress < 60) return "growing";
    if (progress < 90) return "blooming";
    return "mature";
  };

  const stage = getStage();

  return (
    <div className="relative w-64 h-64 flex items-end justify-center">
      {/* Pot/Soil Base */}
      <motion.div 
        className="absolute bottom-0 w-32 h-24 bg-amber-800/80 rounded-b-xl rounded-t-sm border-4 border-amber-950 z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="absolute top-0 left-0 right-0 h-4 bg-amber-900/50" />
      </motion.div>

      {/* Plant Stages */}
      <div className="absolute bottom-20 z-0 flex justify-center">
        {stage === "seed" && (
          <motion.div
            key="seed"
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-4 h-4 bg-green-800 rounded-full"
          />
        )}

        {stage === "sprout" && (
          <motion.div
            key="sprout"
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring" }}
          >
            <Sprout className="w-16 h-16 text-green-500 fill-green-500/20" />
          </motion.div>
        )}

        {stage === "growing" && (
          <motion.div
            key="growing"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
            className="flex flex-col items-center"
          >
            <Leaf className="w-12 h-12 text-green-500 fill-green-500/20 absolute -left-8 top-4 -rotate-45" />
            <Leaf className="w-12 h-12 text-green-500 fill-green-500/20 absolute -right-8 top-8 rotate-45" />
            <div className="w-4 h-24 bg-green-600 rounded-full" />
          </motion.div>
        )}

        {stage === "blooming" && (
          <motion.div
            key="blooming"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <Flower2 className="w-24 h-24 text-pink-500 fill-pink-500/20 absolute -top-16 animate-pulse" />
            <Leaf className="w-14 h-14 text-green-500 fill-green-500/20 absolute -left-10 top-0 -rotate-45" />
            <Leaf className="w-14 h-14 text-green-500 fill-green-500/20 absolute -right-10 top-6 rotate-45" />
            <div className="w-5 h-32 bg-green-600 rounded-full" />
          </motion.div>
        )}

        {stage === "mature" && (
          <motion.div
            key="mature"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <Trees className="w-40 h-40 text-green-600 fill-green-600/20 absolute -top-24" />
            <div className="w-6 h-32 bg-amber-900 rounded-full" />
          </motion.div>
        )}
      </div>

      {/* Particles/Energy */}
      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              initial={{ opacity: 0, y: 100, x: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                y: -100, 
                x: (Math.random() - 0.5) * 100 
              }}
              transition={{ 
                duration: 2 + Math.random() * 2, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
              style={{ left: '50%', bottom: '20%' }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

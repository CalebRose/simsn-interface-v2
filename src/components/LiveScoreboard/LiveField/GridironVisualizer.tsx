import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GridironVisualizerProps {
  ballX: number; // 0 to 100 (Where 0 is away endzone, 100 is home endzone)
  ballY: number; // 0 to 100
  playType: string;
  eventText: string;
}

export const GridironVisualizer: React.FC<GridironVisualizerProps> = ({ 
  ballX, ballY, playType, eventText 
}) => {
  // Clamp values to ensure they stay on screen
  const x = Math.min(Math.max(ballX, 0), 100);
  const y = Math.min(Math.max(ballY, 0), 100);

  return (
    <div className="relative w-full h-[300px] bg-green-600 border-4 border-white shadow-2xl overflow-hidden rounded-md">
      {/* End Zones */}
      <div className="absolute left-0 top-0 bottom-0 w-[10%] bg-green-800 border-r-2 border-white/30" />
      <div className="absolute right-0 top-0 bottom-0 w-[10%] bg-green-800 border-l-2 border-white/30" />

      {/* Sidelines & Markings */}
      <div className="absolute top-0 left-0 right-0 h-2 border-b-2 border-white/30" />
      <div className="absolute bottom-0 left-0 right-0 h-2 border-t-2 border-white/30" />
      
      {/* Goal Posts (Simplified) */}
      <div className="absolute left-0 top-1/2 -mt-10 w-2 h-20 bg-yellow-400 z-10" />
      <div className="absolute right-0 top-1/2 -mt-10 w-2 h-20 bg-yellow-400 z-10" />

      {/* The Ball */}
      <motion.div
        className="absolute w-8 h-5 bg-amber-900 rounded-full z-20 flex items-center justify-center border-2 border-black font-bold text-white text-[10px]"
        initial={{ left: `${x}%`, top: `${y}%` }} // Fixes the corner teleport issue
        animate={{ 
          left: `${x}%`, 
          top: `${y}%`,
          scale: playType === 'PASS' ? [1, 1.5, 1] : 1,
          rotate: playType === 'PASS' ? 45 : 0 
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {" "}
      </motion.div>

      {/* Persistent Event Text Overlay */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm border border-white/20 z-30">
        {eventText || "Waiting for snap..."}
      </div>
    </div>
  );
};
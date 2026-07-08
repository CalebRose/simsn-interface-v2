import React from 'react';
import { motion } from 'framer-motion';

interface VisualizerProps {
  ballX: number;
  playType: string;
  homeName: string;
  awayName: string;
}

export const GridironVisualizer: React.FC<VisualizerProps> = ({ ballX, playType, homeName, awayName }) => {
  return (
    <div className="relative w-full aspect-[2/1] bg-green-700 border-x-8 border-white shadow-2xl rounded-sm overflow-hidden flex items-center">
      
      {/* --- Away End Zone (Left) --- */}
      <div className="absolute left-0 h-full w-[10%] bg-green-900 flex items-center justify-center z-10 border-r-4 border-white">
        <span className="text-white font-black text-2xl -rotate-90 whitespace-nowrap uppercase tracking-widest opacity-80">
          {awayName || "AWAY"}
        </span>
      </div>

      {/* --- Home End Zone (Right) --- */}
      <div className="absolute right-0 h-full w-[10%] bg-green-900 flex items-center justify-center z-10 border-l-4 border-white">
        <span className="text-white font-black text-2xl rotate-90 whitespace-nowrap uppercase tracking-widest opacity-80">
          {homeName || "HOME"}
        </span>
      </div>

      {/* --- Yard Lines --- */}
      <div className="absolute inset-y-0 left-[10%] right-[10%] flex justify-between">
        {[...Array(11)].map((_, i) => {
          const yardValue = i <= 5 ? i * 10 : (10 - i) * 10;
          const isGoalLine = yardValue === 0;
          return (
            <div key={i} className="h-full flex flex-col justify-between items-center relative">
              <div className={`${isGoalLine ? 'w-[6px] bg-white' : 'w-px bg-white/40'} h-full`} />
              {!isGoalLine && (
                <div className="absolute top-2 text-[10px] text-white font-mono font-bold">
                  {yardValue}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- Midfield Hash Marks --- */}
      <div className="absolute top-1/3 left-[10%] right-[10%] h-px bg-white/30" />
      <div className="absolute bottom-1/3 left-[10%] right-[10%] h-px bg-white/30" />

      {/* --- Goal Posts (Moved to far edges) --- */}
      {/* Left Far Edge */}
      <div className="absolute left-0 top-1/2 -mt-10 w-2 h-20 bg-yellow-400 z-20 border-2 border-black/50" />
      {/* Right Far Edge */}
      <div className="absolute right-0 top-1/2 -mt-10 w-2 h-20 bg-yellow-400 z-20 border-2 border-black/50" />

      {/* --- The Ball --- */}
      <motion.div
        className="absolute w-6 h-4 bg-amber-900 rounded-full z-30 border-2 border-black shadow-lg"
        initial={{ left: `${ballX}%` }}
        animate={{ left: `${ballX}%` }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      />
    </div>
  );
};
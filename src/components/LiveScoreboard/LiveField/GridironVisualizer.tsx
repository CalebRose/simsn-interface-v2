import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GridironVisualizerProps {
  ballX: number; // 0 to 100 (Field Length)
  ballY: number; // 0 to 100 (Field Width)
  playType: 'IDLE' | 'PASS' | 'RUN' | 'TD' | 'INT' | 'FUMBLE' | 'PUNT';
  eventText: string;
}

export const GridironVisualizer: React.FC<GridironVisualizerProps> = ({ 
  ballX, ballY, playType, eventText 
}) => {
  return (
    <div className="relative w-full h-[300px] bg-green-700 rounded-lg border-4 border-white shadow-2xl overflow-hidden">
      {/* Field Markings */}
      <div className="absolute inset-0 flex justify-between px-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="w-px h-full bg-white/30" />
        ))}
      </div>

      {/* The Ball */}
      <motion.div
        className="absolute w-6 h-6 bg-amber-900 rounded-full z-20 flex items-center justify-center border border-black"
        animate={{ 
          left: `${ballX}%`, 
          top: `${ballY}%`,
          scale: playType === 'PASS' ? [1, 1.4, 1] : 1, // Arc effect
          rotate: playType === 'PASS' ? 360 : 0,
          backgroundColor: playType === 'INT' ? '#ef4444' : '#78350f' // Red if INT
        }}
        transition={{ duration: playType === 'PASS' ? 1.2 : 0.5, ease: "easeInOut" }}
      />

      {/* Event Overlay */}
      <AnimatePresence>
        {playType !== 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded font-bold uppercase tracking-widest"
          >
            {eventText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
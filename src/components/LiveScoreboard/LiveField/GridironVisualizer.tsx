import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export interface VisualizerProps {
  ballX: number;
  playType: string;
  resultCategory?: 'INTERCEPTION' | 'FUMBLE' | 'INCOMPLETE' | 'COMPLETE' | 'GOOD' | 'NO_GOOD' | 'NONE';
  playId?: number;
  homeName: string;
  awayName: string;
  yards?: number;
  isHomeOffense?: boolean;
}

// --- BADGE CONFIGURATION ---
const getBadgeConfig = (category: string) => {
    switch (category) {
        case 'COMPLETE': 
            return { text: 'CATCH', bg: 'bg-green-600', border: 'border-green-400' };
        case 'INCOMPLETE': 
            return { text: 'INCOMPLETE', bg: 'bg-gray-800', border: 'border-gray-500' };
        case 'INTERCEPTION': 
            return { text: 'INTERCEPTED', bg: 'bg-red-600', border: 'border-red-400' };
        case 'FUMBLE': 
            return { text: 'FUMBLE', bg: 'bg-red-600', border: 'border-red-400' };
        case 'GOOD': 
            return { text: 'GOOD', bg: 'bg-green-600', border: 'border-green-400' };
        case 'NO_GOOD': 
            return { text: 'NO GOOD', bg: 'bg-red-600', border: 'border-red-400' };
        default: 
            return null;
    }
};

// --- FIELD MAPPING MATH ---
// The container is 120 "yards" wide (Endzone 10% + Field 80% + Endzone 10%).
// This perfectly maps a 0-100 yardline value into the middle 80% of the screen.
const mapToField = (yardLine: number) => {
    return 10 + (yardLine * 0.8);
};

export const GridironVisualizer: React.FC<VisualizerProps> = ({ 
    ballX, playType, resultCategory = 'NONE', playId = 0, homeName, awayName, yards = 0, isHomeOffense = false
}) => {
  const ballControls = useAnimation();
  const shadowControls = useAnimation();
  const badgeControls = useAnimation();
  
  useEffect(() => {
     // VITAL FIX: Instantly snap ball back to actual mapped Line of Scrimmage before animating new play
     ballControls.set({ left: `${mapToField(ballX)}%`, top: "50%", scale: 1 });
     shadowControls.set({ left: `${mapToField(ballX)}%`, top: "54%", opacity: 0 });
     badgeControls.set({ opacity: 0, scale: 0.5, y: 10 });

     if (!playType || playType === 'IDLE') return;

     const pType = String(playType).toLowerCase();
     const isPass = pType.includes('pass');
     const isOutside = pType.includes('outside') || pType.includes('sweep') || pType.includes('pitch') || pType.includes('toss');
     const isInside = pType.includes('inside') || pType.includes('dive') || pType.includes('draw');
     const isGoalKick = pType.includes('xp') || pType.includes('field goal') || pType.includes('fg');
     const isPuntKickoff = pType.includes('punt') || pType.includes('kickoff');

     // Directional Math
     let dir = isHomeOffense ? -1 : 1; 
     let endX = ballX + (yards * dir);
     if (endX < 0) endX = 0;
     if (endX > 100) endX = 100;
     
     // Base Keyframes (mapped to the 80% field)
     const midX = ballX + ((endX - ballX) * 0.5);
     let leftKeyframes: any = [`${mapToField(ballX)}%`, `${mapToField(midX)}%`, `${mapToField(endX)}%`];
     let topKeyframes: any = ["50%", "50%", "50%"];
     let scaleKeyframes: any = [1, 1, 1];
     let shadowOpacity: any = [0, 0, 0];
     let shadowTop: any = ["54%", "54%", "54%"];
     
     // 1. Goal Targeting Physics (FG & XP)
     if (isGoalKick) {
         // Kicks physically fly into the endzone (0% or 100% of the entire container)
         const targetVisualX = isHomeOffense ? 0 : 100; 
         leftKeyframes = [`${mapToField(ballX)}%`, `${(mapToField(ballX) + targetVisualX) / 2}%`, `${targetVisualX}%`];
         scaleKeyframes = [1, 3, 1]; 
         if (resultCategory === 'NO_GOOD') {
             topKeyframes = ["50%", "65%", "85%"]; // Slices wide
         }
     } 
     // 2. Air Physics (Punts & Kickoffs)
     else if (isPuntKickoff) {
         // DEFAULT 40 YARD OVERRIDE: If the backend fails to send return yardage, fake a 40-yard bomb!
         const kickYards = yards === 0 ? 40 : yards;
         endX = ballX + (kickYards * dir);
         if (endX < 0) endX = 0;
         if (endX > 100) endX = 100;

         leftKeyframes = [`${mapToField(ballX)}%`, `${mapToField(ballX + ((endX - ballX) * 0.5))}%`, `${mapToField(endX)}%`];
         scaleKeyframes = [1, 3, 1];
         shadowOpacity = [0, 0.3, 0];
         shadowTop = ["54%", "65%", "54%"];
     } 
     // 3. Air Physics (Passes & Turnovers)
     else if (isPass || resultCategory === 'INCOMPLETE' || resultCategory === 'INTERCEPTION') {
         if (resultCategory === 'INCOMPLETE' || resultCategory === 'INTERCEPTION') {
             endX = ballX + (15 * dir); 
             if (endX < 0) endX = 0;
             if (endX > 100) endX = 100;
             leftKeyframes = [`${mapToField(ballX)}%`, `${mapToField(ballX + ((endX - ballX) * 0.5))}%`, `${mapToField(endX)}%`];
         }
         scaleKeyframes = [1, 2.5, 1]; 
         shadowOpacity = [0, 0.4, 0];
         shadowTop = ["54%", "62%", "54%"];
     } 
     // 4. Ground Physics (Runs)
     else if (isOutside || isInside) {
         const isTopSide = (playId % 2) === 0; // Alternates sideline usage
         
         if (isOutside) {
             const side = isTopSide ? "15%" : "85%";
             const midSide = isTopSide ? "25%" : "75%";
             topKeyframes = ["50%", midSide, side]; // Arcs out and stays there
         } else if (isInside) {
             const side = isTopSide ? "35%" : "65%";
             const midSide = isTopSide ? "40%" : "60%";
             topKeyframes = ["50%", midSide, side]; // Tight arc
         }
     } // Power runs keep default straight line

     // Fire Animations
     ballControls.start({
         left: leftKeyframes,
         top: topKeyframes,
         scale: scaleKeyframes,
         transition: { duration: 1.5, ease: "easeInOut" }
     });
     
     shadowControls.start({
         left: leftKeyframes,
         top: shadowTop,
         opacity: shadowOpacity,
         transition: { duration: 1.5, ease: "easeInOut" }
     });
     
     if (resultCategory !== 'NONE') {
         badgeControls.start({
             opacity: [0, 0, 1, 1, 0], 
             scale: [0.5, 0.5, 1.1, 1, 0.9],
             y: [10, 10, -25, -20, -15], 
             transition: { duration: 3.0, times: [0, 0.48, 0.53, 0.8, 1] } 
         });
     }
     
  }, [ballX, yards, isHomeOffense, playId, playType, resultCategory, ballControls, shadowControls, badgeControls]);

  const badgeConfig = getBadgeConfig(resultCategory);

  return (
    <div className="relative w-full aspect-[2/1] bg-green-700 border-x-8 border-white shadow-2xl rounded-sm overflow-hidden flex items-center">
      
      {/* Away End Zone */}
      <div className="absolute left-0 h-full w-[10%] bg-green-900 flex items-center justify-center z-10 border-r-4 border-white">
        <span className="text-white font-black text-2xl -rotate-90 whitespace-nowrap uppercase tracking-widest opacity-80">
          {awayName || "AWAY"}
        </span>
      </div>

      {/* Home End Zone */}
      <div className="absolute right-0 h-full w-[10%] bg-green-900 flex items-center justify-center z-10 border-l-4 border-white">
        <span className="text-white font-black text-2xl rotate-90 whitespace-nowrap uppercase tracking-widest opacity-80">
          {homeName || "HOME"}
        </span>
      </div>

      {/* Yard Lines */}
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

      {/* Midfield Hash Marks */}
      <div className="absolute top-1/3 left-[10%] right-[10%] h-px bg-white/30" />
      <div className="absolute bottom-1/3 left-[10%] right-[10%] h-px bg-white/30" />

      {/* Goal Posts */}
      <div className="absolute left-0 top-1/2 -mt-10 w-2 h-20 bg-yellow-400 z-20 border-2 border-black/50" />
      <div className="absolute right-0 top-1/2 -mt-10 w-2 h-20 bg-yellow-400 z-20 border-2 border-black/50" />

      {/* --- ANIMATED BALL & EFFECTS --- */}
      
      <motion.div
        className="absolute w-6 h-3 bg-black/50 rounded-full blur-[2px] z-20"
        animate={shadowControls}
        initial={{ left: `${mapToField(ballX)}%`, top: "54%", opacity: 0 }}
        style={{ x: "-50%", y: "-50%" }}
      />
      
      <motion.div
        className="absolute z-30"
        animate={ballControls}
        initial={{ left: `${mapToField(ballX)}%`, top: "50%", scale: 1 }}
        style={{ x: "-50%", y: "-50%" }}
      >
         <div className="w-6 h-4 bg-amber-900 rounded-full border-2 border-black shadow-sm" />
         
         <motion.div 
           className="absolute flex items-center justify-center pointer-events-none w-40"
           style={{ left: -70, top: 0 }} 
           animate={badgeControls}
           initial={{ opacity: 0 }}
         >
            {badgeConfig && (
                <div className={`px-3 py-1 rounded shadow-xl text-white font-black text-[11px] tracking-[0.2em] uppercase border-2 ${badgeConfig.bg} ${badgeConfig.border}`}>
                    {badgeConfig.text}
                </div>
            )}
         </motion.div>
      </motion.div>
    </div>
  );
};
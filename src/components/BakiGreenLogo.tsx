
import React from 'react';
import { motion } from 'motion/react';

export const BakiGreenLogo = ({ size = 32 }: { size?: number }) => {
  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <style>{`
        @keyframes periodicPulse {
          0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
          1% { transform: scale(1.1) rotate(5deg); filter: brightness(1.2); }
          2% { transform: scale(1) rotate(0deg); filter: brightness(1); }
          100% { transform: scale(1) rotate(0deg); filter: brightness(1); }
        }
        .periodic-logo {
          animation: periodicPulse 120s infinite ease-in-out;
        }
        .wavy-shape {
          border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
        }
      `}</style>
      <motion.div 
        className="periodic-logo wavy-shape w-full h-full bg-[#58CC02] flex items-center justify-center text-white font-black shadow-lg shadow-[#58cc02]/20 cursor-pointer overflow-hidden p-1"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
          {/* Cute Sloth Face Vector */}
          <circle cx="50" cy="50" r="40" fill="white" fillOpacity="0.2" />
          <path d="M30 45 C 30 35, 70 35, 70 45 C 70 65, 30 65, 30 45" fill="white" />
          <circle cx="40" cy="48" r="4" fill="#333" />
          <circle cx="60" cy="48" r="4" fill="#333" />
          <path d="M45 55 Q 50 58, 55 55" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Eyes patches */}
          <path d="M28 48 Q 32 40, 42 45" fill="none" stroke="#58CC02" strokeWidth="1" />
          <path d="M72 48 Q 68 40, 58 45" fill="none" stroke="#58CC02" strokeWidth="1" />
        </svg>
      </motion.div>
    </div>
  );
};

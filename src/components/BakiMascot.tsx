import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export function BakiMascot({ size = 120, emotion = 'happy' }: { size?: number, emotion?: 'happy' | 'thinking' | 'celebrate' }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <motion.div
      animate={
        emotion === 'celebrate' ? { y: [0, -20, 0], rotate: [0, 10, -10, 0] } :
        emotion === 'thinking' ? { rotate: [0, 5, 0], y: [0, -5, 0] } :
        { y: [0, -5, 0] }
      }
      transition={{ 
        repeat: emotion === 'celebrate' ? 2 : Infinity, 
        duration: emotion === 'celebrate' ? 0.6 : 3,
        ease: 'easeInOut' 
      }}
      className="relative flex justify-center items-center rounded-full bg-baki-mint"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[85%] h-[85%] drop-shadow-sm">
        {/* Sloth Body / Head */}
        <path d="M100 190C149.706 190 190 149.706 190 100C190 50.2944 149.706 10 100 10C50.2944 10 10 50.2944 10 100C10 149.706 50.2944 190 100 190Z" fill="#58CC02"/>
        <path d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z" fill="#78E625"/>
        
        {/* Face plate (smooth rounded lighter area) */}
        <path fillRule="evenodd" clipRule="evenodd" d="M170 100C170 138.66 138.66 170 100 170C61.3401 170 30 138.66 30 100C30 75 42 55 60 42C72 60 85 65 100 65C115 65 128 60 140 42C158 55 170 75 170 100Z" fill="#E2F9CC"/>
        
        {/* Eyes (dark colored circles or lines for blinking) */}
        {blink ? (
          <>
            <path d="M60 100 L85 100" stroke="#3C3C3C" strokeWidth="8" strokeLinecap="round" />
            <path d="M115 100 L140 100" stroke="#3C3C3C" strokeWidth="8" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="72" cy="95" r="14" fill="#3C3C3C"/>
            <circle cx="128" cy="95" r="14" fill="#3C3C3C"/>
            {/* Eye Highlights */}
            <circle cx="76" cy="90" r="4" fill="white"/>
            <circle cx="132" cy="90" r="4" fill="white"/>
          </>
        )}
        
        {/* Nose */}
        <path d="M100 120C108.284 120 115 113.284 115 105C115 102 108.284 110 100 110C91.7157 110 85 102 85 105C85 113.284 91.7157 120 100 120Z" fill="#3C3C3C"/>
        
        {/* Smile */}
        <path d="M85 130C85 130 92 140 100 140C108 140 115 130 115 130" stroke="#3C3C3C" strokeWidth="6" strokeLinecap="round"/>
        
        {/* Rosy Cheeks */}
        <circle cx="50" cy="115" r="10" fill="#FF8FBD" opacity="0.6"/>
        <circle cx="150" cy="115" r="10" fill="#FF8FBD" opacity="0.6"/>
        
        {/* Emotion modifiers */}
        {emotion === 'thinking' && (
          <path d="M60 70 C70 60, 80 60, 85 70" stroke="#3C3C3C" strokeWidth="6" strokeLinecap="round" fill="none"/>
        )}
      </svg>
    </motion.div>
  );
}

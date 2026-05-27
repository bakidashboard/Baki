import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function AmbientBackground() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-baki-bg">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] rounded-full bg-[#58CC02] blur-[100px] opacity-[0.08]"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[#38BDF8] blur-[100px] opacity-[0.08]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 30, -30, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="absolute top-[20%] right-[10%] w-32 h-32 rounded-full bg-pink-200 blur-3xl opacity-40"
      />
    </div>
  );
}

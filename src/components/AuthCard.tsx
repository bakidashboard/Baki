import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { cn } from './Button';

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={cn(
        "relative w-full max-w-md mx-auto bg-white rounded-[36px] p-8 md:p-10",
        "shadow-baki-float border border-gray-100",
        "overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-[36px]" />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.div>
  );
}

import { motion, HTMLMotionProps } from 'motion/react';
import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "className"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'google' | 'ghost' | 'outline';
  fullWidth?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  isLoading = false,
  className,
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = "relative flex items-center justify-center font-bold outline-none cursor-pointer transition-all";
  
  const variants = {
    primary: "bg-[#58CC02] text-white text-lg font-black rounded-2xl shadow-[0_8px_0_0_#46A302] hover:shadow-[0_4px_0_0_#46A302] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px]",
    secondary: "bg-gray-100 text-gray-700 text-lg rounded-2xl shadow-[0_8px_0_0_#D1D5DB] hover:shadow-[0_4px_0_0_#D1D5DB] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px]",
    google: "bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 active:bg-gray-100 active:scale-[0.98]",
    ghost: "bg-transparent text-gray-500 hover:text-gray-800 rounded-2xl active:bg-gray-50",
    outline: "bg-transparent border-2 border-slate-200 text-slate-700 hover:bg-slate-50 text-lg rounded-2xl active:scale-[0.98]"
  };

  const widthClass = fullWidth ? "w-full px-6 py-4" : "px-8 py-4";
  const disabledClass = disabled || isLoading ? "opacity-60 cursor-not-allowed hover:translate-y-0 active:translate-y-0 hover:shadow-[0_8px_0_0_#46A302] active:shadow-[0_8px_0_0_#46A302]" : "";

  return (
    <motion.button
      className={cn(baseClasses, variants[variant], widthClass, disabledClass, className)}
      disabled={disabled || isLoading}
      {...props}
    >
      <div className="relative z-10 flex items-center gap-3">
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {children}
      </div>
    </motion.button>
  );
}

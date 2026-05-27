import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isValid?: boolean;
}

export function Input({ label, error, isValid, className, id, required, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { dir } = useLanguage();
  const inputId = id || label.replace(/\s+/g, '-').toLowerCase();

  const isRtl = dir === 'rtl';

  return (
    <div className={cn("relative w-full mb-6", className)}>
      <motion.div
        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <div className="relative flex items-center">
          <input
            id={inputId}
            onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
            className={cn(
              "w-full px-5 py-4 pt-6 bg-gray-50 border-none rounded-2xl outline-none text-sm font-medium text-gray-800 transition-all",
              error ? "bg-red-50 focus:ring-2 focus:ring-red-400 focus:bg-white" :
              "focus:ring-2 focus:ring-[#58CC02] focus:bg-white hover:bg-gray-100",
              isRtl ? "text-right" : "text-left"
            )}
            dir={dir}
            {...props}
          />
          
          <div className={cn("absolute flex items-center gap-2", isRtl ? "left-4" : "right-4")}>
             <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </motion.div>
              )}
              {!error && isValid && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-baki-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.label
          htmlFor={inputId}
          initial={false}
          animate={{
            y: (isFocused || props.value) ? -10 : 16,
            scale: (isFocused || props.value) ? 0.75 : 1,
            color: error ? '#ef4444' : isFocused ? '#58CC02' : '#9ca3af'
          }}
          className={cn(
            "absolute top-0 pointer-events-none origin-top-left transition-colors font-bold z-10",
            isRtl ? "right-5 origin-top-right" : "left-5"
          )}
        >
          {label}
        </motion.label>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn("absolute text-sm font-bold text-red-500 mt-1", isRtl ? "right-2" : "left-2")}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

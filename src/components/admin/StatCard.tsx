import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, className, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={cn(
        "bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl shadow-slate-200/20 relative overflow-hidden group",
        "hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300",
        className
      )}
    >
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <Icon className="w-32 h-32" />
      </div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-slate-500 font-medium tracking-tight mb-2">{title}</p>
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-2 mt-3">
              <span className={cn(
                "px-2 py-1 rounded-lg text-xs font-bold",
                trend.isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              )}>
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
              <span className="text-slate-400 text-xs font-medium">vs last month</span>
            </div>
          )}
        </div>
        
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-300 shadow-sm border border-indigo-100">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, MessageSquare, Sparkles, Shield, Settings, Database, LogOut, ChevronRight, Menu, Bell, Zap, Home } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'content', label: 'Content', icon: Database },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'ai-hub', label: 'AI Hub', icon: Zap },
  { id: 'ai-advisor', label: 'AI Advisor', icon: Sparkles },
  { id: 'chat', label: 'Community', icon: MessageSquare },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children, activeTab, onTabChange, onExit }: AdminLayoutProps) {
  const { user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#FAF9F5] w-full flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
         <div className="flex items-center gap-2">
             <button 
               onClick={onExit}
               className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm"
             >
                <Home className="w-5 h-5" />
             </button>
             <div className="flex flex-col">
                <span className="font-black text-slate-800 text-xs tracking-tighter uppercase">Mission</span>
                <span className="text-[#58cc02] font-black text-[10px] -mt-1 tracking-widest uppercase">Control</span>
             </div>
         </div>
         
         <div className="flex items-center gap-3">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 bg-slate-100 rounded-xl text-slate-600 border border-slate-200">
               <Menu className="w-5 h-5" />
             </button>
         </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="md:hidden fixed inset-4 top-[80px] bg-white border border-slate-200 z-[60] shadow-2xl rounded-[32px] overflow-hidden flex flex-col"
          >
             <div className="p-4 flex flex-col gap-2 overflow-y-auto">
                <div className="px-4 py-2 mb-2 flex items-center gap-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                   <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                      <img src={profile?.photoURL || user?.photoURL || ''} alt="Av" className="w-full h-full object-cover" />
                   </div>
                   <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-xs">{profile?.displayName || user?.displayName}</span>
                      <span className="text-[9px] font-bold text-slate-400">ADMINISTRATOR</span>
                   </div>
                </div>
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
                    className={cn(
                      "flex items-center gap-3 w-full p-4 rounded-2xl font-black text-xs transition-all",
                      activeTab === item.id ? "bg-[#58cc02] text-white shadow-lg shadow-[#58cc02]/20" : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
             </div>
             <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
                <button onClick={onExit} className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl font-black text-xs text-red-500 hover:bg-red-50 border border-red-100 transition-all">
                   <LogOut className="w-4 h-4" />
                   Back to Main Academy
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Floating Navigation */}
      <div className="hidden md:flex flex-col w-72 h-screen fixed top-0 left-0 p-6 z-40">
        <div className="bg-white/90 backdrop-blur-2xl border border-slate-200 shadow-2xl shadow-slate-200/40 rounded-[40px] h-full flex flex-col overflow-hidden">
           <div className="p-8 flex items-center gap-4 border-b border-slate-100/50 bg-[#58cc02]/5">
             <div className="w-12 h-12 rounded-[22px] bg-white border border-[#58cc02]/20 shadow-sm flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#58cc02]" />
             </div>
             <div>
                <h2 className="font-black text-slate-800 tracking-tighter leading-none text-xl uppercase">CONTROL<br/><span className="text-[#58cc02] text-sm tracking-widest">MISSION</span></h2>
             </div>
           </div>

           {/* Scrollable Nav Area */}
           <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-2 custom-scrollbar">
              {NAV_ITEMS.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => onTabChange(item.id)}
                   className={cn(
                     "flex items-center justify-between w-full p-4 rounded-[24px] font-black text-[13px] transition-all duration-300 group relative overflow-hidden",
                     activeTab === item.id 
                       ? "bg-[#58cc02] text-white shadow-xl shadow-[#58cc02]/20" 
                       : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 hover:translate-x-1"
                   )}
                 >
                   <div className="flex items-center gap-4 relative z-10">
                     <item.icon className={cn("w-5 h-5 transition-transform duration-300", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
                     {item.label}
                   </div>
                   {activeTab === item.id && (
                      <motion.div layoutId="active-nav-arrow" className="relative z-10 bg-white/20 p-1.5 rounded-xl">
                         <ChevronRight className="w-3.5 h-3.5" />
                      </motion.div>
                   )}
                 </button>
              ))}
           </div>

           <div className="p-6 border-t border-slate-100/80">
              <div className="bg-slate-50/50 p-4 rounded-[28px] mb-4 flex items-center gap-3 border border-slate-100 shadow-sm relative overflow-hidden group">
                 <div className="absolute inset-0 bg-emerald-500/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                 <div className="relative z-10 w-11 h-11 rounded-[18px] bg-white border border-slate-200 shadow-sm flex items-center justify-center p-0.5 overflow-hidden">
                    <img src={profile?.photoURL || user?.photoURL || ''} alt="Av" className="w-full h-full object-cover rounded-[16px]" />
                 </div>
                 <div className="relative z-10 overflow-hidden">
                    <div className="font-black text-slate-800 text-[11px] truncate">{profile?.displayName || user?.displayName || 'Admin'}</div>
                    <div className="text-[9px] text-[#58cc02] font-black tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase">
                       Super Admin <Sparkles className="w-2.5 h-2.5" />
                    </div>
                 </div>
              </div>
              <button 
                onClick={onExit}
                className="flex items-center justify-center gap-3 w-full p-4 rounded-[24px] font-black text-xs text-slate-500 hover:bg-emerald-50 hover:text-[#58cc02] transition-all border border-transparent hover:border-emerald-100"
              >
                 <Home className="w-4 h-4" />
                 <span>Main Dashboard</span>
              </button>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-72 min-h-screen relative p-4 md:p-10 overflow-x-hidden">
         <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -15 }}
           transition={{ duration: 0.4, ease: "easeOut" }}
           className="w-full max-w-7xl mx-auto h-full"
         >
           {children}
         </motion.div>
      </div>
    </div>
  );
}

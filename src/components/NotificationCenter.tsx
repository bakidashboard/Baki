
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { database } from '../firebase/config';
import { ref, onValue, set, update } from 'firebase/database';
import { Bell, X, Check, MailOpen, Trash2, Info, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
  timestamp: number;
}

export const NotificationCenter = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user?.uid) return;
    
    // Listen to user-specific notifications
    const notificationsRef = ref(database, `notifications/${user.uid}`);
    const unsub = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(parsed);
      } else {
        setNotifications([]);
      }
    });

    return () => {};
  }, [user?.uid]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.uid) return;
    await update(ref(database, `notifications/${user.uid}/${notificationId}`), {
      read: true
    });
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user?.uid) return;
    await set(ref(database, `notifications/${user.uid}/${notificationId}`), null);
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center relative hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer group"
      >
        <Bell className={cn(
          "w-5 h-5 transition-colors",
          unreadCount > 0 ? "text-[#58cc02]" : "text-slate-400 group-hover:text-slate-600"
        )} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white shadow-sm"></span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-slate-100 rounded-[24px] shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]"
            >
              <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-800 text-sm">
                    {language === 'ar' ? 'الإشعارات والتنبيهات' : 'Notifications'}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="bg-[#58cc02] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center gap-3">
                    <MailOpen className="w-10 h-10 text-slate-200" />
                    <p className="text-xs font-bold text-slate-400">
                      {language === 'ar' ? 'علبة الوارد فارغة حالياً' : 'Inbox is currently empty'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((n) => (
                      <motion.div
                        key={n.id}
                        layout
                        onClick={() => !n.read && markAsRead(n.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer group relative ${
                          n.read 
                            ? 'bg-white border-transparent opacity-60' 
                            : 'bg-slate-50 border-slate-100 shadow-sm'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                            n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                             n.type === 'success' ? <Check className="w-4 h-4" /> :
                             <Info className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <h4 className={`text-xs font-black text-slate-800 truncate ${!n.read && 'text-[#58cc02]'}`}>
                              {n.title}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-2">
                              {n.message}
                            </p>
                            <span className="text-[8px] font-bold text-slate-400 mt-1.5 block uppercase">
                              {new Date(n.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        {!n.read && (
                          <div className="absolute right-3 top-3 w-2 h-2 bg-[#58cc02] rounded-full"></div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="absolute right-2 bottom-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-white shadow-sm border text-slate-400 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    {language === 'ar' ? 'تنتهي صلاحية التنبيهات تلقائياً' : 'Notifications expire automatically'}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

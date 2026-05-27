
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { database } from '../../firebase/config';
import { ref, push, set, serverTimestamp, get } from 'firebase/database';
import { Bell, Send, Users, Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const AdminNotifications = () => {
  const { language } = useLanguage();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success'>('info');
  const [target, setTarget] = useState<'all' | 'specific'>('all');
  const [specificUserId, setSpecificUserId] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async () => {
    if (!title || !message) {
      toast.error('Please fill in both title and message');
      return;
    }

    setIsSending(true);
    try {
      if (target === 'all') {
        // In a real production app with thousands of users, we'd use a cloud function or a batch process.
        // For this real-time app, we fetch all user IDs and push to their notification buckets.
        const usersRef = ref(database, 'users');
        const snapshot = await get(usersRef);
        
        if (snapshot.exists()) {
          const users = snapshot.val();
          const userIds = Object.keys(users);
          
          const broadcastMsg = {
            title,
            message,
            type,
            read: false,
            timestamp: Date.now()
          };

          const promises = userIds.map(uid => {
            const newNotifRef = push(ref(database, `notifications/${uid}`));
            return set(newNotifRef, broadcastMsg);
          });

          await Promise.all(promises);
          toast.success(`Broadcast sent to ${userIds.length} users! 🚀`);
        }
      } else {
        if (!specificUserId) {
          toast.error('Please provide a specific User ID');
          setIsSending(false);
          return;
        }
        const newNotifRef = push(ref(database, `notifications/${specificUserId}`));
        await set(newNotifRef, {
          title,
          message,
          type,
          read: false,
          timestamp: Date.now()
        });
        toast.success('Direct notification sent! 📥');
      }

      setTitle('');
      setMessage('');
    } catch (err: any) {
      toast.error('Broadcast failed: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-[32px] p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">
              {language === 'ar' ? 'بث الإشعارات الذكية' : 'Smart Notification Broadcast'}
            </h3>
            <p className="text-xs font-bold text-slate-400">
              {language === 'ar' ? 'أرسل تنبيهات فورية لكافة الطلاب أو لمستخدم محدد' : 'Send instant alerts to all students or a specific user'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Notification Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New Lesson Available! ✨"
                className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Detailed Message</label>
              <textarea 
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the message content here..."
                className="w-full bg-slate-50 border rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Alert Type (Visual style)</label>
              <div className="flex gap-2">
                {(['info', 'warning', 'success'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`flex-1 py-3 rounded-2xl border flex items-center justify-center gap-2 transition-all capitalize font-black text-xs ${
                      type === t 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {t === 'info' && <Info className="w-3.5 h-3.5" />}
                    {t === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {t === 'success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-slate-400 px-1">Audience Target</label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  onClick={() => setTarget('all')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    target === 'all' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Users className="w-4 h-4" /> Global Broadcast
                </button>
                <button
                  onClick={() => setTarget('specific')}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    target === 'specific' ? 'bg-white text-indigo-650 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Bell className="w-4 h-4" /> Direct DM
                </button>
              </div>
              
              {target === 'specific' && (
                <input 
                  type="text" 
                  value={specificUserId}
                  onChange={(e) => setSpecificUserId(e.target.value)}
                  placeholder="Enter User UID (e.g. xY7z...)"
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2 text-xs font-mono font-bold focus:border-indigo-400"
                />
              )}
            </div>

            <button
              disabled={isSending}
              onClick={handleBroadcast}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Broadcast...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{target === 'all' ? 'Trigger Global Alert 🚀' : 'Send Private Message 📥'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 flex items-start gap-4">
        <Sparkles className="w-6 h-6 text-amber-500 shrink-0" />
        <div>
          <h4 className="text-sm font-black text-amber-900">Push Notification Strategy</h4>
          <p className="text-xs font-bold text-amber-800/70 leading-relaxed mt-1">
            Notifications are stored in real-time. Students will see the bell icon animate immediately when a new broadcast is sent. 
            Remember to be concise and pedagogical in your communications.
          </p>
        </div>
      </div>
    </div>
  );
};

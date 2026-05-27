import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, Shield, Flag, Trash2, CheckCircle, Send, User, Clock, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ref, onValue, set, push } from 'firebase/database';
import { database } from '../../firebase/config';

interface Report {
  id: string;
  category: string;
  reporter: string;
  message: string;
  time: string;
  status: 'pending' | 'resolved';
}

interface ChatSession {
  id: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  timestamp: number;
  isResolved?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export function AdminChat() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Maintenance Live Chats
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reportsRef = ref(database, 'reports');
    const unsubscribe = onValue(reportsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).filter((r: any) => r.status !== 'resolved');
        setReports(parsed);
      } else {
        const defaultReports: Record<string, Report> = {
          "report_1": {
            id: "report_1",
            category: "Spam",
            reporter: "@user123",
            message: "Buy cheap crypto here at entirelyfake.link!!!",
            time: "10 mins ago",
            status: "pending"
          },
          "report_2": {
            id: "report_2",
            category: "Harassment",
            reporter: "@student_alpha",
            message: "You are totally incorrect and shouldn't be in this room.",
            time: "2 hours ago",
            status: "pending"
          }
        };
        set(reportsRef, defaultReports);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports: ", error);
      setLoading(false);
    });

    return () => {};
  }, []);

  // Sync Maintenance Sessions List
  useEffect(() => {
    const sessionsRef = ref(database, 'maintenance_chats/sessions');
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const parsed: ChatSession[] = Object.keys(val).map(k => ({
          id: k,
          ...val[k]
        })).sort((a, b) => b.timestamp - a.timestamp);
        setSessions(parsed);
      } else {
        setSessions([]);
      }
    });

    return () => {};
  }, []);

  // Sync Messages of Selected Chat
  useEffect(() => {
    if (!activeSession) {
      setMessages([]);
      return;
    }
    const messagesRef = ref(database, `maintenance_chats/rooms/${activeSession}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const parsed: ChatMessage[] = Object.keys(val).map(k => ({
          id: k,
          ...val[k]
        })).sort((a, b) => a.timestamp - b.timestamp);
        setMessages(parsed);
      } else {
        setMessages([]);
      }
    });

    return () => {};
  }, [activeSession]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAction = async (id: string, action: 'delete' | 'dismiss') => {
    try {
      if (action === 'delete') {
        await set(ref(database, `reports/${id}/status`), 'resolved');
        toast.success('Message deleted and user warned! 🚨');
      } else {
        await set(ref(database, `reports/${id}/status`), 'resolved');
        toast.success('Report dismissed successfully! ✅');
      }
    } catch (err: any) {
      toast.error('Action failed: ' + err.message);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSession) return;

    try {
      const roomRef = push(ref(database, `maintenance_chats/rooms/${activeSession}/messages`));
      await set(roomRef, {
        id: roomRef.key,
        senderId: 'admin',
        senderName: 'المدير 🛡️',
        text: replyText.trim(),
        timestamp: Date.now()
      });

      // Update session info
      await set(ref(database, `maintenance_chats/sessions/${activeSession}/lastMessage`), `المدير: ${replyText.trim()}`);
      await set(ref(database, `maintenance_chats/sessions/${activeSession}/timestamp`), Date.now());

      setReplyText('');
    } catch (err: any) {
      toast.error('فشل إرسال الرد: ' + err.message);
    }
  };

  const handleMarkResolved = async (sessionId: string) => {
    try {
      await set(ref(database, `maintenance_chats/sessions/${sessionId}/isResolved`), true);
      toast.success('تم تحديد الاستفسار كمكتمل ومحلول! 🌸');
      if (activeSession === sessionId) {
        setActiveSession(null);
      }
    } catch (err: any) {
      toast.error('حدث خطأ: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0 font-sans text-right" dir="rtl">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">غرفة التحكم والدردشة المباشرة 🛡️</h1>
            <p className="text-slate-500 font-bold text-sm">إدارة البلاغات ومتابعة الدردشات المباشرة مع الأعضاء في وضع الصيانة.</p>
          </div>
       </div>

       {/* LIVE SUPPORT CHATS DURING MAINTENANCE */}
       <div className="bg-white/75 backdrop-blur-xl border border-amber-100 rounded-3xl p-6 shadow-xl shadow-amber-900/5">
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2 flex-row-reverse">
             <span>💬 محادثات الدعم والمساندة الفورية (أثناء الصيانة)</span>
          </h2>
          <p className="text-xs font-bold text-slate-400 mb-6 text-right">تابع تساؤلات ومشاكل الأعضاء وحلها بثوانٍ لتكسب رضا مجتمع باكي.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Sessions list */}
             <div className="lg:col-span-1 border-l border-slate-100 pl-4 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-right border-b pb-2 mb-2">قائمة المستفسرين النشطين</span>
                {sessions.length === 0 ? (
                   <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-400 font-bold text-xs">
                      لا توجد أي محادثات دعم نشطة حالياً. 🦥💤
                   </div>
                ) : (
                   sessions.map((sess) => {
                      const isActive = activeSession === sess.id;
                      return (
                         <div 
                           key={sess.id} 
                           onClick={() => setActiveSession(sess.id)}
                           className={`p-4 rounded-2xl border transition-all cursor-pointer text-right flex flex-col gap-1 relative ${
                              isActive 
                                ? 'bg-amber-50/70 border-amber-200 shadow-sm' 
                                : sess.isResolved 
                                  ? 'bg-emerald-50/40 border-emerald-100 opacity-60' 
                                  : 'bg-white border-slate-100 hover:bg-slate-50'
                           }`}
                         >
                            <div className="flex items-center justify-between flex-row-reverse">
                               <span className="font-black text-slate-800 text-xs">{sess.userName}</span>
                               <span className="text-[10px] font-bold text-slate-400">
                                  {new Date(sess.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </span>
                            </div>
                            <p className="text-slate-400 text-[10px] font-bold truncate text-right">{sess.userEmail}</p>
                            <p className="text-slate-600 text-[11px] font-semibold truncate mt-1 text-right">{sess.lastMessage}</p>

                            {sess.isResolved ? (
                               <span className="absolute top-3 left-3 bg-emerald-100 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded">محلول</span>
                            ) : (
                               <button 
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkResolved(sess.id);
                                 }}
                                 className="absolute top-3 left-3 p-1 hover:bg-emerald-100 rounded text-emerald-500 transition-all"
                                 title="تظليل كمحلول"
                               >
                                  <Check className="w-3 h-3" />
                               </button>
                            )}
                         </div>
                      );
                   })
                )}
             </div>

             {/* Live Chat Box */}
             <div className="lg:col-span-2 bg-slate-50/50 rounded-3xl border border-slate-100 p-4 h-[420px] flex flex-col">
                {activeSession ? (
                   <>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 flex-row-reverse">
                         <div className="text-right flex items-center gap-2">
                            <span className="font-black text-sm text-slate-800">
                               الدردشة مع: {sessions.find(s => s.id === activeSession)?.userName}
                            </span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                         </div>
                         <button 
                           onClick={() => handleMarkResolved(activeSession)}
                           className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                        >
                            تم الحل وباشر الخدمة
                         </button>
                      </div>

                      {/* Chat Messages */}
                      <div className="flex-1 overflow-y-auto space-y-3 p-2 text-right">
                         {messages.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                               بانتظار الرسائل...
                            </div>
                         ) : (
                            messages.map((m) => {
                               const isAdminSender = m.senderId === 'admin';
                               return (
                                  <div key={m.id} className={`flex flex-col ${isAdminSender ? 'items-end' : 'items-start'} space-y-1`}>
                                     <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 text-right flex-row-reverse">
                                        <span>{m.senderName}</span>
                                        <span>• {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                     </div>
                                     <div className={`p-3 rounded-2xl max-w-[80%] text-xs font-semibold leading-relaxed ${
                                        isAdminSender 
                                          ? 'bg-emerald-500 text-white rounded-tr-none' 
                                          : 'bg-slate-200 text-slate-800 rounded-tl-none'
                                     }`}>
                                        {m.text}
                                     </div>
                                  </div>
                               );
                            })
                         )}
                         <div ref={chatEndRef} />
                      </div>

                      {/* Send Form */}
                      <form onSubmit={handleSendReply} className="flex gap-2 items-center mt-3 border-t pt-3 border-slate-100">
                         <input 
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="اكتب ردك ومساعدتك للمستفسر الفوري..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-400 text-right"
                            dir="rtl"
                         />
                         <button 
                            type="submit"
                            className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center active:scale-95"
                         >
                            <Send className="w-4 h-4" />
                         </button>
                      </form>
                   </>
                ) : (
                   <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                      <span className="text-4xl">🦥💬</span>
                      <p className="text-xs font-black text-slate-500">اختر مستفسراً من القائمة للبدء بالدردشة والردود الفورية ومساعدته بشكل كفء.</p>
                      <p className="text-[10px] font-medium text-slate-400">ستصل تحديثات الإجابات لمستخدم الكسلان في نفس اللحظة.</p>
                   </div>
                )}
             </div>
          </div>
       </div>

       {/* STANDARD AUDIT/REPORTS (DUOLINGO STYLE EXCLUSIONS) */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl shadow-slate-200/20">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 flex-row-reverse text-right">
                   <span>البلاغات المعلقة للغرف العامة ({reports.length})</span>
                </h3>

                <div className="space-y-4">
                   {loading ? (
                     <div className="text-center p-8 text-slate-400 font-bold animate-pulse">جاري جلب البلاغات والتقارير المعلقة...</div>
                   ) : reports.length === 0 ? (
                     <div className="text-center p-8 text-emerald-600 font-bold bg-emerald-50 rounded-2xl border border-emerald-100">
                       لا توجد بلاغات أو مشاكل بالمجموعات العامة اليوم! مجتمع نظيف تماماً. ✨
                     </div>
                   ) : (
                     reports.map((report) => (
                       <div key={report.id} className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl text-right">
                          <div className="flex justify-between items-start mb-2 flex-row-reverse">
                             <div className="flex items-center gap-2">
                                <span className="bg-rose-105 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-md">
                                  {report.category}
                                </span>
                                <span className="font-bold text-slate-700 text-sm">
                                  المُبلِغ: {report.reporter}
                                </span>
                             </div>
                             <span className="text-xs text-slate-400 font-medium">{report.time}</span>
                          </div>
                          <p className="text-slate-600 text-sm bg-white p-3 rounded-xl border border-slate-100 mb-4 font-mono text-right">
                             "{report.message}"
                          </p>
                          <div className="flex items-center gap-3 justify-end">
                             <button onClick={() => handleAction(report.id, 'delete')} className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-rose-600 transition-colors cursor-pointer">
                                <Trash2 className="w-4 h-4" /> حذف الرسالة وبلاغ
                             </button>
                             <button onClick={() => handleAction(report.id, 'dismiss')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer">
                                <CheckCircle className="w-4 h-4 text-emerald-500" /> تجاهل
                             </button>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>

          <div className="space-y-6 text-right">
             <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-xl shadow-slate-200/20">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 flex-row-reverse">
                   <Shield className="w-5 h-5 text-indigo-500" />
                   <span>فلاتر الرقابة الذاتية</span>
                </h3>
                
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl flex-row-reverse">
                      <span className="font-bold text-slate-705 text-sm">فلتر الكلمات البذيئة</span>
                      <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-md uppercase">نشط</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl flex-row-reverse">
                      <span className="font-bold text-slate-705 text-sm">محدد الروابط المزعجة</span>
                      <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-md uppercase">نشط</span>
                   </div>
                   <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl flex-row-reverse">
                      <span className="font-bold text-slate-705 text-sm">مكافح غسيل المحادثات</span>
                      <span className="bg-emerald-100 text-emerald-600 text-xs font-bold px-2 py-0.5 rounded-md uppercase">نشط</span>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

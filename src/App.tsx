/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from 'react-hot-toast';
import { X, Send, MessageCircle } from 'lucide-react';
import { ref, push, set, onValue, off } from 'firebase/database';
import { database } from './firebase/config';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AmbientBackground } from './components/AmbientBackground';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { AuthScreen } from './screens/AuthScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { AdminScreen } from './screens/AdminScreen';
import { RoleGuard } from './components/RoleGuard';

const SlothVector = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14 cursor-pointer" style={{ transformOrigin: 'top center' }}>
    <defs>
      <style>{`
        @keyframes slothSwing {
          0% { transform: rotate(0deg); }
          4% { transform: rotate(8deg); }
          8% { transform: rotate(-8deg); }
          12% { transform: rotate(5deg); }
          16% { transform: rotate(-3deg); }
          20% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes slothEyeBlink {
          0%, 3%, 100% { transform: scaleY(1); }
          1.5% { transform: scaleY(0.1); }
        }
        .sloth-swing-element {
          animation: slothSwing 12s infinite ease-in-out;
          transform-origin: 50% 10px;
        }
        .sloth-eye {
          animation: slothEyeBlink 12s infinite ease-in-out;
          transform-origin: 50% 50%;
        }
      `}</style>
    </defs>
    {/* The Branch */}
    <path d="M10,24 Q50,32 90,24" stroke="#8E7051" strokeWidth="5.5" strokeLinecap="round" fill="none" />
    <path d="M30,24 Q32,14 25,10" stroke="#8E7051" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    {/* Cute Leaf on branch */}
    <path d="M25,10 Q20,12 25,16 Z" fill="#7CB342" />
    
    <g className="sloth-swing-element">
      {/* Hanging arm left */}
      <path d="M40,25 L44,45" stroke="#A78B71" strokeWidth="7" strokeLinecap="round" />
      {/* Hanging arm right */}
      <path d="M60,25 L56,45" stroke="#A78B71" strokeWidth="7" strokeLinecap="round" />
      {/* Curved Claws */}
      <path d="M38,23 A2.5,2.5 0 0 1 42,23" fill="none" stroke="#ECEFF1" strokeWidth="2" strokeLinecap="round" />
      <path d="M58,23 A2.5,2.5 0 0 1 62,23" fill="none" stroke="#ECEFF1" strokeWidth="2" strokeLinecap="round" />
      
      {/* Body */}
      <circle cx="50" cy="56" r="16" fill="#A78B71" />
      
      {/* Head */}
      <circle cx="50" cy="45" r="12" fill="#A78B71" />
      {/* Cute Face Mask */}
      <path d="M42,44 C42,40 45,39 50,42 C55,39 58,40 58,44 C58,50 53,51 50,51 C47,51 42,50 42,44 Z" fill="#EAD4BE" />
      
      {/* Left eye patch */}
      <ellipse cx="45" cy="44" rx="3" ry="4.5" fill="#8D6E63" transform="rotate(-15 45 44)" />
      {/* Right eye patch */}
      <ellipse cx="55" cy="44" rx="3" ry="4.5" fill="#8D6E63" transform="rotate(15 55 44)" />
      
      {/* Eyes with blinking animation */}
      <circle cx="44.5" cy="44" r="1.2" fill="#212121" className="sloth-eye" />
      <circle cx="55.5" cy="44" r="1.2" fill="#212121" className="sloth-eye" />
      
      {/* Nose */}
      <ellipse cx="50" cy="47" rx="1.8" ry="1" fill="#3E2723" />
      
      {/* Mouth */}
      <path d="M48,49 Q50,50.2 52,49" fill="none" stroke="#3E2723" strokeWidth="1" strokeLinecap="round" />
      
      {/* Cheeks */}
      <circle cx="43" cy="46" r="1.2" fill="#E57373" opacity="0.6" />
      <circle cx="57" cy="46" r="1.2" fill="#E57373" opacity="0.6" />
      
      {/* Feet */}
      <circle cx="44" cy="70" r="4" fill="#8E7051" />
      <circle cx="56" cy="70" r="4" fill="#8E7051" />
    </g>
  </svg>
);

type Screen = 'welcome' | 'auth' | 'onboarding' | 'dashboard' | 'admin';

function AppContent() {
  const { language } = useLanguage();
  const { user, loading, isSuspended, isMaintenanceMode, isAdmin, isModerator, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>('welcome');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [bypassMaintenance, setBypassMaintenance] = useState(false);

  const [visitorId] = useState(() => {
    let existing = localStorage.getItem('baki_maintenance_visitor_id');
    if (!existing) {
      existing = `visitor_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('baki_maintenance_visitor_id', existing);
    }
    return existing;
  });

  const [visitorName, setVisitorName] = useState(() => {
    return localStorage.getItem('baki_maintenance_visitor_name') || '';
  });

  const [supportMessages, setSupportMessages] = useState<any[]>([]);
  const [supportChatOpen, setSupportChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newSupportMsg, setNewSupportMsg] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMaintenanceMode) return;
    const sessionKey = user ? user.uid : visitorId;
    const chatRef = ref(database, `maintenance_chats/rooms/${sessionKey}/messages`);
    
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const parsed = Object.keys(val).map(k => ({
          id: k,
          ...val[k]
        })).sort((a,b) => a.timestamp - b.timestamp);
        
        setSupportMessages(parsed);
        
        // If chat is closed, count new messages from admin
        if (!supportChatOpen) {
          const lastViewed = Number(localStorage.getItem(`baki_last_viewed_chat_${sessionKey}`) || 0);
          const newMsgs = parsed.filter(m => m.senderId === 'admin' && m.timestamp > lastViewed);
          setUnreadCount(newMsgs.length);
        }
      } else {
        setSupportMessages([]);
        setUnreadCount(0);
      }
    });

    return () => {
      off(chatRef);
    };
  }, [isMaintenanceMode, visitorId, user, supportChatOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (supportChatOpen) {
      const timer = setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [supportMessages, supportChatOpen]);

  const toggleSupportChat = () => {
    const nextState = !supportChatOpen;
    setSupportChatOpen(nextState);
    if (nextState) {
      setUnreadCount(0);
      const sessionKey = user ? user.uid : visitorId;
      localStorage.setItem(`baki_last_viewed_chat_${sessionKey}`, String(Date.now()));
    }
  };

  const handleSendSupportMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSupportMsg.trim()) return;

    const sessionKey = user ? user.uid : visitorId;
    const finalName = visitorName.trim() || (user?.displayName || user?.email) || `زائر باكي #${sessionKey.slice(-4)}`;
    
    const roomRef = push(ref(database, `maintenance_chats/rooms/${sessionKey}/messages`));
    const msgObj = {
      id: roomRef.key,
      senderId: sessionKey,
      senderName: finalName,
      text: newSupportMsg.trim(),
      timestamp: Date.now()
    };
    
    await set(roomRef, msgObj);

    // Update active sessions list
    const sessionRef = ref(database, `maintenance_chats/sessions/${sessionKey}`);
    await set(sessionRef, {
      id: sessionKey,
      userName: finalName,
      userEmail: user?.email || 'زائر مجهول',
      lastMessage: newSupportMsg.trim(),
      timestamp: Date.now(),
      isResolved: false
    });

    setNewSupportMsg('');
  };

  // Automatically reset bypass maintenance flag when user logs out or session changes
  useEffect(() => {
    if (!user) {
      setBypassMaintenance(false);
    }
  }, [user]);

  // Automatically navigate home if user comes back
  useEffect(() => {
    const canAccess = !isMaintenanceMode || isAdmin || isModerator;
    if (!loading && user && !isSuspended && canAccess && (screen === 'welcome' || screen === 'auth' || screen === 'onboarding')) {
      setScreen('dashboard');
    } else if (!loading && !user && screen !== 'welcome' && screen !== 'auth') {
      setScreen('welcome');
    }
  }, [user, loading, isSuspended, isMaintenanceMode, isAdmin, isModerator, screen]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-12 h-12 border-4 border-lime-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Determine if we should show the maintenance block
  const showMaintenance = isMaintenanceMode && !isAdmin && !isModerator && (user || !bypassMaintenance);

  if (showMaintenance) {
    return (
      <>
        <AmbientBackground />
        <main className="relative z-10 h-[100dvh] w-full flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full items-center justify-center p-2">
            {/* Maintenance card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md bg-white/85 backdrop-blur-2xl border border-amber-100 rounded-[32px] p-8 shadow-2xl shadow-amber-950/5 text-center flex flex-col items-center gap-6"
            >
              <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center text-5xl shadow-inner border border-amber-100/50 relative animate-bounce">
                 🦊
                 <span className="absolute -top-1 -right-1 text-base">🚧</span>
              </div>
              <div>
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">باكي في استراحة صيانة ممتعة</h2>
                 <div className="inline-flex items-center gap-1.5 bg-amber-100/70 text-amber-800 px-3.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border border-amber-200 mb-4">
                    <span>وضع الصيانة والترقية البيداغوجية 🇩🇿</span>
                 </div>
                 <p className="text-slate-500 text-sm font-bold leading-relaxed mb-1">
                   يُجري بطلنا الفنك باكي مراجعة شاملة للملفات وتحديثاً لقاعدة الأسئلة والمنهاج الوطني لضمان تجربة تعليمية فائقة السرعة!
                 </p>
                 <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                   We are performing essential scheduled database and platform-wide upgrades. BAKI will be back online shortly!
                 </p>
              </div>
              <div className="w-full h-px bg-slate-100"></div>

              <div className="w-full space-y-3">
                 {user ? (
                   <button 
                     onClick={() => logout()}
                     className="w-full py-3.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-black rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer text-xs flex items-center justify-center gap-2"
                   >
                      <span>تسجيل الخروج والعودة لصفحة البدء • Sign Out</span>
                      <span>🚪</span>
                   </button>
                 ) : (
                   <button 
                     onClick={() => setBypassMaintenance(true)}
                     className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-3xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs flex items-center justify-center gap-2"
                   >
                      <span>الذهاب لصفحة التسجيل وتجربة الدخول • Enter Platform</span>
                      <span>🚪</span>
                   </button>
                 )}
              </div>

              <div className="w-full h-px bg-slate-100"></div>

              {/* SLOTH INTERACTIVE LIVE CHAT WIDGET */}
              <div className="flex flex-col items-center gap-3">
                 <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full blur opacity-10 group-hover:opacity-35 transition duration-500"></div>
                    <button 
                      onClick={toggleSupportChat}
                      className="relative p-2 bg-gradient-to-b from-amber-50 to-orange-50/70 rounded-full border border-amber-100 hover:scale-105 active:scale-95 transition-all shadow-md focus:outline-none cursor-pointer flex items-center justify-center"
                      title="تحدث مباشرة مع الإدارة"
                    >
                       <SlothVector />
                       {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 text-[10px] text-white font-black items-center justify-center">
                                {unreadCount}
                             </span>
                          </span>
                       )}
                    </button>
                 </div>
                 
                 <div className="text-center font-sans">
                    <p className="text-xs font-black text-slate-700">دردشة صيانة مباشرة مع الإدارة 🦥💬</p>
                    <p className="text-[10px] font-bold text-slate-400 leading-normal mt-0.5">انقر على صديقنا الكسلان اللطيف لفتح نافذة المحادثة المباشرة مع المسؤول!</p>
                 </div>
              </div>
            </motion.div>

            {/* Support chat drawer / card side-by-side with beautiful motion */}
            <AnimatePresence>
               {supportChatOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: 20 }}
                    className="w-full max-w-md bg-white/95 backdrop-blur-2xl border border-emerald-100 rounded-[32px] p-6 shadow-2xl shadow-emerald-950/5 flex flex-col gap-4 max-h-[500px] h-[500px] font-sans text-right"
                    dir="rtl"
                  >
                     {/* Chat Header */}
                     <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                        <div className="flex items-center gap-2.5 flex-row-reverse w-full">
                           <div className="w-10 h-10 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-2xl shadow-sm">
                              🦥
                           </div>
                           <div className="text-right flex-1">
                              <h3 className="text-sm font-black text-slate-800">مستشار الدعم والمرافقة</h3>
                              <span className="text-[10px] font-bold text-emerald-500 block">● متصل الآن لمساعدتك</span>
                           </div>
                        </div>
                        <button 
                          onClick={toggleSupportChat} 
                          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>

                     {/* Custom Name Identifier */}
                     {!user && (
                        <div className="bg-amber-50/70 border border-amber-100/50 p-3 rounded-2xl flex flex-col gap-1 text-right">
                           <label className="text-[10px] font-bold text-slate-500">من فضلك اكتب اسمك للتعرف عليك وسرعة الرد:</label>
                           <input 
                              type="text" 
                              value={visitorName} 
                              onChange={(e) => {
                                 setVisitorName(e.target.value);
                                 localStorage.setItem('baki_maintenance_visitor_name', e.target.value);
                              }} 
                              placeholder="مثال: محمد الجزائري..." 
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-400 text-right"
                           />
                        </div>
                     )}

                     {/* Scrollable Messages container */}
                     <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50/50 rounded-2xl border border-slate-100/50 custom-scrollbar text-right">
                        {supportMessages.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
                              <span className="text-3xl animate-pulse">💤</span>
                              <p className="text-xs font-bold text-slate-500">أهلاً بك! لا توجد تساؤلات بعد.</p>
                              <p className="text-[10px] font-bold text-slate-400 leading-normal">أرسل استفسارك بخصوص الصيانة أو المشاكل وسيقوم المشرفون بالرد عليك في الحين.</p>
                           </div>
                        ) : (
                           supportMessages.map((msg) => {
                              const isMe = msg.senderId !== 'admin';
                              return (
                                 <div key={msg.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'} space-y-1`}>
                                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 px-2 flex-row-reverse">
                                       <span>{msg.senderName}</span>
                                       <span>• {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-semibold leading-relaxed shadow-sm ${
                                       isMe 
                                         ? 'bg-slate-800 text-white rounded-tl-none text-right' 
                                         : 'bg-emerald-500 text-white rounded-tr-none text-right border border-emerald-400'
                                    }`}>
                                       {msg.text}
                                    </div>
                                 </div>
                              );
                           })
                        )}
                        <div ref={chatEndRef} />
                     </div>

                     {/* Footer Input */}
                     <form onSubmit={handleSendSupportMessage} className="flex gap-2 items-center">
                        <input 
                           type="text" 
                           value={newSupportMsg} 
                           onChange={(e) => setNewSupportMsg(e.target.value)} 
                           placeholder="اكتب استفسارك هنا..." 
                           className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all text-right"
                           dir="rtl"
                        />
                        <button 
                           type="submit" 
                           className="p-3 bg-emerald-500 hover:bg-emerald-600 rounded-2xl text-white transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95"
                        >
                           <Send className="w-4 h-4" />
                        </button>
                     </form>
                  </motion.div>
               )}
            </AnimatePresence>
          </div>
        </main>
      </>
    );
  }

  if (user && isSuspended) {
    return (
      <>
        <AmbientBackground />
        <main className="relative z-10 h-[100dvh] w-full flex flex-col items-center justify-center p-4 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/85 backdrop-blur-2xl border border-red-100 rounded-[32px] p-8 shadow-2xl shadow-red-950/5 text-center flex flex-col items-center gap-6"
          >
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-red-100/50">
               🚫
            </div>
            <div>
               <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">الحساب مجمّد أو معطّل</h2>
               <h3 className="text-lg font-bold text-slate-600 tracking-tight leading-none mb-4">Account Suspended</h3>
               <p className="text-slate-500 text-sm font-medium leading-relaxed mb-1">
                 تم تعليق هذا الحساب بواسطة المشرفين لمخالفة شروط العمل أو اللوائح الأخلاقية.
               </p>
               <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                 This account has been suspended by system administrators for safety or policy violations.
               </p>
            </div>
            <div className="w-full h-px bg-slate-100"></div>
            <div className="text-xs text-slate-400 font-medium">
               Contact support at <a href="mailto:pulsedz14@gmail.com" className="text-indigo-500 underline font-semibold">pulsedz14@gmail.com</a>
            </div>
            <button 
              onClick={() => logout()}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
            >
               تسجيل خروج • Exit Account
            </button>
          </motion.div>
        </main>
      </>
    );
  }

  const goToAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setScreen('auth');
  };

  const handleAuthSuccess = () => {
    if (authMode === 'signup') {
      setScreen('onboarding');
    } else {
      setScreen('dashboard');
    }
  };

  return (
    <>
      <AmbientBackground />
      <Toaster position="bottom-center" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '16px' } }} />
      
      <main className="relative z-10 h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {screen === 'welcome' && (
            <WelcomeScreen 
              key="welcome"
              onStart={() => goToAuth('signup')} 
              onLogin={() => goToAuth('login')} 
            />
          )}
          {screen === 'auth' && (
            <AuthScreen 
              key="auth"
              initialMode={authMode} 
              onSuccess={handleAuthSuccess}
              onBack={() => setScreen('welcome')}
            />
          )}
          {screen === 'onboarding' && (
            <OnboardingScreen 
              key="onboarding"
              onComplete={() => setScreen('dashboard')} 
            />
          )}
          {screen === 'dashboard' && (
            <DashboardScreen key="dashboard" onNavigateAdmin={() => setScreen('admin')} />
          )}
          {screen === 'admin' && (
            <RoleGuard key="admin" allowedRoles={['admin', 'moderator']}>
                <AdminScreen onBack={() => setScreen('dashboard')} />
            </RoleGuard>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 z-50 flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          {screen === 'auth' && (
            <>
              <span className="text-xs font-medium tracking-wide text-gray-400">{language === 'ar' ? 'صُنع بكل' : 'Made with'} </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="text-red-400 text-sm"
              >
                ❤️
              </motion.div>
              <span className="text-xs font-medium tracking-wide text-gray-400">{language === 'ar' ? 'أكاديمية باكي' : ' BAKI ACADEMY'}</span>
            </>
          )}
        </motion.div>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

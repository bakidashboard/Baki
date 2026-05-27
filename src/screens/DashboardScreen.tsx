import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { BakiMascot } from '../components/BakiMascot';
import { BakiGreenLogo } from '../components/BakiGreenLogo';
import { NotificationCenter } from '../components/NotificationCenter';
import { LessonReader } from '../components/LessonReader';
import { BAKI_AVATARS, getRandomAvatar } from '../data/avatars';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { UserList } from '../components/UserList';
import { toast } from 'react-hot-toast';
import { ref, onValue, set, push } from 'firebase/database';
import { database } from '../firebase/config';
import { 
  Settings, 
  LogOut, 
  Globe, 
  Bell, 
  Sparkles, 
  Cpu, 
  Activity, 
  X, 
  ChevronRight, 
  User, 
  Check, 
  Sliders,
  Shield,
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  Lock,
  Play,
  FileCheck,
  Megaphone,
  CheckCircle2,
  Bookmark,
  UploadCloud,
  HelpCircle,
  Brain,
  ChevronLeft,
  Plus
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  url?: string;
  order: number;
  layoutType?: 'editorial' | 'cards' | 'bento' | 'split';
  articleContent?: string;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  lessons?: Record<string, Lesson>;
  status: 'Published' | 'Draft';
  students: number;
  type: 'video' | 'file';
  audience: 'public' | 'subscribers';
}

interface PlatformUpdate {
  id: string;
  title: string;
  body: string;
  category: 'feature' | 'security' | 'announcement';
  audience: 'all' | 'subscribers';
  timestamp: number;
}

export function DashboardScreen({ onNavigateAdmin }: { onNavigateAdmin: () => void }) {
    const { t, language, toggleLanguage, dir } = useLanguage();
    const { user, profile, logout, isAdmin, isModerator, isPremium, refreshClaims, updateUserAvatar } = useAuth();
    
    // Student Dashboard Tabs: 'courses' | 'updates' | 'membership'
    const [dashTab, setDashTab] = useState<'courses' | 'updates' | 'membership'>('courses');
    
    // Immersive Reading State
    const [activeReadingLesson, setActiveReadingLesson] = useState<any | null>(null);
    const [activeReadingCardIdx, setActiveReadingCardIdx] = useState<number>(0);

    // AI Advisor Drag & Drop + Analysis states are removed (moved to admin)

    // Dynamic database states
    const [courses, setCourses] = useState<Course[]>([]);
    const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
    const [userProgress, setUserProgress] = useState<Record<string, Record<string, boolean>>>({});
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingUpdates, setLoadingUpdates] = useState(true);

    // Deep lecture explore state
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    // UI Local States
    const [isHubOpen, setIsHubOpen] = useState(false);
    const [hubTab, setHubTab] = useState<'preferences' | 'control'>('preferences');
    const [mascotEmotion, setMascotEmotion] = useState<'happy' | 'thinking' | 'celebrate'>('happy');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [activeAccent, setActiveAccent] = useState<'mint' | 'sky' | 'gold'>('mint');

    // Accent style map for beautiful tactile dopamine feedback
    const accentColors = {
      mint: {
        text: 'text-emerald-500',
        bg: 'bg-[#58cc02]',
        border: 'border-emerald-500/20',
        glow: 'shadow-emerald-500/10',
        gradient: 'from-[#58CC02] to-[#78E625]',
      },
      sky: {
        text: 'text-sky-500',
        bg: 'bg-sky-500',
        border: 'border-sky-500/20',
        glow: 'shadow-sky-500/10',
        gradient: 'from-[#38BDF8] to-[#0ea5e9]',
      },
      gold: {
        text: 'text-amber-500',
        bg: 'bg-[#ffc800]',
        border: 'border-amber-500/20',
        glow: 'shadow-amber-500/10',
        gradient: 'from-[#FFC800] to-[#FF9600]',
      }
    };

    const currentStyle = accentColors[activeAccent];

    // Listen to lessons & study courses
    useEffect(() => {
       const coursesRef = ref(database, 'courses');
       const unsub = onValue(coursesRef, (snapshot) => {
          if (snapshot.exists()) {
             const data = snapshot.val();
             const parsed = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
             })).filter(c => c.status === 'Published'); // standard students only see Published courses
             setCourses(parsed);
          } else {
             setCourses([]);
          }
          setLoadingCourses(false);
       });

       return () => {};
    }, []);

    // Listen to Platform announcements
    useEffect(() => {
       const updatesRef = ref(database, 'updates');
       const unsub = onValue(updatesRef, (snapshot) => {
          if (snapshot.exists()) {
             const data = snapshot.val();
             const parsed = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
             })).sort((a, b) => b.timestamp - a.timestamp);
             setUpdates(parsed);
          } else {
             setUpdates([]);
          }
          setLoadingUpdates(false);
       });

       return () => {};
    }, []);

    // Listen to this user's study progress in real-time
    useEffect(() => {
       if (!user?.uid) return;
       const progressRef = ref(database, `usersProgress/${user.uid}`);
       const unsub = onValue(progressRef, (snapshot) => {
          if (snapshot.exists()) {
             setUserProgress(snapshot.val());
          } else {
             setUserProgress({});
          }
       });

       return () => {};
    }, [user?.uid]);

    const cycleMascotEmotion = () => {
      const emotions: ('happy' | 'thinking' | 'celebrate')[] = ['happy', 'thinking', 'celebrate'];
      const currentIndex = emotions.indexOf(mascotEmotion);
      const nextIndex = (currentIndex + 1) % emotions.length;
      setMascotEmotion(emotions[nextIndex]);
    };

    // Simulated Premium Activation (updates user's role and immediately triggers refreshClaims)

    const handleUpgradeSimulated = async () => {
       if (!user?.uid) return;
       const toastId = toast.loading(language === 'ar' ? 'جاري تفعيل العضوية الذهبية... ✨' : 'Activating premium Gold pass... ✨');
       
       try {
          // Write premium marker dynamically to Firebase RTDB user profile
          await set(ref(database, `users/${user.uid}/role`), 'premium');
          
          // Re-verify and trigger immediate JWT tokens reload
          await refreshClaims();
          
          setMascotEmotion('celebrate');
          toast.success(
             language === 'ar' 
               ? 'تهانينا! لقد حصلت على العضوية المميزة بنجاح 🎉' 
               : 'Congratulations! Premium membership successfully unlocked! 🎉', 
             { id: toastId, duration: 5000 }
          );
       } catch (err: any) {
          toast.error("Upgrade error: " + err.message, { id: toastId });
       }
    };


    // Toggle study completion for lessons
    const handleToggleLessonComplete = async (courseId: string, lessonId: string, currentlyCompleted: boolean) => {
       if (!user?.uid) return;
       
       const nextVal = !currentlyCompleted;
       await set(ref(database, `usersProgress/${user.uid}/${courseId}/${lessonId}`), nextVal ? true : null);

       if (nextVal) {
          setMascotEmotion('celebrate');
          toast.success(
             language === 'ar' 
               ? 'رائع! أكملت دراسة هذا الدرس بمثابرة 🥳' 
               : 'Brilliant! Lesson completed with determination! 🥳',
             { duration: 2000 }
          );
       } else {
          setMascotEmotion('thinking');
       }
    };

    return (
        <div className="min-h-screen w-full flex flex-col bg-[#FAF9F5] overflow-hidden relative font-sans select-none" dir={dir}>
            
            {/* Ambient Animated blob structures matching Apple/Headspace aesthetic */}
            <div className="absolute top-24 -left-32 w-96 h-96 bg-[#58cc02]/5 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse"></div>
            <div className="absolute bottom-24 -right-32 w-96 h-96 bg-amber-200/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
            
            {/* Top Minimalist Navigation Header Bar */}
            <header className="flex-none w-full bg-white/60 backdrop-blur-md border-b border-slate-200/40 px-6 py-4 flex items-center justify-between z-30">
                <div className="flex items-center gap-3">
                    <BakiGreenLogo size={32} />
                    <span className="font-black text-xs text-slate-800 tracking-widest hidden sm:block">BAKI ACADEMY</span>
                </div>

                <div className="flex items-center gap-2">
                    <NotificationCenter />
                    <Button 
                        onClick={logout} 
                        variant="ghost" 
                        className="text-xs h-9 px-3 bg-white hover:bg-rose-50 hover:text-rose-650 border border-slate-200 rounded-full transition-colors font-bold text-slate-600"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsHubOpen(true)}
                        className="w-10 h-10 rounded-full bg-white overflow-hidden shadow-sm hover:shadow border border-slate-200 flex items-center justify-center transition-all cursor-pointer relative"
                    >
                        {profile?.photoURL || user?.photoURL ? (
                           <img src={profile?.photoURL || user?.photoURL} referrerPolicy="no-referrer" alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                           <User className="w-4 h-4 text-slate-600" />
                        )}
                        <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full ${isPremium ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`}></span>
                    </motion.button>
                </div>
            </header>

            {/* Immersive Viewport-Aware Responsive Workspace Grid */}
            <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 overflow-y-auto">
                
                {/* Left/Main Column: Welcome, Mascot & Study Dashboard */}
                <div className="flex-1 flex flex-col gap-6">
                    
                    {/* Welcome banner + Companion Mascot Playground */}
                    <div className="bg-white border border-slate-200/60 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative shadow-sm overflow-hidden bg-gradient-to-tr from-white to-slate-50/20">
                         
                         {/* Companion Play zone */}
                         <div className="flex flex-col items-center select-none" onClick={cycleMascotEmotion}>
                             <div className="relative cursor-pointer group">
                                <motion.div 
                                    className="absolute -inset-4 bg-[#58cc02]/5 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500"
                                />
                                <BakiMascot size={120} emotion={mascotEmotion} />
                             </div>
                             <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mt-1.5 bg-slate-100/80 px-2.5 py-1 rounded-full cursor-pointer hover:bg-slate-200">
                                {language === 'ar' ? 'انقر للعب! 🦊' : 'Click to play! 🦊'}
                             </span>
                         </div>

                         {/* Welcome Text in beautiful pairing typography */}
                         <div className="flex-1 text-center md:text-left md:pl-4 space-y-2">
                             <h1 className="text-2xl md:text-3.5xl font-black text-slate-800 tracking-tight leading-tight">
                                 {language === 'ar' ? 'مرحباً بك مجدداً،' : 'Welcome back,'}
                                 <br />
                                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-[#58CC02] to-amber-500 font-black">
                                     {user?.displayName || user?.email?.split('@')[0] || 'Scholar'}
                                 </span>
                             </h1>
                             <p className="text-xs md:text-sm text-slate-400 font-bold max-w-sm leading-normal">
                                 {language === 'ar' ? 'أهلاً بك في فخرنا التعليمي المتصل. كافة الدروس والتحديثات تبث حية الآن!' : 'Explore courses, track accomplishments, and review system updates.'}
                             </p>
                             
                             <div className="flex items-center justify-center md:justify-start gap-2 pt-1 flex-wrap">
                                {isPremium ? (
                                   <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-amber-500" /> Platinum Pass Active
                                   </span>
                                ) : (
                                   <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full animate-bounce">
                                      🌍 Free Student Account
                                   </span>
                                )}
                             </div>
                         </div>
                    </div>

                    {/* DUAL WORKSPACE TABS SWITCHER */}
                    {!selectedCourse ? (
                      <>
                        <div className="flex bg-slate-200/50 p-1.5 rounded-2.5xl max-w-full border border-slate-200/40 overflow-x-auto gap-1 self-start w-full whitespace-nowrap scrollbar-none">
                           <button 
                             onClick={() => setDashTab('courses')}
                             className={`flex-1 py-3 text-center font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                               dashTab === 'courses' 
                                 ? 'bg-white text-slate-800 shadow-sm' 
                                 : 'text-slate-400 hover:text-slate-600'
                             }`}
                           >
                              <BookOpen className="w-4 h-4 text-[#58cc02]" />
                              <span>{language === 'ar' ? 'المقررات والدروس' : 'Study Courses'}</span>
                           </button>
                            <button 
                              onClick={() => setDashTab('updates')}
                             className={`flex-1 py-3 text-center font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                               dashTab === 'updates' 
                                 ? 'bg-white text-indigo-650 shadow-sm' 
                                 : 'text-slate-400 hover:text-slate-600'
                             }`}
                           >
                              <Megaphone className="w-4 h-4" />
                              <span>{language === 'ar' ? 'التحديثات المستمرة' : 'Platform updates'}</span>
                           </button>
                           <button 
                             onClick={() => setDashTab('membership')}
                             className={`flex-1 py-3 text-center font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                               dashTab === 'membership' 
                                 ? 'bg-white text-amber-600 shadow-sm' 
                                 : 'text-slate-400 hover:text-slate-600'
                             }`}
                           >
                              <Award className="w-4 h-4 text-amber-500" />
                              <span>{language === 'ar' ? 'العضوية والاشتراك' : 'Gold Membership'}</span>
                           </button>
                        </div>

                        {/* TAB CONTENTS CONTAINER */}
                        <div className="space-y-4">
                           {dashTab === 'courses' && (
                              loadingCourses ? (
                                <div className="text-center p-12 bg-white/60 border rounded-3xl text-slate-400 font-bold animate-pulse">Scanning Course Database...</div>
                              ) : courses.length === 0 ? (
                                <div className="text-center p-12 bg-white border border-dashed rounded-[32px] text-slate-400 font-semibold p-8 space-y-2">
                                    <p>No active courses have been posted by the administrator yet.</p>
                                    <p className="text-xs">Access "CMS Mission Control" in settings if you are an Admin to publish courses.</p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   {courses.map((course) => {
                                      const lessonsObj = course.lessons || {};
                                      const lessonsList = Object.keys(lessonsObj);
                                      const lessonsLength = lessonsList.length;

                                      // Calculate completed lessons count under this course
                                      const completedCount = lessonsList.filter((lessonsKey) => 
                                         userProgress[course.id]?.[lessonsKey] === true
                                      ).length;

                                      const percent = lessonsLength > 0 ? Math.round((completedCount / lessonsLength) * 100) : 0;
                                      const isLocked = course.audience === 'subscribers' && !isPremium && !isAdmin;

                                      return (
                                         <div 
                                           key={course.id} 
                                           className="p-5 bg-white border border-slate-200/50 rounded-[32px] flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                                         >
                                            <div className="space-y-3">
                                               <div className="flex justify-between items-start gap-4">
                                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                                                    course.type === 'file' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-indigo-50 text-indigo-500 border-indigo-100'
                                                  }`}>
                                                     {course.type === 'file' ? <FileCheck className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                                  </div>

                                                  {isLocked ? (
                                                     <div className="bg-amber-50 rounded-xl p-1.5 border border-amber-200 text-amber-550 flex items-center justify-center" title="Subscribers Exclusive Pass">
                                                        <Lock className="w-4 h-4 animate-pulse" />
                                                     </div>
                                                  ) : (
                                                     course.audience === 'subscribers' && (
                                                        <div className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-0.5" title="Holographic gold subscription benefits active">
                                                           <Award className="w-3 h-3 text-amber-500 animate-bounce" /> UNLOCKED
                                                        </div>
                                                     )
                                                  )}
                                               </div>

                                               <div className="space-y-1">
                                                  <h4 className="font-extrabold text-[#111111] text-base leading-snug group-hover:text-[#58cc02] transition-colors">{course.title}</h4>
                                                  <p className="text-xs text-slate-400 font-bold leading-normal truncate">{course.description || 'No description supplied.'}</p>
                                               </div>
                                            </div>

                                            {/* Micro Progress component inside the card (tactile and cute) */}
                                            <div className="mt-5 space-y-2 pt-2 border-t border-slate-100/50">
                                               <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
                                                  <span>{lessonsLength} lessons</span>
                                                  {isLocked ? (
                                                     <span className="text-amber-600 font-bold">Gold Locked 🌟</span>
                                                  ) : (
                                                     <span className="text-emerald-500">{percent}% Completed</span>
                                                  )}
                                               </div>

                                               {!isLocked && lessonsLength > 0 && (
                                                  <div className="flex items-center justify-center">
                                                     <div className="relative w-14 h-14 flex items-center justify-center">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                           <circle cx="28" cy="28" r="22" className="stroke-slate-100 fill-transparent" strokeWidth="4" />
                                                           <motion.circle 
                                                             cx="28" 
                                                             cy="28" 
                                                             r="22" 
                                                             className="stroke-[#58cc02] fill-transparent" 
                                                             strokeWidth="4" 
                                                             strokeLinecap="round" 
                                                             strokeDasharray={2 * Math.PI * 22} 
                                                             initial={{ strokeDashoffset: 2 * Math.PI * 22 }} 
                                                             animate={{ strokeDashoffset: (2 * Math.PI * 22) - (percent / 100) * (2 * Math.PI * 22) }} 
                                                             transition={{ type: "spring", stiffness: 85, damping: 15 }} 
                                                           />
                                                        </svg>
                                                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-800">{percent}%</span>
                                                     </div>
                                                  </div>
                                               )}

                                               <div className="pt-2">
                                                  {isLocked ? (
                                                     <Button 
                                                       variant="outline" 
                                                       onClick={() => { setDashTab('membership'); toast("Upgrade simulated instantly!", { icon: "🌟" }) }}
                                                       className="w-full py-2.5 rounded-2xl hover:bg-slate-50 border border-slate-200 text-xs font-black text-slate-650 flex items-center justify-center gap-1.5"
                                                     >
                                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                                        <span>Unlock Gold Access</span>
                                                     </Button>
                                                  ) : (
                                                     <Button 
                                                       variant="primary" 
                                                       onClick={() => setSelectedCourse(course)}
                                                       className="w-full py-2.5 rounded-2xl text-xs font-black"
                                                     >
                                                        <span>Start Learning</span>
                                                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                                     </Button>
                                                  )}
                                               </div>
                                            </div>
                                         </div>
                                      );
                                   })}
                                </div>
                              )
                           )}

                           {dashTab === 'updates' && (
                              loadingUpdates ? (
                                <div className="text-center p-12 bg-white/60 border rounded-3xl text-slate-400 font-bold animate-pulse">Reticulating bulletin feeds...</div>
                              ) : updates.length === 0 ? (
                                <div className="text-center p-12 bg-white border border-dashed rounded-[32px] text-slate-400 font-semibold p-8">
                                    No announcements posted yet. You are all up to date.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                   {updates.map((post) => {
                                      // If post is subscribers-only and user is not premium, hide body or filter. Let's make it show locked blur content! This encourages subscription.
                                      const isLock = post.audience === 'subscribers' && !isPremium && !isAdmin;

                                      return (
                                         <div key={post.id} className="p-5 bg-white border border-slate-200/50 rounded-3xl space-y-3 shadow-none relative">
                                            <div className="flex items-center gap-2 flex-wrap">
                                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                                 post.category === 'security' ? 'bg-red-50 text-red-600 border-red-100' :
                                                 'bg-indigo-50 text-indigo-650 border-indigo-100'
                                               }`}>
                                                  {post.category}
                                               </span>
                                               <span className="text-[10px] text-slate-400 font-bold">
                                                  {new Date(post.timestamp).toLocaleDateString()}
                                               </span>

                                               {post.audience === 'subscribers' && (
                                                  <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase">
                                                     🌟 gold bulletin
                                                  </span>
                                               )}
                                            </div>

                                            <h4 className="text-base font-extrabold text-[#111111]">{post.title}</h4>
                                            
                                            {isLock ? (
                                               <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/60 flex flex-col items-center justify-center text-center space-y-2">
                                                  <Lock className="w-5 h-5 text-amber-500 animate-pulse" />
                                                  <p className="text-xs font-black text-slate-500">Premium Broadcast. Unlock Gold membership tab to read details!</p>
                                               </div>
                                            ) : (
                                               <p className="text-sm font-medium text-slate-505 leading-relaxed whitespace-pre-wrap">{post.body}</p>
                                            )}
                                         </div>
                                      );
                                   })}
                                </div>
                              )
                           )}

                           {dashTab === 'membership' && (
                              <div className="bg-white border border-slate-200/60 rounded-[32px] p-6 shadow-sm space-y-6 relative overflow-hidden">
                                  {/* Holographic glowing layout ornament */}
                                  <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-tr from-amber-200/20 to-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                  <div className="flex items-center gap-3.5">
                                      <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-200/40 text-amber-500">
                                         <Award className="w-6 h-6 text-amber-500" />
                                      </div>
                                      <div>
                                         <h4 className="text-lg font-black text-slate-800 leading-none">
                                            {language === 'ar' ? 'بطاقة العضوية الذهبيةالمميزة 🌟' : 'Premium Gold Fellowship 🌟'}
                                         </h4>
                                         <span className="text-[11px] text-amber-600 font-bold uppercase tracking-wider block mt-1">
                                            {isPremium ? 'MEMBER LEVEL: PLATINUM' : 'MEMBER LEVEL: STANDARD FREE'}
                                         </span>
                                      </div>
                                  </div>

                                  <p className="text-xs text-slate-500 leading-relaxed font-bold">
                                     {language === 'ar' 
                                       ? 'افتح كافة المواد والمحاضرات الذهبية المغلقة، واحصل على مميزات الذكاء الاصطناعي الفوري، ونظام التحديثات المتقدم بالمنصة بنقرة واحدة.' 
                                       : 'Gain access to all locked subscriber courses, exclusive updates bulletins, and advanced companion mechanics.'}
                                  </p>

                                  <div className="space-y-2">
                                     <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>Unlimited access to Subscriber-only channels Course sequence mapped</span>
                                     </div>
                                     <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>Instant priority updates and announcements bulletins access</span>
                                     </div>
                                  </div>

                                  <div className="pt-2">
                                     {isPremium ? (
                                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-sm gap-2">
                                           <span>✓ You are a Premium Subscriber! Enjoy absolute access! 🌟</span>
                                        </div>
                                     ) : (
                                        <button 
                                          onClick={handleUpgradeSimulated}
                                          className="w-full bg-gradient-to-tr from-amber-400 to-[#FF9600] text-[#111111] font-black text-sm py-4 rounded-2xl shadow-xl shadow-amber-500/10 hover:shadow-2xl hover:shadow-amber-500/20 active:translate-y-[2px] transition-all cursor-pointer flex items-center justify-center gap-2.5"
                                        >
                                           <Sparkles className="w-5 h-5 text-white animate-pulse" />
                                           <span>{language === 'ar' ? 'تفعيل العضوية الذهبية مجاناً (محاكاة)' : 'Activate Gold Pass Now (Simulated)'}</span>
                                        </button>
                                     )}
                                  </div>
                              </div>
                           )}
                        </div>
                      </>
                    ) : (
                      /* LESSON SEQUENCE LECTURES DRILLDOWN */
                      <div className="space-y-4">
                         <div className="flex items-center justify-between gap-4 p-4 bg-white border border-slate-200/50 rounded-2xl">
                             <div className="flex items-center gap-2.5">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Classroom Index</span>
                             </div>

                             <button 
                               onClick={() => setSelectedCourse(null)}
                               className="px-3.5 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-650 cursor-pointer flex items-center gap-1 shrink-0"
                             >
                                <ChevronRight className="w-4 h-4 mr-0.5 rotate-180" />
                                <span>{language === 'ar' ? 'الرجوع للمقررات' : 'Menu Courses'}</span>
                             </button>
                         </div>

                         {/* Parent Course details & Live sequence progress meter (delicate and gentle) */}
                         {(() => {
                            const lessonsObj = selectedCourse.lessons || {};
                            const lessonsList = Object.keys(lessonsObj).map(key => ({
                              id: key,
                              ...(lessonsObj as any)[key]
                            })).sort((a, b) => (a.order || 0) - (b.order || 0));

                            const completedCount = lessonsList.filter((l) => 
                               userProgress[selectedCourse.id]?.[l.id] === true
                            ).length;

                            const percent = lessonsList.length > 0 ? Math.round((completedCount / lessonsList.length) * 100) : 0;

                            return (
                               <div className="space-y-4">
                                  <div className="bg-white border rounded-[32px] p-6 shadow-sm space-y-4 relative overflow-hidden bg-gradient-to-tr from-white to-slate-50/50">
                                      <div className="space-y-1">
                                         <h3 className="text-xl font-black text-slate-800 leading-tight">{selectedCourse.title}</h3>
                                         <p className="text-xs font-bold text-slate-450 leading-normal max-w-lg">{selectedCourse.description}</p>
                                      </div>

                                      {/* Gorgeous, premium circular radial progress gauge and student metrics tracker */}
                                      <div className="flex flex-col md:flex-row items-center gap-6 pt-4 border-t border-slate-100 bg-emerald-50/30 p-5 rounded-3xl mt-2 border border-emerald-100/40">
                                          {/* Circular Gauge */}
                                          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                                             <svg className="w-full h-full transform -rotate-90">
                                                <circle 
                                                  cx="48" 
                                                  cy="48" 
                                                  r="38" 
                                                  className="stroke-slate-200 fill-transparent" 
                                                  strokeWidth="6"
                                                />
                                                <motion.circle 
                                                  cx="48" 
                                                  cy="48" 
                                                  r="38" 
                                                  className="stroke-[#58cc02] fill-transparent" 
                                                  strokeWidth="6"
                                                  strokeLinecap="round"
                                                  strokeDasharray={2 * Math.PI * 38}
                                                  initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                                                  animate={{ strokeDashoffset: (2 * Math.PI * 38) - (percent / 100) * (2 * Math.PI * 38) }}
                                                  transition={{ type: "spring", stiffness: 85, damping: 15 }}
                                                />
                                             </svg>
                                             {/* Central Text */}
                                             <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-sans">
                                                <span className="text-2xl font-black text-slate-800 tracking-tight leading-none">{percent}%</span>
                                                <span className="text-[10px] font-black text-[#58cc02] uppercase tracking-wider mt-0.5">{completedCount}/{lessonsList.length}</span>
                                             </div>
                                             {/* Accent rotating orbit */}
                                             {percent > 0 && percent < 100 && (
                                                <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s' }}>
                                                   <div className="absolute top-0.5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-lime-400 border border-white shadow-md animate-pulse" />
                                                </div>
                                             )}
                                          </div>

                                          {/* Content Description */}
                                          <div className="flex-1 space-y-1.5 text-center md:text-right">
                                             <div className="inline-flex items-center gap-1.5 bg-emerald-100/60 text-emerald-700 px-3 py-0.5 rounded-full text-[10px] font-black border border-emerald-200/40">
                                                <Award className="w-3 h-3 text-[#58cc02] animate-bounce" />
                                                <span>{percent === 100 ? 'تم تحصيل كامل الدروس! 🎉' : 'مسار باكي البيداغوجي'}</span>
                                             </div>
                                             <h4 className="font-extrabold text-[#111111] leading-snug text-xs">
                                                {percent === 100 
                                                   ? 'تهانينا الحارة! لقد أنهيت هذا المقطع البيداغوجي بنجاح مطلق وبجاهزية كاملة.' 
                                                   : 'بإنهائك لكل درس، ترتفع جاهزيتك العلمية للامتحانات الوطنية وفق المنهاج.'}
                                             </h4>
                                             <p className="text-[10px] font-bold text-slate-400">
                                                تتضمن دروس باكي الذكية ملخصات تفصيلية وبطاقات تفاعلية مصممة خصيصاً للتفوق والنجاح.
                                             </p>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Sequence checklist */}
                                  <div className="space-y-3">
                                     {lessonsList.length === 0 ? (
                                        <div className="text-center p-12 bg-white/50 border rounded-2xl text-slate-400 font-bold">
                                           No lessons built. Please access settings and Launch console as an administrator to attach some study content!
                                        </div>
                                     ) : (
                                        lessonsList.map((lesson, idx) => {
                                           const isCompleted = userProgress[selectedCourse.id]?.[lesson.id] === true;
                                           return (
                                              <div 
                                                key={lesson.id}
                                                onClick={() => {
                                                   setActiveReadingLesson(lesson);
                                                   setActiveReadingCardIdx(0);
                                                }} 
                                                className={`p-4 rounded-3xl border transition-all flex items-center justify-between gap-4 ${
                                                  isCompleted 
                                                    ? 'bg-emerald-50/40 border-emerald-100/60 shadow-inner' 
                                                    : 'bg-white border-slate-201 hover:border-slate-300'
                                                }`}
                                              >
                                                 <div className="flex items-start gap-3.5">
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); handleToggleLessonComplete(selectedCourse.id, lesson.id, isCompleted); }}
                                                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-colors shrink-0 cursor-pointer ${
                                                        isCompleted 
                                                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                                                          : 'bg-slate-50 border-slate-250 hover:bg-slate-100 text-slate-400'
                                                      }`}
                                                    >
                                                       {isCompleted ? <Check className="w-5 h-5 stroke-[3px]" /> : <Play className="w-4 h-4 ml-0.5" />}
                                                    </button>
                                                    <div>
                                                       <h5 className={`font-extrabold text-sm leading-tight flex items-center gap-2 ${isCompleted ? 'text-emerald-900 line-through' : 'text-slate-850'}`}>
                                                          <span>{lesson.title}</span>
                                                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border px-1.5 py-0.2 rounded-md">{lesson.duration || '12 mins'}</span>
                                                       </h5>
                                                       <p className="text-xs font-bold text-slate-400 mt-1 max-w-sm">{lesson.description || 'No summary details given.'}</p>
                                                       {lesson.url && (
                                                         <div className="pt-2">
                                                            <a href={lesson.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] font-black text-indigo-650 hover:underline inline-flex items-center gap-0.5 bg-indigo-50 border border-indigo-100/40 px-2 py-0.5 rounded-md">
                                                               <Bookmark className="w-3 h-3" /> Get Reference File
                                                            </a>
                                                         </div>
                                                       )}
                                                    </div>
                                                 </div>

                                                 <button 
                                                    onClick={(e) => { e.stopPropagation(); handleToggleLessonComplete(selectedCourse.id, lesson.id, isCompleted); }}
                                                    className={`w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                                                      isCompleted 
                                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-transparent'
                                                    }`}
                                                 >
                                                    <Check className="w-3.5 h-3.5 stroke-[3.5px]" />
                                                 </button>
                                              </div>
                                           );
                                        })
                                     )}
                                  </div>
                               </div>
                            );
                         })()}
                      </div>
                    )}
                </div>

                {/* Right Column: Recent Students Scroll Cabinet */}
                <div className="flex-1 md:max-w-xs flex flex-col overflow-hidden">
                    <UserList />
                </div>
            </div>



            {/* BAKI CONTROL HUB: iOS-style Popover/Drawer Panel */}
            <AnimatePresence>
                {isHubOpen && (
                    <>
                        {/* Soft backdrop blur */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHubOpen(false)}
                            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 overflow-hidden"
                        />

                        {/* Animated panel structure (sliding drawer on mobile, centered overlay container on desktop) */}
                        <motion.div
                            initial={{ opacity: 0, y: 100, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 100, scale: 0.95 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-[480px] bg-white rounded-t-[32px] md:rounded-[32px] border border-slate-100 shadow-2xl z-50 overflow-hidden outline-none max-h-[85vh] flex flex-col"
                        >
                            {/* Drag handle or Indicator line */}
                            <div className="flex justify-center pt-3 pb-1 md:hidden">
                                <div className="w-12 h-1 bg-slate-200 rounded-full"></div>
                            </div>

                            {/* Panel Header */}
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-none bg-slate-50/50">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                                        <Settings className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-extrabold text-[#1A1A1A] text-base leading-none">
                                            {language === 'ar' ? 'مركز التحكم والخيارات' : 'Control Hub & Options'}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 block font-mono">
                                            {user?.email}
                                        </span>
                                    </div>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setIsHubOpen(false)}
                                    className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </motion.button>
                            </div>

                            {/* Dual tab Navigation switcher (System settings vs. Admin details) */}
                            <div className="p-3 mx-6 mt-4 mb-2 bg-slate-100/80 rounded-2xl flex items-center gap-1">
                                <button
                                    onClick={() => setHubTab('preferences')}
                                    className={`flex-1 py-2 rounded-xl text-center font-bold text-xs transition-all ${
                                        hubTab === 'preferences'
                                            ? 'bg-white text-slate-800 shadow-sm font-black'
                                            : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    {language === 'ar' ? 'الإعدادات الشخصية' : 'Preferences'}
                                </button>
                                {(isAdmin || isModerator) && (
                                    <button
                                        onClick={() => setHubTab('control')}
                                        className={`flex-1 py-2 rounded-xl text-center font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                                            hubTab === 'control'
                                                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50/50 font-black'
                                                : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        <Shield className="w-3.5 h-3.5 text-indigo-505" />
                                        <span>{language === 'ar' ? 'لوحة المطور' : 'Mission Control'}</span>
                                    </button>
                                )}
                            </div>

                            {/* Content Body */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5 hide-scrollbar">
                                <AnimatePresence mode="wait">
                                    {hubTab === 'preferences' ? (
                                        <motion.div
                                            key="preferences"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="flex flex-col gap-4"
                                        >
                                            {/* Profile Identity - Avatar Selection & Upload */}
                                            <div className="bg-slate-50/50 rounded-3xl p-5 border-2 border-slate-100 flex flex-col gap-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-5 h-5 text-indigo-500" />
                                                    <span className="font-black text-sm text-slate-800">
                                                        {language === 'ar' ? 'الهوية الشخصية' : 'Profile Identity'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-col items-center gap-6">
                                                   <div className="relative group">
                                                      <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-white shadow-xl bg-slate-100 relative">
                                                         {profile?.photoURL || user?.photoURL ? (
                                                            <img src={profile?.photoURL || user?.photoURL} alt="Profile" className="w-full h-full object-cover" />
                                                         ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-300">
                                                               {(profile?.displayName || user?.displayName || '?').charAt(0).toUpperCase()}
                                                            </div>
                                                         )}
                                                         
                                                         {/* Dropzone Overlay */}
                                                         <div 
                                                            className="absolute inset-0 bg-indigo-600/60 backdrop-blur-sm flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-[10px] font-black text-center p-2"
                                                            onDragOver={(e) => e.preventDefault()}
                                                            onDrop={async (e) => {
                                                               e.preventDefault();
                                                               const file = e.dataTransfer.files[0];
                                                               if (file && file.type.startsWith('image/')) {
                                                                  // Simulated upload - in real app we'd upload to Firebase Storage
                                                                  const reader = new FileReader();
                                                                  reader.onload = async (event) => {
                                                                     const url = event.target?.result as string;
                                                                     // Update user profile in Firebase
                                                                     const { updateProfile } = await import('firebase/auth');
                                                                     if (user) {
                                                                        await updateProfile(user, { photoURL: url });
                                                                        toast.success(language === 'ar' ? 'تم تحديث الصورة!' : 'Identity updated!');
                                                                        refreshClaims();
                                                                     }
                                                                  };
                                                                  reader.readAsDataURL(file);
                                                               }
                                                            }}
                                                         >
                                                            <UploadCloud className="w-6 h-6 mb-1" />
                                                            <span>DROP HERE</span>
                                                         </div>
                                                      </div>
                                                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center text-white shadow-lg">
                                                         <Sparkles className="w-4 h-4 fill-current" />
                                                      </div>
                                                   </div>

                                                   <div className="w-full space-y-3">
                                                      <div className="flex items-center justify-between">
                                                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select AI Companion Avatar</span>
                                                         <button 
                                                            onClick={async () => {
                                                               if (user) {
                                                                  await updateUserAvatar(getRandomAvatar(user.uid));
                                                               }
                                                            }}
                                                            className="text-[10px] font-black text-indigo-500 hover:underline"
                                                         >
                                                            Randomize
                                                         </button>
                                                      </div>
                                                      
                                                      <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar p-1">
                                                         {BAKI_AVATARS.map((avatar) => (
                                                            <button
                                                               key={avatar.id}
                                                               onClick={async () => {
                                                                  if (user) {
                                                                     await updateUserAvatar(avatar.url);
                                                                  }
                                                               }}
                                                               className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${(profile?.photoURL || user?.photoURL) === avatar.url ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-white'}`}
                                                            >
                                                               <img src={avatar.url} alt={avatar.id} className="w-full h-full object-cover" />
                                                            </button>
                                                         ))}
                                                      </div>
                                                   </div>
                                                </div>
                                            </div>

                                            {/* Preferences Card - Language Selection */}
                                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
                                                <div className="flex items-center justify-between mb-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-slate-500" />
                                                        <span className="font-bold text-sm text-slate-700">
                                                            {language === 'ar' ? 'لغة التطبيق' : 'App Language'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-emerald-500">
                                                        {language === 'ar' ? 'نشطة' : 'Active'}
                                                    </span>
                                                </div>

                                                {/* segment switches */}
                                                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                                                    <button
                                                        onClick={() => language !== 'ar' && toggleLanguage()}
                                                        className={`py-2 rounded-lg text-center font-black text-xs transition-all ${
                                                            language === 'ar' 
                                                                ? 'bg-[#58CC02] text-white shadow-sm' 
                                                                : 'text-slate-505 hover:text-slate-700'
                                                        }`}
                                                    >
                                                        العربية
                                                    </button>
                                                    <button
                                                        onClick={() => language !== 'en' && toggleLanguage()}
                                                        className={`py-2 rounded-lg text-center font-black text-xs transition-all ${
                                                            language === 'en' 
                                                                ? 'bg-[#58CC02] text-white shadow-sm' 
                                                                : 'text-slate-505 hover:text-slate-700'
                                                        }`}
                                                    >
                                                        English
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tactile accent palette picker */}
                                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Sparkles className="w-4 h-4 text-slate-500" />
                                                    <span className="font-bold text-sm text-slate-700">
                                                        {language === 'ar' ? 'السمة التفاعلية' : 'Tactile Accent Theme'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2.5">
                                                    {(['mint', 'sky', 'gold'] as const).map((accent) => (
                                                        <button
                                                            key={accent}
                                                            onClick={() => setActiveAccent(accent)}
                                                            className={`flex-1 py-3 rounded-xl border font-extrabold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer capitalize ${
                                                              activeAccent === accent
                                                                ? 'border-slate-800 bg-slate-800 text-white shadow-md'
                                                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                                                            }`}
                                                        >
                                                            <span className={`w-2.5 h-2.5 rounded-full ${accentColors[accent].bg}`}></span>
                                                            <span>{accent}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Preferences Card - Notifications Toggle */}
                                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Bell className="w-4 h-4 text-slate-500" />
                                                    <span className="font-bold text-sm text-slate-700">
                                                        {language === 'ar' ? 'التنبيهات الذكية' : 'Smart Notifications'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer outline-none border border-transparent ${
                                                        notificationsEnabled ? 'bg-[#58CC02]' : 'bg-slate-200'
                                                    }`}
                                                >
                                                    <motion.div 
                                                        animate={{ x: notificationsEnabled ? 20 : 2 }}
                                                        className="w-5 h-5 bg-white rounded-full shadow absolute top-[1px]" 
                                                    />
                                                </button>
                                            </div>

                                            {/* Account Summary block */}
                                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm overflow-hidden">
                                                    {profile?.photoURL || user?.photoURL ? (
                                                        <img src={profile?.photoURL || user?.photoURL} alt="Av" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user?.displayName?.charAt(0).toUpperCase() || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-sm">{profile?.displayName || user?.displayName || 'Student'}</div>
                                                    <div className="text-xs text-slate-400 font-medium font-mono">{user?.email}</div>
                                                </div>
                                                <div className="ml-auto bg-slate-100/85 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide text-slate-500 uppercase">
                                                    {isAdmin ? 'Admin' : isModerator ? 'Staff' : isPremium ? 'Premium' : 'Student'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="control"
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="flex flex-col gap-4"
                                        >
                                            <div className="bg-indigo-50/40 rounded-2xl p-4 border border-indigo-100/50 flex flex-col gap-3">
                                                <div className="flex items-center gap-2 text-indigo-700">
                                                    <Cpu className="w-4.5 h-4.5 animate-pulse" />
                                                    <span className="font-black text-sm tracking-tight text-indigo-900">
                                                        {language === 'ar' ? 'صلاحيات المشرف تفاعلية' : 'Administrive Core'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-indigo-600/90 leading-normal font-medium">
                                                    {language === 'ar' 
                                                        ? 'صلاحيات المشرف تفاعلية ومؤكدة. يمكنك قيادة قاعدة البيانات ونشر المناهج بمرونة.' 
                                                        : 'Enterprise privileges verified in real-time. Direct operations ready.'}
                                                </p>
                                            </div>

                                            {/* Quick Action Widgets */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => { setIsHubOpen(false); onNavigateAdmin(); }}
                                                    className="p-4 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all text-left flex flex-col gap-2.5 group cursor-pointer"
                                                >
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform">
                                                        <LayoutDashboard className="w-4.5 h-4.5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-xs">
                                                            Mission Control
                                                        </div>
                                                        <span className="text-[10px] text-slate-405 font-medium">Launch Console</span>
                                                    </div>
                                                </button>

                                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left flex flex-col gap-2.5">
                                                    <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/10">
                                                        <Activity className="w-4.5 h-4.5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-xs text-slate-700">
                                                            {language === 'ar' ? 'حالة المنصة' : 'Cloud Status'}
                                                        </div>
                                                        <span className="text-[10px] text-teal-650 font-extrabold flex items-center gap-1 px-1">
                                                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping"></span>
                                                            Connected
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Advanced administrative parameters info */}
                                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/80 flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                                    <span>Authentication Engine</span>
                                                    <span className="text-emerald-500 font-bold">Firebase Auth</span>
                                                </div>
                                                <div className="h-px bg-slate-100"></div>
                                                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                                    <span>Database Connection</span>
                                                    <span className="text-emerald-500 font-bold">Realtime Live</span>
                                                </div>
                                                <div className="h-px bg-slate-100"></div>
                                                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                                    <span>Operations Claim</span>
                                                    <span className="text-indigo-650 font-bold uppercase">{isAdmin ? 'Super Admin' : 'Staff Moderator'}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Safe and Visible Destructive Logout Block */}
                            <div className="px-6 py-4 border-t border-slate-100 flex-none bg-slate-50/40 pb-6 md:pb-4">
                                <Button 
                                    onClick={() => { setIsHubOpen(false); logout(); }}
                                    variant="ghost" 
                                    className="w-full text-red-600 bg-red-50 hover:bg-red-105 border border-red-200/50 hover:border-red-200 font-extrabold flex items-center justify-center gap-2 py-3 rounded-2xl cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>{language === 'ar' ? 'تسجيل الخروج الآمن' : 'Secure Logout'}</span>
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeReadingLesson && (
                    <LessonReader
                      courseId={selectedCourse?.id || ''}
                      lesson={activeReadingLesson}
                      isPremium={isPremium || isAdmin}
                      isCompleted={userProgress[selectedCourse?.id || '']?.[activeReadingLesson.id] === true}
                      onClose={() => setActiveReadingLesson(null)}
                      onComplete={(completed) => handleToggleLessonComplete(selectedCourse?.id || '', activeReadingLesson.id, !completed)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

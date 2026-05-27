
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { FlexySubscription } from './FlexySubscription';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Lock,
  Play,
  FileText,
  Volume2
} from 'lucide-react';
import Markdown from 'react-markdown';

interface LessonReaderProps {
  courseId: string;
  lesson: any;
  onClose: () => void;
  onComplete: (completed: boolean) => void;
  isPremium: boolean;
  isCompleted: boolean;
}

export const LessonReader = ({ 
  courseId, 
  lesson, 
  onClose, 
  onComplete, 
  isPremium,
  isCompleted 
}: LessonReaderProps) => {
  const { language, dir } = useLanguage();
  const [readingProgress, setReadingProgress] = useState(0);
  const [showSubscription, setShowSubscription] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(120); // 2 minutes simulation
  const [canComplete, setCanComplete] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const icons = [
    <Brain className="w-16 h-16 text-slate-100/50" />,
    <Sparkles className="w-16 h-16 text-slate-100/50" />,
    <BookOpen className="w-16 h-16 text-slate-100/50" />,
    <CheckCircle2 className="w-16 h-16 text-slate-100/50" />
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setCanComplete(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFinish = () => {
    if (!canComplete && !isCompleted) return;
    onComplete(true);
    onClose();
  };

  const isLocked = lesson.audience === 'subscribers' && !isPremium;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#FAF9F5] flex flex-col font-sans"
      dir={dir}
    >
      {/* Top Bar */}
      <header className="flex-none p-4 md:p-6 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-800 leading-tight truncate max-w-md">{lesson.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                {lesson.duration || '12 mins'}
              </span>
              {isCompleted && (
                <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {language === 'ar' ? 'تم الانجاز' : 'COMPLETED'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
              {language === 'ar' ? 'التقدم في الدرس' : 'Lesson Progress'}
            </span>
            <div className="h-1.5 w-32 bg-slate-100 rounded-full mt-1 overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: canComplete ? '100%' : `${((120 - timeRemaining) / 120) * 100}%` }}
                 className="h-full bg-[#58cc02]"
               />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12 pb-32">
          
          {isLocked ? (
            <div className="text-center space-y-8 py-12">
               <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[32px] flex items-center justify-center mx-auto border-2 border-amber-100 shadow-xl shadow-amber-500/10">
                  <Lock className="w-12 h-12 stroke-[2.5px]" />
               </div>
               <div className="max-w-md mx-auto space-y-3">
                  <h3 className="text-2xl font-black text-slate-800">
                    {language === 'ar' ? 'هذا المحتوى خاص بالمشتركين فقط 💎' : 'Subscribers Only Content 💎'}
                  </h3>
                  <p className="text-sm font-bold text-slate-450 leading-relaxed">
                    {language === 'ar' 
                      ? 'عذراً، هذا الدرس جزء من المنهج الذهبي المتميز. اشترك الآن في باكي للوصول الفوري لكل المواد.' 
                      : 'Sorry, this lesson is part of the premium Gold cycle. Subscribe to Baki for instant access to all materials.'}
                  </p>
               </div>
               
               <div className="max-w-md mx-auto">
                 <FlexySubscription onComplete={() => window.location.reload()} />
               </div>
            </div>
          ) : (
            <>
              {/* Lesson Hero */}
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#58cc02]/10 text-[#58cc02] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#58cc02]/20">
                  <BookOpen className="w-3 h-3" /> {language === 'ar' ? 'محتوى تعليمي حقيقي' : 'Real Educational Content'}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-[1.1]">
                  {lesson.title}
                </h1>
                <p className="text-lg font-bold text-slate-400 leading-relaxed max-w-2xl">
                  {lesson.description || 'Welcome to this deep-dive lesson provided by Baki Academy.'}
                </p>
              </div>

              {/* Dynamic Content Rendering */}
              <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:text-slate-600 prose-p:leading-relaxed relative">
                 <div className="bg-white border rounded-[32px] p-8 md:p-12 shadow-sm min-h-[400px] relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-10 -right-10 opacity-30 transform rotate-12">
                       {icons[Math.floor(Math.random() * icons.length)]}
                    </div>
                    <div className="absolute bottom-10 -left-10 opacity-30 transform -rotate-12">
                       {icons[Math.floor(Math.random() * icons.length)]}
                    </div>

                    {lesson.articleContent ? (
                       <Markdown>{lesson.articleContent}</Markdown>
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                             <Clock className="w-8 h-8 text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-400">Content loading from pedagogical cloud...</p>
                       </div>
                    )}
                 </div>
              </div>

              {/* Challenge Quiz Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-50 border border-indigo-100 rounded-[32px] p-8 space-y-6"
              >
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-indigo-900 flex items-center gap-3">
                       <Brain className="w-6 h-6 text-indigo-500" />
                       {language === 'ar' ? 'تحدي الفهم السريع' : 'Quick Understanding Challenge'}
                    </h3>
                    <div className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                       {language === 'ar' ? 'اختبار تفاعلي' : 'Interactive Quiz'}
                    </div>
                 </div>

                 {quizScore === null ? (
                   <div className="space-y-4">
                      <p className="text-sm font-bold text-indigo-700/80">
                         {language === 'ar' ? 'هل فهمت المحتوى السابق؟ أجب على هذا السؤال السريع:' : 'Did you understand the content? Answer this quick question:'}
                      </p>
                      <button 
                         onClick={() => setQuizScore(1)}
                         className="w-full text-left p-4 bg-white rounded-2xl border border-indigo-100 hover:border-indigo-300 transition-all font-bold text-sm text-indigo-900"
                      >
                         {language === 'ar' ? 'الخيار الأول (صحيح)' : 'Option 1 (Correct)'}
                      </button>
                      <button 
                         onClick={() => setQuizScore(0)}
                         className="w-full text-left p-4 bg-white rounded-2xl border border-indigo-100 hover:border-indigo-300 transition-all font-bold text-sm text-indigo-900"
                      >
                         {language === 'ar' ? 'الخيار الثاني' : 'Option 2'}
                      </button>
                   </div>
                 ) : (
                    <div className={`p-4 rounded-2xl ${quizScore === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                       <p className="font-black text-sm">
                          {quizScore === 1 
                             ? (language === 'ar' ? 'إجابة صحيحة! أحسنت متابعة الدرس.' : 'Correct answer! Excellent progress.') 
                             : (language === 'ar' ? 'إجابة غير صحيحة. راجع المحتوى وحاول مجدداً!' : 'Incorrect. Review the content and try again!')}
                       </p>
                    </div>
                 )}
              </motion.div>

              {/* Completion Logic */}
              <div className="pt-12 border-t border-slate-200">
                 {!canComplete && !isCompleted ? (
                   <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-amber-500">
                           <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">
                            {language === 'ar' ? 'لا تتسرع في إنهاء الدرس' : 'Don\'t rush the lesson'}
                          </p>
                          <p className="text-xs font-bold text-slate-400">
                             {language === 'ar' ? 'يجب البقاء في الدرس لمدة دقيقتين على الأقل للفهم والتحصيل' : 'You must stay in the lesson for at least 2 minutes for full comprehension.'}
                          </p>
                        </div>
                      </div>
                      <div className="text-center md:text-right shrink-0">
                         <span className="text-xl font-black text-amber-600 font-mono">00:{String(timeRemaining).padStart(2, '0')}</span>
                         <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">
                            {language === 'ar' ? 'متبقي من الوقت' : 'Time Remaining'}
                         </p>
                      </div>
                   </div>
                 ) : (
                   <motion.div 
                     initial={{ scale: 0.95, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px] text-center space-y-6 shadow-lg shadow-emerald-500/5"
                   >
                     <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircle2 className="w-8 h-8 stroke-[3.5px]" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl font-black text-emerald-900">
                          {language === 'ar' ? 'أحسنت! أنت مستعد الآن' : 'Well done! You are ready now'}
                        </h3>
                        <p className="text-xs font-bold text-emerald-700/70">
                          {isCompleted 
                            ? (language === 'ar' ? 'لقد أكملت هذا الدرس مسبقاً بنجاح.' : 'You have already successfully completed this lesson.')
                            : (language === 'ar' ? 'لقد قضيت الوقت الكافي. يمكنك الآن وسم الدرس كمكتمل.' : 'You have spent enough time. You can now mark this as completed.')}
                        </p>
                     </div>
                     <Button 
                       onClick={handleFinish}
                       className="px-12 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-xl shadow-emerald-500/20"
                     >
                        {language === 'ar' ? 'إنهاء وحفظ التقدم • ✅' : 'Finish & Save Progress • ✅'}
                     </Button>
                   </motion.div>
                 )}
              </div>

              {/* Upsell if not premium */}
              {!isPremium && !isCompleted && (
                <div className="mt-12 p-8 bg-gradient-to-tr from-amber-50 to-white border border-amber-100 rounded-[32px] space-y-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl"></div>
                   <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md text-amber-500 border border-amber-100 italic font-black text-2xl">G</div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-lg font-black text-slate-800">
                          {language === 'ar' ? 'هل تود تسريع مسارك الدراسي؟' : 'Want to accelerate your study path?'}
                        </h4>
                        <p className="text-xs font-bold text-slate-400 mt-1">
                           {language === 'ar' ? 'اشترك في باكي غولد وستحصل على حلول نموذجية مفصلة بالذكاء الاصطناعي.' : 'Subscribe to Baki Gold and get detailed model solutions with AI.'}
                        </p>
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={() => setShowSubscription(true)}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-6 py-3 font-black border-none shadow-lg shadow-amber-500/20"
                      >
                         {language === 'ar' ? 'اشترك الآن 🌟' : 'Subscribe Now 🌟'}
                      </Button>
                   </div>

                   <AnimatePresence>
                     {showSubscription && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-6"
                        >
                           <FlexySubscription />
                        </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Progress Tracker at bottom */}
      <footer className="flex-none p-4 bg-white border-t border-slate-100 flex items-center justify-center gap-2">
         <div className="flex items-center gap-1.5 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Powered by Baki Cloud AI</span>
         </div>
      </footer>
    </motion.div>
  );
};

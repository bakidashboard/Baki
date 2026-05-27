import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { ref, set, push } from 'firebase/database';
import { database } from '../../firebase/config';
import { 
  Sparkles, 
  Shield, 
  Brain, 
  FileCheck, 
  UploadCloud,
  ChevronRight
} from 'lucide-react';

export function AdminAIAdvisor() {
    const { t, language } = useLanguage();
    const { user, refreshClaims } = useAuth();
    
    // AI Advisor states
    const [droppedFile, setDroppedFile] = useState<{ b64: string; name: string; type: string } | null>(null);
    const [isDragOver, setIsDragOver] = useState<boolean>(false);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [advisorResult, setAdvisorResult] = useState<any | null>(null);
    const [advisorError, setAdvisorError] = useState<string | null>(null);
    const [additionalPrompt, setAdditionalPrompt] = useState<string>('');
    const [academicLevel, setAcademicLevel] = useState<string>('3AS - بكالوريا');
    const [subjectCategory, setSubjectCategory] = useState<string>('العلوم الفيزيائية والأكاديمية');
    const [advisorStage, setAdvisorStage] = useState<string>('');
    const [curQuizIndex, setCurQuizIndex] = useState<number>(0);
    const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
    const [homeworkRevealed, setHomeworkRevealed] = useState<boolean>(false);

    const handleFileSelection = (file: File) => {
       const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
       if (!allowed.includes(file.type)) {
          toast.error('صيغة الملف غير مدعومة! الرجاء رفع ملفات PDF أو صور PNG/JPG فقط');
          return;
       }
       if (file.size > 8 * 1024 * 1024) { // 8MB limit
          toast.error('حجم الملف كبير جداً! الحد الأقصى المسموح به هو 8 ميغابايت');
          return;
       }

       const reader = new FileReader();
       reader.onload = () => {
          const resultStr = reader.result as string;
          const commaIdx = resultStr.indexOf(',');
          const base64Segment = commaIdx > -1 ? resultStr.substring(commaIdx + 1) : resultStr;
          setDroppedFile({
             name: file.name,
             type: file.type,
             b64: base64Segment
          });
          toast.success('تم قراءة وضغط المستند بنجاح! 📂');
       };
       reader.onerror = () => {
          toast.error('فشلت قراءة ملف المستند.');
       };
       reader.readAsDataURL(file);
    };

    const handleSaveAiCourseToDb = async () => {
       if (!advisorResult || !user?.uid) {
          toast.error('الرجاء تسجيل الدخول وإنشاء خطة بامتياز الفنك أولاً!');
          return;
       }

       const toastId = toast.loading('جاري صياغة وحفظ المقرر العلمي المحدث بالذكاء الاصطناعي في قاعدة البيانات... 💾');

       try {
          const newCourseRef = push(ref(database, 'courses'));
          const courseId = newCourseRef.key || `course_ai_${Date.now()}`;

          const formattedLessons: Record<string, any> = {};
          advisorResult.studyNodes?.forEach((node: any, index: number) => {
             const lsnId = `lesson_${index + 1}`;
             formattedLessons[lsnId] = {
                id: lsnId,
                title: node.title,
                description: node.explanation,
                duration: node.timeRequired || "20 mins",
                layoutType: "bilingual",
                articleContent: `### 📖 ${node.title}\n\n${node.explanation}\n\n---\n\n#### 💡 التشبيه البصري والتبسيط الحسي لباكي:\n${node.analogy}\n\n---\n\n#### 🦊 نصيحة بطل الفنك للتفوق:\n*${node.mascotComment}*\n\n---\n\n*المنهاج الدراسي لجمهورية الجزائر الديمقراطية الشعبية 🇩🇿*`
             };
          });

          const newbornCourse = {
             id: courseId,
             title: advisorResult.curriculumTitle || "مقرر دراسي بيداغوجي مطور بالذكاء الاصطناعي",
             description: advisorResult.curriculumOverview || "مقرر معد ومبسط خصيصاً للتفوق ومرافقة المنهاج الوطني الجزائري.",
             level: academicLevel,
             subject: subjectCategory,
             isPremiumOnly: false,
             lessons: formattedLessons,
             enrolledCount: 1,
             status: 'Draft',
             createdAt: Date.now()
          };

          await set(ref(database, `courses/${courseId}`), newbornCourse);
          toast.success('مُبارك! تم دمج المقرر المطوَّر بنجاح في قاعدة البيانات كمسودة! 🎉', { id: toastId, duration: 6000 });
          setAdvisorResult(null);
          setDroppedFile(null);
       } catch (err: any) {
          toast.error("فشل حفظ المقرر: " + err.message, { id: toastId });
       }
    };

    return (
       <div className="space-y-6 max-w-5xl mx-auto pb-12">
          {/* AI Advisor Card Setup */}
          {!advisorResult && !isAnalyzing && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-white border border-slate-200/60 p-6 md:p-8 rounded-[36px] shadow-sm space-y-6 relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/10"
             >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                   <div className="space-y-1 text-right md:text-left md:flex-1">
                      <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-emerald-200">
                         <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                         <span>مستشار باكي بطل الفنك 🇩🇿 - بوابة المسؤولين</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight mt-1">
                         صانع المناهج والملخصات الذكيّة
                      </h3>
                      <p className="text-xs font-bold text-slate-400">
                         ارفع أي ملف (PDF أو صورة لدرسك) ليقوم الذكاء الاصطناعي بصياغة خطة دراسية متكاملة متوافقة مع المنهاج الجزائري الرسمي.
                      </p>
                   </div>
                   
                   <div className="w-16 h-16 rounded-2.5xl bg-emerald-50 flex items-center justify-center border border-emerald-100/40 shrink-0 self-center">
                      <Brain className="w-8 h-8 text-emerald-500 animate-bounce" />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wide block">المستوى الدراسي المستهدف</label>
                      <select 
                         value={academicLevel}
                         onChange={(e) => setAcademicLevel(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl px-4 py-3 text-xs font-black focus:outline-none focus:border-[#58cc02] focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                         <option value="3AS - بكالوريا شُعبة علوم تجريبية / رياضيات / تقني">بكالوريا شُعبة علوم تجريبية / رياضيات / تقني 🎓</option>
                         <option value="2AS - السنة الثانية ثانوي">السنة الثانية ثانوي 📚</option>
                         <option value="1AS - السنة الأولى ثانوي جذع مشترك">السنة الأولى ثانوي جذع مشترك 🌱</option>
                         <option value="4AM - السنة الرابعة متوسط">السنة الرابعة متوسط 🌟</option>
                      </select>
                   </div>

                   <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wide block">تصنيف المادة العلمية</label>
                      <select 
                         value={subjectCategory}
                         onChange={(e) => setSubjectCategory(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-201 text-slate-700 rounded-2xl px-4 py-3 text-xs font-black focus:outline-none focus:border-[#58cc02] focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                         <option value="العلوم الفيزيائية">العلوم الفيزيائية والأكاديمية ⚡</option>
                         <option value="الرياضيات">الرياضيات والتحليل الجبري 📐</option>
                         <option value="علوم الطبيعة والحياة">علوم الطبيعة والحياة 🧬</option>
                         <option value="العلوم الإسلامية">العلوم الإسلامية 🕌</option>
                         <option value="اللغة العربية وآدابها">اللغة العربية وآدابها 📜</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-wide block">توجيهات إضافية (اختياري)</label>
                   <textarea 
                      value={additionalPrompt}
                      onChange={(e) => setAdditionalPrompt(e.target.value)}
                      placeholder="مثال: ركز على براهين الظواهر الكهربائية RC، أو بسط المفاهيم مستهدفاً التلاميذ ذوي الفهم البصري..."
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl px-4 py-3 focus:outline-none focus:border-[#58cc02] focus:bg-white transition-all resize-none"
                   />
                </div>

                <div 
                   onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                   onDragLeave={() => setIsDragOver(false)}
                   onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelection(file);
                   }}
                   onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*,application/pdf';
                      input.onchange = (e: any) => {
                         const file = e.target.files?.[0];
                         if (file) handleFileSelection(file);
                      };
                      input.click();
                   }}
                   className={`border-2 border-dashed rounded-[28px] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      isDragOver 
                        ? 'bg-emerald-55/20 border-[#58cc02] scale-[0.99] shadow-inner' 
                        : droppedFile 
                          ? 'bg-emerald-50/10 border-emerald-300' 
                          : 'bg-slate-50/30 border-slate-200/70 hover:bg-slate-55/20 hover:border-[#58cc02]/50'
                   }`}
                >
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                      droppedFile ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-400'
                   }`}>
                      {droppedFile ? <FileCheck className="w-6 h-6 animate-pulse" /> : <UploadCloud className="w-6 h-6 text-[#58cc02]" />}
                   </div>

                   <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-slate-700">
                         {droppedFile 
                            ? `تم تجهيز مستند: ${droppedFile.name}` 
                            : 'قم بجر وإفلات مستند الدرس هنا أو انقر للتصفح'}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400">
                         يقبل ملفات الصور وملفات الـ PDF.
                      </p>
                   </div>
                </div>

                <Button 
                   variant="primary"
                   disabled={!droppedFile}
                   onClick={async () => {
                      if (!droppedFile) return;
                      setIsAnalyzing(true);
                      setAdvisorError(null);
                      setAdvisorResult(null);

                      const stages = [
                         "جاري قراءة وتحليل المستند بالكامل... 📂",
                         "مراجعة المطبوعات الرسمية ومقارنتها بالمنهاج الجزائري المتكامل... 🇩🇿",
                         "رسم الخريطة البيداغوجية وبناء المخطط السلوكي للدرس... 📐",
                         "توليد تبسيطات فيزيائية ممتعة وتصميم أسئلة الاختبار الذاتي... 🧠",
                         "باكي بطل الفنك يضع اللمسات السحرية الأخيرة للتفوق... 🦊✨"
                      ];

                      let stIdx = 0;
                      setAdvisorStage(stages[0]);
                      const stageTimer = setInterval(() => {
                         stIdx = (stIdx + 1) % stages.length;
                         setAdvisorStage(stages[stIdx]);
                      }, 3200);

                      try {
                         const res = await fetch('/api/gemini/analyze-document', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                               fileB64: droppedFile.b64,
                               fileName: droppedFile.name,
                               mimeType: droppedFile.type,
                               additionalInstructions: `Level: ${academicLevel}, Subject: ${subjectCategory}. ${additionalPrompt}`
                            })
                         });

                         clearInterval(stageTimer);
                         const data = await res.json();
                         
                         if (!res.ok || data.error) throw new Error(data.error || 'Server processing error');
                         if (data.payload) {
                            setAdvisorResult(data.payload);
                            toast.success('تم صياغة المنهج بنجاح! 🎯');
                         } else {
                            throw new Error('لم يكتمل التنسيق التلقائي للمستند.');
                         }
                      } catch (err: any) {
                         clearInterval(stageTimer);
                         setAdvisorError(err.message || 'فشلت معالجة المستند.');
                         toast.error(err.message || 'Error parsing document');
                      } finally {
                         setIsAnalyzing(false);
                      }
                   }}
                   className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                >
                   <Sparkles className="w-5 h-5" />
                   <span>حلل واصنع المسودة التعليمية الآن ✨</span>
                </Button>
             </motion.div>
          )}

          {isAnalyzing && (
             <div className="bg-white border p-12 rounded-[36px] text-center space-y-6 flex flex-col items-center justify-center relative overflow-hidden h-[400px]">
                <div className="relative w-32 h-32 flex items-center justify-center">
                   <svg className="w-full h-full animate-spin">
                      <circle cx="64" cy="64" r="54" className="stroke-[#58cc02]/15 fill-transparent" strokeWidth="6" />
                      <circle cx="64" cy="64" r="54" className="stroke-[#58cc02] fill-transparent" strokeWidth="6" strokeLinecap="round" strokeDasharray="339" strokeDashoffset="120" />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center text-3xl animate-pulse">🦊</div>
                </div>
                <div className="space-y-3 max-w-md">
                   <h4 className="text-lg font-black text-slate-800 tracking-tight leading-snug animate-pulse">{advisorStage}</h4>
                   <p className="text-xs font-bold text-slate-400">نظام باكي المتصل بقواعد البيانات الأكاديمية يقوم بمعالجة المدخلات...</p>
                </div>
             </div>
          )}

          {advisorResult && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-[28px] text-white shadow-md">
                   <div className="space-y-1 text-right">
                      <span className="text-[10px] font-black uppercase opacity-75">خطة بيداغوجية مقترحة</span>
                      <h3 className="text-lg font-black tracking-tight">{advisorResult.curriculumTitle}</h3>
                      <p className="text-xs text-emerald-100 font-bold">{advisorResult.algerianCurriculumStandard}</p>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button onClick={handleSaveAiCourseToDb} className="px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-black transition-all shadow-sm">حفظ كمسودة 💾</button>
                      <button onClick={() => { setAdvisorResult(null); setDroppedFile(null); }} className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 rounded-xl text-xs font-black border border-emerald-500/30 text-white transition-all">إلغاء ❌</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                   <div className="md:col-span-2 bg-white border border-slate-200/50 p-6 rounded-[28px] shadow-sm space-y-3">
                      <h4 className="font-extrabold text-[#111111] text-base">نظرة عامة</h4>
                      <p className="text-xs font-bold text-slate-650 leading-relaxed">{advisorResult.curriculumOverview}</p>
                   </div>
                   <div className="bg-emerald-50/20 border border-emerald-100 p-6 rounded-[28px] shadow-sm space-y-3">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                         <Shield className="w-5 h-5 text-[#58cc02]" />
                         <span className="font-extrabold text-sm text-slate-800">بيان الصحة العلمية</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{advisorResult.verificationReport}</p>
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="font-extrabold text-[#111111] text-base">خطوات المقرر الدراسي</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {advisorResult.studyNodes?.map((node: any, index: number) => (
                         <div key={index} className="bg-white border border-slate-200/50 p-5 rounded-[28px] shadow-sm flex gap-4">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 border flex items-center justify-center font-bold text-emerald-700 shrink-0">{index + 1}</div>
                            <div className="space-y-2">
                               <h5 className="font-extrabold text-sm text-slate-800">{node.title}</h5>
                               <p className="text-xs font-semibold text-slate-500 leading-relaxed">{node.explanation}</p>
                               <div className="bg-emerald-50/25 rounded-2xl p-3 border border-emerald-100/50 flex gap-2.5">
                                  <div className="text-sm shrink-0">🦊</div>
                                  <p className="text-[10px] font-bold text-emerald-800 italic leading-relaxed">{node.mascotComment}</p>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}
       </div>
    );
}

import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Video, 
  FileText, 
  Image as ImageIcon, 
  X, 
  BookOpen, 
  Bell, 
  Users, 
  Globe, 
  ShieldCheck, 
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Cpu,
  Sparkles,
  Award
} from 'lucide-react';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { ref, onValue, set, push } from 'firebase/database';
import { database } from '../../firebase/config';
import { motion, AnimatePresence } from 'motion/react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "12 mins" or "8 pages"
  url?: string;
  order: number;
}

interface Course {
  id?: string;
  title: string;
  description?: string;
  lessonsCount?: number;
  lessons?: Record<string, Lesson> | Lesson[];
  status: 'Published' | 'Draft';
  students: number;
  type: 'video' | 'file';
  audience: 'public' | 'subscribers';
}

interface PlatformUpdate {
  id?: string;
  title: string;
  body: string;
  category: 'feature' | 'security' | 'announcement';
  audience: 'all' | 'subscribers';
  timestamp: number;
}

export function AdminContent() {
  const [activeTab, setActiveTab] = useState<'courses' | 'updates'>('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Progress Bar / Step Loader State (beautiful, lightweight, CPU-friendly)
  const [taskProgress, setTaskProgress] = useState<{
    active: boolean;
    label: string;
    value: number;
    sublabel?: string;
  }>({ active: false, label: '', value: 0 });

  // Deep view: Lesson Manager state for a selected course
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);

  // Modal State - Course
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseStatus, setCourseStatus] = useState<'Published' | 'Draft'>('Draft');
  const [courseType, setCourseType] = useState<'video' | 'file'>('video');
  const [courseAudience, setCourseAudience] = useState<'public' | 'subscribers'>('public');

  // Modal State - Lesson
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonDuration, setLessonDuration] = useState('10 mins');
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonLayoutType, setLessonLayoutType] = useState<'editorial' | 'cards' | 'bento' | 'split'>('editorial');
  const [lessonArticleContent, setLessonArticleContent] = useState('');

  // Modal State - Update Bulletin
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<PlatformUpdate | null>(null);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateBody, setUpdateBody] = useState('');
  const [updateCategory, setUpdateCategory] = useState<'feature' | 'security' | 'announcement'>('feature');
  const [updateAudience, setUpdateAudience] = useState<'all' | 'subscribers'>('all');

  // Load and listen to course list
  useEffect(() => {
    const coursesRef = ref(database, 'courses');
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCourses(parsed);
      } else {
        // Seed initial mock courses if no courses exist so the user sees some beautiful starting data
        const initialMock: Record<string, Course> = {
          "mock_1": {
            title: "Advanced English grammar & layout styling",
            description: "Learn advanced editorial composition with beautiful typography rules, RTL styles, and elegant vocabulary flow.",
            status: "Published",
            students: 1420,
            type: "file",
            audience: "subscribers",
            lessons: {
              "l1": {
                id: "l1",
                 title: "Welcome to Premium Arabic Composition",
                 description: "Getting to know RTL flows, font pairs, and visual weight distributions.",
                 duration: "15 mins",
                 order: 1
              }
            }
          },
          "mock_2": {
            title: "Visual Design & Creative Fennec companions",
            description: "A friendly introduction to colors, gamification psychology, and crafting memorable companion mascots like BAKI.",
            status: "Published",
            students: 4200,
            type: "video",
            audience: "public",
            lessons: {
              "l1": {
                id: "l1",
                title: "Intro To Gamified UX Systems",
                description: "Why emotional connection keeps students motivated and active daily.",
                duration: "8 mins",
                order: 1
              },
              "l2": {
                id: "l2",
                title: "Styling Inputs with microinteractions",
                description: "Using bounces, soft glow rings, and live progress feedbacks.",
                duration: "12 mins",
                order: 2
              }
            }
          }
        };
        set(coursesRef, initialMock);
      }
      setLoadingCourses(false);
    }, (error) => {
      console.error("Error loading courses: ", error);
      setLoadingCourses(false);
    });

    return () => {};
  }, []);

  // Load and listen to Platform Updates node
  useEffect(() => {
    const updatesRef = ref(database, 'updates');
    const unsubscribe = onValue(updatesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const parsed = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => b.timestamp - a.timestamp);
        setUpdates(parsed);
      } else {
        // Seed standard onboarding updates
        const initialMock: Record<string, PlatformUpdate> = {
          "up_1": {
            title: "🌟 BAKI Luxury v2.0 - Soft UI Integration",
            body: "Welcome to the luxurious new experience! We have introduced dynamic fennec mascot expressions, physical buttons depth, and a streamlined premium subscription unlock scheme. Study materials are now fully interactive.",
            category: "feature",
            audience: "all",
            timestamp: Date.now() - 3600000 * 2
          },
          "up_2": {
            title: "🛡️ Advanced Realtime Integrity & Security Upgrades",
            body: "We have fully activated our end-to-end security audit logging, ensuring student records are strictly private, safe, and immune to unauthorized network scraping. Access is secured by JWT claims verified dynamically.",
            category: "security",
            audience: "subscribers",
            timestamp: Date.now() - 3600000 * 24
          }
        };
        set(updatesRef, initialMock);
      }
      setLoadingUpdates(false);
    }, (error) => {
      console.error("Error loading updates: ", error);
      setLoadingUpdates(false);
    });

    return () => {};
  }, []);

  // Helper: Trigger a beautiful simulated progress loader
  const runProgressSimulation = (label: string, sublabel: string, callback: () => Promise<void>) => {
    setTaskProgress({ active: true, label, value: 5, sublabel });
    
    // Smooth increment intervals
    let curVal = 5;
    const interval = setInterval(() => {
      curVal += Math.floor(Math.random() * 15) + 5;
      if (curVal >= 92) {
        clearInterval(interval);
      } else {
        setTaskProgress(prev => ({ ...prev, value: curVal }));
      }
    }, 80);

    setTimeout(async () => {
      try {
        await callback();
        setTaskProgress(prev => ({ ...prev, value: 100, sublabel: "Task successfully processed! 🎉" }));
        setTimeout(() => {
          setTaskProgress({ active: false, label: '', value: 0 });
        }, 300);
      } catch (err: any) {
        clearInterval(interval);
        setTaskProgress({ active: false, label: '', value: 0 });
        toast.error("Operation failed: " + err.message);
      }
    }, 900);
  };

  // --- COURSE CRUD ACTIONS ---
  const handleOpenCourseModal = (course: Course | null = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseTitle(course.title);
      setCourseDesc(course.description || '');
      setCourseStatus(course.status);
      setCourseType(course.type);
      setCourseAudience(course.audience || 'public');
    } else {
      setEditingCourse(null);
      setCourseTitle('');
      setCourseDesc('');
      setCourseStatus('Draft');
      setCourseType('video');
      setCourseAudience('public');
    }
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    const payload = {
      title: courseTitle,
      description: courseDesc,
      status: courseStatus,
      type: courseType,
      audience: courseAudience,
      students: editingCourse?.students || 0,
      lessons: editingCourse?.lessons || {}
    };

    runProgressSimulation(
      editingCourse ? "Updating Course Core..." : "Registering New Course...",
      "Connecting to Live Realtime cluster and writing schemas securely",
      async () => {
        if (editingCourse && editingCourse.id) {
          const courseRef = ref(database, `courses/${editingCourse.id}`);
          await set(courseRef, payload);
          toast.success("Course details modified successfully! ✨");
        } else {
          const coursesRef = ref(database, 'courses');
          const newCourseRef = push(coursesRef);
          await set(newCourseRef, payload);
          toast.success("New course drafted and published live! 🚀");
        }
        setIsCourseModalOpen(false);
      }
    );
  };

  const handleDeleteCourse = (id?: string) => {
    if (!id) return;
    if (!window.confirm('Are you strictly sure you want to delete this course and all associated lessons permanently?')) return;

    runProgressSimulation(
      "Purging Course Material...",
      "Clearing course entity, orphaned sub-keys, and active assets safely.",
      async () => {
        await set(ref(database, `courses/${id}`), null);
        toast.success("Course deleted from absolute register.");
        if (selectedCourseForLessons?.id === id) {
          setSelectedCourseForLessons(null);
        }
      }
    );
  };

  // --- DEEP LESSONS CRUD ACTIONS ---
  const handleOpenLessonModal = (lesson: any | null = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonTitle(lesson.title);
      setLessonDesc(lesson.description || '');
      setLessonDuration(lesson.duration || '12 mins');
      setLessonUrl(lesson.url || '');
      setLessonLayoutType(lesson.layoutType || 'editorial');
      setLessonArticleContent(lesson.articleContent || '');
    } else {
      setEditingLesson(null);
      setLessonTitle('');
      setLessonDesc('');
      setLessonDuration('12 mins');
      setLessonUrl('');
      setLessonLayoutType('editorial');
      setLessonArticleContent('');
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForLessons || !selectedCourseForLessons.id) return;
    if (!lessonTitle.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    const courseId = selectedCourseForLessons.id;
    const currentLessonsMap = selectedCourseForLessons.lessons || {};
    
    // Parse to object structure
    const lessonsList = Object.keys(currentLessonsMap).map(key => ({
      id: key,
      ...(currentLessonsMap as any)[key]
    }));

    runProgressSimulation(
      editingLesson ? "Modifying Lesson Index..." : "Appending New Lesson...",
      "Structuring content, assigning sorting coordinates, and issuing metadata.",
      async () => {
        if (editingLesson) {
          const lessonRef = ref(database, `courses/${courseId}/lessons/${editingLesson.id}`);
          await set(lessonRef, {
            ...editingLesson,
            title: lessonTitle,
            description: lessonDesc,
            duration: lessonDuration,
            url: lessonUrl,
            layoutType: lessonLayoutType,
            articleContent: lessonArticleContent
          });
          toast.success("Lesson metadata adjusted! 📝");
        } else {
          const lessonsRef = ref(database, `courses/${courseId}/lessons`);
          const newLessonRef = push(lessonsRef);
          await set(newLessonRef, {
            id: newLessonRef.key,
            title: lessonTitle,
            description: lessonDesc,
            duration: lessonDuration,
            url: lessonUrl,
            order: lessonsList.length + 1,
            layoutType: lessonLayoutType,
            articleContent: lessonArticleContent
          });
          toast.success("New lesson integrated inside study sequence! 🎬");
        }

        // Refresh selected course view to see immediate update
        onValue(ref(database, `courses/${courseId}`), (snapshot) => {
          if (snapshot.exists()) {
            setSelectedCourseForLessons({
              id: courseId,
              ...snapshot.val()
            });
          }
        }, { onlyOnce: true });

        setIsLessonModalOpen(false);
      }
    );
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!selectedCourseForLessons || !selectedCourseForLessons.id) return;
    if (!window.confirm('Delete this lesson permanently?')) return;

    const courseId = selectedCourseForLessons.id;

    runProgressSimulation(
      "Removing Lesson Entity...",
      "Disconnecting child node and rebuilding lessons chronological indices.",
      async () => {
        await set(ref(database, `courses/${courseId}/lessons/${lessonId}`), null);
        toast.success("Lesson deleted.");
        
        // Refresh local cache
        onValue(ref(database, `courses/${courseId}`), (snapshot) => {
          if (snapshot.exists()) {
            setSelectedCourseForLessons({
              id: courseId,
              ...snapshot.val()
            });
          } else {
            setSelectedCourseForLessons(null);
          }
        }, { onlyOnce: true });
      }
    );
  };

  // --- PLATFORM UPDATES CRUD ACTIONS ---
  const handleOpenUpdateModal = (upd: PlatformUpdate | null = null) => {
    if (upd) {
      setEditingUpdate(upd);
      setUpdateTitle(upd.title);
      setUpdateBody(upd.body);
      setUpdateCategory(upd.category);
      setUpdateAudience(upd.audience);
    } else {
      setEditingUpdate(null);
      setUpdateTitle('');
      setUpdateBody('');
      setUpdateCategory('feature');
      setUpdateAudience('all');
    }
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateBody.trim()) {
      toast.error('Title and announcement content are required');
      return;
    }

    const payload = {
      title: updateTitle,
      body: updateBody,
      category: updateCategory,
      audience: updateAudience,
      timestamp: editingUpdate?.timestamp || Date.now()
    };

    runProgressSimulation(
      editingUpdate ? "Restructuring Announcement..." : "Broadcasting Live Update...",
      "Publishing announcement immediately. Active members will see notifications layout refreshed in real-time.",
      async () => {
        if (editingUpdate && editingUpdate.id) {
          await set(ref(database, `updates/${editingUpdate.id}`), payload);
          toast.success("Platform bulletin updated. 🌍");
        } else {
          const newRef = push(ref(database, 'updates'));
          await set(newRef, {
            ...payload,
            id: newRef.key
          });
          toast.success("Dynamic broadcast sent to selected users! 📣");
        }
        setIsUpdateModalOpen(false);
      }
    );
  };

  const handleDeleteUpdate = (id?: string) => {
    if (!id) return;
    if (!window.confirm('Delete this announcement post forever?')) return;

    runProgressSimulation(
      "Withdrawing Announcement...",
      "Terminating the global dispatch stream and archiving post records.",
      async () => {
        await set(ref(database, `updates/${id}`), null);
        toast.success("Broadcast bulletin deleted successfully.");
      }
    );
  };

  // Search filter
  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUpdates = updates.filter(u => 
    u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-24 md:pb-0 font-sans">
       
       {/* Ambient Overlay Progress Loader Component (handcrafted, lightweight, beautiful) */}
       <AnimatePresence>
         {taskProgress.active && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[100] p-4"
           >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white/95 rounded-[32px] p-8 border border-slate-100 max-w-md w-full shadow-2xl shadow-indigo-950/10 text-center space-y-6"
              >
                 <div className="w-16 h-16 bg-indigo-50/50 border border-indigo-100/30 rounded-2xl flex items-center justify-center mx-auto text-2xl relative">
                    <span className="animate-pulse">⚡</span>
                    <div className="absolute -inset-1 bg-indigo-200/20 blur rounded-2xl -z-10 animate-ping"></div>
                 </div>

                 <div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-1">{taskProgress.label}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{taskProgress.sublabel || 'Synchronizing with Live Databases...'}</p>
                 </div>

                 {/* Premium tactile Progress Bar */}
                 <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 px-1">
                       <span>Realtime Sync</span>
                       <span className="text-indigo-600">{taskProgress.value}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                       <motion.div 
                         className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full relative"
                         animate={{ width: `${taskProgress.value}%` }}
                         transition={{ duration: 0.1, ease: "easeOut" }}
                       >
                         {/* Light effect overlay */}
                         <div className="absolute inset-0 bg-white/25" style={{ width: '40%' }} />
                       </motion.div>
                    </div>
                 </div>
              </motion.div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* HEADER */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
              {selectedCourseForLessons ? 'Lessons Manager' : 'Content Management'}
            </h1>
            <p className="text-slate-500 font-bold">
              {selectedCourseForLessons 
                ? `Drilled view: Managing lessons for "${selectedCourseForLessons.title}"` 
                : 'Create courses, post announcements, and orchestrate learning media.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedCourseForLessons ? (
              <Button variant="ghost" className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl py-2.5 font-bold text-xs" onClick={() => setSelectedCourseForLessons(null)}>
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Courses
              </Button>
            ) : activeTab === 'courses' ? (
              <Button variant="primary" onClick={() => handleOpenCourseModal(null)} className="rounded-2xl py-3 font-bold text-xs px-5 shadow-lg shadow-[#5bb70d]/10">
                <Plus className="w-4.5 h-4.5 mr-1.5" /> New Course
              </Button>
            ) : (
              <Button variant="primary" onClick={() => handleOpenUpdateModal(null)} className="rounded-2xl py-3 font-bold text-xs px-5 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/10">
                <Plus className="w-4.5 h-4.5 mr-1.5" /> New Bulletin Update
              </Button>
            )}
          </div>
       </div>

       {/* CMS CONTROL CENTER PANEL */}
       {!selectedCourseForLessons ? (
         <>
           {/* Tab Switches */}
           <div className="flex bg-slate-100/80 p-1.5 rounded-2.5xl max-w-sm border border-slate-200/40">
              <button 
                onClick={() => { setActiveTab('courses'); setSearchTerm(''); }}
                className={`flex-1 py-3 text-center font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'courses' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                 <BookOpen className="w-4 h-4" />
                 <span>Study Courses & Lessons</span>
              </button>
              <button 
                onClick={() => { setActiveTab('updates'); setSearchTerm(''); }}
                className={`flex-1 py-3 text-center font-black text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'updates' 
                    ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                 <Bell className="w-4 h-4" />
                 <span>News Updates Bulletin</span>
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 
                 {/* SEARCH ELEMENT */}
                 <div className="bg-white/80 border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-100/50">
                    <div className="relative">
                      <Search className="w-5 h-5 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                      <input 
                         type="text"
                         placeholder={activeTab === 'courses' ? "Search dynamic courses..." : "Search official updates..."}
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="w-full bg-slate-50/50 border border-slate-200/50 rounded-2xl pl-12 pr-4 py-3.5 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-400 shadow-inner text-sm"
                      />
                    </div>
                 </div>

                 {/* LIST OF DATA */}
                 <div className="space-y-4">
                    {activeTab === 'courses' ? (
                       loadingCourses ? (
                         <div className="text-center p-12 bg-white/50 border rounded-3xl text-slate-400 font-bold animate-pulse">Scanning Course Registry...</div>
                       ) : filteredCourses.length === 0 ? (
                         <div className="text-center p-12 bg-white/50 border border-dashed rounded-3xl text-slate-400 font-semibold">No Courses built. Click "New Course" above to begin.</div>
                       ) : (
                         filteredCourses.map((course) => {
                           const lessonsObj = course.lessons || {};
                           const lessonsLength = Object.keys(lessonsObj).length;
                           return (
                             <div key={course.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl shadow-slate-100/20 hover:border-slate-200 hover:-translate-y-[1px] transition-all group">
                                <div className="flex items-start gap-4">
                                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                     course.type === 'file' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'
                                   }`}>
                                      {course.type === 'file' ? <FileText className="w-5.5 h-5.5" /> : <Video className="w-5.5 h-5.5" />}
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-extrabold text-[#1A1A1A] leading-tight text-base">{course.title}</h4>
                                        {course.audience === 'subscribers' ? (
                                           <span className="bg-amber-50 text-amber-600 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border border-amber-100 flex items-center gap-0.5">
                                             <Award className="w-3 h-3" /> Premium
                                           </span>
                                        ) : (
                                           <span className="bg-teal-50 text-teal-600 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border border-teal-100">
                                              Public 🌍
                                           </span>
                                        )}
                                        {course.status === 'Draft' && (
                                           <span className="bg-slate-100 text-slate-500 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md">Draft</span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm mb-2">{course.description || 'No description supplied.'}</p>
                                      <div className="flex items-center gap-3 text-slate-405 text-[11px] font-bold">
                                         <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{lessonsLength} Lessons / classes</span>
                                         <span className="text-slate-300">•</span>
                                         <span>{course.students || 0} Registered Scholars</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2 md:self-center self-end pl-12 md:pl-0">
                                   <Button 
                                     variant="outline" 
                                     onClick={() => setSelectedCourseForLessons(course)}
                                     className="px-3.5 py-2 hover:bg-slate-50 text-xs font-bold border border-slate-200 rounded-xl flex items-center gap-1 cursor-pointer"
                                   >
                                      <Plus className="w-3.5 h-3.5 text-indigo-500" />
                                      Manage Lessons ({lessonsLength})
                                   </Button>
                                   <button onClick={() => handleOpenCourseModal(course)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer">
                                      <Edit3 className="w-4.5 h-4.5" />
                                   </button>
                                   <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                                      <Trash2 className="w-4.5 h-4.5" />
                                   </button>
                                </div>
                             </div>
                           );
                         })
                       )
                    ) : (
                       loadingUpdates ? (
                         <div className="text-center p-12 bg-white/50 border rounded-3xl text-slate-400 font-bold animate-pulse">Synchronizing bulletin updates...</div>
                       ) : filteredUpdates.length === 0 ? (
                         <div className="text-center p-12 bg-white/50 border border-dashed rounded-3xl text-slate-400 font-semibold">No platform wide updates published yet. Click "New Bulletin" to dispatch one.</div>
                       ) : (
                         filteredUpdates.map((bulletin) => (
                           <div key={bulletin.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex flex-col md:flex-row justify-between gap-4 shadow-xl shadow-slate-100/20 group hover:border-slate-200 hover:-translate-y-[1px] transition-all">
                              <div className="space-y-2 max-w-lg">
                                 <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                                      bulletin.category === 'security' ? 'bg-red-50 text-red-600 border-red-100' :
                                      bulletin.category === 'feature' ? 'bg-[#58cc02]/10 text-emerald-600 border-[#58cc02]/20' :
                                      'bg-blue-50 text-blue-600 border-blue-100'
                                    }`}>
                                       {bulletin.category}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold">
                                       {new Date(bulletin.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                       Target: {bulletin.audience === 'subscribers' ? '🌟 Subscribers' : '🌍 Public'}
                                    </span>
                                 </div>
                                 <h4 className="text-base font-extrabold text-slate-800 leading-snug">{bulletin.title}</h4>
                                 <p className="text-sm font-medium text-slate-500 whitespace-pre-wrap leading-relaxed">{bulletin.body}</p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0 md:self-start self-end">
                                 <button onClick={() => handleOpenUpdateModal(bulletin)} className="p-2 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                                    <Edit3 className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => handleDeleteUpdate(bulletin.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                         ))
                       )
                    )}
                 </div>
              </div>

              {/* REAL DATA STATS / INFO SIDEBAR */}
              <div className="space-y-6">
                 <div className="bg-white/80 border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-100/50">
                     <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[#58cc02]" />
                        Learning Database Space
                     </h3>
                     
                     <div className="space-y-5">
                        <div className="space-y-1.5">
                           <div className="flex justify-between text-xs font-black text-slate-500">
                              <span>Published Courses</span>
                              <span className="text-[#58cc02]">{courses.filter(c => c.status === 'Published').length} / {courses.length}</span>
                           </div>
                           <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-lime-400 to-emerald-500 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${courses.length > 0 ? (courses.filter(c => c.status === 'Published').length / courses.length) * 100 : 0}%` }}
                                transition={{ duration: 0.8 }}
                              />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <div className="flex justify-between text-xs font-black text-slate-500">
                              <span>Premium Lock Status</span>
                              <span className="text-amber-500">{courses.filter(c => c.audience === 'subscribers').length} Active Locks</span>
                           </div>
                           <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" 
                                initial={{ width: 0 }}
                                animate={{ width: `${courses.length > 0 ? (courses.filter(c => c.audience === 'subscribers').length / courses.length) * 100 : 0}%` }}
                                transition={{ duration: 0.8 }}
                              />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <div className="flex justify-between text-xs font-black text-slate-500">
                              <span>Broadcast Dispatch</span>
                              <span className="text-indigo-500">{updates.length} Updates Live</span>
                           </div>
                        </div>
                     </div>

                     <div className="h-px bg-slate-100 my-5"></div>

                     <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-2">
                         <div className="flex items-center gap-2 text-indigo-700">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-wider">Instant CMS Sync</span>
                         </div>
                         <p className="text-[11px] font-bold text-slate-500 leading-normal">
                           Any changes made here sync instantly with student dashboards and security nodes using Realtime Database connection.
                         </p>
                     </div>
                 </div>
              </div>
           </div>
         </>
       ) : (
         /* SELECTED COURSE - MANAGE LESSONS DEEP SUB-VIEW */
         <div className="space-y-6">
            <div className="bg-white/80 border border-slate-200/50 rounded-[32px] p-6 shadow-xl shadow-slate-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <div className="flex items-center gap-2 mb-1.5">
                     <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Lessons Sequence Editor</span>
                     <span className="text-slate-300">•</span>
                     <span className="text-xs font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/40 capitalize">{selectedCourseForLessons.type} Channel</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#1a1a1a]">{selectedCourseForLessons.title}</h3>
                  <p className="text-xs text-slate-400 font-semibold max-w-xl mt-1">{selectedCourseForLessons.description}</p>
               </div>
               
               <Button variant="primary" onClick={() => handleOpenLessonModal(null)} className="rounded-2xl shrink-0 py-3 font-extrabold text-xs">
                  <Plus className="w-4.5 h-4.5 mr-1" /> Append Lesson
               </Button>
            </div>

            <div className="bg-white/50 border border-slate-100 rounded-[32px] p-6 shadow-sm">
               <h3 className="text-base font-black text-slate-800 mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#58cc02]" />
                  Lessons Sequence Map
               </h3>

               <div className="space-y-3">
                  {(() => {
                    const lessonsObj = selectedCourseForLessons.lessons || {};
                    const lessonsList = Object.keys(lessonsObj).map(key => ({
                      id: key,
                      ...(lessonsObj as any)[key]
                    })).sort((a, b) => (a.order || 0) - (b.order || 0));

                    if (lessonsList.length === 0) {
                      return (
                        <div className="text-center p-12 border border-dashed border-slate-200 rounded-[24px] text-slate-400 font-bold">
                           No sequence lessons added to this course. Click "Append Lesson" to design its curriculum!
                        </div>
                      );
                    }

                    return lessonsList.map((lesson, idx) => (
                      <div key={lesson.id} className="p-4 bg-white/90 border border-slate-100 hover:border-slate-200 rounded-2xl flex items-center justify-between gap-4 pr-6">
                         <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-500 border">
                               {idx + 1}
                            </div>
                            <div>
                               <h5 className="font-bold text-slate-800 text-sm leading-tight flex items-center gap-2">
                                  <span>{lesson.title}</span>
                                  <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100/30">{lesson.duration || '10 mins'}</span>
                               </h5>
                               <p className="text-xs text-slate-400 font-medium mt-1 leading-normal max-w-md">{lesson.description || 'No description provided'}</p>
                               {lesson.url && (
                                 <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-md mt-1.5 inline-block select-all">
                                    Resource: {lesson.url}
                                 </span>
                               )}
                            </div>
                         </div>
                         <div className="flex items-center gap-1 pl-4">
                            <button onClick={() => handleOpenLessonModal(lesson)} className="p-2 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                               <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    ));
                  })()}
               </div>
            </div>
         </div>
       )}

       {/* --- DIALOGS / MODALS --- */}
       
       {/* Course Creator/Editor Modal */}
       {isCourseModalOpen && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-md relative font-sans">
             <button onClick={() => setIsCourseModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
               <X className="w-5 h-5" />
             </button>
             <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">
               {editingCourse ? 'Modify Course Details' : 'Design New Course'}
             </h3>

             <form onSubmit={handleSaveCourse} className="space-y-4">
               <div>
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Course Title</label>
                 <input 
                   type="text"
                   value={courseTitle}
                   onChange={e => setCourseTitle(e.target.value)}
                   placeholder="Enter spectacular title..."
                   className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-sm"
                 />
               </div>

               <div>
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Course Summary / Description</label>
                 <textarea 
                   value={courseDesc}
                   onChange={e => setCourseDesc(e.target.value)}
                   placeholder="Describe what students will master..."
                   rows={3}
                   className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-semibold text-slate-600 outline-none focus:border-indigo-500 focus:bg-white text-xs resize-none leading-relaxed"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Primary Type</label>
                   <select 
                     value={courseType}
                     onChange={e => setCourseType(e.target.value as 'video' | 'file')}
                     className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-2 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-xs"
                   >
                     <option value="video">🎥 Streaming Video</option>
                     <option value="file">📄 PDF / Document</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Scope Audience</label>
                   <select 
                     value={courseAudience}
                     onChange={e => setCourseAudience(e.target.value as 'public' | 'subscribers')}
                     className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-2 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-xs"
                   >
                     <option value="public">🌍 Public (Open to All)</option>
                     <option value="subscribers">🔒 Subscriber Premium ONLY</option>
                   </select>
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Distribution Status</label>
                 <div className="flex gap-2">
                   <button 
                     type="button" 
                     onClick={() => setCourseStatus('Published')}
                     className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                       courseStatus === 'Published' 
                         ? 'bg-[#58cc02] text-white border-[#58cc02] shadow-sm shadow-[#58cc02]/20'
                         : 'bg-white text-slate-505 border-slate-200 hover:bg-slate-50'
                     }`}
                   >
                     Published 🌍
                   </button>
                   <button 
                     type="button" 
                     onClick={() => setCourseStatus('Draft')}
                     className={`flex-1 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                       courseStatus === 'Draft' 
                         ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20'
                         : 'bg-white text-slate-505 border-slate-200 hover:bg-slate-50'
                     }`}
                   >
                     Draft ✏️
                   </button>
                 </div>
               </div>

               <div className="pt-2 flex justify-end gap-2 text-xs">
                 <button 
                   type="button" 
                   onClick={() => setIsCourseModalOpen(false)}
                   className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-650 transition-colors"
                 >
                   Cancel
                 </button>
                 <Button type="submit" variant="primary" className="py-2.5 font-extrabold text-xs px-4">
                   {editingCourse ? 'Save Updates' : 'Build Course'}
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Lesson Editor Modal */}
       {isLessonModalOpen && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-md relative font-sans">
             <button onClick={() => setIsLessonModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
               <X className="w-5 h-5" />
             </button>
             <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">
               {editingLesson ? 'Edit Lesson Metadata' : 'Append New Lesson'}
             </h3>

             <form onSubmit={handleSaveLesson} className="space-y-4">
               <div>
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Lesson Title</label>
                 <input 
                   type="text"
                   value={lessonTitle}
                   onChange={e => setLessonTitle(e.target.value)}
                   placeholder="Introduction to styling parameters..."
                   className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-sm"
                 />
               </div>

               <div>
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Description / Goal</label>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Article Layout Style (طريقة عرض المقالة)</label>
                  <select 
                    value={lessonLayoutType}
                    onChange={e => setLessonLayoutType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-xs"
                  >
                    <option value="editorial">🖋️ Editorial Masterclass (مقال تحريري كلاسيكي فريد)</option>
                    <option value="cards">🗂️ Step-by-Step Curriculum Cards (بطاقات متعاقبة تفاعلية)</option>
                    <option value="bento">🔳 Bento Summary Grid (شبكة بينتو المنظمة المترابطة)</option>
                    <option value="split">🧠 Academic Bilingual Concept Split (نظرة ثنائية مكثفة للمفاهيم)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Article Body / Lesson Material (المادة العلمية والمحتوى التفصيلي)</label>
                  <textarea 
                    value={lessonArticleContent}
                    onChange={e => setLessonArticleContent(e.target.value)}
                    placeholder="Write beautiful details here. Use '---' to split cards, bento blocks, or translation columns!"
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-semibold text-slate-600 outline-none focus:border-indigo-500 focus:bg-white text-xs"
                  />
                  <span className="text-[10px] text-slate-400 font-bold block mt-1 leading-tight">
                    💡 تلميح: استخدم الرمز '---' للفصل بين البطاقات أو فقرات البينتو أو لمقارنة المصطلحات الفرنسية والعربية جنباً إلى جنب!
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Original Description</label>
                 <textarea 
                   value={lessonDesc}
                   onChange={e => setLessonDesc(e.target.value)}
                   placeholder="What should the student capture from this lesson..."
                   rows={2}
                   className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-semibold text-slate-600 outline-none focus:border-indigo-500 focus:bg-white text-xs resize-none"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Duration / Length</label>
                   <input 
                     type="text"
                     value={lessonDuration}
                     onChange={e => setLessonDuration(e.target.value)}
                     placeholder="e.g. 15 mins, 4 pages"
                     className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-xs"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Media / File URL (Optional)</label>
                   <input 
                     type="text"
                     value={lessonUrl}
                     onChange={e => setLessonUrl(e.target.value)}
                     placeholder="e.g. https://streams.baki.com/vid1"
                     className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-xs"
                   />
                 </div>
               </div>

               <div className="pt-2 flex justify-end gap-2 text-xs">
                 <button 
                   type="button" 
                   onClick={() => setIsLessonModalOpen(false)}
                   className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-650"
                 >
                   Cancel
                 </button>
                 <Button type="submit" variant="primary" className="py-2.5 font-extrabold text-xs px-4">
                   {editingLesson ? 'Save Updates' : 'Add to Course'}
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}

       {/* Platform Update Editor Modal */}
       {isUpdateModalOpen && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 w-full max-w-md relative font-sans">
             <button onClick={() => setIsUpdateModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer">
               <X className="w-5 h-5" />
             </button>
             <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">
               {editingUpdate ? 'Modify Platform Update' : 'Broadcast New Announcement'}
             </h3>

             <form onSubmit={handleSaveUpdate} className="space-y-4">
               <div>
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Broadcast Title</label>
                 <input 
                   type="text"
                   value={updateTitle}
                   onChange={e => setUpdateTitle(e.target.value)}
                   placeholder="e.g. 🥳 Study Hub and Lessons integrated!"
                   className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-sm"
                 />
               </div>

               <div>
                 <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Message Body</label>
                 <textarea 
                   value={updateBody}
                   onChange={e => setUpdateBody(e.target.value)}
                   rows={4}
                   placeholder="Write down the details of the announcement here..."
                   className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-4 py-2.5 font-semibold text-slate-600 outline-none focus:border-indigo-500 focus:bg-white text-xs resize-none leading-relaxed"
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Category Badge</label>
                   <select 
                     value={updateCategory}
                     onChange={e => setUpdateCategory(e.target.value as 'feature' | 'security' | 'announcement')}
                     className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-2 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-xs"
                   >
                     <option value="feature">🎉 Feature Release</option>
                     <option value="security">🛡️ Security Alert</option>
                     <option value="announcement">📣 Official Announcement</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Viewing Scope</label>
                   <select 
                     value={updateAudience}
                     onChange={e => setUpdateAudience(e.target.value as 'all' | 'subscribers')}
                     className="w-full bg-slate-50 border border-slate-200/65 rounded-xl px-2 py-2.5 font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white text-xs"
                   >
                     <option value="all">🌍 All Registered Members</option>
                     <option value="subscribers">🔒 Premium Members Only</option>
                   </select>
                 </div>
               </div>

               <div className="pt-2 flex justify-end gap-2 text-xs">
                 <button 
                   type="button" 
                   onClick={() => setIsUpdateModalOpen(false)}
                   className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-650"
                 >
                   Cancel
                 </button>
                 <Button type="submit" variant="primary" className="py-2.5 font-extrabold text-xs px-4 bg-indigo-600 hover:bg-indigo-700">
                   {editingUpdate ? 'Save Changes' : 'Broadcast live!'}
                 </Button>
               </div>
             </form>
           </div>
         </div>
       )}

    </div>
  );
}

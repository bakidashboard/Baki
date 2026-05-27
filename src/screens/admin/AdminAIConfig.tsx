import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { 
  Zap, 
  Bot, 
  Cpu, 
  Settings, 
  Save, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  BarChart3,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Rocket,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AIProvider {
  enabled: boolean;
  apiKey: string;
  usage: number;
  limit: number;
}

interface AIConfig {
  providers: {
    gemini: AIProvider;
    openai: AIProvider;
  };
}

export const AdminAIConfig = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [config, setConfig] = useState<AIConfig>({
    providers: {
      gemini: { enabled: true, apiKey: '', usage: 0, limit: 1000 },
      openai: { enabled: false, apiKey: '', usage: 0, limit: 1000 }
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/ai-config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.providers) {
        setConfig(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load AI configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        toast.success(language === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
      }
    } catch (err) {
      toast.error('Failed to save config');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleProvider = (id: 'gemini' | 'openai') => {
    setConfig(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [id]: { ...prev.providers[id], enabled: !prev.providers[id].enabled }
      }
    }));
  };

  const updateApiKey = (id: 'gemini' | 'openai', val: string) => {
    setConfig(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [id]: { ...prev.providers[id], apiKey: val }
      }
    }));
  };

  const resetUsage = (id: 'gemini' | 'openai') => {
    setConfig(prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [id]: { ...prev.providers[id], usage: 0 }
      }
    }));
    toast.success(`${id} usage reset`);
  };

  if (isLoading) return <div className="p-12 text-center font-black animate-pulse text-slate-300">BAKI Intelligence Booting...</div>;

  return (
    <div className="space-y-8 pb-32">
       <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">
            {language === 'ar' ? 'إدارة الذكاء الاصطناعي' : 'AI Intelligence Hub'}
          </h1>
          <p className="text-slate-400 font-bold">
            {language === 'ar' ? 'ربط مفاتيح API وإدارة نظام التبديل التلقائي' : 'Configure API keys and manage automatic failover systems'}
          </p>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Gemini Provider */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border-2 p-8 rounded-[40px] shadow-xl transition-all ${config.providers.gemini.enabled ? 'border-indigo-100 shadow-indigo-500/5' : 'border-slate-100 grayscale opacity-60'}`}
          >
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center shadow-inner border border-indigo-100">
                      <Zap className="w-7 h-7 fill-current" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800">Google Gemini</h3>
                      <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Primary Engine</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 hover:bg-indigo-100 transition-all shadow-sm"
                     title={language === 'ar' ? 'حفظ إعدادات Gemini' : 'Save Gemini Settings'}
                   >
                      {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   </button>
                   <button 
                     onClick={() => toggleProvider('gemini')}
                     className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${config.providers.gemini.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
                   >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all ${config.providers.gemini.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-1">Gemini API Key</label>
                   <div className="relative">
                      <input 
                        type={showKeys.gemini ? "text" : "password"}
                        value={config.providers.gemini.apiKey}
                        onChange={(e) => updateApiKey('gemini', e.target.value)}
                        placeholder="AIxxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-mono text-sm focus:border-indigo-400 outline-none transition-all"
                      />
                      <button 
                        onClick={() => setShowKeys(prev => ({ ...prev, gemini: !prev.gemini }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                      >
                         {showKeys.gemini ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <BarChart3 className="w-4 h-4 text-indigo-600" />
                         <span className="text-xs font-black text-slate-700">Usage Analytics</span>
                      </div>
                      <button 
                        onClick={() => resetUsage('gemini')}
                        className="p-1.5 bg-white rounded-lg border border-slate-100 text-slate-400 hover:text-indigo-600 shadow-sm"
                      >
                         <RotateCcw className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                         <span className="text-slate-400">Total API Requests</span>
                         <span className="text-indigo-600">{config.providers.gemini.usage} Calls</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(config.providers.gemini.usage / config.providers.gemini.limit) * 100}%` }}
                           className="h-full bg-indigo-500"
                         />
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>

          {/* OpenAI Provider */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-white border-2 p-8 rounded-[40px] shadow-xl transition-all ${config.providers.openai.enabled ? 'border-emerald-100 shadow-emerald-500/5' : 'border-slate-100 grayscale opacity-60'}`}
          >
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner border border-emerald-100">
                      <Cpu className="w-7 h-7 fill-current" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800">OpenAI ChatGPT</h3>
                      <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Failover Backup</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all shadow-sm"
                     title={language === 'ar' ? 'حفظ إعدادات OpenAI' : 'Save OpenAI Settings'}
                   >
                      {isSaving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   </button>
                   <button 
                     onClick={() => toggleProvider('openai')}
                     className={`w-14 h-7 rounded-full p-1 transition-all flex items-center ${config.providers.openai.enabled ? 'bg-emerald-600' : 'bg-slate-200'}`}
                   >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all ${config.providers.openai.enabled ? 'translate-x-7' : 'translate-x-0'}`} />
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 px-1">OpenAI API Key</label>
                   <div className="relative">
                      <input 
                        type={showKeys.openai ? "text" : "password"}
                        value={config.providers.openai.apiKey}
                        onChange={(e) => updateApiKey('openai', e.target.value)}
                        placeholder="sk-proj-xxxxxxxxxxxxxxxx"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-mono text-sm focus:border-emerald-400 outline-none transition-all"
                      />
                      <button 
                        onClick={() => setShowKeys(prev => ({ ...prev, openai: !prev.openai }))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                      >
                         {showKeys.openai ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <BarChart3 className="w-4 h-4 text-emerald-600" />
                         <span className="text-xs font-black text-slate-700">Usage Analytics</span>
                      </div>
                      <button 
                         onClick={() => resetUsage('openai')}
                         className="p-1.5 bg-white rounded-lg border border-slate-100 text-slate-400 hover:text-emerald-600 shadow-sm"
                      >
                         <RotateCcw className="w-4 h-4" />
                      </button>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                         <span className="text-slate-400">Total API Requests</span>
                         <span className="text-emerald-600">{config.providers.openai.usage} Calls</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${(config.providers.openai.usage / config.providers.openai.limit) * 100}%` }}
                           className="h-full bg-emerald-500"
                         />
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
       </div>

       {/* Failover Policy Info */}
       <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-[32px] flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100 shrink-0">
             <AlertCircle className="w-6 h-6" />
          </div>
          <div>
             <h4 className="font-black text-amber-900 mb-1">
               {language === 'ar' ? 'سياسة استبدال الخدمة الآلي' : 'Active Failover Policy'}
             </h4>
             <p className="text-xs font-bold text-amber-700/80 leading-relaxed">
               {language === 'ar' 
                 ? 'عند فشل محرك Gemini (بسبب انتهاء الحصة أو خطأ تقني)، سيقوم النظام بتحويل الطلبات تلقائياً إلى محرك OpenAI لضمان استمرارية خدمة تحليل الملفات والدروس للطلاب. تأكد من تفعيل كلا المحركين لضمان أفضل تجربة.'
                 : 'When Gemini fails (due to quota limits or technical errors), the system will automatically reroute requests to OpenAI to ensure continuity for students. Enable both providers for maximum reliability.'}
             </p>
          </div>
       </div>
    </div>
  );
};

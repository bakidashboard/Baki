
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './Button';
import { Sparkles, Check, Loader2, ShieldCheck, Phone, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const FlexySubscription = ({ onComplete }: { onComplete?: () => void }) => {
  const { language } = useLanguage();
  const [selectedOperator, setSelectedOperator] = useState<'djezzy' | 'ooredoo' | 'mobilis' | null>(null);
  const [rechargeCode, setRechargeCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'input' | 'success'>('select');

  const handleRecharge = async () => {
    if (!rechargeCode || rechargeCode.length < 5) {
      toast.error(language === 'ar' ? 'يرجى إدخال كود شحن صحيح' : 'Please enter a valid recharge code');
      return;
    }

    setIsProcessing(true);
    // Simulate premium processing with Baki charm
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
    setStep('success');
    if (onComplete) onComplete();
  };

  const operators = [
    { id: 'djezzy', name: 'Djezzy', color: 'bg-[#E30613]', logo: '🇩🇿', label: 'جيزي' },
    { id: 'ooredoo', name: 'Ooredoo', color: 'bg-[#ED1C24]', logo: '🔴', label: 'أوريدو' },
    { id: 'mobilis', name: 'Mobilis', color: 'bg-[#6DA544]', logo: '🟢', label: 'موبيليس' },
  ];

  return (
    <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 shadow-xl shadow-slate-200/50 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#58cc02]/5 rounded-full blur-2xl"></div>
      
      <AnimatePresence mode="wait">
        {step === 'select' && (
          <motion.div 
            key="select"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-amber-100">
                <Sparkles className="w-3 h-3" /> {language === 'ar' ? 'ترقية بيداغوجية' : 'Pedagogical Upgrade'}
              </div>
              <h3 className="text-xl font-black text-slate-800">
                {language === 'ar' ? 'اشحن رصيدك وفعل العضوية الذهبية' : 'Recharge & Activate Gold Membership'}
              </h3>
              <p className="text-xs font-bold text-slate-400">
                {language === 'ar' ? 'خدمة فليكسي (Flexy) متاحة الآن لجميع الشبكات في الجزائر' : 'Flexy service now available for all networks in Algeria'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {operators.map((op) => (
                <button
                  key={op.id}
                  onClick={() => {
                    setSelectedOperator(op.id as any);
                    setStep('input');
                  }}
                  className="group flex flex-col items-center gap-3 p-4 rounded-3xl border-2 border-slate-50 hover:border-[#58cc02] hover:bg-slate-50/50 transition-all cursor-pointer"
                >
                  <div className={`w-14 h-14 rounded-2xl ${op.color} flex items-center justify-center text-2xl shadow-lg ring-4 ring-white`}>
                    {op.logo}
                  </div>
                  <span className="text-xs font-black text-slate-700">{language === 'ar' ? op.label : op.name}</span>
                </button>
              ))}
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <p className="text-[10px] font-bold text-slate-500 leading-tight">
                {language === 'ar' ? 'نظام شحن آمن ومشفر 100%. التفعيل يتم فورياً بعد التحقق من كود الشحن.' : '100% secure and encrypted recharging system. Activation is instant after code verification.'}
              </p>
            </div>
          </motion.div>
        )}

        {step === 'input' && (
          <motion.div 
            key="input"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <button onClick={() => setStep('select')} className="text-xs font-black text-slate-400 hover:text-slate-600 flex items-center gap-1">
              ← {language === 'ar' ? 'الرجوع لاختيار المشغل' : 'Back to operators'}
            </button>

            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${operators.find(o => o.id === selectedOperator)?.color} flex items-center justify-center text-3xl shadow-lg shadow-black/10`}>
                {operators.find(o => o.id === selectedOperator)?.logo}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800">
                  {language === 'ar' ? `شحن عبر ${operators.find(o => o.id === selectedOperator)?.label}` : `Recharge via ${operators.find(o => o.id === selectedOperator)?.name}`}
                </h4>
                <p className="text-xs font-bold text-slate-400">
                  {language === 'ar' ? 'أدخل كود التعبة المكون من 14 أو 16 رقم' : 'Enter the 14 or 16 digit recharging code'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                <input
                  type="text"
                  value={rechargeCode}
                  onChange={(e) => setRechargeCode(e.target.value)}
                  placeholder="Code: 0000 0000 0000 0000"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-12 py-4 text-center font-mono font-black text-lg focus:outline-none focus:border-[#58cc02] focus:bg-white transition-all tracking-[0.2em]"
                />
              </div>

              <button
                disabled={isProcessing}
                onClick={handleRecharge}
                className="w-full bg-[#58cc02] hover:bg-[#46a302] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#58cc02]/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{language === 'ar' ? 'جاري معالجة الكود...' : 'Processing Code...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-current" />
                    <span>{language === 'ar' ? 'تأكيد وشحن الحساب' : 'Confirm & Recharge'}</span>
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-center"
                >
                  <p className="text-[10px] font-black text-emerald-600 animate-pulse uppercase tracking-widest">
                    {language === 'ar' ? 'يتم الاتصال بخوادم المشغل... يرجى الانتظار' : 'Connecting to operator servers... Please wait'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-5xl mx-auto border-4 border-white shadow-xl shadow-emerald-500/10">
              <Check className="w-12 h-12 stroke-[4px]" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">
                {language === 'ar' ? 'تم تفعيل الاشتراك بنجاح! 🎉' : 'Subscription Active! 🎉'}
              </h3>
              <p className="text-sm font-bold text-slate-400">
                {language === 'ar' ? 'أهلاً بك في عالم باكي الذهبي. يمكنك الآن الوصول لكل الدروس.' : 'Welcome to Baki Gold. You now have access to all lessons.'}
              </p>
            </div>

            <Button onClick={() => setStep('select')} className="w-full rounded-2xl py-4 font-black">
              {language === 'ar' ? 'ابدأ التعلم الآن' : 'Start Learning Now'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

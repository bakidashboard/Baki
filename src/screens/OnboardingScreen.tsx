import { motion } from 'motion/react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { AuthCard } from '../components/AuthCard';
import { Button } from '../components/Button';
import { BakiMascot } from '../components/BakiMascot';
import { Check, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t, dir } = useLanguage();
  const [step, setStep] = useState(1);
  const [branch, setBranch] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const branches = [
    { id: 'science', label: 'science', color: 'border-baki-primary bg-baki-mint' },
    { id: 'math', label: 'math', color: 'border-baki-sky bg-[#E6F6FF]' },
    { id: 'tech', label: 'tech', color: 'border-baki-purple bg-[#F7E6FF]' },
    { id: 'management', label: 'management', color: 'border-baki-peach bg-[#FFEEDB]' },
    { id: 'languages', label: 'languages', color: 'border-baki-pink bg-[#FFE6F0]' },
    { id: 'philosophy', label: 'philosophy', color: 'border-baki-gold bg-[#FFF7D6]' },
  ];

  const goals = [
    { id: 'light', label: 'goalLight' },
    { id: 'medium', label: 'goalMedium' },
    { id: 'hard', label: 'goalHard' },
  ];

  const handleNext = () => {
    if (step === 1 && branch) setStep(2);
    else if (step === 2 && goal) {
      setIsBuilding(true);
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
  };

  if (isBuilding) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center h-full p-6 w-full"
      >
        <BakiMascot size={160} emotion="celebrate" />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="mt-8 text-xl font-bold text-slate-700"
        >
          {t('buildingPlan')}
        </motion.div>
        
        <div className="w-64 h-3 bg-slate-200 justify-start rounded-full mt-6 overflow-hidden">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="h-full bg-baki-primary rounded-full relative"
          >
            <motion.div 
              className="absolute top-0 right-0 bottom-0 w-8 bg-white/40"
              animate={{ x: [-32, 256] }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center justify-start h-full py-6 px-4 w-full max-w-2xl mx-auto overflow-y-auto hide-scrollbar"
    >
      <div className="w-full flex justify-between items-center mb-6 px-4">
        {step > 1 ? (
          <button 
            onClick={handleBack}
            className="w-10 h-10 rounded-full bg-white shadow-baki-soft flex items-center justify-center text-slate-500 hover:text-slate-800 hover:scale-105 active:scale-95 transition-all outline-none"
          >
            {dir === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
          </button>
        ) : <div className="w-10" />}
        
        <div className="flex gap-2">
          {[1, 2].map((s) => (
            <div 
              key={s} 
              className={`h-2.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-baki-primary w-8' : 'bg-slate-200 w-2.5'}`} 
            />
          ))}
        </div>
        
        <div className="w-10" />
      </div>

      <div className="flex flex-col items-center mb-8">
        <BakiMascot size={80} emotion="thinking" />
        <h2 className="text-2xl font-black text-slate-800 mt-4 mb-2 text-center">
          {step === 1 ? t('onboardingTitle') : t('goalLabel')}
        </h2>
        <p className="text-slate-500 font-medium text-center">
          {step === 1 ? t('branchLabel') : t('onboardingSubtitle')}
        </p>
      </div>

      <AuthCard className="w-full">
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {branches.map((b) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={b.id}
                onClick={() => setBranch(b.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  branch === b.id 
                    ? b.color + ' ring-4 ring-offset-1 ' + b.color.replace('bg-', 'ring-').replace('border-', '') + '/30'
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                }`}
              >
                <span className={`font-bold ${branch === b.id ? 'text-slate-900' : ''}`}>
                  {t(b.label)}
                </span>
                {branch === b.id && <CheckCircle2 className={`w-6 h-6 ${b.color.includes('primary') ? 'text-baki-primary' : 'text-slate-800'}`} />}
              </motion.button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            {goals.map((g) => (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={g.id}
                onClick={() => setGoal(g.id)}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  goal === g.id 
                    ? 'border-baki-primary bg-baki-mint ring-4 ring-offset-1 ring-baki-primary/30'
                    : 'bg-white border-slate-100 hover:border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 outline outline-2 rounded flex items-center justify-center ${goal === g.id ? 'outline-baki-primary bg-baki-primary' : 'outline-slate-300 bg-white'}`}>
                    {goal === g.id && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>
                  <span className={`font-bold text-lg ${goal === g.id ? 'text-slate-900' : ''}`}>
                    {t(g.label)}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100">
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleNext}
            disabled={(step === 1 && !branch) || (step === 2 && !goal)}
          >
            {t('continue')}
          </Button>
        </div>
      </AuthCard>
    </motion.div>
  );
}

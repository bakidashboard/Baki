import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/Button';
import { BakiMascot } from '../components/BakiMascot';

interface WelcomeScreenProps {
  onStart: () => void;
  onLogin: () => void;
}

export function WelcomeScreen({ onStart, onLogin }: WelcomeScreenProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-between h-full p-6 relative w-full max-w-md mx-auto overflow-hidden"
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10" style={{ paddingBottom: '10vh' }}>
        <BakiMascot size={160} emotion="happy" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mt-10"
        >
          <h1 className="text-3xl md:text-5xl font-black text-[#1A1A1A] mb-4 leading-tight">
            {t('welcomeTitle')}
          </h1>
          <p className="text-base md:text-lg text-gray-500 font-medium max-w-sm mx-auto">
            {t('welcomeSubtitle')}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full flex-none pb-8"
      >
        <Button variant="primary" fullWidth onClick={onStart} className="text-xl h-[64px]">
          {t('startNow')}
        </Button>
        <Button variant="ghost" fullWidth onClick={onLogin} className="mt-4 font-semibold text-slate-500">
          {t('alreadyHaveAccount')}
        </Button>
      </motion.div>
    </motion.div>
  );
}

import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, toggleLanguage, dir } = useLanguage();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className={`fixed top-6 ${dir === 'rtl' ? 'left-6 border-l-0' : 'right-6 border-r-0'} z-50 hidden md:flex items-center gap-2 bg-white rounded-full p-1 border border-gray-100 shadow-sm font-bold text-xs text-gray-400 cursor-pointer overflow-hidden`}
      layout
    >
      <div className={`px-4 py-1.5 rounded-full transition-colors ${language === 'ar' ? 'bg-[#58CC02] text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
        العربية
      </div>
      <div className={`px-4 py-1.5 rounded-full transition-colors ${language === 'en' ? 'bg-[#58CC02] text-white' : 'hover:bg-gray-50 text-gray-600'}`}>
        English
      </div>
    </motion.button>
  );
}

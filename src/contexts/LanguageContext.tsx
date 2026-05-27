import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  dir: 'rtl' | 'ltr';
  t: (key: string) => string;
}

const translations = {
  ar: {
    welcomeTitle: 'ابدأ رحلتك نحو البكالوريا الذكية',
    welcomeSubtitle: 'تعلم بطريقة ممتعة، ذكية، ومصممة خصيصاً لك.',
    startNow: 'لننطلق 🚀',
    alreadyHaveAccount: 'لدي حساب بالفعل',
    loginTitle: 'مرحباً بعودتك! 👋',
    loginSubtitle: 'النجاح بانتظارك، استمر في التقدم.',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    loginAction: 'تسجيل الدخول',
    signInWithGoogle: 'المتابعة مع Google',
    forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟ سجل الآن',
    signupTitle: 'اصنع حسابك الجديد ✨',
    signupSubtitle: 'خطوتك الأولى نحو التفوق تبدأ هنا.',
    nameLabel: 'الاسم الكامل',
    signupAction: 'إنشاء الحساب',
    haveAccountSignup: 'تفضل بتسجيل الدخول',
    onboardingTitle: 'لنتعرف عليك أكثر 🎯',
    onboardingSubtitle: 'صمم رحلتك التعليمية للوصول إلى هدفك.',
    branchLabel: 'ما هي شعبتك؟',
    goalLabel: 'ما هو هدفك اليومي؟',
    continue: 'استمر نحو النجاح',
    science: 'علوم تجريبية',
    math: 'رياضيات',
    tech: 'تقني رياضي',
    management: 'تسيير واقتصاد',
    languages: 'لغات أجنبية',
    philosophy: 'آداب وفلسفة',
    goalLight: 'خفيف (15 دقيقة)',
    goalMedium: 'متوسط (30 دقيقة)',
    goalHard: 'مكثف (60 دقيقة)',
    buildingPlan: 'جاري بناء خطتك الذكية...',
    emailError: 'بريد إلكتروني غير صالح',
    passwordError: 'يجب أن تكون 6 أحرف على الأقل',
    or: 'أو'
  },
  en: {
    welcomeTitle: 'Start Your Smart Bac Journey',
    welcomeSubtitle: 'Learn in a fun, smart way tailored just for you.',
    startNow: 'Let\'s Go 🚀',
    alreadyHaveAccount: 'I already have an account',
    loginTitle: 'Welcome Back! 👋',
    loginSubtitle: 'Success is waiting for you, keep going.',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    loginAction: 'Log In',
    signInWithGoogle: 'Continue with Google',
    forgotPassword: 'Forgot password?',
    noAccount: 'Don\'t have an account? Sign up',
    signupTitle: 'Create New Account ✨',
    signupSubtitle: 'Your first step to excellence starts here.',
    nameLabel: 'Full Name',
    signupAction: 'Sign Up',
    haveAccountSignup: 'Log in instead',
    onboardingTitle: 'Let\'s Get to Know You 🎯',
    onboardingSubtitle: 'Design your learning journey to reach your goals.',
    branchLabel: 'What is your branch?',
    goalLabel: 'Daily goal?',
    continue: 'Continue to Success',
    science: 'Experimental Sciences',
    math: 'Mathematics',
    tech: 'Math Tech',
    management: 'Management & Economics',
    languages: 'Foreign Languages',
    philosophy: 'Literature & Philosophy',
    goalLight: 'Light (15 min)',
    goalMedium: 'Medium (30 min)',
    goalHard: 'Intense (60 min)',
    buildingPlan: 'Building your smart plan...',
    emailError: 'Invalid email address',
    passwordError: 'Must be at least 6 characters',
    or: 'OR'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, dir: language === 'ar' ? 'rtl' : 'ltr', t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}

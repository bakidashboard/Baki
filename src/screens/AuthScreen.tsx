import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import { AuthCard } from '../components/AuthCard';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { BakiMascot } from '../components/BakiMascot';

import { useAuth } from '../contexts/AuthContext';

interface AuthScreenProps {
  initialMode: 'login' | 'signup';
  onSuccess: () => void;
  onBack: () => void;
}

export function AuthScreen({ initialMode, onSuccess, onBack }: AuthScreenProps) {
  const { t, language } = useLanguage();
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    let isValid = true;
    if (!email.includes('@')) {
      setEmailError(t('emailError') || 'Invalid email');
      isValid = false;
    } else {
      setEmailError('');
    }
    if (password.length < 6) {
      setPasswordError(t('passwordError') || 'Password too short');
      isValid = false;
    } else {
      setPasswordError('');
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      if (mode === 'signup') {
         await signup(email, password, name || 'User', gender);
         toast.success('Account created successfully');
      } else {
         await login(email, password);
         toast.success('Logged in successfully');
      }
      onSuccess();
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Logged in with Google');
      onSuccess();
    } catch (err: any) {
      const msg = err.message || 'Google Auth failed';
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setEmailError('');
    setPasswordError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-start h-full py-6 w-full overflow-y-auto hide-scrollbar"
    >
      <div className="mb-8 cursor-pointer" onClick={onBack}>
        <BakiMascot size={80} emotion="happy" />
      </div>

      <AuthCard>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#1A1A1A] mb-2">
              {mode === 'login' ? t('loginTitle') : t('signupTitle')}
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              {mode === 'login' ? t('loginSubtitle') : t('signupSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {mode === 'signup' && (
              <>
                <Input
                  label={t('nameLabel')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                
                <div className="flex flex-col gap-2 mb-4">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">
                      {language === 'ar' ? 'الجنس (لاختيار الصورة الرمزية)' : 'Gender (For Avatar Selection)'}
                   </label>
                   <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
                      {(['male', 'female', 'other'] as const).map((g) => (
                         <button
                           key={g}
                           type="button"
                           onClick={() => setGender(g)}
                           className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                             gender === g 
                               ? 'bg-white text-emerald-600 shadow-sm' 
                               : 'text-slate-400 hover:text-slate-600'
                           }`}
                         >
                            {language === 'ar' ? (g === 'male' ? 'ذكر' : g === 'female' ? 'أنثى' : 'آخر') : g}
                         </button>
                      ))}
                   </div>
                </div>
              </>
            )}
            <Input
              label={t('emailLabel')}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              error={emailError}
              isValid={email.length > 3 && !emailError}
              required
            />
            <Input
              label={t('passwordLabel')}
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
              error={passwordError}
              isValid={password.length >= 6 && !passwordError}
              required
            />

            {mode === 'login' && (
              <div className="flex justify-end -mt-4 mb-6">
                <button type="button" className="text-sm font-bold text-baki-primary hover:text-baki-primary-hover transition-colors">
                  {t('forgotPassword')}
                </button>
              </div>
            )}

            {authError && (
              <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg border border-red-500/20 text-center mb-4">
                {authError}
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="mb-4">
              {mode === 'login' ? t('loginAction') : t('signupAction')}
            </Button>
            
            <div className="relative flex items-center py-4 mb-4">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-gray-300 text-[10px] uppercase tracking-widest font-bold">{t('or') || 'OR'}</span>
              <div className="flex-grow border-t border-gray-100"></div>
            </div>

            <Button type="button" variant="google" fullWidth onClick={handleGoogleLogin} className="mb-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('signInWithGoogle')}
            </Button>

            <Button type="button" variant="ghost" fullWidth onClick={toggleMode} className="mt-2 text-sm font-semibold">
              {mode === 'login' ? t('noAccount') : t('haveAccountSignup')}
            </Button>
          </form>
        </motion.div>
      </AuthCard>
    </motion.div>
  );
}

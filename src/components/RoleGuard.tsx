import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'moderator' | 'teacher' | 'premium' | 'student')[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, loading, isAdmin, isModerator, isTeacher, isPremium } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 flex-shrink-0 border-4 border-lime-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Unauthorized if no user is signed in
  if (!user) {
    return fallback ? <>{fallback}</> : <AccessDenied />;
  }

  // Determine user's highest logical role
  let userRoles = ['student'];
  if (isAdmin) userRoles.push('admin');
  if (isModerator) userRoles.push('moderator');
  if (isTeacher) userRoles.push('teacher');
  if (isPremium) userRoles.push('premium');

  const hasAccess = allowedRoles.some(role => userRoles.includes(role));

  if (!hasAccess) {
    return fallback ? <>{fallback}</> : <AccessDenied requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
}

function AccessDenied({ requiredRoles = [] }: { requiredRoles?: string[] }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl text-center border border-white/50 max-w-sm mx-auto my-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
         <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Access Denied</h2>
      <p className="text-slate-500 mb-6 font-medium leading-relaxed">
        You do not have the required permissions to view this section.
        {requiredRoles.length > 0 && (
          <span className="block mt-2 text-sm bg-slate-100 p-2 rounded-lg text-slate-500">
             Required Clearance: {requiredRoles.join(', ')}
          </span>
        )}
      </p>
      <Button variant="outline" onClick={() => window.location.href = '/'}>
        Return to Dashboard
      </Button>
    </div>
  );
}

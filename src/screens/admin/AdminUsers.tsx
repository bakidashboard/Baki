import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  Ban, 
  CheckCircle, 
  MoreHorizontal, 
  UserMinus, 
  UserPlus, 
  Download, 
  Filter,
  ShieldAlert,
  Ghost,
  Mail,
  Calendar,
  Lock,
  Unlock,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-hot-toast';
import { useRealtimeUsers } from '../../hooks/useRealtimeUsers';
import { usePresence } from '../../hooks/usePresence';
import { ref, set, push, update } from 'firebase/database';
import { database, firestore } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

function UserCard({ userId, user, isCurrentUser, onAction, isProcessing }: any) {
  const { language } = useLanguage();
  const presence = usePresence(userId);
  const isOnline = presence?.status === 'online';
  const [isExpanding, setIsExpanding] = useState(false);

  return (
    <motion.div 
      layout
      className={`bg-white border-2 rounded-[32px] p-5 transition-all relative overflow-hidden ${user.suspended ? 'border-rose-100 bg-rose-50/10' : 'border-slate-50 hover:border-indigo-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5'}`}
    >
       {user.suspended && (
          <div className="absolute top-0 right-0 p-3">
             <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
       )}

       <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative shrink-0">
             <div className={`w-16 h-16 rounded-[24px] bg-gradient-to-tr flex items-center justify-center text-2xl font-black border-4 border-white shadow-lg overflow-hidden ${
               user.role === 'admin' ? 'from-rose-500 to-orange-400 text-white' :
               user.role === 'premium' ? 'from-[#58cc02] to-emerald-400 text-white' :
               'from-slate-100 to-slate-200 text-slate-500'
             }`}>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  user.displayName?.charAt(0).toUpperCase() || '?'
                )}
             </div>
             <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white shadow-sm ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0 space-y-1">
             <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="font-black text-slate-800 text-lg truncate max-w-[200px]">
                  {user.displayName || 'Anonymous'}
                </h3>
                {isCurrentUser && <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-indigo-100">You</span>}
                <div className="flex gap-1">
                  {user.role === 'admin' && <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Admin</span>}
                  {user.role === 'premium' && <span className="bg-[#58cc02] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Premium</span>}
                  {user.suspended && <span className="bg-rose-100 text-rose-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-rose-200">Suspended</span>}
                </div>
             </div>
             
             <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-slate-400">
                <Mail className="w-3 h-3" />
                <span className="truncate">{user.email}</span>
             </div>

             <div className="flex items-center justify-center sm:justify-start gap-3 mt-2">
                <div className="flex items-center gap-1 group">
                   <Calendar className="w-3 h-3 text-slate-300" />
                   <span className="text-[10px] font-black text-slate-400">Ref: {userId.slice(0, 8)}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-col gap-2 w-full sm:w-auto">
             {user.suspended ? (
                <button 
                  disabled={isProcessing}
                  onClick={() => onAction(userId, 'unsuspended')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black hover:bg-emerald-100 transition-all"
                >
                  <Unlock className="w-3.5 h-3.5" /> {language === 'ar' ? 'فك الحظر' : 'Unblock'}
                </button>
             ) : (
                <button 
                  disabled={isProcessing}
                  onClick={() => onAction(userId, 'suspended')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 text-rose-500 border border-rose-100 text-[10px] font-black hover:bg-rose-50 transition-all"
                >
                  <Ban className="w-3.5 h-3.5" /> {language === 'ar' ? 'حظر الطالب' : 'Block Student'}
                </button>
             )}

             {user.role === 'premium' ? (
                <button 
                  disabled={isProcessing}
                  onClick={() => onAction(userId, 'student')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black hover:bg-amber-100 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" /> {language === 'ar' ? 'إلغاء الاشتراك' : 'Downgrade'}
                </button>
             ) : (
                <button 
                  disabled={isProcessing}
                  onClick={() => onAction(userId, 'premium')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#58cc02]/10 text-[#58cc02] border border-[#58cc02]/20 text-[10px] font-black hover:bg-[#58cc02]/20 transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> {language === 'ar' ? 'تفعيل اشتراك' : 'Grant Premium'}
                </button>
             )}

             <button 
               disabled={isProcessing}
               onClick={() => onAction(userId, user.role === 'admin' ? 'student' : 'admin')}
               className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 text-[10px] font-black hover:bg-slate-200 transition-all"
             >
               <Shield className="w-3.5 h-3.5" /> {user.role === 'admin' ? (language === 'ar' ? 'سحب الإدارة' : 'Revoke Admin') : (language === 'ar' ? 'تعيين مدير' : 'Make Admin')}
             </button>
          </div>
       </div>
    </motion.div>
  );
}

export function AdminUsers() {
  const { user, isAdmin, refreshClaims } = useAuth();
  const { language } = useLanguage();
  const { users, loading } = useRealtimeUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'premium' | 'admin' | 'suspended'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = Object.entries(users).filter(([id, u]: [string, any]) => {
     const matchesSearch = u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           id.includes(searchTerm);
     
     if (filter === 'all') return matchesSearch;
     if (filter === 'premium') return matchesSearch && u.role === 'premium';
     if (filter === 'admin') return matchesSearch && u.role === 'admin';
     if (filter === 'suspended') return matchesSearch && u.suspended;
     return matchesSearch;
  });

  const performAction = async (targetUid: string, action: string) => {
    if (!isAdmin) {
       toast.error('Admin privileges required.');
       return;
    }
    
    setIsProcessing(true);
    const loadingToast = toast.loading('Synchronizing student database...');

    try {
      if (action === 'suspended' || action === 'unsuspended') {
        const isBanned = action === 'suspended';
        
        // 1. Update Realtime DB
        await update(ref(database, `users/${targetUid}`), { suspended: isBanned });
        
        // 2. Update Firestore
        try {
          await setDoc(doc(firestore, 'users', targetUid), { 
            suspended: isBanned,
            isSuspended: isBanned
          }, { merge: true });
        } catch (e) { console.warn("Firestore sync warning", e); }

        // 3. Security Log
        const logRef = push(ref(database, 'security/logs'));
        await set(logRef, {
          title: isBanned ? "Account Banned" : "Account Unbanned",
          admin: user?.email,
          target: targetUid,
          timestamp: Date.now()
        });

        toast.success(isBanned ? 'Account has been locked.' : 'Account access restored.');
      } else {
        // Handle Role Updates (Premium, Admin, Student)
        const token = await user?.getIdToken();
        const claims: any = {};
        
        if (action === 'admin') {
           claims.admin = true;
           claims.premium = true;
        } else if (action === 'premium') {
           claims.premium = true;
           claims.admin = false; // Revoke admin if granting premium
        } else {
           // Default student role
           claims.admin = false;
           claims.premium = false;
        }

        const res = await fetch('/api/admin/setCustomClaims', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ uid: targetUid, claims })
        });

        if (!res.ok) {
           const err = await res.json();
           throw new Error(err.error || 'Network propagation failed');
        }

        // Update Realtime Database node for UI presence
        await update(ref(database, `users/${targetUid}`), { 
           role: action === 'student' ? 'student' : action 
        });

        toast.success(`${action.toUpperCase()} permissions sync completed.`);
        if (targetUid === user?.uid) await refreshClaims();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleExportCSV = () => {
    const headers = ["UID", "Name", "Email", "Role", "Banned"];
    const rows = filtered.map(([uid, u]: any) => [
      uid,
      `"${u.displayName || "Anonymous"}"`,
      u.email || "",
      u.role || "student",
      u.suspended ? "Yes" : "No"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `BAKI_USER_EXPORT_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-32">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter">Student Galaxy</h1>
            <p className="text-slate-400 font-bold mt-1">Manage {filtered.length} nodes in the educational network.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" className="rounded-2xl border-2 border-slate-100 bg-white" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" /> Export
             </Button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
             <Search className="w-5 h-5 text-slate-300 absolute left-5 top-1/2 -translate-y-1/2" />
             <input 
               type="text" 
               placeholder="Search by student name, email, or digital signature..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border-2 border-slate-50 rounded-[28px] pl-14 pr-6 py-4 font-bold text-slate-800 focus:border-indigo-200 outline-none transition-all shadow-sm"
             />
          </div>
          <div className="relative">
             <Filter className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
             <select 
               value={filter}
               onChange={(e) => setFilter(e.target.value as any)}
               className="w-full bg-white border-2 border-slate-50 rounded-[28px] pl-10 pr-6 py-4 font-black text-xs text-slate-600 appearance-none outline-none focus:border-indigo-200 shadow-sm"
             >
                <option value="all">All Explorers</option>
                <option value="premium">Premium Only</option>
                <option value="admin">Admins</option>
                <option value="suspended">Suspended</option>
             </select>
          </div>
       </div>

       {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin" />
             <p className="text-slate-300 font-black tracking-widest uppercase text-[10px]">Loading student grid...</p>
          </div>
       ) : filtered.length === 0 ? (
          <div className="py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 text-center flex flex-col items-center gap-4">
             <Ghost className="w-12 h-12 text-slate-200" />
             <p className="text-slate-400 font-black">No matching records floating in this sector.</p>
          </div>
       ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             {filtered.map(([id, u]) => (
                <UserCard 
                  key={id}
                  userId={id}
                  user={u}
                  isCurrentUser={id === user?.uid}
                  onAction={performAction}
                  isProcessing={isProcessing}
                />
             ))}
          </div>
       )}
    </div>
  );
}


import React from 'react';
import { useRealtimeUsers, UserNode } from '../hooks/useRealtimeUsers';
import { usePresence } from '../hooks/usePresence';
import { motion, AnimatePresence } from 'motion/react';

function UserStatusMarker({ userId }: { userId: string }) {
  const presence = usePresence(userId);
  const isOnline = presence?.status === 'online';

  return (
    <div className={`w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} title={isOnline ? 'Online' : 'Offline'} />
  );
}

export function UserList() {
  const { users, loading } = useRealtimeUsers();

  if (loading) {
    return <div className="text-sm font-medium text-slate-400">Loading users...</div>;
  }

  const userEntries = Object.entries(users) as [string, UserNode][];
  
  if (userEntries.length === 0) {
    return <div className="text-sm font-medium text-slate-400">No users found in database.</div>;
  }

  return (
    <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50 mb-8 flex flex-col max-h-[380px] md:max-h-[500px] overflow-hidden">
      <h3 className="text-lg font-bold text-slate-800 mb-4 z-10 relative flex-none">Recent Students</h3>
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 hide-scrollbar scroll-touch">
        <AnimatePresence>
          {userEntries.map(([userId, user]) => (
            <motion.div
              key={userId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-white font-bold shadow-sm overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      user.displayName?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    <UserStatusMarker userId={userId} />
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-700 text-sm">{user.displayName || 'Anonymous'}</div>
                  <div className="text-xs text-slate-400 font-medium truncate max-w-[120px]">{user.email}</div>
                </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-slate-200/50 px-2 py-1 rounded-full">
                Student
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

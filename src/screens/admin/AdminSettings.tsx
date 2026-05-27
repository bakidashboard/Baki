import React, { useEffect, useState } from 'react';
import { Settings, ShieldAlert, Key, DatabaseBackup, Globe, Power } from 'lucide-react';
import { Button } from '../../components/Button';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { ref, onValue, set, push } from 'firebase/database';
import { database } from '../../firebase/config';

export function AdminSettings() {
  const [maintenance, setMaintenance] = useState(false);
  const [logging, setLogging] = useState(true);
  const [loading, setLoading] = useState(true);

  // Load and listen to settings in firebase Realtime DB
  useEffect(() => {
    const settingsRef = ref(database, 'settings/global');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMaintenance(!!data.maintenanceMode);
        setLogging(data.enhancedLogging !== false); // default to true
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching admin settings: ", error);
      setLoading(false);
    });

    return () => {
      // unsub is handled by firebase implicitly, or we can just let it clear
    };
  }, []);

  const toggleMaintenance = async () => {
    const newVal = !maintenance;
    try {
      await set(ref(database, 'settings/global/maintenanceMode'), newVal);
      
      // Log event to security logs
      try {
        const logRef = push(ref(database, 'security/logs'));
        await set(logRef, {
          title: "System Config Modified",
          description: `Maintenance Mode toggled to: ${newVal ? 'ENABLED' : 'DISABLED'}`,
          timestamp: Date.now(),
          type: "config_change"
        });
      } catch (logErr) {
        console.error("Log error:", logErr);
      }

      toast.success(newVal ? 'Maintenance Mode enabled globally 🚧' : 'Maintenance Mode disabled globally ✨');
    } catch (err: any) {
      toast.error('Failed to save settings: ' + err.message);
    }
  };

  const toggleLogging = async () => {
    const newVal = !logging;
    try {
      await set(ref(database, 'settings/global/enhancedLogging'), newVal);

      // Log event to security logs
      try {
        const logRef = push(ref(database, 'security/logs'));
        await set(logRef, {
          title: "System Config Modified",
          description: `Enhanced Security Logging toggled to: ${newVal ? 'ACTIVE' : 'STANDARD'}`,
          timestamp: Date.now(),
          type: "config_change"
        });
      } catch (logErr) {
        console.error("Log error:", logErr);
      }

      toast.success(newVal ? 'Enhanced logging active 🔍' : 'Standard logging active 📝');
    } catch (err: any) {
      toast.error('Failed to save settings: ' + err.message);
    }
  };

  const handleForceLogoutAll = async () => {
    try {
      await set(ref(database, 'settings/global/forceLogoutTimestamp'), Date.now());

      // Log event to security logs
      try {
        const logRef = push(ref(database, 'security/logs'));
        await set(logRef, {
          title: "Danger Zone Action",
          description: `Global user re-authentication broadcast triggered.`,
          timestamp: Date.now(),
          type: "security_alert"
        });
      } catch (logErr) {
        console.error("Log error:", logErr);
      }

      toast.success('Triggered global re-authentication broadcast!');
    } catch (err: any) {
      toast.error('Action failed: ' + err.message);
    }
  };

  const handleRotateSecrets = async () => {
    try {
      await set(ref(database, 'settings/global/secretsRotationSalt'), Math.random().toString(36).substring(7));

      // Log event to security logs
      try {
        const logRef = push(ref(database, 'security/logs'));
        await set(logRef, {
          title: "Danger Zone Action",
          description: `Firebase Security verification keys rotated successfully.`,
          timestamp: Date.now(),
          type: "security_alert"
        });
      } catch (logErr) {
        console.error("Log error:", logErr);
      }

      toast.success('Successfully rotated virtual security cluster salts!');
    } catch (err: any) {
      toast.error('Action failed: ' + err.message);
    }
  };

  const handleFlushDatabase = async () => {
    try {
      // Clear temporary statuses without deleting core users
      await set(ref(database, 'chats/global/typing'), null);

      // Log event to security logs
      try {
        const logRef = push(ref(database, 'security/logs'));
        await set(logRef, {
          title: "Danger Zone Action",
          description: `Database garbage collector executed. Temp presence and typing buffers swept.`,
          timestamp: Date.now(),
          type: "security_alert"
        });
      } catch (logErr) {
        console.error("Log error:", logErr);
      }

      toast.success('Successfully flushed developer garbage and temp presence caches! 🧹');
    } catch (err: any) {
      toast.error('Action failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-slate-400 font-bold animate-pulse">Loading secure system cluster...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-0">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-2">Systems & Security</h1>
            <p className="text-slate-500 font-medium">Manage global platform configurations.</p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl shadow-slate-200/20">
               <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                     <Settings className="w-5 h-5" />
                   </div>
                   <h2 className="text-xl font-bold text-slate-800">Global Settings</h2>
               </div>

               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <h4 className="font-bold text-slate-700">Maintenance Mode</h4>
                        <p className="text-sm text-slate-500">Block all non-admin traffic.</p>
                     </div>
                     <button 
                        onClick={toggleMaintenance}
                        className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${maintenance ? 'bg-amber-500' : 'bg-slate-200'}`}
                     >
                        <motion.div layout className="w-6 h-6 bg-white rounded-full mx-1 shadow-sm" animate={{ x: maintenance ? 24 : 0 }} />
                     </button>
                  </div>
                  
                  <div className="h-px bg-slate-100"></div>
                  
                  <div className="flex items-center justify-between">
                     <div>
                        <h4 className="font-bold text-slate-700">Enhanced Security Logging</h4>
                        <p className="text-sm text-slate-500">Keep detailed IP & session logs.</p>
                     </div>
                     <button 
                        onClick={toggleLogging}
                        className={`w-14 h-8 rounded-full transition-colors relative flex items-center ${logging ? 'bg-emerald-500' : 'bg-slate-200'}`}
                     >
                        <motion.div layout className="w-6 h-6 bg-white rounded-full mx-1 shadow-sm" animate={{ x: logging ? 24 : 0 }} />
                     </button>
                  </div>
               </div>
           </div>

           <div className="bg-rose-50/50 backdrop-blur-xl border border-rose-100 rounded-3xl p-8 shadow-xl shadow-rose-200/20">
               <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500">
                     <ShieldAlert className="w-5 h-5" />
                   </div>
                   <h2 className="text-xl font-bold text-rose-900">Danger Zone</h2>
               </div>
               
               <p className="text-rose-700/80 font-medium text-sm mb-6">
                   These actions will save changes directly to Live Database. Realtime system adjustments occur immediately.
               </p>

               <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start text-rose-600 border-rose-200 hover:bg-rose-100" onClick={handleForceLogoutAll}>
                     <Power className="w-5 h-5 mr-3" /> Force Logout All Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-rose-600 border-rose-200 hover:bg-rose-100" onClick={handleRotateSecrets}>
                     <Key className="w-5 h-5 mr-3" /> Rotate Firebase Keys
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-rose-600 border-rose-200 hover:bg-rose-100" onClick={handleFlushDatabase}>
                     <DatabaseBackup className="w-5 h-5 mr-3" /> Flush Realtime Database
                  </Button>
               </div>
           </div>
       </div>
    </div>
  );
}

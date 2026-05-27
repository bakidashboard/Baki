import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminOverview } from './admin/AdminOverview';
import { AdminUsers } from './admin/AdminUsers';
import { AdminSettings } from './admin/AdminSettings';
import { AdminContent } from './admin/AdminContent';
import { AdminChat } from './admin/AdminChat';
import { AdminSecurity } from './admin/AdminSecurity';
import { AdminAIAdvisor } from './admin/AdminAIAdvisor';

import { AdminAIConfig } from './admin/AdminAIConfig';
import { AdminNotifications } from '../components/admin/AdminNotifications';

export function AdminScreen({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUsers />;
      case 'content':
        return <AdminContent />;
      case 'notifications':
        return <AdminNotifications />;
      case 'ai-hub':
        return <AdminAIConfig />;
      case 'chat':
        return <AdminChat />;
      case 'security':
        return <AdminSecurity />;
      case 'ai-advisor':
        return <AdminAIAdvisor />;
      case 'settings':
        return <AdminSettings />;
      default:
         return (
           <div className="flex flex-col items-center justify-center h-[60vh] text-center">
             <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                <span className="text-4xl">🚀</span>
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Coming Soon</h2>
             <p className="text-slate-500 font-medium max-w-md">
               The {activeTab} module is currently being provisioned for the next enterprise rollout.
             </p>
           </div>
         );
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab} onExit={onBack}>
       {renderContent()}
    </AdminLayout>
  );
}

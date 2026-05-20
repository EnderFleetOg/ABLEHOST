
import React from 'react';
import { useAbility } from '../context/AbilityContext';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications } = useAbility();

  if (!isOpen) return null;

  const typeColors = {
    info: 'border-blue-500 text-blue-500',
    warning: 'border-orange-500 text-orange-500',
    error: 'border-ableRed text-ableRed',
    success: 'border-emerald-500 text-emerald-500'
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, x: 50 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0.9, opacity: 0, x: 50 }}
          className="relative w-full max-w-md bg-ableBlack border-8 border-ableSky rounded-huge shadow-huge overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-8 border-b-4 border-white/10 flex justify-between items-center">
            <h2 className="text-4xl font-black text-ableSky italic uppercase tracking-tighter">Alerts.</h2>
            <div className="flex items-center gap-4">
              <button onClick={clearNotifications} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">Clear All</button>
              <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-20 text-center space-y-4 opacity-20">
                <span className="text-8xl">🔕</span>
                <p className="text-xl font-black uppercase tracking-widest">No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <motion.div 
                  layout
                  key={notification.id}
                  onClick={() => markNotificationRead(notification.id)}
                  className={`p-6 rounded-3xl border-4 bg-white/5 transition-all cursor-pointer group ${notification.read ? 'border-white/5 opacity-50' : typeColors[notification.type]}`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="text-xl font-black uppercase tracking-tighter italic">{notification.title}</h4>
                    {!notification.read && <div className="w-2 h-2 rounded-full bg-ableSky animate-pulse"></div>}
                  </div>
                  <p className="text-sm font-bold text-white/60 mt-2 leading-snug">{notification.message}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-4">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationCenter;

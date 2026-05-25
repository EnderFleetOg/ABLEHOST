
import React, { useState } from 'react';
import { useAbility } from '../context/AbilityContext';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useAbility();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || UserRole.User
  });

  if (!isOpen) return null;

  const handleSave = () => {
    updateUser(formData);
    onClose();
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
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-ableBlack border-8 border-ableTeal rounded-huge shadow-huge overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-8 border-b-4 border-white/10 flex justify-between items-center">
            <h2 className="text-4xl font-black text-ableTeal italic uppercase tracking-tighter">User Profile</h2>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
            <div className="flex flex-col items-center gap-6">
              <div className="w-32 h-32 bg-ableTeal/20 rounded-huge flex items-center justify-center text-6xl border-4 border-ableTeal/40">👤</div>
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-widest text-white/30">ID: {user?.id}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/5 border-4 border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white outline-none focus:border-ableTeal transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border-4 border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white outline-none focus:border-ableTeal transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">System Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {[UserRole.User, UserRole.Mentor, UserRole.Doctor, UserRole.HomeMember].map(role => (
                    <button
                      key={role}
                      onClick={() => setFormData({ ...formData, role })}
                      className={`py-3 rounded-xl border-2 font-black uppercase text-[10px] transition-all ${formData.role === role ? 'border-ableTeal bg-ableTeal/20 text-ableTeal' : 'border-white/10 text-white/40'}`}
                    >
                      {role.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-10 space-y-4">
              <button 
                onClick={handleSave}
                className="w-full py-6 bg-ableTeal text-ableBlack rounded-3xl font-black text-xl uppercase tracking-widest shadow-huge active:scale-95 transition-all"
              >
                Save Changes
              </button>
              <button 
                onClick={logout}
                className="w-full py-4 border-4 border-ableRed/20 text-ableRed rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-ableRed hover:text-white transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileModal;


import React, { useState } from 'react';
import { useAbility } from '../context/AbilityContext';
import { UserRole } from '../types';
import Logo from './Logo';
import CursorBuddy from './CursorBuddy';
import { motion, AnimatePresence } from 'motion/react';

const AuthFlow: React.FC = () => {
  const { login, register, speak } = useAbility();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>(UserRole.User);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register') {
      if (!email || !password || !name) {
        speak("Please fill in all details.");
        return;
      }
      if (password !== confirmPassword) {
        speak("Passwords do not match.");
        return;
      }
      const success = register(email, password, name, role);
      if (success) {
        speak(`Profile synchronized. Welcome ${name}! Your ${role} profile is active.`);
      }
    } else {
      if (!email || !password) {
        speak("Please enter your credentials.");
        return;
      }
      const success = login(email, password);
      if (success) {
        speak("Access granted. Syncing ability profile.");
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-ableBlack overflow-y-auto overflow-x-hidden scroll-container relative">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-ableTeal/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-ablePurple/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="min-h-full flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full space-y-10 py-12"
        >
          <header className="text-center space-y-6">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="w-24 h-24 bg-white rounded-huge mx-auto flex items-center justify-center p-2 shadow-glow cursor-pointer"
            >
              <Logo />
            </motion.div>
            <div className="space-y-2">
              <h1 className="text-6xl font-black text-ableTeal tracking-tighter italic uppercase leading-none">ABLE.</h1>
              <motion.p 
                key={mode}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs md:text-sm font-black text-white/40 tracking-[0.4em] uppercase"
              >
                {mode === 'login' ? 'SECURE ACCESS' : 'JOIN THE ECOSYSTEM'}
              </motion.p>
            </div>
          </header>

          <div className="bg-white/5 p-1 md:p-8 rounded-3xl md:rounded-huge border-2 md:border-4 border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ableTeal/10 via-ableBlue/5 to-transparent pointer-events-none" />
            
            <form onSubmit={handleAuth} className="relative z-10 space-y-8 p-6 md:p-2">
              <div className="flex bg-black/40 p-1.5 rounded-2xl gap-2 border border-white/5">
                <button 
                  type="button" 
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all relative overflow-hidden ${mode === 'login' ? 'text-ableBlack' : 'text-white/40 hover:text-white/60'}`}
                >
                  {mode === 'login' && (
                    <motion.div 
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-ableTeal"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">LOGIN</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setMode('register')}
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all relative overflow-hidden ${mode === 'register' ? 'text-ableBlack' : 'text-white/40 hover:text-white/60'}`}
                >
                  {mode === 'register' && (
                    <motion.div 
                      layoutId="tab-bg"
                      className="absolute inset-0 bg-ableTeal"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">REGISTER</span>
                </button>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {mode === 'register' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3 overflow-hidden"
                    >
                      <label className="text-[10px] font-black text-ableTeal tracking-[0.3em] uppercase ml-1">Your Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="NAME"
                        className="w-full bg-black/40 border-2 md:border-4 border-white/10 rounded-2xl px-6 py-4 text-lg md:text-xl font-black text-white focus:border-ableTeal focus:bg-black/60 outline-none transition-all placeholder:text-white/10"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div layout className="space-y-3">
                  <label className="text-[10px] font-black text-ableTeal tracking-[0.3em] uppercase ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="EMAIL"
                    autoComplete="email"
                    className="w-full bg-black/40 border-2 md:border-4 border-white/10 rounded-2xl px-6 py-4 text-lg md:text-xl font-black text-white focus:border-ableTeal focus:bg-black/60 outline-none transition-all placeholder:text-white/10"
                  />
                </motion.div>

                <motion.div layout className="space-y-3">
                  <label className="text-[10px] font-black text-ableTeal tracking-[0.3em] uppercase ml-1">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="PASSWORD"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full bg-black/40 border-2 md:border-4 border-white/10 rounded-2xl px-6 py-4 text-lg md:text-xl font-black text-white focus:border-ableTeal focus:bg-black/60 outline-none transition-all placeholder:text-white/10"
                  />
                </motion.div>

                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <label className="text-[10px] font-black text-ableTeal tracking-[0.3em] uppercase ml-1">Confirm Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="REPEAT PASSWORD"
                        autoComplete="new-password"
                        className="w-full bg-black/40 border-2 md:border-4 border-white/10 rounded-2xl px-6 py-4 text-lg md:text-xl font-black text-white focus:border-ableTeal focus:bg-black/60 outline-none transition-all placeholder:text-white/10"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div layout className="space-y-3">
                  <label className="text-[10px] font-black text-ableTeal tracking-[0.3em] uppercase ml-1">Account Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[UserRole.User, UserRole.Specialist, UserRole.Mentor].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-3 rounded-xl text-[8px] font-black tracking-widest border-2 transition-all active:scale-95 ${role === r ? 'bg-ableTeal text-ableBlack border-white shadow-glow' : 'bg-black/40 text-white/40 border-white/5 hover:border-white/20 hover:text-white/60'}`}
                      >
                        {r === UserRole.Specialist ? 'DOCTOR' : r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-5 md:py-6 bg-white text-ableBlack rounded-2xl md:rounded-huge font-black text-xl md:text-2xl shadow-huge hover:bg-ableTeal transition-all relative overflow-hidden group"
              >
                <span className="relative z-10">{mode === 'login' ? 'ENTER ABLE' : 'CREATE PROFILE'}</span>
                <motion.div 
                  className="absolute inset-0 bg-ableTeal opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.button>
            </form>
          </div>

          <footer className="text-center pt-8">
             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] hover:text-white/30 transition-colors cursor-default">Built for Ability by Naksh & Lakshita</p>
          </footer>
        </motion.div>
      </div>
      <CursorBuddy />
    </div>
  );
};

export default AuthFlow;

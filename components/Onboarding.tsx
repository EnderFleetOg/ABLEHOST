
import React, { useState } from 'react';
import { useAbility } from '../context/AbilityContext';
import { VisualAbility, SpeechStyle, UserRole } from '../types';
import { APP_NAME, TAGLINE, CREATORS } from '../constants';
import Logo from './Logo';

interface OnboardingProps {
  onComplete: (role: UserRole) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { pad, updatePAD, speak } = useAbility();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>(UserRole.User);

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="min-h-screen bg-ableBlack flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-ableBlack border-8 border-ableTeal p-12 md:p-20 rounded-huge shadow-huge space-y-16 animate-in zoom-in duration-500">
        
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-white rounded-huge mx-auto flex items-center justify-center mb-6 p-2">
            <Logo />
          </div>
          <h1 className="text-6xl font-black text-ableTeal tracking-tighter">{APP_NAME}</h1>
          <p className="text-white font-black text-xs tracking-[0.4em] uppercase opacity-60">{TAGLINE}</p>
        </div>

        {step === 1 && (
          <div className="space-y-12 animate-in slide-in-from-right-12">
            <h2 className="text-4xl font-black text-center text-white">CHOOSE PATH.</h2>
            <div className="grid grid-cols-1 gap-6">
              {[
                { id: UserRole.User, label: 'USER', icon: '👤', desc: 'Personal accessibility explorer' },
                { id: UserRole.Doctor, label: 'DOCTOR', icon: '🩺', desc: 'Expert medical specialist' },
                { id: UserRole.Mentor, label: 'MENTOR', icon: '🫂', desc: 'Professional guidance' }
              ].map(r => (
                <button 
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-10 rounded-huge border-4 transition-all flex items-center space-x-8 text-left ${role === r.id ? 'bg-ableTeal text-ableBlack border-white ring-4 ring-white/20' : 'bg-white/5 text-white border-white/10'}`}
                >
                  <span className="text-4xl">{r.icon}</span>
                  <div>
                    <span className="text-3xl font-black block">{r.label}</span>
                    <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{r.desc}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={nextStep} className="w-full bg-white text-ableBlack py-8 rounded-huge font-black text-3xl shadow-huge transition-all active:scale-95">CONTINUE</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12 animate-in slide-in-from-right-12">
            {role === UserRole.User ? (
              <>
                <h2 className="text-4xl font-black text-center text-white italic uppercase tracking-tighter">Set Your Profile.</h2>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-ableTeal uppercase tracking-[0.4em]">Visual Perspective</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: VisualAbility.Standard, label: 'STANDARD' },
                        { id: VisualAbility.PartialBlindness, label: 'ACCESSIBLE' }
                      ].map(v => (
                        <button 
                          key={v.id} 
                          onClick={() => updatePAD({ visual: v.id })} 
                          className={`p-8 rounded-huge border-4 font-black transition-all ${pad.visual === v.id ? 'bg-ableTeal text-ableBlack border-white ring-4 ring-white/10' : 'bg-white/5 text-white border-white/10 opacity-40 hover:opacity-100'}`}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-ableTeal uppercase tracking-[0.4em]">Communication Style</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: SpeechStyle.Standard, label: 'STANDARD' },
                        { id: SpeechStyle.StutterAware, label: 'PACE-SYNC' }
                      ].map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => updatePAD({ speech: s.id })} 
                          className={`p-8 rounded-huge border-4 font-black transition-all ${pad.speech === s.id ? 'bg-ableTeal text-ableBlack border-white ring-4 ring-white/20' : 'bg-white/5 text-white border-white/10 opacity-40 hover:opacity-100'}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : role === UserRole.Doctor ? (
              <>
                <h2 className="text-4xl font-black text-center text-ableSky italic uppercase tracking-tighter">Medical Credentials.</h2>
                <div className="space-y-8 bg-white/5 p-10 rounded-huge border-4 border-white/10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-ableSky uppercase tracking-[0.4em]">License Number</label>
                    <input type="text" placeholder="MD-XXXXXX" className="w-full bg-black/40 border-4 border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:border-ableSky outline-none transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-ableSky uppercase tracking-[0.4em]">Specialization</label>
                    <select className="w-full bg-black/40 border-4 border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white outline-none">
                      <option>Occupational Therapist</option>
                      <option>Neurologist</option>
                      <option>Speech Pathologist</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-black text-center text-emerald-500 italic uppercase tracking-tighter">Mentor Profile.</h2>
                <div className="space-y-8 bg-white/5 p-10 rounded-huge border-4 border-white/10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Area of Lived Experience</label>
                    <input type="text" placeholder="e.g. Visual Impairment Navigation" className="w-full bg-black/40 border-4 border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:border-emerald-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Biography</label>
                    <textarea placeholder="Tell us how you can help..." className="w-full bg-black/40 border-4 border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:border-emerald-500 outline-none transition-all h-32"></textarea>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-8 rounded-huge border-4 border-white/10 text-white font-black text-xl hover:bg-white/5 transition-all">BACK</button>
              <button 
                onClick={() => {
                  speak(`Syncing ${role} profile. Welcome to the ecosystem.`);
                  onComplete(role);
                }} 
                className={`flex-1 py-8 rounded-huge font-black text-xl shadow-huge transition-all active:scale-95 ${
                  role === UserRole.Doctor ? 'bg-ableSky text-white' : 
                  role === UserRole.Mentor ? 'bg-emerald-500 text-white' : 
                  'bg-white text-ableBlack'
                }`}
              >
                SYNC SYSTEM
              </button>
            </div>
          </div>
        )}

        <div className="pt-10 border-t-4 border-white/5 text-center text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
          DEVELOPED BY {CREATORS}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

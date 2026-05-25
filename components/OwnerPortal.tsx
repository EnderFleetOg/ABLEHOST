import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAbility } from '../context/AbilityContext';
import { UserRole } from '../types';

interface OwnerPortalProps {
  tab: string;
}

export const OwnerPortal: React.FC<OwnerPortalProps> = ({ tab }) => {
  const { speak, tasks, notifications, addNotification, pad } = useAbility();
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'System init successful.',
    'Speech synthesis engine online.',
    'Adaptive accessibility DNA structure validated.',
    'Owner Naksh synchronized securely over enderfleet.ai@gmail.com.',
  ]);
  const [logInput, setLogInput] = useState('');

  const sendCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logInput) return;
    setConsoleLogs(prev => [...prev, `[USER COMMAND] ${logInput}`]);
    speak(`Dispatching instruction: ${logInput}`);
    setLogInput('');
  };

  const simulatedAudits = [
    { email: 'sarah.m@client.able', role: 'User', integrity: 'Stable', lastEvent: 'Camera analysis success' },
    { email: 'james.c@client.able', role: 'User', integrity: 'High-Focus', lastEvent: 'Speech pacer active' },
    { email: 'dr.aris@able.com', role: 'Doctor', integrity: 'Clinical Checked', lastEvent: 'Diagnostic request' },
    { email: 'mentor.maya@able.com', role: 'Mentor', integrity: 'Guidance Match', lastEvent: 'Connected' }
  ];

  if (tab === 'users') {
    return (
      <div className="space-y-10 animate-in fade-in duration-500 text-left">
        <div className="flex items-center gap-6">
          <div className="w-4 h-24 bg-amber-500 rounded-full shadow-glow"></div>
          <div>
            <h2 className="text-3xl font-black text-amber-500 italic uppercase tracking-tighter">SIMULATED ECOSYSTEM REGISTRY</h2>
            <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Auditing Synced Accessibility Connections</p>
          </div>
        </div>

        <div className="bg-white/5 border-4 border-white/10 p-6 md:p-8 rounded-3xl space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans border-collapse">
              <thead>
                <tr className="border-b-2 border-white/10 text-[9px] font-black text-white/40 tracking-wider uppercase">
                  <th className="py-4 px-2">EMAIL ADDRESS</th>
                  <th className="py-4 px-2">SYSTEM ROLE</th>
                  <th className="py-4 px-2">SYNERGY STATE</th>
                  <th className="py-4 px-2">LAST REGISTERED EVENT</th>
                  <th className="py-4 px-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-bold text-white/80">
                {simulatedAudits.map((item, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-all">
                    <td className="py-4 px-2 font-black italic">{item.email}</td>
                    <td className="py-4 px-2">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase ${
                        item.role === 'Doctor' ? 'bg-ableSky/20 text-ableSky' :
                        item.role === 'Mentor' ? 'bg-emerald-500/20 text-emerald-500' :
                        'bg-ableTeal/20 text-ableTeal'
                      }`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-emerald-500 font-black">{item.integrity}</td>
                    <td className="py-4 px-2 text-white/40">{item.lastEvent}</td>
                    <td className="py-4 px-2 text-right">
                      <button 
                        onClick={() => {
                          addNotification({
                            title: 'Sim Intercept',
                            message: `Simulated secure query forwarded for descriptor: ${item.email}`,
                            type: 'info'
                          });
                          speak(`Querying descriptor metrics for ${item.email}`);
                        }}
                        className="py-1.5 px-3 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase hover:bg-white/10 transition-all text-white"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'system') {
    return (
      <div className="space-y-10 animate-in fade-in duration-500 text-left">
        <div className="flex items-center gap-6">
          <div className="w-4 h-24 bg-amber-500 rounded-full shadow-glow"></div>
          <div>
            <h2 className="text-3xl font-black text-amber-500 italic uppercase tracking-tighter">AI DIAGNOSTICS & TELEMETRY</h2>
            <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Sovereign Command Terminal Control</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Action Log Console */}
          <div className="bg-black/90 p-6 rounded-3xl border-4 border-amber-500/30 flex flex-col md:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-500">SYSTEM STACK CONTROLS</span>
              <span className="text-[9px] text-emerald-500 font-bold tracking-widest uppercase">● STABLE STATE</span>
            </div>
            
            <div className="flex-1 min-h-[220px] bg-black/40 rounded-xl p-4 font-mono text-[10px] text-white/70 overflow-y-auto space-y-1.5 border border-white/5">
              {consoleLogs.map((log, index) => (
                <p key={index}>
                  <span className="text-amber-500 font-bold">&gt;&gt;</span> {log}
                </p>
              ))}
            </div>

            <form onSubmit={sendCustomLog} className="flex gap-2">
              <input 
                type="text" 
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                placeholder="Simulate system console command..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white focus:border-amber-500 outline-none transition-all"
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-amber-500 text-black font-black uppercase text-xs rounded-xl shadow-glow overflow-hidden relative cursor-pointer"
              >
                Execute
              </button>
            </form>
          </div>

          {/* Quick Override Injector Cards */}
          <div className="space-y-6">
            <div className="bg-white/5 border-2 border-white/10 p-6 rounded-3xl space-y-4 text-left">
              <span className="text-2xl">🔥</span>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">DIVINE PRIVILEGES</h4>
              <p className="text-xs text-white/60 leading-relaxed font-bold">
                You have supreme override priority. Every active user container maps to your accessibility adaptation schema. Testing metrics stay isolated locally.
              </p>
              <div className="h-0.5 bg-white/5 my-2"></div>
              <span className="text-[8px] font-black text-amber-500 tracking-widest uppercase italic block">
                ADMIN BYPASS SIGNATURE // OK
              </span>
            </div>

            <div className="bg-white/5 border-2 border-white/10 p-6 rounded-3xl space-y-4 text-left">
              <h4 className="text-xs font-black uppercase text-amber-500 tracking-wider">SPEECH SYNTH METRICS</h4>
              <p className="text-xs text-white/60 font-bold">
                Synthesized Voice Prefer: <span className="text-white italic">{pad.voicePreference}</span>
              </p>
              <p className="text-xs text-white/60 font-bold">
                Simulated Output rate: <span className="text-white italic">{pad.speechRate}x rate</span>
              </p>
              <button 
                onClick={() => speak("Voice telemetry diagnostic validation completed.")}
                className="w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase hover:bg-white/10 transition-all text-white"
              >
                Voice Output Ping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to Dashboard Metrics Panel
  return (
    <div className="space-y-10 animate-in fade-in duration-500 text-left">
      <div className="flex items-center gap-6">
        <div className="w-4 h-24 bg-amber-500 rounded-full shadow-glow"></div>
        <div>
          <h2 className="text-3xl font-black text-amber-500 italic uppercase tracking-tighter">OWNER PRIVILEGES PORTAL</h2>
          <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Sovereign Console Dashboard Panel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Synaptic Links', value: '12', desc: 'Secure connected patient channels', icon: '⚡' },
          { label: 'Diagnostic Load', value: '0.04s', desc: 'Symptom analysis latency', icon: '🧠' },
          { label: 'Ecosystem Tunnels', value: 'AES-256', desc: 'Clinical bridge encryption', icon: '🔑' },
          { label: 'Total Logs Injected', value: '47', desc: 'Audited simulation events', icon: '📋' }
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border-2 border-amber-500/30 p-6 rounded-3xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase text-white/40">{item.label}</span>
                <span className="text-lg">{item.icon}</span>
              </div>
              <h3 className="text-4xl font-black text-amber-400 italic font-mono">{item.value}</h3>
            </div>
            <p className="text-[10px] text-white/50 font-bold mt-4 border-t border-white/5 pt-2 leading-tight uppercase font-sans">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-2 text-left">
          <span className="text-xs font-black uppercase text-amber-500 block">Sovereign Directives</span>
          <h4 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
            Simulate emergency network broadcasting test
          </h4>
          <p className="text-xs text-white/50 font-bold leading-normal">
            Triggers simulated localized telemetry alerts. Instantly sends secure notifications across active simulation users and diagnostic slots safely without loading native network sockets.
          </p>
        </div>
        <button 
          onClick={() => {
            speak("Dispatching global simulated emergency beacon test.");
            addNotification({
              title: "System-wide SOS Test",
              message: "SIMULATION BROADCST: Localized telemetry simulated alert dispatched successfully.",
              type: "warning"
            });
          }}
          className="px-8 py-4 bg-amber-500 text-black font-black italic rounded-xl hover:bg-amber-400 tracking-wider text-xs uppercase shadow-glow flex-shrink-0 cursor-pointer"
        >
          Dispatch SOS Broadcaster
        </button>
      </div>
    </div>
  );
};

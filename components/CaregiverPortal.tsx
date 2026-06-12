import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAbility } from '../context/AbilityContext';

const CaregiverPortal: React.FC<{ tab: string }> = ({ tab }) => {
  const { 
    user, 
    tasks, 
    aiMemories, 
    notifications, 
    addNotification, 
    careCircleMembers, 
    addActivityLog, 
    speak 
  } = useAbility();

  const [activeSegment, setActiveSegment] = useState<'roster' | 'sync'>('roster');
  const [syncToken, setSyncToken] = useState('');
  const [syncedClientName, setSyncedClientName] = useState('Naksh');
  const [requestPendingMap, setRequestPendingMap] = useState<Record<string, boolean>>({});

  // 1. Locate current logged in caregiver member info to verify precise consent settings
  const caregiverMember = careCircleMembers.find(m => m.email.toLowerCase() === user?.email.toLowerCase()) || careCircleMembers[0]; 
  const permissions = caregiverMember?.permissions || {
    memberId: caregiverMember?.id || 'm1',
    viewProgress: true,
    viewGoals: true,
    viewAiInsights: true,
    viewWellBeing: true,
    viewSupportPlans: true,
    viewUpdates: true
  };

  const handleRequestAccess = (permKey: string, docName: string) => {
    setRequestPendingMap(prev => ({ ...prev, [permKey]: true }));
    speak(`Access synchronism request dispatched to ${syncedClientName} for ${docName}.`);
    
    addNotification({
      title: 'Access Request Proposed',
      message: `${user?.name} (Caregiver) has requested secure linkage to view ${docName}.`,
      type: 'info'
    });

    addActivityLog({
      memberName: user?.name || 'Caregiver',
      role: 'Caregiver',
      action: 'Requested Data Stream',
      details: `Dispatched permission request to unlock ${docName} stream.`
    });
  };

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncToken) return;
    speak(`Establishing secure care tunnel for ${syncToken}. Link active.`);
    addNotification({
      title: 'Secure Synchronism Active',
      message: `Direct care authorization synced with client profile ID: ${syncToken.toUpperCase()}.`,
      type: 'success'
    });
    setSyncToken('');
  };

  const renderSafeScope = (permKey: keyof typeof permissions, title: string, renderFn: () => React.ReactNode) => {
    const isGranted = permissions[permKey] as boolean;
    if (isGranted) {
      return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4 text-left">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h3 className="text-sm font-black text-white tracking-widest uppercase italic">{title}</h3>
            <span className="text-[7px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wider">Synced ✔</span>
          </div>
          {renderFn()}
        </div>
      );
    }

    const isPending = requestPendingMap[permKey as string] || false;
    return (
      <div className="bg-black/60 border-2 border-dashed border-white/10 p-6 rounded-2xl relative overflow-hidden text-center min-h-[180px] flex flex-col justify-center items-center space-y-3">
        <div className="text-3xl filter grayscale opacity-40">🔐</div>
        <div className="space-y-1">
          <h3 className="text-xs font-black text-white/40 tracking-wider uppercase">{title} Locked</h3>
          <p className="text-[10px] text-white/30 font-semibold max-w-xs leading-normal">
            {syncedClientName} has restricted access to view this information under their private Consent Controls.
          </p>
        </div>
        <button 
          onClick={() => handleRequestAccess(permKey as string, title)}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${isPending ? 'bg-white/5 text-white/20 border-white/5 cursor-default' : 'bg-white/10 hover:bg-ablePurple text-white border-white/10 hover:border-white/20 active:scale-95'}`}
        >
          {isPending ? '⏳ AWAITING DECRYPT' : '🔑 REQUEST DECRYPT LINK'}
        </button>
      </div>
    );
  };

  if (tab === 'consented') {
    return (
      <div className="space-y-10 animate-in fade-in duration-500 text-left">
        <div className="flex items-center gap-6">
          <div className="w-4 h-20 bg-ablePurple rounded-full shadow-[0_0_10px_#A855F7]"></div>
          <div>
            <h2 className="text-3xl font-black text-ablePurple italic uppercase tracking-tighter">Client Micro-Sync</h2>
            <p className="text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Establish custom physical or clinical care bounds</p>
          </div>
        </div>

        <div className="max-w-xl bg-white/5 border-2 border-white/10 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[80px]"></div>
          <p className="text-sm font-bold text-white/60 italic leading-relaxed mb-6">
            If you are synchronizing custom external diagnostics, enter the client's 6-digit sync key below to unify patient settings into your caretaker cockpit.
          </p>
          
          <form onSubmit={handleSyncSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="caregiver-sync-token" className="text-[8px] font-black text-white/30 uppercase tracking-widest block">Client Sync Token</label>
              <input 
                id="caregiver-sync-token"
                type="text" 
                value={syncToken}
                onChange={(e) => setSyncToken(e.target.value)}
                placeholder="e.g. ABLE-MEMBER-99"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-center text-xl font-black text-ablePurple outline-none focus:border-ablePurple transition-all"
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-4 bg-ablePurple text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 border border-white/20"
            >
              ESTABLISH ENCRYPTED COCKPIT
            </button>
          </form>
        </div>
      </div>
    );
  }

  // HUB Tab
  const completedCount = tasks.filter(t => t.completed).length;
  const progressRatio = tasks.length > 0 ? (completedCount / tasks.length) : 0.8;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
        <div className="flex items-center gap-4 text-left">
          <span className="text-5xl bg-black/40 p-3 rounded-2xl border border-white/10">🏡</span>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic">Care Circle Workspace</h2>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              Direct connection <span className="text-ablePurple font-black">ACTIVE</span> with patient profile: <span className="text-white italic">{syncedClientName}</span>
            </p>
          </div>
        </div>
        <div className="flex bg-black/40 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white/60">
          Sync Status: <span className="text-emerald-400 ml-2 animate-pulse font-black">● TELEMETRY SECURED</span>
        </div>
      </div>

      {/* Grid of 6 role based sections gated by User Consent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Progress Summary */}
        {renderSafeScope('viewProgress', 'Progress Summary', () => (
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-black uppercase text-white/60">
                <span>Task Board Compliance</span>
                <span>{Math.round(progressRatio * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/15">
                <div 
                  className="h-full bg-ablePurple transition-all duration-1000 shadow-[0_0_10px_#A855F7]" 
                  style={{ width: `${progressRatio * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[8px] font-black text-white/30 uppercase block">Tasks Handled</span>
                <span className="text-2xl font-black text-white">{completedCount} <span className="text-xs text-white/20">/ {tasks.length || 8}</span></span>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[8px] font-black text-white/30 uppercase block">Daily Micro-streaks</span>
                <span className="text-2xl font-black text-emerald-400">5 <span className="text-xs text-white/20">Days</span></span>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                <span className="text-[8px] font-black text-white/30 uppercase block">Cognitive Tension</span>
                <span className="text-2xl font-black text-amber-500">Normal</span>
              </div>
            </div>
          </div>
        ))}

        {/* 2. Goals Tracking */}
        {renderSafeScope('viewGoals', 'Client Life Goals', () => {
          const goals = aiMemories.filter(m => m.category === 'Goal');
          return (
            <div className="space-y-3">
              {goals.length === 0 ? (
                <div className="text-xs text-white/30 italic">No structured goals registered currently.</div>
              ) : (
                goals.map(g => (
                  <div key={g.id} className="bg-black/45 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-ablePurple uppercase">🎯 LIFE COACH GOAL</span>
                      <span className="text-[7px] font-black bg-emerald-500/20 text-emerald-400 px-2 rounded">ACTIVE</span>
                    </div>
                    <p className="text-xs text-white leading-relaxed font-bold">"{g.content}"</p>
                  </div>
                ))
              )}
            </div>
          );
        })}

        {/* 3. AI Generated Insights */}
        {renderSafeScope('viewAiInsights', 'AI Cognitive Insights', () => {
          const disabilityMem = aiMemories.filter(m => m.category === 'Disability');
          const accessibilityMem = aiMemories.filter(m => m.category === 'Accessibility');
          return (
            <div className="space-y-3">
              <div className="bg-black/30 p-4 border border-white/5 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧠</span>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Synthesized Glaucoma profile</span>
                </div>
                <p className="text-xs text-white/70 font-medium leading-relaxed italic">
                  "System observations indicate that bright default backgrounds trigger micro-strain and raise reading errors to 14/min. Contrast locks and slow audio pacings are successfully alleviating cognitive burden."
                </p>
              </div>

              {disabilityMem.length > 0 && (
                <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-xs text-white/60">
                  <span className="text-[8px] font-black text-ablePurple uppercase block mb-1">Diagnostic Memory Anchor</span>
                  "{disabilityMem[0].content}"
                </div>
              )}
            </div>
          );
        })}

        {/* 4. Well-being Trends */}
        {renderSafeScope('viewWellBeing', 'Well-Being Trends', () => (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[8px] font-black text-white/40 uppercase">
                  <span>Stress Levels</span>
                  <span className="text-emerald-400">Stable</span>
                </div>
                <div className="flex gap-1 h-8 items-end">
                  {[20, 35, 45, 80, 50, 30, 25].map((val, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm ${i === 3 ? 'bg-amber-500' : 'bg-ablePurple/65'}`}
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>
                <span className="text-[6px] font-black text-white/20 uppercase tracking-widest block text-right">Last 7 Days</span>
              </div>

              <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-1 text-center flex flex-col justify-center">
                <span className="text-[8px] font-black text-white/30 uppercase block">Anxiety Trigger Alert</span>
                <span className="text-xs text-white font-black uppercase">5+ Active Tasks Gated</span>
                <p className="text-[9px] text-white/40 leading-snug">Limit of active tasks strictly kept below 4.</p>
              </div>
            </div>
          </div>
        ))}

        {/* 5. Support Plans */}
        {renderSafeScope('viewSupportPlans', 'Primary Support Plans', () => (
          <div className="space-y-3">
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-xs font-bold space-y-2">
              <div className="flex justify-between text-[8px] font-black text-ablePurple uppercase">
                <span>Visual Aid Plan</span>
                <span>Active</span>
              </div>
              <p className="text-[11px] text-white/80">Keep high contrast modes turned on. Highlight main cards with thick bounding borders to outline reading fields.</p>
            </div>

            <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 text-xs font-bold space-y-2">
              <div className="flex justify-between text-[8px] font-black text-ablePurple uppercase">
                <span>Vocal Pacings</span>
                <span>0.9 Speed Standard</span>
              </div>
              <p className="text-[11px] text-white/80">Voice instructions read back via voice synthesized helper should maintain slow, calming pacings.</p>
            </div>
          </div>
        ))}

        {/* 6. Important Updates */}
        {renderSafeScope('viewUpdates', 'Important Status Updates', () => (
          <div className="space-y-2.5 max-h-[160px] overflow-y-auto no-scrollbar">
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-[10px] text-red-400 font-bold flex justify-between">
              <span>⚠️ Glaucoma visual fatigue logged during layout tuning</span>
              <span>Today</span>
            </div>
            <div className="bg-black/40 border border-white/5 p-3 rounded-xl text-[10px] text-white/50 font-bold flex justify-between">
              <span>✓ Daily task completion metrics hit 100% compliance</span>
              <span>Yesterday</span>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default CaregiverPortal;

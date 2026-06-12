import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAbility } from '../context/AbilityContext';
import { CareCircleMember, UserRole } from '../types';

const CircleOfCare: React.FC = () => {
  const { 
    pad, 
    updatePAD, 
    speak, 
    searchQuery,
    careCircleMembers,
    addCareCircleMember,
    updateCareCircleMemberPermissions,
    removeCareCircleMember,
    activityLogs,
    addActivityLog,
    addNotification
  } = useAbility();

  const [activeFilter, setActiveFilter] = useState<'all' | 'caregivers' | 'doctors' | 'teachers'>('all');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'parent' | 'caregiver' | 'mentor' | 'teacher' | 'doctor' | 'healthcare'>('caregiver');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial Invite Permissions
  const [initialPermissions, setInitialPermissions] = useState({
    viewProgress: true,
    viewGoals: true,
    viewAiInsights: true,
    viewWellBeing: true,
    viewSupportPlans: true,
    viewUpdates: true
  });

  // Emergency state
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const filteredMembers = careCircleMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeFilter === 'caregivers') return m.role === 'caregiver' || m.role === 'parent';
    if (activeFilter === 'doctors') return m.role === 'doctor' || m.role === 'healthcare';
    if (activeFilter === 'teachers') return m.role === 'teacher';
    return true;
  });

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) {
      speak("Please provide both name and email for the invitation.");
      return;
    }

    const avatarMap: Record<string, string> = {
      parent: '👪',
      caregiver: '👩‍⚕️',
      mentor: '🤝',
      teacher: '👨‍🏫',
      doctor: '👨‍⚕️',
      healthcare: '🏥'
    };

    addCareCircleMember({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      avatar: avatarMap[inviteRole] || '👤'
    }, initialPermissions);

    const speakRole = inviteRole === 'parent' ? 'parent' : inviteRole;
    speak(`Encrypted care invitation created for ${inviteName}. Sharing profile matches your selected permission set.`);
    
    setInviteName('');
    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleTogglePermission = (memberId: string, permissionKey: string, currentValue: boolean) => {
    const member = careCircleMembers.find(m => m.id === memberId);
    if (!member) return;

    updateCareCircleMemberPermissions(memberId, {
      [permissionKey]: !currentValue
    });

    const permName = permissionKey.replace('view', '').replace(/([A-Z])/g, ' $1').trim();
    const actionText = !currentValue ? "Granted access to" : "Revoked access from";
    
    speak(`${actionText} ${permName} for ${member.name}.`);
    
    addActivityLog({
      memberName: 'User (You)',
      role: 'User',
      action: 'Updated Shared Scope',
      details: `${actionText} ${permName} logs for member ${member.name}.`
    });
  };

  const handleCopyLink = (memberId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(memberId);
    speak("Sync link copied to clipboard.");
    addNotification({
      title: 'Token Copied',
      message: 'Secure invitation link copied to system clipboard.',
      type: 'success'
    });
    setTimeout(() => {
      setCopiedId(null);
    }, 3000);
  };

  const handleAddEmergencyContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emergencyName || !emergencyPhone) return;

    const currentContacts = pad.emergencyContacts || [];
    const updated = [...currentContacts, { name: emergencyName, phone: emergencyPhone }];
    updatePAD({ emergencyContacts: updated });

    speak(`Emergency contact ${emergencyName} registered in your primary alert systems.`);
    addNotification({
      title: 'Emergency Contact Installed',
      message: `${emergencyName} is now synced to your standard SOS trigger.`,
      type: 'success'
    });

    addActivityLog({
      memberName: 'User (You)',
      role: 'User',
      action: 'Configured Emergency Contact',
      details: `Added ${emergencyName} (${emergencyPhone}) to the local emergency network.`
    });

    setEmergencyName('');
    setEmergencyPhone('');
  };

  const handleRemoveEmergencyContact = (idx: number) => {
    const currentContacts = pad.emergencyContacts || [];
    const removedName = currentContacts[idx]?.name || '';
    const updated = currentContacts.filter((_, i) => i !== idx);
    updatePAD({ emergencyContacts: updated });

    speak(`Emergency contact ${removedName} removed.`);
    addActivityLog({
      memberName: 'User (You)',
      role: 'User',
      action: 'Removed Emergency Contact',
      details: `Deleted contact ${removedName} from local safety settings.`
    });
  };

  return (
    <div className="space-y-12 py-6">
      <header className="space-y-6">
        <div className="flex items-center space-x-3 text-ablePurple font-black tracking-[0.25em] uppercase text-[10px]">
          <span className="w-10 h-1 bg-ablePurple rounded-full shadow-[0_0_10px_#A855F7]" />
          <span>SUPPORT INFRASTRUCTURE</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">Care Circle</h1>
            <p className="text-lg text-white/60 leading-relaxed font-bold max-w-2xl mt-1">
              Add trusted family, caregivers, mentors, teachers, or primary doctors. Control exactly what goals, insights, and records they can securely monitor.
            </p>
          </div>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="px-8 py-4 bg-ablePurple hover:bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-huge active:scale-95 border-2 border-white/20 whitespace-nowrap"
          >
            🤝 New Invite Link
          </button>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {['all', 'caregivers', 'doctors', 'teachers'].map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f as any)}
              className={`px-6 py-2.5 rounded-lg font-black text-[10px] tracking-widest border-2 transition-all uppercase ${activeFilter === f ? 'bg-ablePurple text-white border-white shadow-lg' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
            >
              {f === 'caregivers' ? 'Caregivers & Parents' : f === 'doctors' ? 'Clinical Doctors' : f === 'teachers' ? 'Instructors & Coaches' : 'All Circle'}
            </button>
          ))}
        </div>
      </header>

      {/* Circle Members Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-6">
          <h2 className="text-xl font-black uppercase text-white/40 tracking-widest">Connected Partners ({filteredMembers.length})</h2>
          
          <div className="space-y-6">
            {filteredMembers.length === 0 ? (
              <div className="bg-white/5 border-2 border-white/10 p-12 rounded-2xl text-center space-y-4">
                <span className="text-6xl block">🌾</span>
                <p className="text-white/60 font-black text-sm uppercase tracking-wider">No circle members found.</p>
                <p className="text-white/30 text-xs">Register or generate an secure invite token to connect helpers.</p>
              </div>
            ) : (
              filteredMembers.map(member => (
                <div 
                  key={member.id}
                  className={`bg-white/5 border-2 p-6 rounded-2xl space-y-6 transition-all relative overflow-hidden flex flex-col justify-between ${member.status === 'pending' ? 'border-dashed border-white/20 opacity-80' : 'border-white/10 hover:border-ablePurple'}`}
                >
                  {/* Status Indicator */}
                  {member.status === 'pending' ? (
                    <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 animate-pulse">Pending Auth</span>
                    </div>
                  ) : member.isOnline ? (
                    <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Synced Active</span>
                    </div>
                  ) : (
                    <div className="absolute top-4 right-4 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Offline</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <span className="text-5xl bg-black/40 p-3 rounded-2xl border border-white/10">{member.avatar}</span>
                    <div>
                      <h3 className="text-2xl font-black text-white italic">{member.name}</h3>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none mt-1">
                        {member.role.toUpperCase()} <span className="text-white/20">//</span> {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Granular Permissions Section */}
                  <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-3">
                    <span className="text-[8px] font-black uppercase tracking-[0.25em] text-ablePurple block">Granular Data Permissions</span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { key: 'viewProgress', label: 'Progress Summaries' },
                        { key: 'viewGoals', label: 'Life Goals' },
                        { key: 'viewAiInsights', label: 'AI Cognitive Insights' },
                        { key: 'viewWellBeing', label: 'Well-being Trends' },
                        { key: 'viewSupportPlans', label: 'Support Plans' },
                        { key: 'viewUpdates', label: 'Status Updates' }
                      ].map(perm => {
                        const isChecked = (member.permissions as any)[perm.key] || false;
                        return (
                          <label 
                            key={perm.key} 
                            className={`flex items-center gap-2 p-2 rounded-lg border-2 cursor-pointer select-none transition-all active:scale-95 ${isChecked ? 'bg-ablePurple/10 border-ablePurple text-white' : 'bg-white/5 border-white/5 hover:border-white/10 text-white/40'}`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handleTogglePermission(member.id, perm.key, isChecked)}
                              className="accent-ablePurple w-3.5 h-3.5 flex-shrink-0 cursor-pointer"
                            />
                            <span className="text-[8px] font-black uppercase tracking-tighter leading-snug">{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="flex flex-wrap md:flex-nowrap gap-3 pt-3 border-t border-white/5">
                    {member.status === 'pending' && (
                      <button 
                        onClick={() => handleCopyLink(member.id, member.inviteLink)}
                        className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white/80 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:border-white/20 transition-colors"
                      >
                        {copiedId === member.id ? '✅ COPIED LINK' : '🔗 COPY SECURE SYNC LINK'}
                      </button>
                    )}
                    <button 
                      onClick={() => removeCareCircleMember(member.id)}
                      className="px-4 py-2.5 border-2 border-transparent hover:border-ableRed text-white/30 hover:text-ableRed rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Sever Sync
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right column: Emergency contacts and Activities */}
        <div className="space-y-8">
          {/* Emergency Settings */}
          <section className="bg-white/5 border-2 border-white/10 p-6 md:p-8 rounded-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🖐️</span>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic">SOS Beacon Configuration</h2>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Immediate Alert Broadcast Destinations</p>
              </div>
            </div>

            <form onSubmit={handleAddEmergencyContact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="emergency-contact-name" className="text-[8px] font-black text-white/40 tracking-widest uppercase">Name</label>
                <input 
                  id="emergency-contact-name"
                  type="text" 
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Eleanor Moore"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-ablePurple outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="emergency-contact-phone" className="text-[8px] font-black text-white/40 tracking-widest uppercase">Phone Number</label>
                <div className="flex gap-2">
                  <input 
                    id="emergency-contact-phone"
                    type="tel" 
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="e.g. 555-0199"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:border-ablePurple outline-none"
                  />
                  <button 
                    type="submit" 
                    disabled={!emergencyName || !emergencyPhone}
                    className="px-4 bg-white/10 hover:bg-ablePurple text-white disabled:bg-white/5 disabled:text-white/20 rounded-xl text-xs font-black uppercase transition-all"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Active Broadcasters</span>
              {(!pad.emergencyContacts || pad.emergencyContacts.length === 0) ? (
                <div className="text-xs text-white/20 italic">No phone destinations configured. System will broadcast generic local emergency channels.</div>
              ) : (
                <div className="space-y-2">
                  {pad.emergencyContacts.map((contact, i) => (
                    <div key={i} className="flex justify-between items-center bg-black/45 p-3 rounded-xl border border-white/5 text-xs font-bold">
                      <div>
                        <span className="text-white uppercase italic">{contact.name}</span>
                        <span className="text-white/30 mx-2">//</span>
                        <span className="text-ablePurple">{contact.phone}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveEmergencyContact(i)}
                        className="text-[10px] text-white/20 hover:text-ableRed font-black transition-colors"
                      >
                        REMOVE
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Activity logs */}
          <section className="bg-white/5 border-2 border-white/10 p-6 md:p-8 rounded-2xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic">Access Audit Trail</h2>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Real-time Care Circle Activity Monitor</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
              {activityLogs.length === 0 ? (
                <div className="text-xs text-white/20 italic">No access events recorded.</div>
              ) : (
                activityLogs.map(log => (
                  <div key={log.id} className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-white uppercase">{log.memberName}</span>
                        <span className="bg-white/10 text-white/50 text-[6px] font-black px-2 py-0.5 rounded uppercase ml-2 tracking-widest">{log.role}</span>
                      </div>
                      <span className="text-[8px] text-white/30 font-medium">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[9px] font-black uppercase text-ablePurple tracking-wider">{log.action}</div>
                    <p className="text-[10px] text-white/60 font-bold leading-relaxed">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Invite Link Generation Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-ableBlack border-4 border-ablePurple p-8 rounded-huge max-w-lg w-full relative space-y-6 shadow-2xl text-left"
            >
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute top-6 right-6 text-white/40 hover:text-white"
              >
                ✕
              </button>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white uppercase italic">Generate Sync Token</h3>
                <p className="text-xs text-white/60 font-bold">Invite caregivers, doctors, or schools to synchronize access.</p>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="invite-name" className="text-[8px] font-black text-white/40 uppercase tracking-widest">Full Name</label>
                  <input 
                    id="invite-name"
                    type="text" 
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Dr. Aris Vance"
                    required
                    className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-5 py-3 text-sm font-bold text-white focus:border-ablePurple outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="invite-email" className="text-[8px] font-black text-white/40 uppercase tracking-widest">Email Address</label>
                  <input 
                    id="invite-email"
                    type="email" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. doctor@hospital.com"
                    required
                    className="w-full bg-black/40 border-2 border-white/10 rounded-xl px-5 py-3 text-sm font-bold text-white focus:border-ablePurple outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[8px] font-black text-white/40 uppercase tracking-widest block">Core Support Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'caregiver', label: 'CAREGIVER' },
                      { role: 'parent', label: 'PARENT' },
                      { role: 'teacher', label: 'TEACHER' },
                      { role: 'mentor', label: 'MENTOR' },
                      { role: 'doctor', label: 'DOCTOR' },
                      { role: 'healthcare', label: 'CLINICAL' }
                    ].map(r => (
                      <button 
                        key={r.role}
                        type="button"
                        onClick={() => setInviteRole(r.role as any)}
                        className={`py-2 rounded-lg text-[8px] font-black border-2 transition-all ${inviteRole === r.role ? 'bg-ablePurple text-white border-white' : 'bg-black/30 text-white/40 border-white/5'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded-xl space-y-2 border border-white/5">
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Initial Grant Permissions</span>
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-white/70">
                    {[
                      { key: 'viewProgress', label: 'Progress Summaries' },
                      { key: 'viewGoals', label: 'Life Goals' },
                      { key: 'viewAiInsights', label: 'AI Cognitive Insights' },
                      { key: 'viewWellBeing', label: 'Well-being Trends' },
                      { key: 'viewSupportPlans', label: 'Support Plans' },
                      { key: 'viewUpdates', label: 'Status Updates' }
                    ].map(p => (
                      <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(initialPermissions as any)[p.key]}
                          onChange={() => setInitialPermissions(prev => ({...prev, [p.key]: !(prev as any)[p.key]}))}
                          className="accent-ablePurple cursor-pointer"
                        />
                        <span>{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-ablePurple hover:bg-purple-600 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all"
                >
                  DISPATCH SYNC TOKEN
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CircleOfCare;

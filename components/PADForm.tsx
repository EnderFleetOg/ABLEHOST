
import React, { useState, useCallback } from 'react';
import { useAbility } from '../context/AbilityContext';
import { VisualAbility, VoicePreference, CognitiveMode, ColorPalette } from '../types';

const PADForm: React.FC = () => {
  const { pad, updatePAD, speak, uiIntensity } = useAbility();
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isDictating, setIsDictating] = useState<string | null>(null);

  const handleVoicePreferenceChange = (pref: VoicePreference) => {
    updatePAD({ voicePreference: pref });
    const text = pref === VoicePreference.CalmFemale 
      ? "Voice switched to calm female. This is how I will sound." 
      : "Voice switched to calm male. This is how I will sound.";
    // Immediate feedback
    setTimeout(() => speak(text), 100);
  };

  const startDictation = useCallback((target: 'name' | 'phone' | 'medical') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsDictating(target);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (target === 'name') setNewContactName(transcript);
      if (target === 'phone') setNewContactPhone(transcript.replace(/\s/g, ''));
      if (target === 'medical') updatePAD({ medicalInfo: (pad.medicalInfo || '') + ' ' + transcript });
    };
    recognition.onend = () => setIsDictating(null);
    recognition.start();
  }, [speak, pad.medicalInfo, updatePAD]);

  const setCognitive = (mode: CognitiveMode) => {
    updatePAD({ cognitive: mode });
    const feedback = mode === CognitiveMode.Simplified ? "Simplified mode active." : 
                     mode === CognitiveMode.HighFocus ? "High focus mode active." : "Standard mode active.";
    speak(feedback);
  };

  const addEmergencyContact = () => {
    if (!newContactName || !newContactPhone) return;
    updatePAD({ emergencyContacts: [...pad.emergencyContacts, { name: newContactName, phone: newContactPhone }] });
    setNewContactName('');
    setNewContactPhone('');
    speak(`Added ${newContactName}.`);
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-12 py-10 animate-in fade-in duration-700 pb-32 ${uiIntensity === 'simplified' ? 'px-4' : ''}`}>
      <header className="space-y-1">
        <h2 className="text-3xl font-black text-ableTeal tracking-tighter uppercase italic">Ability DNA.</h2>
        <p className="text-lg font-bold opacity-60">Your unique blueprint for interaction.</p>
      </header>

      <div className="space-y-12">
        {/* Voice Preference Section */}
        <section className="space-y-3">
          <h3 className="text-xs font-black text-ablePurple uppercase tracking-[0.4em]">Vocal Persona</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => handleVoicePreferenceChange(VoicePreference.CalmFemale)}
              className={`p-4 rounded-2xl border-2 transition-all text-lg font-black flex justify-between items-center ${
                pad.voicePreference === VoicePreference.CalmFemale ? 'bg-ableTeal text-ableBlack border-white shadow-huge' : 'bg-white/5 text-white/40 border-white/10'
              }`}
            >
              <span>👩 Calm Female</span>
              {pad.voicePreference === VoicePreference.CalmFemale && <span className="text-lg">🔊</span>}
            </button>
            <button
              onClick={() => handleVoicePreferenceChange(VoicePreference.CalmMale)}
              className={`p-4 rounded-2xl border-2 transition-all text-lg font-black flex justify-between items-center ${
                pad.voicePreference === VoicePreference.CalmMale ? 'bg-ableTeal text-ableBlack border-white shadow-huge' : 'bg-white/5 text-white/40 border-white/10'
              }`}
            >
              <span>👨 Calm Male</span>
              {pad.voicePreference === VoicePreference.CalmMale && <span className="text-lg">🔊</span>}
            </button>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-black text-white/60 tracking-wider">SPEECH RATE ({Math.round(pad.speechRate * 100)}%)</label>
              <button 
                onClick={() => speak("Testing current speaking speed. Is this pace suitable for your Ability DNA?")}
                className="text-ableTeal font-black text-xs uppercase underline tracking-widest hover:text-white transition-colors"
              >
                Test Speed
              </button>
            </div>
            <div className="relative group">
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={pad.speechRate}
                onChange={(e) => updatePAD({ speechRate: parseFloat(e.target.value) })}
                className="w-full h-8 bg-black/40 rounded-full appearance-none cursor-pointer accent-ableTeal border-2 border-white/10 px-2"
              />
              <div className="flex justify-between mt-2 px-1">
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Slower</span>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic tracking-[0.3em]">Calibrated</span>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Faster</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-black text-ablePurple uppercase tracking-[0.4em]">Visual Perspective</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: VisualAbility.Standard, label: 'STANDARD' },
              { id: VisualAbility.PartialBlindness, label: 'PARTIAL BLINDNESS' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => updatePAD({ visual: v.id })}
                className={`p-4 rounded-2xl border-2 transition-all text-lg font-black text-left flex justify-between items-center ${
                  pad.visual === v.id ? 'bg-ableTeal text-ableBlack border-white shadow-huge' : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                <span>{v.label}</span>
                {pad.visual === v.id && <span>🎯</span>}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xs font-black text-ablePurple uppercase tracking-[0.4em]">Cognitive Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: CognitiveMode.Standard, label: 'STANDARD', desc: 'Default.' },
              { id: CognitiveMode.Simplified, label: 'SIMPLIFIED', desc: 'Core UI.' },
              { id: CognitiveMode.HighFocus, label: 'HIGH FOCUS', desc: 'No Anim.' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setCognitive(m.id)}
                className={`p-6 rounded-3xl border-4 transition-all text-left flex flex-col gap-2 ${
                  pad.cognitive === m.id ? 'bg-ableTeal text-ableBlack border-white shadow-xl' : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                <span className="text-xl font-black">{m.label}</span>
                <span className="text-[10px] font-bold opacity-40">{m.desc}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-black text-ableRed uppercase tracking-[0.4em]">Emergency Protocol</h3>
          <div className="bg-white/5 p-4 rounded-2xl border-2 border-white/10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <label className="text-sm font-black text-white/60 tracking-wider uppercase">Blood Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                    <button
                      key={type}
                      onClick={() => updatePAD({ bloodType: type })}
                      className={`py-3 rounded-xl border-2 transition-all font-black text-xs ${
                        pad.bloodType === type ? 'bg-ableRed text-white border-white' : 'bg-white/5 text-white/40 border-white/10'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black text-white/60 tracking-wider uppercase">Medical Warnings</label>
                  <button 
                    onClick={() => startDictation('medical')}
                    className={`flex items-center gap-2 text-[10px] font-black italic uppercase tracking-widest ${isDictating === 'medical' ? 'text-ableRed animate-pulse' : 'text-ableTeal opacity-60 hover:opacity-100'}`}
                  >
                    <span>{isDictating === 'medical' ? '🔴 RECORDING' : '🎙️ DICTATE'}</span>
                  </button>
                </div>
                <textarea
                  value={pad.medicalInfo || ''}
                  onChange={(e) => updatePAD({ medicalInfo: e.target.value })}
                  placeholder="Allergies, Medications, Conditions..."
                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-ableRed min-h-[100px] transition-all resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t-2 border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-black text-white/60 tracking-wider uppercase">Emergency Contacts</label>
                <span className="text-[10px] font-black text-ableTeal">{pad.emergencyContacts.length} SYNCED</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pad.emergencyContacts.map((contact, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-2xl border-2 border-white/10 flex justify-between items-center">
                    <div>
                      <p className="font-black text-white">{contact.name}</p>
                      <p className="text-xs font-bold text-white/40 tracking-wider">{contact.phone}</p>
                    </div>
                    <button 
                      onClick={() => updatePAD({ emergencyContacts: pad.emergencyContacts.filter((_, i) => i !== idx) })}
                      className="text-ableRed font-black text-xs hover:scale-110 transition-transform"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <div className="flex-1">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="NAME"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white font-black placeholder:opacity-20 outline-none focus:border-ableTeal transition-all pr-8 text-xs"
                    />
                    <button 
                      onClick={() => startDictation('name')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm ${isDictating === 'name' ? 'animate-pulse text-ableRed' : 'opacity-40 hover:opacity-100'}`}
                    >
                      🎙️
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="PHONE"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-white font-black placeholder:opacity-20 outline-none focus:border-ableTeal transition-all pr-8 text-xs"
                    />
                    <button 
                      onClick={() => startDictation('phone')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-sm ${isDictating === 'phone' ? 'animate-pulse text-ableRed' : 'opacity-40 hover:opacity-100'}`}
                    >
                      🎙️
                    </button>
                  </div>
                </div>
                <button 
                  onClick={addEmergencyContact}
                  className="bg-white text-ableBlack px-4 py-2 rounded-xl font-black text-[10px] shadow-lg hover:bg-ableTeal transition-all active:scale-95 whitespace-nowrap"
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xs font-black text-ablePurple uppercase tracking-[0.4em]">Chromatic Aura & Layout</h3>
            <div className="flex flex-wrap items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border-2 border-white/10">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-2">Primary</span>
                <input 
                  type="color" 
                  value={pad.customColor || '#2DD4BF'} 
                  onChange={(e) => updatePAD({ customColor: e.target.value })}
                  className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer p-0 overflow-hidden" 
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-2">Secondary</span>
                <input 
                  type="color" 
                  value={pad.customSecondaryColor || '#14B8A6'} 
                  onChange={(e) => updatePAD({ customSecondaryColor: e.target.value })}
                  className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer p-0 overflow-hidden" 
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-2">Accent</span>
                <input 
                  type="color" 
                  value={pad.customAccentColor || '#5EEAD4'} 
                  onChange={(e) => updatePAD({ customAccentColor: e.target.value })}
                  className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer p-0 overflow-hidden" 
                />
              </div>
            </div>
          </div>

          <div className="bg-white/5 p-6 rounded-3xl border-2 border-white/10 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                <span>Color Grid (Quick Swatches)</span>
                <span className="text-ableTeal italic">DNA Verified</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['#2DD4BF', '#FFD700', '#FF4D4D', '#FFA500', '#A855F7', '#38BDF8', '#E6E6FA', '#F43F5E', '#10B981', '#F59E0B'].map(hex => (
                  <button 
                    key={hex}
                    onClick={() => updatePAD({ customColor: hex })}
                    className="w-10 h-10 rounded-xl border-2 border-white/10 hover:border-white transition-all hover:scale-110 active:scale-95 shadow-sm"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest">Button Spacing & Density</label>
              <div className="relative pt-2">
                <input 
                  type="range" 
                  min="4" 
                  max="24" 
                  step="1" 
                  value={pad.buttonPadding || 12}
                  onChange={(e) => updatePAD({ buttonPadding: parseInt(e.target.value) })}
                  className="w-full h-8 bg-black/40 rounded-full appearance-none cursor-pointer accent-ableTeal border-2 border-white/10 px-2"
                />
                <div className="flex justify-between mt-2 px-1">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Compact</span>
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Spaced</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { id: ColorPalette.Teal, label: 'TEAL', bg: 'bg-ableTeal' },
                { id: ColorPalette.Purple, label: 'PURPLE', bg: 'bg-ablePurple' },
                { id: ColorPalette.Sky, label: 'SKY', bg: 'bg-ableSky' },
                { id: ColorPalette.Lavender, label: 'LAVENDER', bg: 'bg-[lavender]' },
                { id: ColorPalette.Sunset, label: 'SUNSET', bg: 'bg-gradient-to-tr from-ableRed via-orange-500 to-yellow-400' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => { 
                    updatePAD({ colorPalette: c.id, customColor: undefined, customSecondaryColor: undefined, customAccentColor: undefined }); 
                    speak(`${c.label} theme selected.`); 
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    pad.colorPalette === c.id ? 'border-white scale-105 shadow-glow font-black' : 'border-white/10 grayscale opacity-60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${c.bg} border-2 border-white/20`} />
                  <span className="text-[8px] font-black tracking-widest">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <button onClick={() => speak("DNA synchronization confirmed.")} className="w-full bg-white text-ableBlack py-4 rounded-3xl font-black text-xl shadow-huge hover:bg-ableTeal transition-all active:scale-95 border-4 border-ableTeal">
          SAVE DNA
        </button>
      </div>
    </div>
  );
};

export default PADForm;

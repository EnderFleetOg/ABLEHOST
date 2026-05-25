import React, { useState } from 'react';
import { useAbility } from '../context/AbilityContext';
import { analyzeAbilityProfile } from '../services/geminiService';
import { VisualAbility, SpeechStyle, CognitiveMode, HearingNeed, VisionNeed, AbilityProfile } from '../types';

const AbilityAnalyzer: React.FC = () => {
  const { pad, updatePAD, speak, t } = useAbility();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<AbilityProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsLoading(true);
    setError(null);
    setProfile(null);

    try {
      const data = await analyzeAbilityProfile(description);
      setProfile(data);
      speak(data.explanation);
    } catch (err) {
      console.error(err);
      setError('System bridge timed out. Please try again with a simple description.');
      speak('Could not complete synaptic profiling. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyProfile = () => {
    if (!profile) return;
    
    updatePAD({
      visual: profile.visual,
      speech: profile.speech,
      cognitive: profile.cognitive,
      hearing: profile.hearing,
      vision: profile.vision,
      largeText: profile.largeText,
      highContrast: profile.highContrast,
      speechRate: profile.speechRate
    });

    speak('Synaptic adaptive settings applied successfully. Your ABLE interface has adapted.');
  };

  const loadQuickPreset = (presetText: string) => {
    setDescription(presetText);
  };

  return (
    <div className="space-y-10 py-6 max-w-4xl mx-auto">
      <header className="space-y-4">
        <div className="flex items-center space-x-3 text-ableTeal font-black tracking-[0.25em] uppercase text-[10px]">
          <span className="w-10 h-1 bg-ableTeal rounded-full" />
          <span>ALGORITHM DESIGN</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">Adaptive Core</h1>
        <p className="text-lg text-white/60 leading-relaxed font-bold max-w-2xl">
          Describe any medical conditions, visual blurriness, hearing levels, speech styles, or focus needs. Our local AI will analyze your description and configure the platform structure to perfectly match your neurodivergent or physical trait.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Input Form */}
        <section className="bg-white/5 border-2 border-white/10 rounded-2xl p-6 md:p-8 space-y-6 md:col-span-2 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-ableTeal/5 rounded-full blur-[60px]" />
          
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tight relative z-10">Describe Perspective</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10" id="analyzer-form">
            <div className="space-y-2">
              <label htmlFor="dna-description" className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Symptoms, Conditions, or Challenges</label>
              <textarea
                id="dna-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Examples: 'I feel high cognitive fatigue and have trouble focusing when pages use bright icons,' or 'My vision is extremely blurry at the center and I prefer slow vocal pacings...'"
                rows={4}
                className="w-full bg-black/45 border-2 border-white/10 rounded-xl p-4 font-bold text-white placeholder-white/20 outline-none focus:border-ableTeal focus:bg-black/60 transition-all text-sm md:text-base resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-wider self-center mr-1">Quick Prompts:</span>
              <button
                type="button"
                id="preset-stutter"
                onClick={() => loadQuickPreset("I stutter heavily under pressure and need high focus Simplified layouts.")}
                className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold uppercase transition-colors"
              >
                Stutter & Focus
              </button>
              <button
                type="button"
                id="preset-low-vision"
                onClick={() => loadQuickPreset("My vision is diagnosed with advanced glaucoma. I struggle to read standard text sizes.")}
                className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold uppercase transition-colors"
              >
                Glaucoma / Low Vision
              </button>
              <button
                type="button"
                id="preset-auditory"
                onClick={() => loadQuickPreset("I am completely deaf and communicate using standard sign language layouts.")}
                className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold uppercase transition-colors"
              >
                Auditory Need
              </button>
            </div>

            <button
              type="submit"
              id="analyze-submit"
              disabled={isLoading || !description.trim()}
              className="w-full py-4 bg-white hover:bg-ableTeal text-ableBlack disabled:bg-white/10 disabled:text-white/20 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-ableBlack mr-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 00 12 5.373 12 12H4z" />
                  </svg>
                  <span>PROFILING BRAIN...</span>
                </>
              ) : (
                <>
                  <span>SYNTHESIZE ABILITY DNA</span>
                  <span>🧠</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="bg-ableRed/10 border border-ableRed/40 p-4 rounded-xl text-center text-ableRed font-bold text-xs" id="analyzer-error">
              {error}
            </div>
          )}
        </section>

        {/* Right column: Adaptive Feedback Info */}
        <section className="bg-white/5 border-2 border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-ableTeal/5 rounded-full blur-[60px]" />
          
          <div className="space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Active Config</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Visual Style</span>
                <span className="text-xs font-black text-ableTeal uppercase tracking-tight">{pad.visual}</span>
              </div>
              <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Speech Pacings</span>
                <span className="text-xs font-black text-ableTeal uppercase tracking-tight">{pad.speech}</span>
              </div>
              <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cognitive State</span>
                <span className="text-xs font-black text-ableTeal uppercase tracking-tight">{pad.cognitive || 'standard'}</span>
              </div>
              <div className="flex justify-between items-center bg-black/25 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Hearing Mode</span>
                <span className="text-xs font-black text-ableTeal uppercase tracking-tight">{pad.hearing || 'standard'}</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mt-6 text-center text-[10px] font-black text-white/20 tracking-wider">
            STATUS: SYNCED & SECURED
          </div>
        </section>
      </div>

      {/* Result Profile Section */}
      {profile && (
        <section className="bg-gradient-to-br from-white/5 to-white/10 border-4 border-ableTeal rounded-3xl p-6 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 shadow-glow relative overflow-hidden" id="analyzer-result">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-ableTeal/10 rounded-full blur-[100px]" />
          
          <div className="flex items-start justify-between relative z-10 flex-col md:flex-row gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-ableTeal text-ableBlack px-3 py-1 rounded-full text-[9px] font-black tracking-widest leading-none">ANALYSIS READY</span>
                <span className="text-[10pt] text-white/30">• Inferred DNA Config</span>
              </div>
              <h3 className="text-3xl font-black text-white leading-none italic uppercase">Derived Accessibility DNA Profile</h3>
            </div>
            
            <button
              onClick={applyProfile}
              id="apply-derived-profile"
              className="bg-ableTeal hover:bg-white text-ableBlack px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-huge hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
            >
              APPLY SETTINGS LIVE 🤟
            </button>
          </div>

          <div className="p-6 bg-black/40 border border-white/5 rounded-2xl relative z-10 space-y-3">
            <h4 className="text-[10px] font-black text-ableTeal uppercase tracking-[0.25em]">Guidance Explanation</h4>
            <p className="text-base font-bold text-white/95 leading-relaxed italic">
              "{profile.explanation}"
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 relative z-10">
            {[
              { label: 'VISUAL ABILITY', val: profile.visual },
              { label: 'SPEECH STYLE', val: profile.speech },
              { label: 'COGNITIVE STATE', val: profile.cognitive },
              { label: 'HEARING NEED', val: profile.hearing },
              { label: 'VISION PROFILE', val: profile.vision },
              { label: 'CONTRAST MODE', val: profile.highContrast ? 'HIGH CONTRAST' : 'STANDARD' },
              { label: 'TEXT LAYOUT', val: profile.largeText ? 'LARGE TEXT' : 'STANDARD' },
              { label: 'VOICE SPEED', val: `${Math.round(profile.speechRate * 100)}%` }
            ].map((cell, idx) => (
              <div key={idx} className="bg-black/25 border-2 border-white/5 p-4 rounded-xl hover:border-ableTeal/30 transition-colors">
                <p className="text-[8px] font-black text-white/30 tracking-widest uppercase mb-1">{cell.label}</p>
                <p className="text-sm font-black text-white uppercase italic">{String(cell.val)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AbilityAnalyzer;

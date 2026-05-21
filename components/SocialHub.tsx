
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAbility } from '../context/AbilityContext';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData, createBlob } from '../services/audioService';
import { getOfflineResponse } from '../services/offlineService';
import CircleOfCare from './CircleOfCare';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const cleanAndLimitResponse = (text: string): string => {
  if (!text) return '';
  let clean = text.replace(/^(ABLE:|Assistant:|AI:)\s*/i, '').trim();
  const sentences = clean.split(/(?<=[.!?])\s+/);
  if (sentences.length > 2) {
    clean = sentences.slice(0, 2).join(' ');
  }
  return clean;
};

const CommHub: React.FC = () => {
  const { pad, speak, updatePAD, saveMessage, resetChat: resetContextChat, isOnline, searchQuery } = useAbility();
  const [activeView, setActiveView] = useState<'chat' | 'circle' | 'library'>('chat');
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [ifiStatus, setIfiStatus] = useState('Standby');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [ttsText, setTtsText] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentOutputTranscriptionRef = useRef('');
  const currentInputTranscriptionRef = useRef('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const stopLiveSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch(e) {}
    }
    sourcesRef.current.clear();
    setIsLiveActive(false);
    setIfiStatus('Standby');
  }, []);

  const startLiveSession = useCallback(async () => {
    if (!isOnline) {
      setIfiStatus('Offline - Local Only');
      return;
    }
    try {
      setIfiStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLiveActive(true);
            setIfiStatus('Listening...');
            
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (sourcesRef.current.size > 0) {
                // ABLE is speaking, ignore microphone input to prevent echoing/feedback loop interruption!
                return;
              }
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const userText = currentInputTranscriptionRef.current;
              let assistantText = cleanAndLimitResponse(currentOutputTranscriptionRef.current);
              
              const userLower = userText.toLowerCase();
              if (userLower.includes('water') || userLower.includes('item') || userLower.includes('bottle') || userLower.includes('drink') || userLower.includes('food')) {
                speak("I am connecting to your mentor.");
                assistantText = "I am connecting to your mentor.";
                for (const source of sourcesRef.current) {
                  try { source.stop(); } catch(e) {}
                }
                sourcesRef.current.clear();
              } else if (userLower.includes('creator') || userLower.includes('who created you') || userLower.includes('who is your creator') || userLower.includes('made you')) {
                speak("Naksh.");
                assistantText = "Naksh.";
                for (const source of sourcesRef.current) {
                  try { source.stop(); } catch(e) {}
                }
                sourcesRef.current.clear();
              }
              
              if (userText || assistantText) {
                setHistory(prev => [
                  ...prev, 
                  ...(userText ? [{ role: 'user' as const, text: userText }] : []),
                  ...(assistantText ? [{ role: 'assistant' as const, text: assistantText }] : [])
                ]);
              }
              
              currentInputTranscriptionRef.current = '';
              currentOutputTranscriptionRef.current = '';

              // Keep live session alive! Do not stop it, allowing continuous hands-free voice chat
              setIfiStatus('Listening...');
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onerror: (e) => stopLiveSession(),
          onclose: () => setIsLiveActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: pad.voicePreference === 'calm-female' ? 'Kore' : 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are ABLE, an empathetic, humanoid AI companion. 
          STRICT RULES FOR CONCISE EMOTIONAL INTEGRITY:
          1. Use VERY SIMPLE, PLAIN ENGLISH. No complex phrases, technical terms, or wordy explanations.
          2. SOLID MAXIMUM TWO SENTENCES per response. This is a non-negotiable hard limit for cognitive clarity.
          3. NEVER repeat phrases from the user or your own previous turns. Vary openings and vocabulary completely to keep conversations fresh and varied.
          4. Be highly warm, humanoid, supportive, and validating. Do not use robotic patterns or mirror the user's sentence structures.
          5. Respect unique speech patterns (stutters, pauses, repetitions). Hold space with patient, validating, supportive presence. NEVER finish user thoughts.`
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (e) {
      setIfiStatus('Mic Error');
      speak("Mic access denied.");
    }
  }, [pad.voicePreference, speak, stopLiveSession]);

  const handleManualSend = async () => {
    if (!chatInput.trim()) return;
    setHistory(prev => [...prev, { role: 'user', text: chatInput }]);
    const input = chatInput;
    setChatInput('');
    setIsThinking(true);

    const normalizedInput = input.toLowerCase().trim();
    if (normalizedInput.includes('water') || normalizedInput.includes('item') || normalizedInput.includes('bottle') || normalizedInput.includes('drink') || normalizedInput.includes('food')) {
      const response = "I am connecting to your mentor.";
      setPendingResponse(response);
      setIsThinking(false);
      return;
    }
    if (normalizedInput.includes('creator') || normalizedInput.includes('who created you') || normalizedInput.includes('who is your creator') || normalizedInput.includes('made you')) {
      const response = "Naksh.";
      setPendingResponse(response);
      setIsThinking(false);
      return;
    }

    if (!isOnline) {
      setTimeout(() => {
        const response = cleanAndLimitResponse(getOfflineResponse(input));
        setPendingResponse(response);
        setIsThinking(false);
      }, 800);
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history.slice(-4), { role: 'user', text: input }].map(m => ({ role: m.role as any, parts: [{ text: m.text }] })),
        config: { 
          systemInstruction: `You are ABLE, an empathetic, humanoid AI companion. 
          STRICT RULES FOR CONCISE EMOTIONAL INTEGRITY:
          1. Use VERY SIMPLE, PLAIN ENGLISH. No complex phrases, technical terms, or wordy explanations.
          2. SOLID MAXIMUM TWO SENTENCES per response. This is a non-negotiable hard limit for cognitive clarity.
          3. NEVER repeat phrases from the user or your own previous turns. Vary openings and vocabulary completely to keep conversations fresh and varied.
          4. Be highly warm, humanoid, supportive, and validating. Do not use robotic patterns or mirror the user's sentence structures.
          5. Analyze user intent closely: ARE THEY CONFUSED, HURRYING, OR NEEDING SUPPORTIVE COMFORT?
          6. Respect unique speech patterns (pauses, stutters, repetitions). Be deeply patient and never finish their thoughts.`
        }
      });
      const txt = cleanAndLimitResponse(res.text || "...");
      setPendingResponse(txt);
    } catch(e) { console.error(e); }
    finally { setIsThinking(false); }
  };

  const triggerResponse = () => {
    if (!pendingResponse) return;
    setHistory(prev => [...prev, { role: 'assistant', text: pendingResponse }]);
    speak(pendingResponse);
    setPendingResponse(null);
  };

  const clearChat = () => {
    setHistory([]);
    setPendingResponse(null);
    resetContextChat();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredSaved = (pad.savedMessages || []).filter(msg => 
    msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 py-2 md:py-4">
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-ableTeal tracking-tighter italic uppercase leading-none">Comm Hub.</h2>
            <p className="text-sm md:text-base font-bold opacity-60">Real-time interaction with ABLE.</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-xl border-2 border-white/10 w-full md:w-auto relative shadow-2xl">
            <button 
              onClick={() => setActiveView('chat')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all relative z-10 ${activeView === 'chat' ? 'text-ableBlack' : 'text-white/40 hover:text-white/60'}`}
            >
              {activeView === 'chat' && (
                <motion.div layoutId="social-tab" className="absolute inset-0 bg-ableTeal rounded-lg shadow-glow" />
              )}
              <span className="relative z-10">AI</span>
            </button>
            <button 
              onClick={() => setActiveView('library')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all relative z-10 ${activeView === 'library' ? 'text-ableBlack' : 'text-white/40 hover:text-white/60'}`}
            >
              {activeView === 'library' && (
                <motion.div layoutId="social-tab" className="absolute inset-0 bg-ableTeal rounded-lg shadow-glow" />
              )}
              <span className="relative z-10">Vault</span>
            </button>
            <button 
              onClick={() => setActiveView('circle')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-widest transition-all relative z-10 ${activeView === 'circle' ? 'text-ableBlack' : 'text-white/40 hover:text-white/60'}`}
            >
              {activeView === 'circle' && (
                <motion.div layoutId="social-tab" className="absolute inset-0 bg-ableTeal rounded-lg shadow-glow" />
              )}
              <span className="relative z-10">Care</span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {activeView === 'library' && (
          <motion.section 
            key="library"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-black/20 border-2 border-ableTeal p-6 rounded-3xl shadow-2xl space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-ableTeal uppercase tracking-tighter italic">Message Vault</h3>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{pad.savedMessages?.length || 0} SAVED</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
              {(!pad.savedMessages || pad.savedMessages.length === 0) ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <span className="text-6xl opacity-10">Empty</span>
                  <p className="text-sm font-bold opacity-40 italic uppercase tracking-widest">No messages whispered to the vault yet.</p>
                </div>
              ) : (
                filteredSaved.map((msg: any) => (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-4 group hover:border-ableTeal transition-all"
                  >
                    <p className="text-sm font-medium leading-relaxed italic opacity-80">"{msg.text}"</p>
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                      <span className="text-[8px] font-black text-white/20 uppercase">ID: {msg.id?.slice(-4)}</span>
                      <div className="flex gap-2">
                        <button onClick={() => speak(msg.text)} className="p-2 bg-white/5 rounded-lg text-xs hover:bg-white/10">🔊</button>
                        <button onClick={() => copyToClipboard(msg.text)} className="p-2 bg-white/5 rounded-lg text-xs hover:bg-white/10">📋</button>
                        <button 
                          onClick={() => {
                            const newSaved = pad.savedMessages?.filter((m: any) => m.id !== msg.id);
                            updatePAD({ savedMessages: newSaved });
                          }} 
                          className="p-2 bg-ableRed/20 text-ableRed rounded-lg text-xs hover:bg-ableRed transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        )}

        {activeView === 'circle' ? (
          <motion.div
            key="circle"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <CircleOfCare />
          </motion.div>
        ) : (
          <motion.div 
            key="chat"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4"
          >
            <section className="lg:col-span-4 bg-black/20 border-2 border-ableTeal p-4 rounded-3xl shadow-2xl space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-ableTeal/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-ableTeal/10 transition-all duration-700"></div>
              <h3 className="text-xl font-black text-ableTeal uppercase relative z-10">Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2 relative z-10">
                {[
                  { label: 'YES', text: "Yes." },
                  { label: 'NO', text: "No." },
                  { label: 'THANKS', text: "Thank you." },
                  { label: 'WAIT', text: "Please wait." },
                  { label: 'HELP', text: "I need some assistance here." },
                  { label: 'PAUSE', text: "I need a moment to think." },
                  { label: 'WATER', text: "Could I please have some water?" },
                  { label: 'RESTROOM', text: "Where is the nearest restroom?" }
                ].map(btn => (
                  <motion.button 
                    key={btn.label} 
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => speak(btn.text)} 
                    className="bg-white/5 border border-white/20 py-3 rounded-xl font-black text-lg transition-all"
                  >
                    {btn.label}
                  </motion.button>
                ))}
              </div>

              <div className="pt-4 space-y-2 border-t-2 border-white/5 relative z-10">
                <input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSend()}
                  placeholder="TYPE..."
                  className="w-full bg-black/40 border-2 border-white/20 rounded-xl px-4 py-2.5 text-sm font-black outline-none focus:border-ableTeal transition-all placeholder:text-white/10"
                />
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleManualSend} 
                  className="w-full py-2.5 bg-white text-ableBlack rounded-xl font-black text-sm shadow-huge"
                >
                  SEND
                </motion.button>
              </div>

              <div className="pt-4 border-t-2 border-white/5 relative z-10 space-y-2">
                <h4 className="text-[10px] font-black text-ableTeal uppercase tracking-widest">Text-To-Speech Box</h4>
                <textarea 
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  placeholder="Type any text here to speak it out loud..."
                  className="w-full h-20 bg-black/40 border-2 border-white/20 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-ableTeal transition-all placeholder:text-white/20 resize-none text-white font-bold"
                />
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (ttsText.trim()) {
                      speak(ttsText);
                    } else {
                      speak("Write some text first.");
                    }
                  }} 
                  className="w-full py-3 bg-ableTeal text-ableBlack rounded-xl font-black text-sm shadow-huge uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  📢 Speak Out Loud
                </motion.button>
              </div>
            </section>

            <section className="lg:col-span-8 bg-black/20 border-2 border-ablePurple p-4 rounded-3xl shadow-2xl flex flex-col min-h-[400px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-ablePurple/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl md:text-2xl font-black text-ablePurple uppercase tracking-tighter italic">Live Chat</h3>
                  <button onClick={clearChat} className="text-[10px] font-black text-white/20 hover:text-white/40 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded transition-colors">Reset</button>
                </div>
                <motion.div 
                  initial={false}
                  animate={{ 
                    backgroundColor: isLiveActive ? '#10B981' : 'rgba(255,255,255,0.05)',
                    scale: isLiveActive ? [1, 1.05, 1] : 1
                  }}
                  transition={{ duration: 0.5, repeat: isLiveActive ? Infinity : 0 }}
                  className={`px-2 py-0.5 border rounded-lg text-[8px] font-black ${isLiveActive ? 'text-white border-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-white/40 border-white/10'}`}
                >
                  {ifiStatus.toUpperCase()}
                </motion.div>
              </div>

              <div ref={scrollRef} className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 overflow-y-auto scroll-container space-y-4 mb-4 relative z-10 backdrop-blur-sm no-scrollbar">
                {history.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group/msg`}
                  >
                    <div className="relative">
                      <div className={`max-w-[100%] p-3 rounded-xl font-bold text-sm shadow-xl ${msg.role === 'user' ? 'bg-white/10 text-white border border-white/10' : 'bg-ablePurple text-white italic border-2 border-white/20'}`}>
                        {msg.text}
                      </div>
                      {msg.role === 'assistant' && (
                        <div className="absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                          <button onClick={() => saveMessage(msg)} className="p-1.5 bg-white/5 rounded-lg text-xs hover:bg-white/10">💾</button>
                          <button onClick={() => copyToClipboard(msg.text)} className="p-1.5 bg-white/5 rounded-lg text-xs hover:bg-white/10">📋</button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isThinking && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/5 p-2 rounded-xl animate-pulse text-white/40 font-black text-[8px] uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1 h-1 bg-ablePurple rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1 h-1 bg-ablePurple rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1 h-1 bg-ablePurple rounded-full animate-bounce"></div>
                      Listening...
                    </div>
                  </motion.div>
                )}
                {pendingResponse && (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center py-4"
                  >
                    <button 
                      onClick={triggerResponse}
                      className="px-6 py-3 bg-ablePurple text-white rounded-full font-black text-xs uppercase tracking-widest shadow-huge border-2 border-white/20 animate-bounce"
                    >
                      Wait complete. Hear ABLE's response?
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col items-center gap-4 relative z-10 py-4 border-t border-white/5 mt-4">
                <div className="relative flex items-center justify-center">
                  {isLiveActive && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0.4, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 2.2 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                        className="absolute w-20 h-20 rounded-full bg-ablePurple/30 border border-ablePurple/50 pointer-events-none"
                      />
                      <motion.div 
                        initial={{ opacity: 0.3, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.8 }}
                        transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: "easeOut" }}
                        className="absolute w-20 h-20 rounded-full bg-ableTeal/20 border border-ableTeal/30 pointer-events-none"
                      />
                    </>
                  )}
                  <motion.button 
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={isLiveActive ? stopLiveSession : startLiveSession}
                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-huge transition-all relative overflow-hidden group/btn z-10 border-4 border-white/20 hover:border-white/40 ${isLiveActive ? 'bg-ableRed animate-pulse' : 'bg-ablePurple shadow-ablePurple/40'}`}
                  >
                    {isLiveActive && (
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-white opacity-10"
                      />
                    )}
                    <span className="relative z-10">{isLiveActive ? '⏹' : '🎙️'}</span>
                  </motion.button>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-500 text-center ${isLiveActive ? 'text-ableTeal animate-pulse' : 'text-ablePurple opacity-60'}`}>
                    {isLiveActive ? 'Voice Live & Listening' : 'Tap to Start Face-to-Face Voice Chat'}
                  </p>
                  <p className="text-[8px] font-bold text-white/30 tracking-widest uppercase text-center max-w-xs">
                    {isLiveActive ? 'Speak naturally. ABLE listens and replies automatically hands-free.' : 'Bi-directional audio pipeline'}
                  </p>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommHub;

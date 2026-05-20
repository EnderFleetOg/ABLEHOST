
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAbility } from '../context/AbilityContext';
import SignLanguageAvatar from './SignLanguageAvatar';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData, createBlob } from '../services/audioService';
import { getOfflineResponse } from '../services/offlineService';
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

const AICompanion: React.FC = () => {
  const { pad, speak, uiIntensity, isOnline } = useAbility();
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [status, setStatus] = useState('STANDBY');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const [currentInputText, setCurrentInputText] = useState('');
  const [currentOutputText, setCurrentOutputText] = useState('');
  const [pendingResponse, setPendingResponse] = useState<string | null>(null);
  const [offlineInput, setOfflineInput] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const sceneAnalysisIntervalRef = useRef<number | null>(null);
  const describeTimeoutRef = useRef<number | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const accumulatedInputRef = useRef('');
  const accumulatedOutputRef = useRef('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, currentInputText, currentOutputText]);

  const stopLiveSession = useCallback((force = false) => {
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch(e) {}
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
    frameIntervalRef.current = null;

    if (sceneAnalysisIntervalRef.current) window.clearInterval(sceneAnalysisIntervalRef.current);
    sceneAnalysisIntervalRef.current = null;

    if (describeTimeoutRef.current) window.clearTimeout(describeTimeoutRef.current);
    describeTimeoutRef.current = null;
    
    if (inputAudioContextRef.current) {
      try { inputAudioContextRef.current.close(); } catch(e) {}
      inputAudioContextRef.current = null;
    }
    
    if (force && outputAudioContextRef.current) {
      try { outputAudioContextRef.current.close(); } catch(e) {}
      outputAudioContextRef.current = null;
      sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
      sourcesRef.current.clear();
    }
    
    setIsLiveActive(false);
    setIsThinking(false);
    setStatus('STANDBY');
    setCurrentInputText('');
    setCurrentOutputText('');
    accumulatedInputRef.current = '';
    accumulatedOutputRef.current = '';
  }, []);

  const startLiveSession = useCallback(async () => {
    if (!isOnline) {
      setStatus('OFFLINE');
      return;
    }
    try {
      setStatus('CONNECTING...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const audioStream = await navigator.mediaDevices.getUserMedia({
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
            setStatus('LISTENING');
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(audioStream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (sourcesRef.current.size > 0) {
                // Skip sending mic input when ABLE is actively speaking to prevent echo/feedback loop interruption
                return;
              }
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            // Wait 2.5 seconds to ensure initial feed images are transmitted, then trigger the automatic describe scene action
            describeTimeoutRef.current = window.setTimeout(() => {
              sessionPromise.then(s => s.sendRealtimeInput({
                text: "Analyze the current scene in front of you. Describe what you see in a highly supportive, natural, and concise way."
              }));
              setStatus('SCANNING...');
              setIsThinking(true);
            }, 2500);

            // Periodically analyze environmental scene frames every 15 seconds to provide real-time updates
            sceneAnalysisIntervalRef.current = window.setInterval(() => {
              sessionPromise.then(s => s.sendRealtimeInput({
                text: "Provide a quick real-time overview of any updates or changes in the scene or environment in front of the camera."
              }));
              setStatus('SCANNING...');
              setIsThinking(true);
            }, 15000);

            frameIntervalRef.current = window.setInterval(() => {
              if (videoRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                canvas.width = 640;
                canvas.height = 480;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(video, 0, 0, 640, 480);
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        sessionPromise.then(s => s.sendRealtimeInput({ 
                          media: { data: base64, mimeType: 'image/jpeg' } 
                        }));
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', 0.5);
                }
              }
            }, 1000);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn) {
              setIsThinking(false);
              const audio = message.serverContent.modelTurn.parts[0]?.inlineData?.data;
              if (audio && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(audio), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              }
            }

            if (message.serverContent?.inputTranscription) {
              accumulatedInputRef.current += message.serverContent.inputTranscription.text;
              setCurrentInputText(accumulatedInputRef.current);
              setIsThinking(true);
              setStatus('PROCESSING...');
            }
            if (message.serverContent?.outputTranscription) {
              accumulatedOutputRef.current += message.serverContent.outputTranscription.text;
              setCurrentOutputText(accumulatedOutputRef.current);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.turnComplete) {
              const finalInput = accumulatedInputRef.current;
              const finalOutput = cleanAndLimitResponse(accumulatedOutputRef.current);
              if (finalInput || finalOutput) {
                setHistory(prev => [
                  ...prev,
                  ...(finalInput ? [{ role: 'user' as const, text: finalInput }] : []),
                  ...(finalOutput ? [{ role: 'assistant' as const, text: finalOutput }] : [])
                ]);
              }
              accumulatedInputRef.current = '';
              accumulatedOutputRef.current = '';
              setCurrentInputText('');
              setCurrentOutputText('');
              
              // Keep live session alive! Do not stop it, allowing continuous listening
              setStatus('LISTENING');
            }
          },
          onerror: (e) => stopLiveSession(true),
          onclose: () => setIsLiveActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: pad.voicePreference === 'calm-female' ? 'Kore' : 'Zephyr' 
              } 
            },
          },
          systemInstruction: `You are ABLE, an empathetic, humanoid companion.
          CRITICAL COGNITIVE CLARITY RULES:
          1. Use VERY SIMPLE, PLAIN ENGLISH. No complex or technical words, jargon, or fancy metaphors.
          2. STRICT MAXIMUM TWO SENTENCES per response. This is a non-negotiable hard limit. Keep every reply exceptionally direct and concise.
          3. NEVER repeat phrases from the user or your own previous turns. Vary openings and vocabulary completely to sound humanoid and varied.
          4. Be warm, supportive, and empathetic. Focus on comforting and direct assistant vibes. No robot-talk or mirroring the user.
          5. Respect speech pattern struggles (stutters, pauses, repetitions). Hold the space with quiet, patient, warm presence. NEVER finish their thoughts.
          6. Focus heavily on camera-based surroundings observations to provide supportive, hands-free assistance.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      setStatus('ERROR');
      speak("System sync failed.");
    }
  }, [pad, stopLiveSession, speak]);

  const triggerResponse = () => {
    if (!pendingResponse) return;
    setHistory(prev => [...prev, { role: 'assistant', text: pendingResponse }]);
    speak(pendingResponse);
    setPendingResponse(null);
  };

  const toggleVision = async () => {
    if (isVisionActive) {
      stopLiveSession(true);
      if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
      setIsVisionActive(false);
    } else {
      try {
        setStatus('WAKING UP...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment', width: { ideal: 1280 } } 
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsVisionActive(true);
          startLiveSession();
        }
      } catch (err) {
        setStatus('LENS ERROR');
      }
    }
  };

  const handleOfflineQuery = () => {
    if (!offlineInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: offlineInput };
    setHistory(prev => [...prev, userMsg]);
    setOfflineInput('');
    setIsThinking(true);
    
    setTimeout(() => {
      const response = cleanAndLimitResponse(getOfflineResponse(offlineInput));
      setHistory(prev => [...prev, { role: 'assistant', text: response }]);
      speak(response);
      setIsThinking(false);
    }, 800);
  };

  return (
    <div className={`flex flex-col space-y-4 py-2 w-full ${uiIntensity === 'simplified' ? 'max-w-2xl mx-auto' : 'max-w-full'}`}>
      <canvas ref={canvasRef} className="hidden" />
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2">
        <div className="space-y-0.5">
           <h2 className="text-2xl font-black text-ableTeal tracking-tighter uppercase italic">Vision Hub</h2>
           <div className="flex items-center space-x-2">
             <div className={`w-2 h-2 rounded-full ${isLiveActive ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`}></div>
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40">{status}</p>
           </div>
        </div>
        <button onClick={toggleVision} className={`px-6 py-2 rounded-2xl font-black text-sm border-2 transition-all shadow-huge ${isVisionActive ? 'bg-ableRed border-white text-white' : 'bg-ableTeal border-transparent text-ableBlack'}`}>
          {isVisionActive ? 'STOP LENS' : 'START LENS'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full h-[400px]">
        <div className="lg:col-span-7 bg-black border-4 border-ableTeal rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover transition-opacity ${isVisionActive ? 'opacity-100' : 'opacity-20'}`} />
          {!isVisionActive && <span className="absolute text-6xl text-white/5">👁️</span>}
          <div className="absolute bottom-2 right-2 w-24 md:w-32 shadow-huge">
             <SignLanguageAvatar message={currentOutputText || history[history.length-1]?.text} active={isLiveActive || !!currentOutputText} />
          </div>
          {isThinking && (
            <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg border border-white/20">
              <div className="w-1.5 h-1.5 bg-ableTeal rounded-full animate-ping"></div>
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Scanning...</span>
            </div>
          )}
          {!isOnline && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-4xl grayscale">🌐</div>
               <div className="space-y-1">
                 <p className="text-xl font-black text-white uppercase italic tracking-tighter">Offline Mode</p>
                 <p className="text-xs font-bold text-white/40 italic">Live Lens requires internet. Basic local Q&A is still active below.</p>
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col h-full space-y-2">
           <div className="bg-white/5 border-2 border-white/10 p-4 rounded-3xl shadow-xl flex-1 flex flex-col overflow-hidden">
              <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {history.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-2 rounded-2xl font-bold text-sm ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-ableTeal text-ableBlack'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {currentInputText && <div className="flex justify-end opacity-40"><div className="bg-white/5 p-2 rounded-2xl italic text-xs">{currentInputText}...</div></div>}
                {currentOutputText && <div className="flex justify-start"><div className="bg-ableTeal text-ableBlack p-2 rounded-2xl shadow-xl text-sm">{currentOutputText}</div></div>}
                {pendingResponse && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center py-2"
                  >
                    <button 
                      onClick={triggerResponse}
                      className="px-4 py-2 bg-ableTeal text-ableBlack rounded-full font-black text-[10px] uppercase tracking-widest shadow-huge border border-white transition-all active:scale-95"
                    >
                      Hear ABLE's Observation
                    </button>
                  </motion.div>
                )}
              </div>
              
              {!isOnline && (
                <div className="mt-2 pt-2 border-t border-white/10 space-y-2">
                  <input 
                    value={offlineInput}
                    onChange={(e) => setOfflineInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleOfflineQuery()}
                    placeholder="Type to ABLE (Local Core)..."
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-ableTeal transition-all"
                  />
                </div>
              )}

              {!isLiveActive && isVisionActive && isOnline && (
                <button onClick={startLiveSession} className="mt-2 py-2 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">Reconnect</button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AICompanion;

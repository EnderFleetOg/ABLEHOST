
import React, { useState, useCallback, useEffect } from 'react';
import { useAbility } from '../context/AbilityContext';
import { initGmailAuth, googleGmailSignIn, sendGmailEmail } from '../services/gmailService';
import { User as FirebaseUser } from 'firebase/auth';

interface FeedbackSystemProps {
  onClose: () => void;
}

const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ onClose }) => {
  const { pad, speak, user } = useAbility();
  const [category, setCategory] = useState<'glitch' | 'barrier' | 'idea'>('barrier');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initGmailAuth(
      (gUser, token) => {
        setGoogleUser(gUser);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      const res = await googleGmailSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        speak("Google authentication successful. You can now send your report.");
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Authorization failed');
      speak("Failed to authorize with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setAuthError(null);
    try {
      if (!googleToken) {
        setAuthError("Google connection required to deliver email.");
        speak("Google connection required. Please connect your Gmail account.");
        setLoading(false);
        return;
      }

      const bodyHtml = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 4px solid #A855F7; border-radius: 16px; background-color: #0c0a09; color: #ffffff;">
  <h2 style="color: #2DD4BF; border-bottom: 2px solid #A855F7; padding-bottom: 12px; margin-top: 0; font-size: 24px; text-transform: uppercase; font-style: italic;">ABLE Adaptive DNA Report</h2>
  
  <p style="font-size: 16px; color: #dddddd; line-height: 1.5;">A user has submitted an adaptive barrier feedback from the ABLE platform.</p>
  
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; color: #ffffff; background-color: #1c1917; border-radius: 8px; overflow: hidden;">
    <tr style="background-color: #292524;">
      <td style="padding: 12px; font-weight: bold; border: 1px solid #44403c; width: 35%;">User ID/Name:</td>
      <td style="padding: 12px; border: 1px solid #44403c;">${user?.name || 'Anonymous User'}</td>
    </tr>
    <tr>
      <td style="padding: 12px; font-weight: bold; border: 1px solid #44403c;">Local Session Email:</td>
      <td style="padding: 12px; border: 1px solid #44403c; font-family: monospace;">${user?.email || 'N/A'}</td>
    </tr>
    <tr style="background-color: #292524;">
      <td style="padding: 12px; font-weight: bold; border: 1px solid #44403c;">User Role:</td>
      <td style="padding: 12px; border: 1px solid #44403c;">${user?.role || 'User'}</td>
    </tr>
    <tr>
      <td style="padding: 12px; font-weight: bold; border: 1px solid #44403c;">Report Category:</td>
      <td style="padding: 12px; border: 1px solid #44403c; font-weight: bold; color: #2DD4BF; text-transform: uppercase;">${category.toUpperCase()}</td>
    </tr>
    <tr style="background-color: #292524;">
      <td style="padding: 12px; font-weight: bold; border: 1px solid #44403c;">Gmail Authorized Sender:</td>
      <td style="padding: 12px; border: 1px solid #44403c; font-family: monospace; color: #e7e5e4;">${googleUser?.email || 'Unknown'}</td>
    </tr>
    <tr>
      <td style="padding: 12px; font-weight: bold; border: 1px solid #44403c;">Submission Date:</td>
      <td style="padding: 12px; border: 1px solid #44403c; font-family: monospace;">${new Date().toLocaleString()}</td>
    </tr>
  </table>

  <h3 style="color: #2DD4BF; margin-bottom: 10px; font-size: 18px; text-transform: uppercase;">Friction/Barrier Description:</h3>
  <div style="background-color: #1c1917; border-left: 6px solid #2DD4BF; border-radius: 4px; padding: 20px; font-size: 16px; line-height: 1.6; white-space: pre-wrap; color: #ffffff; font-weight: 500;">
    ${description}
  </div>

  <div style="margin-top: 35px; padding-top: 15px; border-top: 1px solid #44403c; text-align: center; font-size: 11px; color: #78716c; text-transform: uppercase; tracking-widest: 0.1em;">
    Autonomous Dispatch • ABLE Ecosystem Platform
  </div>
</div>
      `;

      await sendGmailEmail({
        to: 'enderfleet.ai@gmail.com',
        subject: `[ABLE Platform] New ${category.toUpperCase()} Report by ${user?.name || 'Anonymous'}`,
        bodyHtml
      });

      setSubmitted(true);
      speak("Your adaptive barrier feedback has been successfully mailed to enderfleet.ai@gmail.com");
      setTimeout(onClose, 3000);
    } catch (err: any) {
      console.error(err);
      setAuthError(`Delivery failed: ${err.message || 'Unknown integration error oocured'}`);
      speak("Gmail API delivery failed.");
    } finally {
      setLoading(false);
    }
  };


  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      let errorMsg = "Dictation failed.";
      switch(event.error) {
        case 'not-allowed': errorMsg = "Microphone access is restricted."; break;
        case 'network': errorMsg = "Check your internet connection."; break;
        case 'no-speech': errorMsg = "No audio detected."; break;
      }
      speak(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [speak]);

  return (
    <div className="fixed inset-0 z-[100] bg-ableBlack/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="max-w-xl w-full bg-ableBlack border-8 border-ableTeal p-12 rounded-huge shadow-huge animate-in zoom-in slide-in-from-bottom-4 duration-400">
        
        {submitted ? (
          <div className="py-12 text-center space-y-6">
            <div className="text-9xl">💪</div>
            <h2 className="text-5xl font-black text-ableTeal tracking-tighter uppercase">DNA MAILED.</h2>
            <p className="text-xl font-bold text-white/60">Adapting the platform based on your input.</p>
            <div className="inline-block bg-white/10 px-6 py-3 border border-white/20 rounded-2xl">
              <span className="text-xs text-white/40 block uppercase tracking-widest font-black mb-1">RECIPIENT ADDRESS</span>
              <span className="text-md font-mono font-black italic text-amber-500">enderfleet.ai@gmail.com</span>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            <header className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-xs font-black text-ablePurple uppercase tracking-[0.3em]">Adaptive Barrier Report</p>
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">WHAT STOPPED YOU?</h2>
              </div>
              <button onClick={onClose} className="text-4xl text-white/40 hover:text-white p-2">✕</button>
            </header>

            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-2">
                {['BARRIER', 'GLITCH', 'IDEA'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat.toLowerCase() as any)}
                    className={`py-4 rounded-2xl border-4 font-black text-[10px] tracking-widest transition-all ${
                      category === cat.toLowerCase() 
                        ? 'bg-ableTeal text-ableBlack border-white shadow-xl scale-105' 
                        : 'bg-white/5 text-white border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-white/40 uppercase tracking-widest font-sans">Description</label>
                  <button 
                    onClick={startListening}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg font-black text-[10px] border transition-all ${isListening ? 'bg-ableRed border-white animate-pulse text-white' : 'bg-white/5 border-white/20 text-white/60 hover:text-white hover:border-ableTeal'}`}
                  >
                    {isListening ? '🔴 LISTENING' : '🎙️ DICTATE'}
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="DESCRIBE THE FRICTION..."
                  className="w-full bg-white/5 border-4 border-white/10 rounded-3xl p-8 text-xl font-bold text-white outline-none focus:border-ableTeal min-h-[150px] transition-all resize-none"
                />
              </div>

              {/* Real-time Gmail Authorization Panel */}
              <div className="bg-white/5 border-4 border-white/10 rounded-3xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-lg">📬</span> Delivery Channel: Gmail API
                    </h4>
                    <p className="text-xs font-bold text-white/40">
                      {googleUser ? `Connected: ${googleUser.email}` : 'OAuth authorization needed to mail report'}
                    </p>
                  </div>
                  {!googleUser ? (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-white text-black font-black text-xs py-3 px-5 rounded-2xl cursor-pointer hover:bg-neutral-200 active:scale-95 transition-all border-2 border-white"
                    >
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      </svg>
                      CONNECT GMAIL
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 bg-white/5 border-2 border-ableTeal/45 px-4 py-2 rounded-2xl">
                      <span className="w-2.5 h-2.5 rounded-full bg-ableTeal animate-pulse"></span>
                      <span className="text-xs font-black text-ableTeal uppercase tracking-widest font-mono">READY</span>
                      {googleUser.photoURL && (
                        <img src={googleUser.photoURL} alt="avatar" className="w-8 h-8 rounded-full border border-ableTeal" referrerPolicy="no-referrer" />
                      )}
                    </div>
                  )}
                </div>
                {authError && (
                  <div className="bg-ableRed/10 border-2 border-ableRed rounded-2xl p-4 text-xs font-black text-white uppercase tracking-wider text-center">
                     ⚠️ {authError}
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !description.trim() || !googleUser}
                className="w-full bg-ableTeal text-ableBlack py-8 rounded-huge font-black text-3xl shadow-huge active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'DELIVERING...' : googleUser ? 'SEND TO ENDERFLEET' : 'CONNECT GMAIL FIRST'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackSystem;

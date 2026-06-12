import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAbility } from '../context/AbilityContext';
import { generateCompanionResponse, detectMemoryInsight } from '../services/geminiService';
import { AiMemory } from '../types';

const AICompanion: React.FC = () => {
  const { 
    user, 
    pad, 
    speak, 
    aiMemories, 
    addAiMemory, 
    updateAiMemory, 
    deleteAiMemory, 
    aiMemoryConsent, 
    setAiMemoryConsent,
    addNotification,
    addActivityLog
  } = useAbility();

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>(() => {
    return [
      { 
        role: 'assistant', 
        content: `Greetings, ${user?.name || 'Partner'}. I am ABLE Core, your adaptive companion. How are you feeling today? Let me know of any challenges, goals, or sensory settings we should tune together.` 
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  
  // Pending Memory Detection
  const [pendingMemory, setPendingMemory] = useState<{ category: string; content: string } | null>(null);

  // Manual Add Memory State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<AiMemory['category']>('Goal');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, pendingMemory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userText = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsLoading(true);

    // Prepare active memories description to ground the model
    const approvedMemories = aiMemories
      .filter(m => m.isApproved)
      .map(m => `Category: ${m.category} | Fact: ${m.content}`);

    try {
      // 1. Process with custom Gemini service leveraging user's personal memories
      const response = await generateCompanionResponse(
        [...messages, { role: 'user', content: userText }],
        approvedMemories,
        pad
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      if (speechEnabled) {
        speak(response);
      }

      // 2. Memory Extraction (Only if consent is toggled ON!)
      if (aiMemoryConsent) {
        const detectedObj = await detectMemoryInsight(userText);
        if (detectedObj && detectedObj.detected && detectedObj.content && detectedObj.category) {
          setPendingMemory({
            category: detectedObj.category,
            content: detectedObj.content
          });
          speak("I notice you shared an important detail. Under your consent protocols, should I commit this to your secure Companion Memory?");
          
          addNotification({
            title: 'Memory Detected 🧠',
            message: `Detected: "${detectedObj.content}"`,
            type: 'info'
          });
        }
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "My direct neural sync is experiencing latency. Tell me, how can I adjust?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveMemory = () => {
    if (!pendingMemory) return;

    addAiMemory({
      category: pendingMemory.category as any,
      content: pendingMemory.content,
      isApproved: true
    });

    speak(`Memorized: ${pendingMemory.content}. Loaded parameters updated.`);
    
    addNotification({
      title: 'Memory Synthesized',
      message: 'Securely saved to your adaptive knowledge base.',
      type: 'success'
    });

    addActivityLog({
      memberName: 'ABLE AI Core',
      role: 'System',
      action: 'Synthesized New Memory',
      details: `Saved conversational context: "${pendingMemory.content}".`
    });

    setPendingMemory(null);
  };

  const handleManualAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    addAiMemory({
      category: newCategory,
      content: newContent.trim(),
      isApproved: true
    });

    speak(`I have recorded your manual parameter entries under ${newCategory}.`);
    
    addNotification({
      title: 'Fact Recorded',
      message: `Manual memory loaded into "${newCategory}".`,
      type: 'success'
    });

    addActivityLog({
      memberName: 'User (You)',
      role: 'User',
      action: 'Saved Stored Fact',
      details: `Manually added ${newCategory} instruction: "${newContent.trim()}".`
    });

    setNewContent('');
    setShowAddForm(false);
  };

  const handleStartEdit = (m: AiMemory) => {
    setEditingId(m.id);
    setEditValue(m.content);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) return;
    updateAiMemory(id, { content: editValue.trim() });
    
    speak(`Memory content index ${id.slice(0, 5)} modified.`);
    
    addActivityLog({
      memberName: 'User (You)',
      role: 'User',
      action: 'Edited Stored Fact',
      details: `Modified stored memory content to: "${editValue.trim()}"`
    });

    setEditingId(null);
  };

  const handleDeleteMemory = (id: string, content: string) => {
    deleteAiMemory(id);
    speak(`Permanently deleted stored fact.`);
    
    addActivityLog({
      memberName: 'User (You)',
      role: 'User',
      action: 'Deleted Stored Fact',
      details: `Removed fact index: "${content.slice(0, 30)}...".`
    });
  };

  const handleSuggestionClick = (promptText: string) => {
    setInputText(promptText);
    speak(`Pre-selecting prompt: ${promptText}. Click send to launch.`);
  };

  const suggestions = [
    "I am having severe central visual blur due to my glaucoma.",
    "My current anxiety triggers make high cognitive task list sizes intimidating.",
    "Goal: Independent-coach my sensory layout controls to maximize code flow.",
    "Remind me what past conversations we had regarding speech speed rates."
  ];

  const categoryIcons: Record<string, string> = {
    Disability: '👁️',
    Anxiety: '⚡',
    Goal: '🎯',
    Preference: '🎨',
    Accessibility: '🎛️',
    Health: '🏥',
    'Past Conversation': '💬'
  };

  return (
    <div className="space-y-12 py-6">
      <header className="space-y-4">
        <div className="flex items-center space-x-3 text-ableTeal font-black tracking-[0.25em] uppercase text-[10px]">
          <span className="w-10 h-1 bg-ableTeal rounded-full shadow-[0_0_10px_#14B8A6]" />
          <span>SYNAPTICS ENGINE</span>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">Memory Companion</h1>
            <p className="text-lg text-white/60 leading-relaxed font-bold max-w-2xl mt-1">
              Engage with ABLE Core, an AI that securely learns your cognitive triggers, visual constraints, and daily goals, utilizing memories to adapt its behavior.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-4 rounded-2xl w-full md:w-auto">
            <div>
              <span className="text-xs font-black text-white uppercase block">Memory Consent Control</span>
              <span className="text-[9px] font-bold text-white/40 block uppercase">Continuous facts learning extraction</span>
            </div>
            <button 
              onClick={() => {
                const updated = !aiMemoryConsent;
                setAiMemoryConsent(updated);
                speak(updated ? "Automatic learning enabled." : "Continuous learning disabled. Existing memories remain safe.");
                addNotification({
                  title: 'Consent Synced',
                  message: updated ? 'ABLE Core allowed to store facts.' : 'No new learning facts extractable.',
                  type: 'info'
                });
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${aiMemoryConsent ? 'bg-ableTeal text-ableBlack border-white shadow-glow' : 'bg-black/40 text-white/40 border-white/5'}`}
            >
              {aiMemoryConsent ? '🧠 SECURE SYNC: ON' : '🔒 PRIVATE MODE: ON'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Direct Companion Chat Console (7 cols) */}
        <section className="lg:col-span-7 flex flex-col bg-white/5 border-2 border-white/10 rounded-3xl overflow-hidden min-h-[600px] justify-between">
          
          {/* Audio voice toggle banner */}
          <div className="bg-black/50 border-b border-white/5 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isLoading ? 'bg-ableTeal animate-ping' : 'bg-ableTeal'}`} />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Companion Active</span>
            </div>
            
            <button 
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                speak(!speechEnabled ? "Voice outputs enabled." : "Voice muted.");
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border-2 text-[8px] font-black uppercase tracking-wider transition-all ${speechEnabled ? 'bg-ableTeal/20 border-ableTeal text-white' : 'bg-white/5 border-white/10 text-white/40'}`}
            >
              {speechEnabled ? '🔊 Auto-Voice (ON)' : '🔇 Muted Voice'}
            </button>
          </div>

          {/* Messages stream */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[450px] no-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl border-2 space-y-1.5 ${
                      m.role === 'user' 
                        ? 'bg-ableTeal text-ableBlack border-white shadow-md font-bold' 
                        : 'bg-black/60 text-white/90 border-white/10 font-medium'
                    }`}
                  >
                    <span className="text-[8px] font-black tracking-widest uppercase opacity-40 block">
                      {m.role === 'user' ? 'User Identity' : 'ABLE AI Core'}
                    </span>
                    <p className="text-xs leading-relaxed">{m.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-black/40 text-white/50 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                    <span className="w-2 h-2 bg-ableTeal rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-ableTeal rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-ableTeal rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 ml-1">recalling memory synaptic links...</span>
                  </div>
                </div>
              )}

              {/* Memory consent pending capture widget */}
              {pendingMemory && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-black/80 border-2 border-ableTeal p-4 rounded-xl space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">🧩</span>
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-black text-ableTeal tracking-widest uppercase">Consent Required: Memory Identified</span>
                      <div className="text-[10px] text-white/40 font-black uppercase">Category: {pendingMemory.category}</div>
                      <p className="text-xs text-white leading-relaxed font-bold">"{pendingMemory.content}"</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleApproveMemory}
                      className="flex-1 py-2 bg-ableTeal text-ableBlack rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all border-2 border-white/20"
                    >
                      ✓ STRENGTHEN MEMORY LINK
                    </button>
                    <button 
                      onClick={() => setPendingMemory(null)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Dismis
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Quick-Access Prompts */}
          <div className="p-4 border-t border-white/5 bg-black/25">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-2 text-left">Simulate Memory Prompts</span>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-ableTeal rounded-lg text-[8px] font-black uppercase text-left text-white/60 hover:text-white transition-all max-w-full truncate"
                >
                  {s.slice(0, 50)}...
                </button>
              ))}
            </div>
          </div>

          {/* Input Chat Console */}
          <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-white/5 flex gap-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Speak with your adaptive care companion..."
              disabled={isLoading}
              className="flex-1 bg-black/60 border-2 border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold outline-none focus:border-ableTeal transition-all placeholder:text-white/20"
            />
            <button 
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-8 bg-ableTeal text-ableBlack disabled:bg-white/5 disabled:text-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border-2 border-white/10"
            >
              SEND
            </button>
          </form>
        </section>

        {/* Right Column: Stored Synaptic Facts Dashboard (5 cols) */}
        <section className="lg:col-span-5 space-y-6 text-left">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black uppercase text-white/40 tracking-widest">Companion Memory Logs ({aiMemories.length})</h2>
            
            <button 
              onClick={() => {
                setShowAddForm(!showAddForm);
                setNewContent('');
              }}
              className="px-4 py-2 bg-white/10 hover:bg-ableTeal hover:text-ableBlack rounded-xl font-black text-[10px] uppercase tracking-wider transition-all"
            >
              {showAddForm ? '✕ Cancel' : '➕ Add Fact Map'}
            </button>
          </div>

          {/* Add Form toggled */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleManualAddMemory}
                className="bg-white/5 border-2 border-ableTeal p-4 rounded-2xl space-y-4 overflow-hidden"
              >
                <div className="space-y-1">
                  <label htmlFor="memory-category" className="text-[8px] font-black text-white/40 uppercase tracking-widest">Fact Category</label>
                  <select 
                    id="memory-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/10 text-white font-bold rounded-lg p-2.5 text-xs outline-none focus:border-ableTeal cursor-pointer"
                  >
                    {['Disability', 'Anxiety', 'Goal', 'Preference', 'Accessibility', 'Health', 'Past Conversation'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="memory-statement" className="text-[8px] font-black text-white/40 uppercase tracking-widest">Fact Statement (Written in 3rd Person)</label>
                  <textarea 
                    id="memory-statement"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                    placeholder="e.g. User manages early visual blind spots in layout margins."
                    rows={3}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-xs text-white font-bold outline-none focus:border-ableTeal resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!newContent.trim()}
                  className="w-full py-2.5 bg-ableTeal text-ableBlack disabled:bg-white/5 disabled:text-white/20 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                >
                  LOAD MEMORY PARAMETER
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Memories Card Grid */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
            {aiMemories.length === 0 ? (
              <div className="bg-white/5 border border-white/10 p-12 rounded-2xl text-center space-y-2">
                <span className="text-4xl">🌫️</span>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">No synaptic memories registered.</p>
              </div>
            ) : (
              aiMemories.map(memory => (
                <div 
                  key={memory.id}
                  className="bg-white/5 border border-white/10 p-4 rounded-2xl hover:border-ableTeal/40 transition-all space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl bg-black/40 p-1.5 rounded-lg border border-white/5">{categoryIcons[memory.category] || '🧩'}</span>
                      <span className="text-[10px] font-black text-white uppercase italic">{memory.category}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStartEdit(memory)}
                        className="text-[9px] text-white/30 hover:text-ableTeal uppercase font-black"
                      >
                        EDIT
                      </button>
                      <button 
                        onClick={() => handleDeleteMemory(memory.id, memory.content)}
                        className="text-[9px] text-white/30 hover:text-ableRed uppercase font-black"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>

                  {editingId === memory.id ? (
                    <div className="space-y-2">
                      <textarea 
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full bg-black/65 border border-ableTeal text-xs text-white rounded-lg p-2 font-bold outline-none"
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-white/5 hover:bg-white/10 text-[9px] font-bold text-white/60 rounded-md"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSaveEdit(memory.id)}
                          className="px-3 py-1 bg-ableTeal text-ableBlack text-[9px] font-black rounded-md uppercase"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-white/80 font-medium leading-relaxed italic">
                      "{memory.content}"
                    </p>
                  )}

                  <div className="text-[8px] text-white/20 font-bold uppercase text-right leading-none">
                    Saved: {new Date(memory.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default AICompanion;

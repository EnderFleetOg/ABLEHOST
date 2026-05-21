
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { PAD, VisualAbility, VisionNeed, CognitiveMode, VoicePreference, ColorPalette, UserRole, Task, Notification, TaskPriority } from '../types';
import { DEFAULT_PAD } from '../constants';
import { TRANSLATIONS, getBaseLanguageKey, adaptToDialect } from '../data/translations';

interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

interface AbilityContextType {
  pad: PAD;
  updatePAD: (updates: Partial<PAD>) => void;
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  uiIntensity: 'standard' | 'simplified' | 'high-focus';
  speak: (text: string) => void;
  saveMessage: (message: any) => void;
  resetChat: () => void;
  t: (text: string) => string;
  // Auth State
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, name: string, role: UserRole) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoggedIn: boolean;
  aiEmotion: 'happy' | 'surprised' | 'curious' | 'cool' | 'sleepy' | 'sad' | 'vibrate';
  triggerAiReaction: (emotion: 'happy' | 'surprised' | 'curious' | 'cool' | 'sleepy' | 'sad' | 'vibrate', duration?: number) => void;
  // Messages
  messages: any[];
  sendMessage: (to: string, text: string) => void;
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Predictive Assistance
  suggestion: string | null;
  setSuggestion: (text: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
}

const AbilityContext = createContext<AbilityContextType | undefined>(undefined);

export const AbilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pad, setPad] = useState<PAD>(DEFAULT_PAD);
  const [isHighContrast, setIsHighContrast] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<{email: string, password: string, name: string, role: UserRole}[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Connectivity Monitoring
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('able_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }

    const savedUser = localStorage.getItem('able_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }

    const savedUsers = localStorage.getItem('able_registered_users');
    if (savedUsers) {
      try {
        setRegisteredUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error('Failed to parse registered users', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('able_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('able_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('able_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('able_registered_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Check for task deadlines
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (!task.completed && task.dueDate) {
          const dueDate = new Date(task.dueDate);
          const diff = dueDate.getTime() - now.getTime();
          const hoursLeft = diff / (1000 * 60 * 60);

          if (hoursLeft > 0 && hoursLeft < 24) {
            // Check if we already notified
            const notificationId = `deadline-${task.id}`;
            if (!notifications.find(n => n.id === notificationId)) {
              addNotification({
                title: 'Upcoming Deadline',
                message: `Task "${task.title}" is due in less than 24 hours!`,
                type: 'warning'
              });
            }
          }
        }
      });
    };

    const interval = setInterval(checkDeadlines, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, notifications]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  const updatePAD = (updates: Partial<PAD>) => {
    setPad(prev => ({ ...prev, ...updates }));
  };

  // AI Companion Reaction State
  const [aiEmotion, setAiEmotion] = useState<'happy' | 'surprised' | 'curious' | 'cool' | 'sleepy' | 'sad' | 'vibrate'>('happy');

  const triggerAiReaction = (emotion: 'happy' | 'surprised' | 'curious' | 'cool' | 'sleepy' | 'sad' | 'vibrate', duration: number = 2000) => {
    setAiEmotion(emotion);
    setTimeout(() => {
      setAiEmotion('happy');
    }, duration);
  };

  const login = (email: string, password: string) => {
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const newUser = { 
        id: 'u-' + Math.random().toString(36).substr(2, 9), 
        name: foundUser.name, 
        email: foundUser.email, 
        role: foundUser.role 
      };
      setUser(newUser);
      addNotification({
        title: 'Welcome back!',
        message: `Logged in as ${foundUser.name}. System adapted to your accessibility settings.`,
        type: 'success'
      });
      return true;
    } else {
      triggerAiReaction('vibrate', 2000);
      addNotification({
        title: 'Login Failed',
        message: 'Invalid email or password.',
        type: 'error'
      });
      return false;
    }
  };

  const register = (email: string, password: string, name: string, role: UserRole) => {
    if (registeredUsers.find(u => u.email === email)) {
      addNotification({
        title: 'Registration Error',
        message: 'Email already exists.',
        type: 'error'
      });
      return false;
    }

    const newUser = { email, password, name, role };
    setRegisteredUsers(prev => [...prev, newUser]);
    
    // Automatically log in after registration
    const userSession = { 
      id: 'u-' + Math.random().toString(36).substr(2, 9), 
      name, 
      email, 
      role 
    };
    setUser(userSession);
    
    addNotification({
      title: 'Success!',
      message: 'Account created. Welcome to the ABLE ecosystem.',
      type: 'success'
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    setSearchQuery('');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
    addNotification({
      title: 'Profile Updated',
      message: 'Your profile information has been saved.',
      type: 'success'
    });
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: 't-' + Math.random().toString(36).substr(2, 9) };
    setTasks(prev => [...prev, newTask]);
    addNotification({
      title: 'Task Added',
      message: `"${task.title}" has been added to your list.`,
      type: 'info'
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: 'n-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const sendMessage = (to: string, text: string) => {
    setMessages(prev => [...prev, { to, text, timestamp: Date.now() }]);
    addNotification({
      title: 'Message Sent',
      message: `Your message to ${to} has been delivered.`,
      type: 'success'
    });
  };

  const toggleHighContrast = () => setIsHighContrast(prev => !prev);

  const saveMessage = (message: any) => {
    updatePAD({ savedMessages: [...(pad.savedMessages || []), { ...message, id: Date.now().toString() }] });
    addNotification({
      title: 'Message Saved',
      message: 'Added to your library for later.',
      type: 'success'
    });
  };

  const resetChat = () => {
    // This will be used in components to clear local state
    addNotification({
      title: 'Session Reset',
      message: 'The conversation path has been cleared.',
      type: 'info'
    });
  };

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    // Clean text for better enunciation
    const cleanedText = text
      .replace(/([.?!])\s*/g, '$1 ') // Ensure single space after punctuation
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const isFemale = pad.voicePreference === VoicePreference.CalmFemale;

    // Natural pacing: slightly slower than 1.0 is often clearer for accessibility
    utterance.rate = pad.speechRate || 0.9;
    utterance.pitch = isFemale ? 1.1 : 0.95; // Slightly more natural pitch range
    utterance.volume = 1.0;

    if (voices.length > 0) {
      // Prioritize high-quality voices like "Google" or "Neural" voices if available
      const preferredVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const isEn = v.lang.startsWith('en');
        const isBetter = name.includes('google') || name.includes('natural') || name.includes('neural');
        
        if (isFemale) {
          return isEn && isBetter && (name.includes('female') || name.includes('samantha') || name.includes('zira') || name.includes('kore'));
        } else {
          return isEn && isBetter && (name.includes('male') || name.includes('david') || name.includes('mark') || name.includes('zephyr'));
        }
      }) || voices.find(v => {
        const isEn = v.lang.startsWith('en');
        const name = v.name.toLowerCase();
        if (isFemale) return isEn && (name.includes('female') || name.includes('samantha'));
        return isEn && (name.includes('male') || name.includes('david'));
      }) || voices.find(v => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    synthRef.current.speak(utterance);
  }, [pad.voicePreference, pad.speechRate, voices]);

  useEffect(() => {
    const root = document.documentElement;
    if (isHighContrast) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Font Scaling
    if (pad.fontSize === 'large') {
      root.style.fontSize = '120%';
    } else if (pad.fontSize === 'extra-large') {
      root.style.fontSize = '150%';
    } else if (pad.visual === VisualAbility.PartialBlindness || pad.vision === VisionNeed.LowVision) {
      root.style.fontSize = '125%';
    } else {
      root.style.fontSize = '100%';
    }

    const paletteMap: Record<ColorPalette, { primary: string; secondary: string; accent: string }> = {
      [ColorPalette.Teal]: { primary: '#2DD4BF', secondary: '#14B8A6', accent: '#5EEAD4' },
      [ColorPalette.Purple]: { primary: '#A855F7', secondary: '#9333EA', accent: '#D8B4FE' },
      [ColorPalette.Sky]: { primary: '#38BDF8', secondary: '#0EA5E9', accent: '#BAE6FD' },
      [ColorPalette.Lavender]: { primary: '#E6E6FA', secondary: '#B0B0E6', accent: '#F0F0FF' },
      [ColorPalette.Sunset]: { primary: '#FFD700', secondary: '#FF4D4D', accent: '#FFA500' }
    };
    
    const theme = paletteMap[pad.colorPalette] || paletteMap[ColorPalette.Teal];
    const primaryColor = pad.customColor || theme.primary;
    const secondaryColor = pad.customSecondaryColor || theme.secondary;
    const accentColor = pad.customAccentColor || theme.accent;
    
    root.style.setProperty('--able-primary', primaryColor);
    root.style.setProperty('--able-secondary', secondaryColor);
    root.style.setProperty('--able-accent', accentColor);
    root.style.setProperty('--able-glow', `${primaryColor}44`);
    root.style.setProperty('--able-btn-padding', `${pad.buttonPadding || 8}px`);
  }, [pad, isHighContrast]);

  const uiIntensity = 
    pad.cognitive === CognitiveMode.Simplified ? 'simplified' : 
    pad.cognitive === CognitiveMode.HighFocus ? 'high-focus' : 'standard';

  const t = useCallback((text: string): string => {
    if (!text) return '';
    const langCode = pad.primaryLanguage || 'english-standard';
    const baseLang = getBaseLanguageKey(langCode);
    const key = text.toUpperCase();
    const entry = TRANSLATIONS[key] || Object.entries(TRANSLATIONS).find(([k]) => k.toUpperCase() === key)?.[1];
    
    let translated = text;
    if (entry) {
      translated = entry[baseLang] || entry['en'] || text;
    }
    return adaptToDialect(translated, langCode);
  }, [pad.primaryLanguage]);

  return (
    <AbilityContext.Provider value={{ 
      pad, updatePAD, isHighContrast, toggleHighContrast, uiIntensity, speak,
      saveMessage, resetChat, t,
      user, login, register, logout, updateUser, isLoggedIn: !!user,
      aiEmotion, triggerAiReaction,
      tasks, addTask, updateTask, deleteTask,
      notifications, addNotification, markNotificationRead, clearNotifications,
      searchQuery, setSearchQuery, messages, sendMessage,
      suggestion, setSuggestion, activeTab, setActiveTab,
      isOnline
    }}>
      <div className={`min-h-screen w-full transition-all duration-500 ${isHighContrast ? 'dark' : ''}`}>
        {children}
      </div>
    </AbilityContext.Provider>
  );
};

export const useAbility = () => {
  const context = useContext(AbilityContext);
  if (!context) throw new Error('useAbility must be used within AbilityProvider');
  return context;
};


export enum VisualAbility {
  Standard = 'standard',
  Blurry = 'blurry',
  LowContrast = 'low-contrast',
  PartialBlindness = 'partial-blindness'
}

export enum SpeechStyle {
  Standard = 'standard',
  StutterAware = 'stutter-aware',
  FrequentPauses = 'frequent-pauses',
  NonVerbal = 'non-verbal'
}

export enum VoicePreference {
  CalmFemale = 'calm-female',
  CalmMale = 'calm-male'
}

export enum ColorPalette {
  Teal = 'teal',
  Purple = 'purple',
  Sky = 'sky',
  Lavender = 'lavender',
  Sunset = 'sunset'
}

export enum UserRole {
  User = 'user',
  HomeMember = 'home-member',
  Mentor = 'mentor',
  Doctor = 'doctor',
  Owner = 'owner'
}

export enum VisionNeed {
  Standard = 'standard',
  LowVision = 'low-vision',
  Blind = 'blind'
}

export enum CognitiveMode {
  Standard = 'standard',
  Simplified = 'simplified',
  HighFocus = 'high-focus'
}

export enum HearingNeed {
  Standard = 'standard',
  HardOfHearing = 'hard-of-hearing',
  Deaf = 'deaf'
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface PAD {
  visual: VisualAbility;
  speech: SpeechStyle;
  voicePreference: VoicePreference;
  colorPalette: ColorPalette;
  customColor?: string;
  customSecondaryColor?: string;
  customAccentColor?: string;
  buttonPadding?: number;
  fontSize?: 'standard' | 'large' | 'extra-large';
  highContrast: boolean;
  largeText: boolean;
  simplifiedResponses?: boolean;
  savedMessages?: Message[];
  primaryLanguage: string;
  speechRate: number;
  emergencyContacts: EmergencyContact[];
  medicalInfo?: string;
  bloodType?: string;
  vision?: VisionNeed;
  cognitive?: CognitiveMode;
  mobility?: string;
  hearing?: HearingNeed;
  signLanguagePreferred?: boolean;
}

export interface CircleMember {
  id: string;
  name: string;
  role: UserRole | string;
  avatar: string;
  specialty?: string;
  isOnline: boolean;
  relationship?: string;
  hourlyRate?: number;
  needsMet: string[];
}

export interface CareCirclePermission {
  memberId: string;
  viewProgress: boolean;
  viewGoals: boolean;
  viewAiInsights: boolean;
  viewWellBeing: boolean;
  viewSupportPlans: boolean;
  viewUpdates: boolean;
}

export interface CareCircleMember {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'caregiver' | 'mentor' | 'teacher' | 'doctor' | 'healthcare';
  avatar: string;
  isOnline: boolean;
  status: 'pending' | 'accepted';
  inviteLink: string;
  joinedAt: string;
  permissions: CareCirclePermission;
}

export interface ActivityLog {
  id: string;
  timestamp: number;
  memberName: string;
  role: string;
  action: string;
  details: string;
}

export interface AiMemory {
  id: string;
  category: 'Disability' | 'Anxiety' | 'Goal' | 'Preference' | 'Accessibility' | 'Health' | 'Past Conversation';
  content: string;
  createdAt: string;
  isApproved: boolean;
}

export interface CareerPath {
  title: string;
  compatibility: number;
  description: string;
  skills: string[];
  visualAlternativeNeeded: boolean;
  speechSupportLevel: 'low' | 'medium' | 'high';
}

export interface LocationSimulation {
  id: string;
  name: string;
  type: string;
  baseAccessibilityScore: number;
  accessibilityFeatures: string[];
  potentialHazards: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  category?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
  read: boolean;
  link?: string;
}

export interface AbilityProfile {
  visual: VisualAbility;
  speech: SpeechStyle;
  cognitive: CognitiveMode;
  hearing: HearingNeed;
  vision: VisionNeed;
  largeText: boolean;
  highContrast: boolean;
  speechRate: number;
  explanation: string;
}

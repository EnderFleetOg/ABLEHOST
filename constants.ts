
import { VisualAbility, SpeechStyle, VoicePreference, ColorPalette, PAD, LocationSimulation, CircleMember, UserRole } from './types';

export const APP_NAME = "ABLE";
export const TAGLINE = "Built for Ability";
export const CREATORS = "Naksh & Lakshita";
export const CONTACT_EMAIL = "enderfleet.ai@gmail.com";

export const DEFAULT_PAD: PAD = {
  visual: VisualAbility.Standard,
  speech: SpeechStyle.Standard,
  voicePreference: VoicePreference.CalmFemale,
  colorPalette: ColorPalette.Teal,
  customColor: '#2DD4BF',
  customSecondaryColor: '#14B8A6',
  customAccentColor: '#5EEAD4',
  buttonPadding: 12,
  highContrast: true,
  largeText: true,
  fontSize: 'standard',
  simplifiedResponses: false,
  savedMessages: [],
  primaryLanguage: 'English',
  speechRate: 0.9,
  emergencyContacts: [
    { name: 'Primary Guardian', phone: '555-0199' }
  ],
  medicalInfo: 'No known allergies. Uses corrective lenses.',
  bloodType: 'O+'
};

export const MOCK_CIRCLE: (CircleMember & { isMentor?: boolean })[] = [
  {
    id: 'c1',
    name: 'Maya',
    role: UserRole.HomeMember,
    relationship: 'Sister',
    avatar: '👧',
    isOnline: true,
    needsMet: ['Daily Support', 'Emotional Care'],
    isMentor: true
  },
  {
    id: 'c2',
    name: 'Dr. Aris',
    role: UserRole.Doctor,
    specialty: 'Vision Adaptation',
    avatar: '👨‍⚕️',
    isOnline: false,
    hourlyRate: 120,
    needsMet: ['Vision', 'Optics'],
    isMentor: true
  }
];

export const MOCK_SHOP_EXPERTS: CircleMember[] = [
  {
    id: 'e1',
    name: 'Dr. Sarah Chen',
    role: 'Doctor',
    specialty: 'Vision Specialist',
    avatar: '👩‍⚕️',
    hourlyRate: 150,
    needsMet: ['Glaucoma', 'Low Vision Tech'],
    isOnline: true
  }
];

export const MOCK_CAREERS = [
  {
    title: "Accessibility Consultant",
    compatibility: 98,
    description: "Use your lived experience to help companies build better tools.",
    skills: ["Analysis", "Advisory", "UX Review"],
    visualAlternativeNeeded: true,
    speechSupportLevel: 'high' as const
  }
];

export const MOCK_LOCATIONS: LocationSimulation[] = [
  {
    id: '1',
    name: 'Tech Park Plaza',
    type: 'WORKPLACE',
    baseAccessibilityScore: 85,
    accessibilityFeatures: ['Ramps', 'Braille Signage', 'Elevators'],
    potentialHazards: ['Crowded corridors']
  }
];

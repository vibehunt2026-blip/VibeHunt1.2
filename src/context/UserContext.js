import React, { createContext, useContext, useState } from 'react';

// Default empty user — nível zero
const defaultUser = {
  // From onboarding
  name: '',
  interests: [],
  schedule: '',
  exploration: '',

  // From profile setup (all optional)
  bio: '',
  city: '',
  birthYear: '',
  instagram: '',
  avatar: null,

  // Game stats — start at zero
  xp: 0,
  level: 0,
  levelLabel: 'Novato',
  badges: [],
  eventsAttended: 0,
  friends: 0,

  // App state
  profileSetupDone: false,
};

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(defaultUser);

  const updateUser = (fields) => {
    setUser(prev => ({ ...prev, ...fields }));
  };

  const completeOnboarding = (onboardingData) => {
    setUser(prev => ({
      ...prev,
      ...onboardingData,
      xp: 100,           // bónus de início
      badges: ['novato'],
    }));
  };

  const completeProfileSetup = (setupData) => {
    setUser(prev => ({
      ...prev,
      ...setupData,
      xp: prev.xp + 50,  // bónus por completar perfil
      profileSetupDone: true,
    }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser, completeOnboarding, completeProfileSetup }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
};

// Map interest id → label + emoji
export const INTEREST_MAP = {
  music:   { emoji: '🎵', label: 'Música' },
  art:     { emoji: '🎨', label: 'Arte' },
  food:    { emoji: '🍕', label: 'Gastronomia' },
  dance:   { emoji: '💃', label: 'Festa & Dance' },
  sport:   { emoji: '⚽', label: 'Desporto' },
  nature:  { emoji: '🌿', label: 'Natureza' },
  culture: { emoji: '🏛️', label: 'Cultura' },
  tech:    { emoji: '💻', label: 'Tecnologia' },
  yoga:    { emoji: '🧘', label: 'Bem-estar' },
  comedy:  { emoji: '😂', label: 'Comédia' },
};

export const SCHEDULE_MAP = {
  morning:   { emoji: '☀️', label: 'Manhã' },
  afternoon: { emoji: '🌤️', label: 'Tarde' },
  evening:   { emoji: '🌆', label: 'Fim do dia' },
  night:     { emoji: '🌙', label: 'Noite' },
};
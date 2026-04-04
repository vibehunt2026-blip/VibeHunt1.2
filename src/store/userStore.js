// src/store/userStore.js
//
// Store global do utilizador.
// Quando o Supabase está ligado, sincroniza automaticamente o perfil
// e os check-ins. Quando está desligado (supabase = null), funciona
// 100% em memória com mockData.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';
import { upsertProfile, getProfile, addXPToProfile } from '../features/profile/services/ProfileService';
import { checkInToEvent as checkInService, getUserCheckins } from '../features/events/services/eventService';

const UserContext = createContext();

// ── Gera um UUID v4 simples (sem dependências extra) ─────────────────────────
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const DEVICE_ID_KEY = '@vibehunt_device_id';

// Obtém ou cria um device_id persistente (substitui auth enquanto não há login)
async function getOrCreateDeviceId() {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const newId = generateUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    return newId;
  } catch {
    return generateUUID(); // fallback se AsyncStorage falhar
  }
}

export function UserProvider({ children }) {
  const [user,     setUser]     = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [syncing,  setSyncing]  = useState(false);

  // Carrega o device_id ao arrancar
  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  // ── Onboarding ──────────────────────────────────────────────────────────────
  const completeOnboarding = useCallback(async (data) => {
    const id = deviceId ?? (await getOrCreateDeviceId());

    const newUser = {
      id,
      name:            data.name        || 'Caçador',
      interests:       data.interests   || [],
      schedule:        data.schedule    || '',
      exploration:     data.exploration || '',
      xp:              50,
      level:           1,
      savedEvents:     [],
      checkedInEvents: [],
      createdAt:       new Date(),
    };

    setUser(newUser);

    // Persiste no Supabase em background (não bloqueia o UI)
    if (supabase) {
      upsertProfile(id, newUser).catch(() => {});
    }
  }, [deviceId]);

  // ── Adicionar XP ────────────────────────────────────────────────────────────
  const addXP = useCallback((amount) => {
    setUser((prev) => {
      if (!prev) return prev;
      const newXP    = prev.xp + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;

      // Sincroniza com Supabase em background
      if (supabase && prev.id) {
        addXPToProfile(prev.id, amount).catch(() => {});
      }

      return { ...prev, xp: newXP, level: newLevel };
    });
  }, []);

  // ── Check-in ────────────────────────────────────────────────────────────────
  const checkInToEvent = useCallback(async (eventId) => {
    if (!user) return { success: false };

    // Evita duplicados localmente
    if (user.checkedInEvents.includes(eventId)) {
      return { success: false, alreadyCheckedIn: true };
    }

    // Tenta persistir no Supabase
    const result = await checkInService(eventId, user.id);

    if (result.success || !supabase) {
      // Atualiza estado local
      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          checkedInEvents: [...prev.checkedInEvents, eventId],
          xp:    prev.xp + 10,
          level: Math.floor((prev.xp + 10) / 1000) + 1,
        };
      });
      return { success: true, xpEarned: 10 };
    }

    return result;
  }, [user]);

  // ── Guardar / remover evento ────────────────────────────────────────────────
  const saveEvent = useCallback((eventId) => {
    setUser((prev) => {
      if (!prev || prev.savedEvents.includes(eventId)) return prev;
      return { ...prev, savedEvents: [...prev.savedEvents, eventId] };
    });
  }, []);

  const unsaveEvent = useCallback((eventId) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, savedEvents: prev.savedEvents.filter(id => id !== eventId) };
    });
  }, []);

  // ── Sincronizar check-ins do Supabase ao abrir a app ───────────────────────
  const syncCheckinsFromSupabase = useCallback(async () => {
    if (!supabase || !user?.id) return;
    setSyncing(true);
    try {
      const checkins = await getUserCheckins(user.id);
      const eventIds = checkins.map(c => c.event_id);
      setUser(prev => prev ? { ...prev, checkedInEvents: eventIds } : prev);
    } finally {
      setSyncing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) syncCheckinsFromSupabase();
  }, [user?.id]);

  // ── Reset (logout) ──────────────────────────────────────────────────────────
  const resetUser = useCallback(() => setUser(null), []);

  return (
    <UserContext.Provider
      value={{
        user,
        deviceId,
        syncing,
        setUser,
        completeOnboarding,
        addXP,
        checkInToEvent,
        saveEvent,
        unsaveEvent,
        syncCheckinsFromSupabase,
        resetUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used inside UserProvider');
  return context;
};
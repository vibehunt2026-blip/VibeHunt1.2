// src/features/profile/services/ProfileService.js
import { supabase } from '../../../lib/supabase';

export async function getProfile(userId) {
  if (!supabase) throw new Error('[VibeHunt] Supabase não configurado');

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return normalizeProfile(data);
}

export async function upsertProfile(userId, profileData) {
  if (!supabase) throw new Error('[VibeHunt] Supabase não configurado');

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id:          userId,
        name:        profileData.name        ?? null,
        bio:         profileData.bio         ?? null,
        city:        profileData.city        ?? null,
        birth_year:  profileData.birthYear   ?? null,
        instagram:   profileData.instagram   ?? null,
        website:     profileData.website     ?? null,
        avatar:      profileData.avatar      ?? '🎯',
        interests:   profileData.interests   ?? [],
        schedule:    profileData.schedule    ?? null,
        exploration: profileData.exploration ?? null,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) throw error;
  return normalizeProfile(data);
}

export function normalizeProfile(raw) {
  if (!raw) return null;
  return {
    id:          raw.id,
    name:        raw.name        || '',
    bio:         raw.bio         || '',
    city:        raw.city        || '',
    birthYear:   raw.birth_year  || '',
    instagram:   raw.instagram   || '',
    website:     raw.website     || '',
    avatar:      raw.avatar      || '🎯',
    interests:   Array.isArray(raw.interests) ? raw.interests : [],
    schedule:    raw.schedule    || '',
    exploration: raw.exploration || '',
    xp:          raw.xp    ?? 100,
    level:       raw.level ?? 0,
  };
}
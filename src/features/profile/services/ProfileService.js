// src/features/profile/services/ProfileService.js
import { supabase } from '../../../../lib/supabase';

export async function getProfile(userId) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return normalizeProfile(data);
}

export async function upsertProfile(userId, profileData) {
  if (!supabase) return null;

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
        xp:          profileData.xp          ?? 50,
        level:       profileData.level       ?? 1,
        updated_at:  new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    console.warn('[ProfileService] upsertProfile:', error.message);
    return null;
  }
  return normalizeProfile(data);
}

export async function addXPToProfile(userId, amount) {
  if (!supabase) return null;

  // Incrementa o XP e recalcula o nível (1 nível por cada 1000 XP)
  const { data: current } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', userId)
    .single();

  if (!current) return null;

  const newXP    = (current.xp ?? 50) + amount;
  const newLevel = Math.floor(newXP / 1000) + 1;

  const { data, error } = await supabase
    .from('profiles')
    .update({ xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) return null;
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
    xp:          raw.xp          ?? 50,
    level:       raw.level       ?? 1,
  };
}
// src/services/profileService.js
//
// Todas as operações CRUD para a tabela profiles.
// normalizeProfile converte snake_case (Supabase) → camelCase (app).

import { supabase } from '../../lib/supabase';

// ── Leitura ───────────────────────────────────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

// ── Escrita (cria ou actualiza) ───────────────────────────────────────────────
export async function upsertProfile(userId, profileData) {
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

// ── Normalização Supabase → App ───────────────────────────────────────────────
// snake_case vindo do Supabase ↔ camelCase usado na app
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
    interests:   raw.interests   || [],
    schedule:    raw.schedule    || '',
    exploration: raw.exploration || '',
    xp:          raw.xp          ?? 100,
    level:       raw.level       ?? 0,
  };
}
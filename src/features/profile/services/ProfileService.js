// ─────────────────────────────────────────────────────────────────────────────
// src/features/profile/services/ProfileService.js
//
// Operações CRUD para a tabela `profiles` do Supabase.
//
// Convenção de nomes:
//   Supabase usa snake_case (birth_year, is_featured, …)
//   A app usa camelCase (birthYear, isFeatured, …)
//   A função normalizeProfile() faz a conversão numa só direcção.
// ─────────────────────────────────────────────────────────────────────────────

// CORRIGIDO: caminho corrigido de '../../lib/supabase' para o caminho real
import { supabase } from '../../../lib/supabase';

// ── Leitura do perfil ─────────────────────────────────────────────────────────
/**
 * Obtém o perfil de um utilizador pelo seu UUID de autenticação.
 * @param {string} userId - UUID do utilizador (auth.users.id)
 * @returns {Promise<Object>} Perfil normalizado
 * @throws {Error} Se a query falhar
 */
export async function getProfile(userId) {
  if (!supabase) throw new Error('Supabase não configurado');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return normalizeProfile(data);
}

// ── Criação ou actualização do perfil ────────────────────────────────────────
/**
 * Cria ou actualiza o perfil de um utilizador (upsert).
 * Usa onConflict: 'id' para garantir que não há duplicados.
 * @param {string} userId - UUID do utilizador
 * @param {Object} profileData - Dados em camelCase (formato da app)
 * @returns {Promise<Object>} Perfil normalizado após escrita
 * @throws {Error} Se a operação falhar
 */
export async function upsertProfile(userId, profileData) {
  if (!supabase) throw new Error('Supabase não configurado');
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
/**
 * Converte um registo raw do Supabase (snake_case) para o formato
 * usado internamente pela app (camelCase).
 * Retorna null se o input for null/undefined.
 * @param {Object|null} raw - Registo do Supabase
 * @returns {Object|null}
 */
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
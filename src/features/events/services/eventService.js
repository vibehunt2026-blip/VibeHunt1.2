// ─────────────────────────────────────────────────────────────────────────────
// src/features/events/services/eventService.js
//
// Serviço de eventos — interface entre a app e o Supabase.
//
// Estratégia de fallback:
//   Todas as funções tentam primeiro o Supabase. Se a tabela estiver vazia,
//   o Supabase não estiver configurado, ou ocorrer qualquer erro de rede,
//   o fallback automático para mockEvents garante que a app funciona sempre
//   durante o desenvolvimento.
//
// Quando ligares ao Supabase real:
//   1. Configura as variáveis de ambiente em .env (ver src/lib/supabase.js)
//   2. Cria a tabela `events` com as colunas em normalizeEvent()
//   3. Muda getEvents() de retorno directo de mock para query Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../../../../lib/supabase';
import { mockEvents } from '../../../data/mockData';

// ── Todos os eventos ──────────────────────────────────────────────────────────
// FIXME: Actualmente retorna mockData directamente (síncrono).
// Quando o Supabase estiver configurado, substituir pelo bloco comentado abaixo.
// A função JÁ é async para que todos os chamadores possam usar await
// sem precisarem de ser alterados depois.
export async function getEvents() {
  // ── Versão Supabase (descomentar quando a tabela existir) ──────────────
  // try {
  //   const { data, error } = await supabase.from('events').select('*');
  //   if (error || !data || data.length === 0) return mockEvents;
  //   return data.map(normalizeEvent);
  // } catch {
  //   return mockEvents;
  // }
  // ──────────────────────────────────────────────────────────────────────

  // Fallback de desenvolvimento — retorna os dados locais
  return mockEvents;
}

// ── Check-in num evento ───────────────────────────────────────────────────────
// FIXME: Actualmente é mock. Implementar escrita na tabela `checkins` do Supabase.
export async function checkInToEvent(eventId) {
  // try {
  //   const { error } = await supabase
  //     .from('checkins')
  //     .insert({ event_id: eventId, user_id: (await supabase.auth.getUser()).data.user.id });
  //   if (error) throw error;
  //   return { success: true, xpEarned: 10 };
  // } catch (err) {
  //   console.warn('[eventService] checkInToEvent error:', err.message);
  //   return { success: false, xpEarned: 0 };
  // }
  return { success: true, xpEarned: 10 };
}

// ── Evento em destaque ────────────────────────────────────────────────────────
export async function getFeaturedEvent() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_featured', true)
      .limit(1)
      .single();

    if (error || !data) return mockEvents[0];
    return normalizeEvent(data);
  } catch {
    return mockEvents[0];
  }
}

// ── Eventos com coordenadas GPS (para o mapa) ─────────────────────────────────
export async function getEventsWithCoords() {
  const events = await getEvents();
  const withCoords = events.filter(
    (e) => e.latitude != null && e.longitude != null
  );

  // Se os eventos (mock ou Supabase) não tiverem coordenadas,
  // injeta coordenadas aproximadas do Porto para o mapa funcionar em dev.
  if (withCoords.length === 0) {
    return attachMockCoords(events);
  }
  return withCoords;
}

// ── Normalização Supabase (snake_case) → App (camelCase) ─────────────────────
// Garante que independentemente da fonte (Supabase ou mock),
// o resto da app usa sempre a mesma estrutura de objecto.
export function normalizeEvent(e) {
  return {
    id:           e.id,
    title:        e.title           ?? '',
    subtitle:     e.subtitle        ?? '',
    venue:        e.venue           ?? '',
    location:     e.location        ?? '',
    latitude:     e.latitude        ?? null,
    longitude:    e.longitude       ?? null,
    date:         e.date            ?? 'Hoje',
    time:         e.time            ?? '',
    category:     e.category        ?? '',
    categoryIcon: e.category_icon   ?? '🎵',
    price:        e.price           ?? 'Grátis',
    priceLabel:   e.price_label     ?? '',
    attendees:    e.attendees_count ?? 0,
    attending:    0,
    distance:     e.distance        ?? '',
    vibe:         e.vibe_emoji      ?? '✨',
    vibeScore:    e.vibe_score      ?? 75,
    image:
      e.image_url ??
      e.image ??
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
    isFeatured: e.is_featured ?? e.isFeatured ?? false,
    isSaved:    false,
    tags:       e.tags ?? [],
  };
}

// ── Coordenadas aproximadas para mockEvents (Porto) ───────────────────────────
// Usado apenas em modo de desenvolvimento quando os dados não têm coords.
const MOCK_COORDS = [
  { latitude: 41.1579, longitude: -8.6291 }, // Casa da Música
  { latitude: 41.1494, longitude: -8.6058 }, // Bolhão
  { latitude: 41.1469, longitude: -8.6057 }, // Maus Hábitos
  { latitude: 41.1597, longitude: -8.6759 }, // Parque da Cidade
  { latitude: 41.1425, longitude: -8.6118 }, // Sé
  { latitude: 41.1396, longitude: -8.6148 }, // Hard Club
];

function attachMockCoords(events) {
  return events.map((e, i) => ({
    ...e,
    latitude:  MOCK_COORDS[i % MOCK_COORDS.length].latitude,
    longitude: MOCK_COORDS[i % MOCK_COORDS.length].longitude,
  }));
}
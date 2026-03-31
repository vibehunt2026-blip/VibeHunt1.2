// src/services/eventService.js
//
// Busca eventos do Supabase.
// Se a tabela estiver vazia ou houver erro, usa os mockEvents como fallback
// para que a app funcione sempre durante desenvolvimento.

import { supabase } from '../../lib/supabase';
import { mockEvents } from '../data/MockData';

// ── Todos os eventos ──────────────────────────────────────────────────────────
export async function getEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return mockEvents; // fallback
    }
    return data.map(normalizeEvent);
  } catch {
    return mockEvents;
  }
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

// ── Eventos com coordenadas (para o mapa) ─────────────────────────────────────
export async function getEventsWithCoords() {
  const events = await getEvents();
  const withCoords = events.filter(e => e.latitude != null && e.longitude != null);
  // Se os mockEvents não têm coords, adiciona coords de Porto manualmente
  if (withCoords.length === 0) return attachMockCoords(events);
  return withCoords;
}

// ── Normalização Supabase → App ───────────────────────────────────────────────
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
    image:        e.image_url       ?? e.image ?? 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
    isFeatured:   e.is_featured     ?? e.isFeatured  ?? false,
    isSaved:      false,
    tags:         e.tags            ?? [],
  };
}

// ── Coordenadas aproximadas para os mockEvents (Porto) ────────────────────────
// Usado apenas quando os dados do Supabase ainda não têm coords
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
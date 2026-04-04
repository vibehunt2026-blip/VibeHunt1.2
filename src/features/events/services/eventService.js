// src/features/events/services/eventService.js
import { supabase } from '../../../../lib/supabase';
import { mockEvents } from '../../../data/mockData';

// ── Todos os eventos ──────────────────────────────────────────────────────────
export async function getEvents() {
  if (!supabase) return mockEvents;

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('vibe_score', { ascending: false });

    if (error || !data || data.length === 0) return mockEvents;
    return data.map(normalizeEvent);
  } catch {
    return mockEvents;
  }
}

// ── Evento em destaque ────────────────────────────────────────────────────────
export async function getFeaturedEvent() {
  if (!supabase) return mockEvents[0];

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

// ── Eventos por categoria ─────────────────────────────────────────────────────
export async function getEventsByCategory(category) {
  if (!supabase) return mockEvents.filter(e => e.category === category);

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('category', category)
      .order('vibe_score', { ascending: false });

    if (error || !data) return mockEvents.filter(e => e.category === category);
    return data.map(normalizeEvent);
  } catch {
    return mockEvents.filter(e => e.category === category);
  }
}

// ── Eventos com coordenadas GPS (para o mapa) ─────────────────────────────────
export async function getEventsWithCoords() {
  const events = await getEvents();
  const withCoords = events.filter(e => e.latitude != null && e.longitude != null);
  if (withCoords.length === 0) return attachMockCoords(events);
  return withCoords;
}

// ── Check-in num evento ───────────────────────────────────────────────────────
export async function checkInToEvent(eventId, userId) {
  if (!supabase || !userId) return { success: true, xpEarned: 10 };

  try {
    const { error } = await supabase
      .from('checkins')
      .insert({ event_id: eventId, user_id: userId, xp_earned: 10 });

    if (error) {
      // código 23505 = unique_violation (já fez check-in)
      if (error.code === '23505') return { success: false, xpEarned: 0, alreadyCheckedIn: true };
      throw error;
    }
    return { success: true, xpEarned: 10 };
  } catch (err) {
    console.warn('[eventService] checkInToEvent:', err.message);
    return { success: false, xpEarned: 0 };
  }
}

// ── Check-ins de um utilizador ────────────────────────────────────────────────
export async function getUserCheckins(userId) {
  if (!supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('checkins')
      .select('event_id, created_at, xp_earned')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

// ── Pesquisa de eventos ───────────────────────────────────────────────────────
export async function searchEvents(query) {
  if (!supabase) {
    const q = query.toLowerCase();
    return mockEvents.filter(
      e => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
    );
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .or(`title.ilike.%${query}%,venue.ilike.%${query}%,location.ilike.%${query}%`)
      .order('vibe_score', { ascending: false });

    if (error || !data) return [];
    return data.map(normalizeEvent);
  } catch {
    return [];
  }
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
    image:
      e.image_url ??
      e.image ??
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
    isFeatured: e.is_featured  ?? false,
    isSaved:    false,
    tags:       e.tags         ?? [],
  };
}

// ── Coordenadas mock para desenvolvimento ────────────────────────────────────
const MOCK_COORDS = [
  { latitude: 41.1579, longitude: -8.6291 },
  { latitude: 41.1494, longitude: -8.6058 },
  { latitude: 41.1469, longitude: -8.6057 },
  { latitude: 41.1597, longitude: -8.6759 },
  { latitude: 41.1425, longitude: -8.6118 },
  { latitude: 41.1396, longitude: -8.6148 },
];

function attachMockCoords(events) {
  return events.map((e, i) => ({
    ...e,
    latitude:  MOCK_COORDS[i % MOCK_COORDS.length].latitude,
    longitude: MOCK_COORDS[i % MOCK_COORDS.length].longitude,
  }));
}
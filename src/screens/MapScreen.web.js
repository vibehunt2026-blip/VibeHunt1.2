// src/screens/MapScreen.js — com react-native-maps real
//
// ✦ Apple Maps no iOS (gratuito, sem API key)
// ✦ Google Maps no Android (precisa de API key no app.json)
// ✦ Estilo escuro personalizado para combinar com o design da app
// ✦ Eventos carregados do Supabase (fallback para mockData)

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Dimensions, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { getEventsWithCoords } from '../services/Eventservice';

const { width } = Dimensions.get('window');

const FILTERS = ['Todos', '🎵 Música', '🎨 Arte', '💃 Festa', '🧘 Bem-estar', '🍕 Gastro'];

const PORTO_REGION = {
  latitude:      41.1496,
  longitude:    -8.6109,
  latitudeDelta:  0.07,
  longitudeDelta: 0.07,
};

const CATEGORY_COLOR = {
  'Música':      '#8B5CF6',
  'Arte':        '#EC4899',
  'Festa':       '#F59E0B',
  'Bem-estar':   '#10B981',
  'Gastronomia': '#EF4444',
  'Cultura':     '#06B6D4',
  'default':     '#8B5CF6',
};

function EventPin({ event, selected }) {
  const color = CATEGORY_COLOR[event.category] ?? CATEGORY_COLOR.default;
  const size  = selected ? 50 : 40;

  return (
    <View style={pin.wrap}>
      <View style={[
        pin.bubble,
        {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: selected ? 3 : 2,
          borderColor: selected ? '#fff' : 'rgba(255,255,255,0.3)',
          shadowRadius: selected ? 12 : 6,
          shadowOpacity: selected ? 0.6 : 0.35,
        },
      ]}>
        <Text style={[pin.emoji, { fontSize: selected ? 22 : 18 }]}>
          {event.categoryIcon}
        </Text>
      </View>
      <View style={[pin.shadow, { backgroundColor: color }]} />
    </View>
  );
}

export default function MapScreen() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [events,       setEvents]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedId,   setSelectedId]   = useState(null);
  const mapRef = useRef(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const data = await getEventsWithCoords();
      setEvents(data);
      if (data.length > 0) setSelectedId(data[0].id);
    } catch (err) {
      console.warn('MapScreen fetchEvents:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = activeFilter === 0
    ? events
    : events.filter(e => {
        const f = FILTERS[activeFilter].replace(/^[^\s]+\s/, '');
        return e.category === f;
      });

  const selectedEvent = filteredEvents.find(e => e.id === selectedId) ?? filteredEvents[0];

  const handleMarkerPress = (id) => {
    setSelectedId(id);
    const ev = events.find(e => e.id === id);
    if (ev?.latitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude:      ev.latitude  - 0.008,
        longitude:     ev.longitude,
        latitudeDelta:  0.035,
        longitudeDelta: 0.035,
      }, 450);
    }
  };

  return (
    <View style={s.container}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={s.header}>
        <View style={s.headerRow}>
          <Text style={s.title}>Explorar</Text>
          <TouchableOpacity style={s.iconBtn}>
            <Ionicons name="options-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <Text style={s.searchText}>Pesquisa local ou evento...</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filters}
        >
          {FILTERS.map((f, i) => (
            <TouchableOpacity
              key={f}
              style={[s.chip, i === activeFilter && s.chipActive]}
              onPress={() => setActiveFilter(i)}
            >
              <Text style={[s.chipText, i === activeFilter && s.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* ── Mapa Nativo Real para iOS / Android ── */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={s.loadingText}>A carregar eventos...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          style={s.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={PORTO_REGION}
          showsUserLocation
          showsMyLocationButton={false}
          userInterfaceStyle="dark"
          customMapStyle={Platform.OS === 'android' ? DARK_MAP_STYLE : undefined}
        >
          {filteredEvents.map(ev => (
            ev.latitude && ev.longitude ? (
              <Marker
                key={ev.id}
                coordinate={{ latitude: ev.latitude, longitude: ev.longitude }}
                onPress={() => handleMarkerPress(ev.id)}
                tracksViewChanges={false}
              >
                <EventPin event={ev} selected={selectedId === ev.id} />
              </Marker>
            ) : null
          ))}
        </MapView>
      )}

      {/* ── Cartão inferior ────────────────────────────────────── */}
      {selectedEvent && !loading && (
        <View style={s.bottomCard}>
          <View style={s.handle} />
          <Text style={s.nearbyTitle}>
            {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
          </Text>

          <TouchableOpacity style={s.preview} activeOpacity={0.88}>
            <View style={s.previewIcon}>
              <Text style={s.previewEmoji}>{selectedEvent.categoryIcon}</Text>
            </View>
            <View style={s.previewContent}>
              <View style={s.previewTop}>
                <Text style={s.previewTitle} numberOfLines={1}>{selectedEvent.title}</Text>
                <Text style={s.previewPrice}>{selectedEvent.price}</Text>
              </View>
              <Text style={s.previewVenue} numberOfLines={1}>{selectedEvent.venue}</Text>
              <View style={s.previewFooter}>
                <View style={s.timePill}>
                  <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                  <Text style={s.timeText}>{selectedEvent.date} · {selectedEvent.time}</Text>
                </View>
                <View style={s.vibePill}>
                  <Text style={s.vibeEmoji}>{selectedEvent.vibe}</Text>
                  <Text style={s.vibeText}>{selectedEvent.vibeScore}%</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
          >
            {filteredEvents.slice(0, 8).map(ev => (
              <TouchableOpacity
                key={ev.id}
                style={[s.chip2, selectedId === ev.id && s.chip2Active]}
                onPress={() => handleMarkerPress(ev.id)}
              >
                <Text style={s.chip2Emoji}>{ev.categoryIcon}</Text>
                <Text
                  style={[s.chip2Text, selectedId === ev.id && s.chip2TextActive]}
                  numberOfLines={1}
                >
                  {ev.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

    </View>
  );
}

const DARK_MAP_STYLE = [
  { elementType: 'geometry',            stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#9ca3af' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road',           elementType: 'geometry',        stylers: [{ color: '#2d2d3e' }] },
  { featureType: 'road',           elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
  { featureType: 'road.highway',   elementType: 'geometry',        stylers: [{ color: '#3d3d5c' }] },
  { featureType: 'water',          elementType: 'geometry',        stylers: [{ color: '#0f172a' }] },
  { featureType: 'poi.park',       elementType: 'geometry',        stylers: [{ color: '#0f2a1d' }] },
  { featureType: 'transit',                                         stylers: [{ visibility: 'off' }] },
  { featureType: 'poi',            elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#4b4b6e' }] },
];

const pin = StyleSheet.create({
  wrap:   { alignItems: 'center' },
  bubble: {
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  emoji:  {},
  shadow: {
    width: 10, height: 4, borderRadius: 5,
    opacity: 0.35, marginTop: 1,
  },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header: { backgroundColor: colors.bg, zIndex: 10 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs,
  },
  title:   { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard,
    marginHorizontal: spacing.md, marginVertical: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: 11,
    borderRadius: radius.lg, gap: 8,
  },
  searchText: { color: colors.textMuted, fontSize: 14 },
  filters:    { paddingHorizontal: spacing.md, gap: 8, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
  },
  chipActive:    { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:      { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: colors.white },

  map: { flex: 1 },
  loadingWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1a1a2e', gap: 12,
  },
  loadingText: { color: colors.textSecondary, fontSize: 14 },

  bottomCard: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.md, paddingTop: spacing.sm, gap: spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20,
    shadowOffset: { width: 0, height: -5 }, elevation: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.xs,
  },
  nearbyTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },

  preview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgCard2, borderRadius: radius.lg, padding: 12,
  },
  previewIcon: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: 'rgba(139,92,246,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  previewEmoji:   { fontSize: 24 },
  previewContent: { flex: 1 },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  previewTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  previewPrice: { color: colors.accent, fontSize: 14, fontWeight: '800' },
  previewVenue: { color: colors.textSecondary, fontSize: 12, marginBottom: 6 },
  previewFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  timeText: { color: colors.textSecondary, fontSize: 11 },
  vibePill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  vibeEmoji: { fontSize: 12 },
  vibeText: { color: colors.accent, fontSize: 11, fontWeight: '700' },

  chip2: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.full,
    backgroundColor: colors.bgCard2, borderWidth: 1, borderColor: colors.border, maxWidth: 140,
  },
  chip2Active:    { borderColor: colors.primary, backgroundColor: 'rgba(139,92,246,0.12)' },
  chip2Emoji:     { fontSize: 14 },
  chip2Text:      { color: colors.textSecondary, fontSize: 12, fontWeight: '600', flex: 1 },
  chip2TextActive: { color: colors.primaryLight },
});
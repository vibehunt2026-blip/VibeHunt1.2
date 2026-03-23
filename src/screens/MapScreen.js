import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { mockEvents } from '../data/mockData';

const { width, height } = Dimensions.get('window');

const FILTERS = ['Todos', '🎵 Música', '🎨 Arte', '💃 Festa', '🧘 Bem-estar', '🍕 Gastro'];

// Fake map pin positions for visual demo
const PINS = [
  { id: 'e1', x: width * 0.25, y: height * 0.22, emoji: '🎷', color: '#8B5CF6' },
  { id: 'e3', x: width * 0.55, y: height * 0.3,  emoji: '💃', color: '#EC4899' },
  { id: 'e6', x: width * 0.4,  y: height * 0.38, emoji: '🎸', color: '#F59E0B' },
  { id: 'e2', x: width * 0.7,  y: height * 0.2,  emoji: '🎵', color: '#10B981' },
  { id: 'e4', x: width * 0.15, y: height * 0.42, emoji: '🧘', color: '#06B6D4' },
];

function MapPin({ pin, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.pin, selected && styles.pinSelected, { left: pin.x - 20, top: pin.y - 20 }]}
      onPress={() => onPress(pin.id)}
      activeOpacity={0.85}
    >
      <View style={[styles.pinBubble, { backgroundColor: pin.color, transform: [{ scale: selected ? 1.2 : 1 }] }]}>
        <Text style={styles.pinEmoji}>{pin.emoji}</Text>
      </View>
      <View style={[styles.pinTail, { borderTopColor: pin.color }]} />
    </TouchableOpacity>
  );
}

export default function MapScreen() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [selectedPin, setSelectedPin] = useState('e1');
  const selectedEvent = mockEvents.find(e => e.id === selectedPin) || mockEvents[0];

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Explorar</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="options-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <TouchableOpacity style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <Text style={styles.searchText}>Pesquisa local ou evento...</Text>
        </TouchableOpacity>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f, i) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, i === activeFilter && styles.chipActive]}
              onPress={() => setActiveFilter(i)}
            >
              <Text style={[styles.chipText, i === activeFilter && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Fake map */}
      <View style={styles.map}>
        {/* Map grid lines */}
        {[0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map(y => (
          <View key={y} style={[styles.gridH, { top: `${y * 100}%` }]} />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map(x => (
          <View key={x} style={[styles.gridV, { left: `${x * 100}%` }]} />
        ))}

        {/* Roads */}
        <View style={styles.roadH1} />
        <View style={styles.roadH2} />
        <View style={styles.roadV1} />
        <View style={styles.roadV2} />

        {/* Location label */}
        <View style={styles.mapLabel}>
          <Ionicons name="navigate" size={12} color={colors.primary} />
          <Text style={styles.mapLabelText}>Porto, Portugal</Text>
        </View>

        {/* User location */}
        <View style={styles.userPin}>
          <View style={styles.userPinOuter} />
          <View style={styles.userPinInner} />
        </View>

        {/* Event pins */}
        {PINS.map(pin => (
          <MapPin
            key={pin.id}
            pin={pin}
            selected={selectedPin === pin.id}
            onPress={setSelectedPin}
          />
        ))}
      </View>

      {/* Bottom event card */}
      <View style={styles.bottomCard}>
        <View style={styles.bottomHandle} />
        <Text style={styles.nearbyTitle}>Eventos próximos · {mockEvents.length} encontrados</Text>

        <TouchableOpacity style={styles.eventPreview} activeOpacity={0.88}>
          <View style={styles.eventPreviewLeft}>
            <Text style={styles.eventPreviewEmoji}>{selectedEvent.categoryIcon}</Text>
          </View>
          <View style={styles.eventPreviewContent}>
            <View style={styles.eventPreviewTop}>
              <Text style={styles.eventPreviewTitle}>{selectedEvent.title}</Text>
              <Text style={styles.eventPreviewPrice}>{selectedEvent.price}</Text>
            </View>
            <Text style={styles.eventPreviewSub}>{selectedEvent.venue} · {selectedEvent.distance}</Text>
            <View style={styles.eventPreviewFooter}>
              <View style={styles.eventTimePill}>
                <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
                <Text style={styles.eventTimeText}>{selectedEvent.date} · {selectedEvent.time}</Text>
              </View>
              <View style={styles.eventVibe}>
                <Text style={styles.eventVibeEmoji}>{selectedEvent.vibe}</Text>
                <Text style={styles.eventVibeText}>{selectedEvent.vibeScore}%</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
          {mockEvents.slice(0, 5).map(e => (
            <TouchableOpacity
              key={e.id}
              style={[styles.eventMiniChip, selectedPin === e.id && styles.eventMiniChipActive]}
              onPress={() => setSelectedPin(e.id)}
            >
              <Text style={styles.eventMiniEmoji}>{e.categoryIcon}</Text>
              <Text style={[styles.eventMiniText, selectedPin === e.id && styles.eventMiniTextActive]} numberOfLines={1}>
                {e.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { backgroundColor: colors.bg, zIndex: 10 },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: 11,
    borderRadius: radius.lg, gap: 8,
  },
  searchText: { color: colors.textMuted, fontSize: 14 },
  filters: { paddingHorizontal: spacing.md, gap: 8, paddingVertical: spacing.xs },
  chip: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: colors.white },

  // Map
  map: {
    flex: 1,
    backgroundColor: '#0F1520',
    position: 'relative',
    overflow: 'hidden',
  },
  gridH: {
    position: 'absolute', left: 0, right: 0,
    height: 1, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  gridV: {
    position: 'absolute', top: 0, bottom: 0,
    width: 1, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  roadH1: {
    position: 'absolute', left: 0, right: 0,
    top: '35%', height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  roadH2: {
    position: 'absolute', left: 0, right: 0,
    top: '60%', height: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  roadV1: {
    position: 'absolute', top: 0, bottom: 0,
    left: '45%', width: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  roadV2: {
    position: 'absolute', top: 0, bottom: 0,
    left: '70%', width: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  mapLabel: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.full,
  },
  mapLabelText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  userPin: {
    position: 'absolute',
    left: width * 0.45 - 12,
    top: height * 0.32 - 12,
    alignItems: 'center', justifyContent: 'center',
  },
  userPinOuter: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.25)',
    position: 'absolute',
  },
  userPinInner: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#3B82F6',
    borderWidth: 2, borderColor: colors.white,
  },

  // Pins
  pin: { position: 'absolute', alignItems: 'center' },
  pinSelected: { zIndex: 10 },
  pinBubble: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  pinEmoji: { fontSize: 18 },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
  },

  // Bottom
  bottomCard: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: -5 },
    elevation: 20,
  },
  bottomHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: spacing.xs,
  },
  nearbyTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  eventPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bgCard2,
    borderRadius: radius.lg, padding: 12,
  },
  eventPreviewLeft: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: 'rgba(139,92,246,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  eventPreviewEmoji: { fontSize: 24 },
  eventPreviewContent: { flex: 1 },
  eventPreviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  eventPreviewTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', flex: 1 },
  eventPreviewPrice: { color: colors.accent, fontSize: 14, fontWeight: '800' },
  eventPreviewSub: { color: colors.textSecondary, fontSize: 12, marginBottom: 6 },
  eventPreviewFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eventTimePill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  eventTimeText: { color: colors.textSecondary, fontSize: 11 },
  eventVibe: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  eventVibeEmoji: { fontSize: 12 },
  eventVibeText: { color: colors.accent, fontSize: 11, fontWeight: '700' },

  eventMiniChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard2,
    borderWidth: 1, borderColor: colors.border,
    maxWidth: 140,
  },
  eventMiniChipActive: { borderColor: colors.primary, backgroundColor: 'rgba(139,92,246,0.12)' },
  eventMiniEmoji: { fontSize: 14 },
  eventMiniText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', flex: 1 },
  eventMiniTextActive: { color: colors.primaryLight },
});

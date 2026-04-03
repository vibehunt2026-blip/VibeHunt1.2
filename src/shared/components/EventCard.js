import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/colors';

// IMPORTAÇÃO DO SERVIÇO (Ajuste o caminho se necessário)
import { checkIn } from '../../features/events/services/checkinService';

const { width } = Dimensions.get('window');

// Large featured card (full-width, tall)
export function FeaturedEventCard({ event, onPress }) {
  const [saved, setSaved] = useState(event.isSaved);
  const [loading, setLoading] = useState(false);

  // FUNÇÃO DE CHECK-IN
  const handleCheckIn = async () => {
    try {
      setLoading(true);
      // Nota: Você precisará passar o ID do usuário logado aqui. 
      // Exemplo temporário: event.userId ou pegar de um contexto de Auth
      await checkIn(event.userId, event.id); 
      Alert.alert("Sucesso!", "Check-in realizado com sucesso.");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível fazer o check-in: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.92}>
      <Image source={{ uri: event.image }} style={styles.featuredImage} />
      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.97)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
      />

      {/* Top row */}
      <View style={styles.featuredTop}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{event.attending} amigos aqui</Text>
        </View>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => setSaved(!saved)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? colors.primary : colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom content */}
      <View style={styles.featuredBottom}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{event.categoryIcon} {event.category}</Text>
        </View>
        
        {/* BOTÃO DE CHECK-IN (Estilizado para o seu design) */}
        <TouchableOpacity 
          style={styles.checkInButton} 
          onPress={handleCheckIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="location" size={16} color={colors.white} />
              <Text style={styles.checkInText}>Check-in</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.featuredTitle}>{event.title}</Text>
        <Text style={styles.featuredSub} numberOfLines={1}>{event.subtitle}</Text>

        <View style={styles.featuredRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.metaText}>{event.venue}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.metaText}>{event.date} · {event.time}</Text>
          </View>
        </View>

        <View style={styles.featuredFooter}>
          <View style={styles.vibeRow}>
            <Text style={styles.vibeEmoji}>{event.vibe}</Text>
            <Text style={styles.vibeScore}>{event.vibeScore}% vibe</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>{event.price}</Text>
            <View style={styles.attendeePill}>
              <Ionicons name="people" size={11} color={colors.textSecondary} />
              <Text style={styles.attendeeText}>{event.attendees}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Compact horizontal card
export function CompactEventCard({ event, onPress }) {
  const [saved, setSaved] = useState(event.isSaved);

  return (
    <TouchableOpacity style={styles.compactCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: event.image }} style={styles.compactImage} />
      <LinearGradient
        colors={['transparent', 'rgba(10,10,15,0.9)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 0, y: 1 }}
      />
      <TouchableOpacity
        style={styles.compactSave}
        onPress={() => setSaved(!saved)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={18}
          color={saved ? colors.primary : colors.white}
        />
      </TouchableOpacity>
      <View style={styles.compactBottom}>
        <Text style={styles.compactEmoji}>{event.categoryIcon}</Text>
        <Text style={styles.compactTitle} numberOfLines={1}>{event.title}</Text>
        <View style={styles.compactMeta}>
          <Text style={styles.compactMetaText}>{event.time}</Text>
          <Text style={styles.compactDot}>·</Text>
          <Text style={styles.compactMetaText}>{event.distance}</Text>
          <Text style={styles.compactDot}>·</Text>
          <Text style={[styles.compactMetaText, { color: colors.accent }]}>{event.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// List row card
export function ListEventCard({ event, onPress }) {
  const [saved, setSaved] = useState(event.isSaved);

  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.88}>
      <Image source={{ uri: event.image }} style={styles.listImage} />
      <View style={styles.listContent}>
        <View style={styles.listTop}>
          <View style={styles.listCategoryPill}>
            <Text style={styles.listCategoryText}>{event.categoryIcon} {event.category}</Text>
          </View>
          {event.attending > 0 && (
            <View style={styles.listFriendBadge}>
              <Ionicons name="people" size={10} color={colors.primary} />
              <Text style={styles.listFriendText}>{event.attending} amigos</Text>
            </View>
          )}
        </View>
        <Text style={styles.listTitle} numberOfLines={1}>{event.title}</Text>
        <Text style={styles.listVenue} numberOfLines={1}>{event.venue} · {event.distance}</Text>
        <div style={styles.listFooter}>
          <View style={styles.listTimePill}>
            <Ionicons name="time-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.listTimeText}>{event.date} {event.time}</Text>
          </View>
          <Text style={styles.listPrice}>{event.price}</Text>
        </div>
      </View>
      <TouchableOpacity
        onPress={() => setSaved(!saved)}
        style={styles.listSaveBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={saved ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={saved ? colors.primary : colors.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured card
  featuredCard: {
    width: width - 32,
    height: 400,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    marginHorizontal: spacing.md,
    position: 'relative',
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    zIndex: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  categoryPill: {
    backgroundColor: 'rgba(139,92,246,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // ESTILO DO BOTÃO DE CHECK-IN
  checkInButton: {
    position: 'absolute',
    right: spacing.md,
    top: -20, // Posiciona um pouco acima do texto
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    gap: 6,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  checkInText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  featuredTitle: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  featuredSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 10,
  },
  featuredRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vibeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vibeEmoji: { fontSize: 16 },
  vibeScore: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  attendeePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  attendeeText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  // Compact card (styles omitidas por brevidade, permanecem iguais)
  compactCard: { width: 180, height: 240, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.bgCard, position: 'relative' },
  compactImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  compactSave: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  compactBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  compactEmoji: { fontSize: 18, marginBottom: 3 },
  compactTitle: { color: colors.white, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  compactMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compactMetaText: { color: colors.textSecondary, fontSize: 11 },
  compactDot: { color: colors.textMuted, fontSize: 11 },

  // List card (styles omitidas por brevidade, permanecem iguais)
  listCard: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.sm, alignItems: 'center' },
  listImage: { width: 88, height: 88 },
  listContent: { flex: 1, padding: 10 },
  listTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  listCategoryPill: { backgroundColor: 'rgba(139,92,246,0.2)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  listCategoryText: { color: colors.primaryLight, fontSize: 10, fontWeight: '700' },
  listFriendBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(139,92,246,0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: radius.full },
  listFriendText: { color: colors.primary, fontSize: 10, fontWeight: '600' },
  listTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  listVenue: { color: colors.textSecondary, fontSize: 12, marginBottom: 6 },
  listFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  listTimePill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  listTimeText: { color: colors.textSecondary, fontSize: 11 },
  listPrice: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  listSaveBtn: { padding: spacing.sm, paddingRight: spacing.md },
});
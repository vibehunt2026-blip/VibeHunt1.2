import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
  TouchableOpacity, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme/colors';

const { width } = Dimensions.get('window');

// A tab bar tem 4 células de largura igual.
// O tab "Perfil" é o último — fica sempre no quarto direito.
const TAB_H      = Platform.OS === 'ios' ? 88 : 68;
const TAB_CELL_W = width / 4;

export default function ProfileCoachOverlay({ onProfileTabPressed }) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const cardY    = useRef(new Animated.Value(30)).current;
  const glow     = useRef(new Animated.Value(1)).current;
  const arrowY   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in tudo
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(cardY,   { toValue: 0, tension: 55, friction: 12, useNativeDriver: true }),
    ]).start();

    // Glow pulsante na caixa do tab
    const glowLoop = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1.06, duration: 900, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 1,    duration: 900, useNativeDriver: true }),
    ]));
    glowLoop.start();

    // Seta a saltar
    const arrowLoop = Animated.loop(Animated.sequence([
      Animated.timing(arrowY, { toValue: -8, duration: 500, useNativeDriver: true }),
      Animated.timing(arrowY, { toValue:  0, duration: 500, useNativeDriver: true }),
    ]));
    arrowLoop.start();

    return () => { glowLoop.stop(); arrowLoop.stop(); };
  }, []);

  const handleTap = () => {
    Animated.timing(opacity, { toValue: 0, duration: 280, useNativeDriver: true })
      .start(() => onProfileTabPressed());
  };

  return (
    <Animated.View style={[s.overlay, { opacity }]} pointerEvents="box-none">

      {/* ── Backdrop visual (sem bloqueio de toques) ──────────── */}
      <View style={s.backdrop} pointerEvents="none" />

      {/* ── Bloqueador silencioso de todos os toques ──────────── */}
      {/* View simples sem onPress captura e descarta todos os toques */}
      <View style={StyleSheet.absoluteFill} />

      {/* ── Zona tappable do tab Perfil — vem POR CIMA do bloqueador ── */}
      <TouchableOpacity
        style={s.profileZone}
        onPress={handleTap}
        activeOpacity={0.75}
      />

      {/* ── Card de instrução ─────────────────────────────────── */}
      <Animated.View style={[s.card, { transform: [{ translateY: cardY }] }]} pointerEvents="none">
        <LinearGradient
          colors={['#1C1C2E', '#141420']}
          style={s.cardInner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={s.iconCircle}>
            <Text style={{ fontSize: 30 }}>👤</Text>
          </View>
          <Text style={s.cardTitle}>Completa o teu perfil!</Text>
          <Text style={s.cardSub}>
            Adiciona foto, bio e cidade para receberes sugestões mais personalizadas.
          </Text>
          <View style={s.perksRow}>
            {[
              { emoji: '🎯', text: '+50 XP bónus'     },
              { emoji: '🔍', text: 'Melhor descoberta' },
              { emoji: '👥', text: 'Mais conexões'     },
            ].map(p => (
              <View key={p.text} style={s.perk}>
                <Text style={s.perkEmoji}>{p.emoji}</Text>
                <Text style={s.perkText}>{p.text}</Text>
              </View>
            ))}
          </View>
          <View style={s.hintRow}>
            <Ionicons name="arrow-down" size={14} color={colors.primary} />
            <Text style={s.hintText}>
              Toca em{' '}
              <Text style={{ color: colors.primary, fontWeight: '800' }}>Perfil</Text>
              {' '}para continuar
            </Text>
            <Ionicons name="arrow-down" size={14} color={colors.primary} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* ── Seta centrada sobre o tab Perfil ─────────────────── */}
      <Animated.View
        style={[s.arrowContainer, { transform: [{ translateY: arrowY }] }]}
        pointerEvents="none"
      >
        <Ionicons name="chevron-down" size={28} color={colors.primary} />
        <Ionicons name="chevron-down" size={28} color={colors.primary}
          style={{ marginTop: -16, opacity: 0.4 }} />
      </Animated.View>

      {/* ── Caixa de destaque sobre o tab Perfil ─────────────── */}
      <Animated.View
        style={[s.tabBox, { transform: [{ scale: glow }] }]}
        pointerEvents="none"
      >
        <View style={s.tabBoxInner}>
          <Ionicons name="person" size={24} color={colors.primary} />
          <Text style={s.tabBoxLabel}>Perfil</Text>
        </View>
      </Animated.View>

    </Animated.View>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },

  // Zona clicável: cobre o 4.º tab (quarter direito), altura total da tab bar
  profileZone: {
    position: 'absolute',
    right: 0, bottom: 0,
    width: TAB_CELL_W,
    height: TAB_H,
  },

  // Card de instrução — posicionado acima da tab bar
  card: {
    position: 'absolute',
    bottom: TAB_H + 80,
    left: spacing.md,
    right: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.35)',
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 20,
  },
  cardInner: { padding: spacing.lg, alignItems: 'center', gap: spacing.sm },
  iconCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(139,92,246,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  cardSub:   { color: colors.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  perksRow:  { flexDirection: 'row', gap: 10 },
  perk: {
    flex: 1, alignItems: 'center', gap: 4,
    backgroundColor: colors.bgCard2,
    paddingVertical: 9, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  perkEmoji: { fontSize: 18 },
  perkText:  { color: colors.textSecondary, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  hintRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(139,92,246,0.08)',
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)',
  },
  hintText: { color: colors.textSecondary, fontSize: 13, flex: 1, textAlign: 'center' },

  // Seta: container centrado sobre o tab Perfil
  arrowContainer: {
    position: 'absolute',
    right: 0,
    bottom: TAB_H,
    width: TAB_CELL_W,
    alignItems: 'center',
  },

  // Caixa de destaque: cobre exactamente o tab Perfil com borda roxa
  tabBox: {
    position: 'absolute',
    right: 0, bottom: 0,
    width: TAB_CELL_W,
    height: TAB_H,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.10)',
    // Conteúdo centrado na zona dos ícones (excluindo home indicator)
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBoxInner: { alignItems: 'center', gap: 3 },
  tabBoxLabel: { color: colors.primary, fontSize: 11, fontWeight: '700' },
});
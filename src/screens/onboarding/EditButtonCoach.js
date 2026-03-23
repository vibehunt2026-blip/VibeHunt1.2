import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../theme/colors';

const { width } = Dimensions.get('window');

// btnLayout: { x, y, width, height } em coordenadas absolutas do ecrã
// medido via measureInWindow em ProfileScreen
export default function EditButtonCoach({ onEditPressed, btnLayout }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const cardY   = useRef(new Animated.Value(16)).current;
  const glow    = useRef(new Animated.Value(1)).current;
  const arrowY  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(cardY,   { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();

    const glowLoop = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1.06, duration: 700, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 1,    duration: 700, useNativeDriver: true }),
    ]));
    glowLoop.start();

    const arrowLoop = Animated.loop(Animated.sequence([
      Animated.timing(arrowY, { toValue: -7, duration: 500, useNativeDriver: true }),
      Animated.timing(arrowY, { toValue:  0, duration: 500, useNativeDriver: true }),
    ]));
    arrowLoop.start();

    return () => { glowLoop.stop(); arrowLoop.stop(); };
  }, []);

  const handleTap = () => {
    Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true })
      .start(() => onEditPressed());
  };

  // Se btnLayout ainda não chegou, usa valores de fallback conservadores
  const bx = btnLayout?.x      ?? (width - 108);
  const by = btnLayout?.y      ?? 70;
  const bw = btnLayout?.width  ?? 92;
  const bh = btnLayout?.height ?? 34;

  // Margens generosas para a zona tappable
  const ZONE_PAD = 12;

  // Centro horizontal do botão
  const btnCenterX = bx + bw / 2;

  // Posição da seta: imediatamente abaixo do botão
  const arrowTop = by + bh + 8;

  // Card: abaixo da seta, centralizado no ecrã
  const cardTop = arrowTop + 40;

  return (
    <Animated.View style={[s.overlay, { opacity }]} pointerEvents="box-none">

      {/* Backdrop visual */}
      <View style={s.backdrop} pointerEvents="none" />

      {/* Bloqueador de todos os toques */}
      <View style={StyleSheet.absoluteFill} />

      {/* Zona tappable exactamente sobre o botão Editar */}
      <TouchableOpacity
        style={[s.editZone, {
          top:    by - ZONE_PAD,
          left:   bx - ZONE_PAD,
          width:  bw + ZONE_PAD * 2,
          height: bh + ZONE_PAD * 2,
        }]}
        onPress={handleTap}
        activeOpacity={0.75}
      />

      {/* Pill glow — replica a forma real do botão */}
      <Animated.View
        style={[s.pill, {
          top:    by,
          left:   bx,
          width:  bw,
          height: bh,
          transform: [{ scale: glow }],
        }]}
        pointerEvents="none"
      >
        <View style={s.pillBorder} />
        <View style={s.pillContent}>
          <Ionicons name="pencil-outline" size={14} color={colors.primary} />
          <Text style={s.pillText}>Editar</Text>
        </View>
      </Animated.View>

      {/* Seta a apontar para cima — centrada sobre o botão */}
      <Animated.View
        style={[s.arrowWrap, {
          top:  arrowTop,
          left: btnCenterX - 13,
          transform: [{ translateY: arrowY }],
        }]}
        pointerEvents="none"
      >
        <Ionicons name="chevron-up" size={26} color={colors.primary} style={{ opacity: 0.45 }} />
        <Ionicons name="chevron-up" size={26} color={colors.primary} style={{ marginTop: -16 }} />
      </Animated.View>

      {/* Card de instrução */}
      <Animated.View
        style={[s.card, { top: cardTop, transform: [{ translateY: cardY }] }]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={['#1C1C2E', '#141420']}
          style={s.cardInner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={s.cardRow}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={s.cardIcon}>
              <Ionicons name="pencil" size={18} color={colors.white} />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>Toca em "Editar"</Text>
              <Text style={s.cardSub}>
                Completa o teu perfil para ganhar{' '}
                <Text style={{ color: colors.primaryLight, fontWeight: '700' }}>+50 XP</Text>.
              </Text>
            </View>
          </View>
        </LinearGradient>
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
    backgroundColor: 'rgba(0,0,0,0.74)',
  },

  // Posicionados inline
  editZone:  { position: 'absolute' },
  pill:      { position: 'absolute', borderRadius: radius.full, overflow: 'hidden' },
  pillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  pillContent: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 5,
  },
  pillText: { color: colors.primary, fontSize: 13, fontWeight: '700' },

  arrowWrap: { position: 'absolute', alignItems: 'center' },

  card: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.3)',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 16,
  },
  cardInner: { padding: spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardIcon: {
    width: 42, height: 42, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 3 },
  cardSub:   { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
});
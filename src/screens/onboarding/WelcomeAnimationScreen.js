import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

// Definido localmente — sem dependência de UserContext
const INTEREST_MAP = {
  music:   { emoji: '🎵', label: 'Música' },
  art:     { emoji: '🎨', label: 'Arte' },
  food:    { emoji: '🍕', label: 'Gastro' },
  dance:   { emoji: '💃', label: 'Festa' },
  sport:   { emoji: '⚽', label: 'Desporto' },
  nature:  { emoji: '🌿', label: 'Natureza' },
  culture: { emoji: '🏛️', label: 'Cultura' },
  tech:    { emoji: '💻', label: 'Tech' },
  yoga:    { emoji: '🧘', label: 'Bem-estar' },
  comedy:  { emoji: '😂', label: 'Comédia' },
};

const STARTING_BADGES = [
  { emoji: '🏅', label: 'Novato',        delay: 600  },
  { emoji: '⚡', label: '+100 XP',       delay: 900  },
  { emoji: '🎯', label: 'Perfil criado', delay: 1200 },
];

// ─── Badge com pop-in animado ─────────────────────────────────────────────────
function AnimatedBadge({ badge }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }, badge.delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={[s.badge, { opacity, transform: [{ scale }] }]}>
      <Text style={s.badgeEmoji}>{badge.emoji}</Text>
      <Text style={s.badgeLabel}>{badge.label}</Text>
    </Animated.View>
  );
}

// ─── Contador XP animado + barra animada ─────────────────────────────────────
function XPBox({ delay = 500 }) {
  const [count, setCount]  = useState(0);
  const countAnim = useRef(new Animated.Value(0)).current;
  // Barra: de 0% até 10% (100/1000 XP)
  const barWidth  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      // Número sobe de 0 → 100
      Animated.timing(countAnim, {
        toValue: 100, duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
      countAnim.addListener(({ value }) => setCount(Math.floor(value)));

      // Barra cresce de 0% → 10%
      Animated.timing(barWidth, {
        toValue: 10, duration: 1400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => {
      clearTimeout(t);
      countAnim.removeAllListeners();
    };
  }, []);

  return (
    <View style={s.xpBox}>
      <LinearGradient
        colors={['rgba(139,92,246,0.15)', 'rgba(236,72,153,0.1)']}
        style={s.xpBoxGrad}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <Text style={s.xpLabel}>⚡ Bónus de início</Text>
        <Text style={s.xpCount}>{count} XP</Text>
        <View style={s.xpTrack}>
          <Animated.View style={[s.xpFill, {
            width: barWidth.interpolate({
              inputRange: [0, 10],
              outputRange: ['0%', '10%'],
            }),
          }]} />
        </View>
        <Text style={s.xpSub}>Nível 1 em 1000 XP</Text>
      </LinearGradient>
    </View>
  );
}

// ─── WelcomeAnimationScreen ───────────────────────────────────────────────────
export default function WelcomeAnimationScreen({ userData, onContinue }) {
  const bgOp     = useRef(new Animated.Value(0)).current;
  const titleOp  = useRef(new Animated.Value(0)).current;
  const titleY   = useRef(new Animated.Value(40)).current;
  const subOp    = useRef(new Animated.Value(0)).current;
  const xpOp     = useRef(new Animated.Value(0)).current;
  const badgesOp = useRef(new Animated.Value(0)).current;
  const chipsOp  = useRef(new Animated.Value(0)).current;
  const btnOp    = useRef(new Animated.Value(0)).current;
  const pulse1   = useRef(new Animated.Value(1)).current;
  const pulse2   = useRef(new Animated.Value(1)).current;
  // Para a saída suave
  const screenOp = useRef(new Animated.Value(1)).current;

  // Nome real do utilizador — primeiro nome
  const firstName = (userData?.name || 'Caçador').trim().split(' ')[0];
  const interests  = (userData?.interests || []).slice(0, 5);

  useEffect(() => {
    // Entrada
    Animated.timing(bgOp, { toValue: 1, duration: 500, useNativeDriver: true }).start();

    setTimeout(() => Animated.parallel([
      Animated.timing(titleOp, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(titleY,  { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start(), 200);

    setTimeout(() => Animated.timing(subOp,    { toValue: 1, duration: 500, useNativeDriver: true }).start(), 700);
    setTimeout(() => Animated.timing(xpOp,     { toValue: 1, duration: 400, useNativeDriver: true }).start(), 350);
    setTimeout(() => Animated.timing(badgesOp, { toValue: 1, duration: 400, useNativeDriver: true }).start(), 450);
    setTimeout(() => Animated.timing(chipsOp,  { toValue: 1, duration: 400, useNativeDriver: true }).start(), 750);
    setTimeout(() => Animated.timing(btnOp,    { toValue: 1, duration: 500, useNativeDriver: true }).start(), 1700);

    // Pulse rings
    const l1 = Animated.loop(Animated.sequence([
      Animated.timing(pulse1, { toValue: 1.6, duration: 1200, useNativeDriver: true }),
      Animated.timing(pulse1, { toValue: 1,   duration: 1200, useNativeDriver: true }),
    ]));
    const l2 = Animated.loop(Animated.sequence([
      Animated.timing(pulse2, { toValue: 1.4, duration: 1600, useNativeDriver: true }),
      Animated.timing(pulse2, { toValue: 1,   duration: 1600, useNativeDriver: true }),
    ]));
    setTimeout(() => { l1.start(); l2.start(); }, 400);
    return () => { l1.stop(); l2.stop(); };
  }, []);

  // Saída lenta e suave ao carregar o botão
  const handleContinue = () => {
    Animated.timing(screenOp, {
      toValue: 0,
      duration: 700,            // mais lento — 700ms
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => onContinue());
  };

  return (
    <Animated.View style={[s.container, { opacity: Animated.multiply(bgOp, screenOp) }]}>
      <LinearGradient colors={['#0A0A0F', '#1a0a2e', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <View style={s.blob1} />
      <View style={s.blob2} />

      {/* Logo com rings pulsantes */}
      <View style={s.logoArea}>
        <Animated.View style={[s.ring, s.ring1, {
          transform: [{ scale: pulse1 }],
          opacity: pulse1.interpolate({ inputRange: [1, 1.6], outputRange: [0.35, 0] }),
        }]} />
        <Animated.View style={[s.ring, s.ring2, {
          transform: [{ scale: pulse2 }],
          opacity: pulse2.interpolate({ inputRange: [1, 1.4], outputRange: [0.2, 0] }),
        }]} />
        <LinearGradient colors={[colors.primary, colors.secondary]} style={s.logoCircle}>
          <Text style={s.logoEmoji}>🎯</Text>
        </LinearGradient>
      </View>

      {/* Nome do utilizador — dinâmico */}
      <Animated.View style={[s.textBlock, { opacity: titleOp, transform: [{ translateY: titleY }] }]}>
        <Text style={s.welcome}>Bem-vindo ao VibeHunt,</Text>
        <Text style={s.name}>{firstName}! 👋</Text>
      </Animated.View>

      <Animated.Text style={[s.subtitle, { opacity: subOp }]}>
        A tua aventura começa agora. Descobre eventos, conecta-te com pessoas e vive experiências únicas.
      </Animated.Text>

      {/* XP box com barra animada */}
      <Animated.View style={[{ width: '100%', opacity: xpOp }]}>
        <XPBox delay={450} />
      </Animated.View>

      {/* Badges com pop-in escalonado */}
      <Animated.View style={[s.badgesRow, { opacity: badgesOp }]}>
        {STARTING_BADGES.map(b => <AnimatedBadge key={b.label} badge={b} />)}
      </Animated.View>

      {/* Chips de interesses */}
      {interests.length > 0 && (
        <Animated.View style={[s.chipsRow, { opacity: chipsOp }]}>
          {interests.map(id => {
            const info = INTEREST_MAP[id];
            if (!info) return null;
            return (
              <View key={id} style={s.chip}>
                <Text style={s.chipEmoji}>{info.emoji}</Text>
                <Text style={s.chipLabel}>{info.label}</Text>
              </View>
            );
          })}
          {userData?.interests?.length > 5 && (
            <View style={s.chip}>
              <Text style={s.chipLabel}>+{userData.interests.length - 5}</Text>
            </View>
          )}
        </Animated.View>
      )}

      {/* Botão com saída suave */}
      <Animated.View style={[s.btnWrap, { opacity: btnOp }]}>
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.85}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={s.btn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={s.btnText}>Explorar o VibeHunt</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md,
  },
  blob1: { position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(139,92,246,0.14)', top: -40, right: -100 },
  blob2: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(236,72,153,0.10)', bottom: 80, left: -80 },

  logoArea: { alignItems: 'center', justifyContent: 'center', width: 130, height: 130 },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 2 },
  ring1: { width: 110, height: 110, borderColor: colors.primary },
  ring2: { width: 130, height: 130, borderColor: colors.secondary },
  logoCircle: {
    width: 88, height: 88, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.6, shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 }, elevation: 15,
  },
  logoEmoji: { fontSize: 42 },

  textBlock: { alignItems: 'center' },
  welcome: { color: colors.textSecondary, fontSize: 17, fontWeight: '500' },
  name: { color: colors.textPrimary, fontSize: 34, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 21 },

  xpBox: { width: '100%', borderRadius: radius.xl, overflow: 'hidden' },
  xpBoxGrad: {
    padding: spacing.md, alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)', borderRadius: radius.xl,
  },
  xpLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  xpCount: { color: colors.primaryLight, fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  xpTrack: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  xpSub: { color: colors.textMuted, fontSize: 11 },

  badgesRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  badge: {
    alignItems: 'center', gap: 4,
    backgroundColor: colors.bgCard,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
  },
  badgeEmoji: { fontSize: 24 },
  badgeLabel: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(139,92,246,0.12)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)',
  },
  chipEmoji: { fontSize: 13 },
  chipLabel: { color: colors.primaryLight, fontSize: 12, fontWeight: '600' },

  btnWrap: { width: '100%' },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 17, borderRadius: radius.lg, gap: 8,
  },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
});
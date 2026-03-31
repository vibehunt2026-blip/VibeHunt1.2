import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'welcome',
    type: 'welcome',
  },
  {
    id: 'name',
    type: 'text_input',
    title: 'Como te chamas?',
    subtitle: 'O teu nome aparece no teu perfil e no radar de caçadores.',
    placeholder: 'O teu nome...',
    emoji: '👤',
  },
  {
    id: 'interests',
    type: 'multi_select',
    title: 'O que te faz vibrar?',
    subtitle: 'Escolhe os teus interesses — podes selecionar vários.',
    emoji: '🎯',
    options: [
      { id: 'music',  emoji: '🎵', label: 'Música' },
      { id: 'art',    emoji: '🎨', label: 'Arte' },
      { id: 'food',   emoji: '🍕', label: 'Gastronomia' },
      { id: 'dance',  emoji: '💃', label: 'Festa & Dance' },
      { id: 'sport',  emoji: '⚽', label: 'Desporto' },
      { id: 'nature', emoji: '🌿', label: 'Natureza' },
      { id: 'culture',emoji: '🏛️', label: 'Cultura' },
      { id: 'tech',   emoji: '💻', label: 'Tecnologia' },
      { id: 'yoga',   emoji: '🧘', label: 'Bem-estar' },
      { id: 'comedy', emoji: '😂', label: 'Comédia' },
    ],
  },
  {
    id: 'schedule',
    type: 'single_select',
    title: 'Quando preferes sair?',
    subtitle: 'Usamos isto para sugerir eventos no teu horário ideal.',
    emoji: '⏰',
    options: [
      { id: 'morning',   emoji: '☀️', label: 'Manhã',       sub: '08:00 – 13:00' },
      { id: 'afternoon', emoji: '🌤️', label: 'Tarde',       sub: '13:00 – 19:00' },
      { id: 'evening',   emoji: '🌆', label: 'Fim do dia',  sub: '19:00 – 22:00' },
      { id: 'night',     emoji: '🌙', label: 'Noite',       sub: '22:00 em diante' },
    ],
  },
  {
    id: 'exploration',
    type: 'single_select',
    title: 'Que tipo de caçador és?',
    subtitle: 'Diz-nos o quão fora da caixa queres ir.',
    emoji: '🗺️',
    options: [
      { id: 'comfort',  emoji: '🏠', label: 'Zona de conforto',   sub: 'Eventos familiares e seguros' },
      { id: 'curious',  emoji: '🔍', label: 'Curioso',            sub: 'Às vezes gosto de experimentar' },
      { id: 'explorer', emoji: '🧭', label: 'Explorador',         sub: 'Adoro descobrir coisas novas' },
      { id: 'wild',     emoji: '🚀', label: 'Sem limites',        sub: 'Quanto mais diferente, melhor' },
    ],
  },
  {
    id: 'ready',
    type: 'ready',
  },
];

// ─── Welcome step ─────────────────────────────────────────────────────────────

function WelcomeStep({ onNext }) {
  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity  = useRef(new Animated.Value(0)).current;
  const pulse       = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance
    Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
    Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    // Text fade in
    setTimeout(() => {
      Animated.timing(textOpacity, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }, 400);

    // Button fade in
    setTimeout(() => {
      Animated.timing(btnOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, 900);

    // Pulse loop
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1400, useNativeDriver: true }),
      ])
    );
    setTimeout(() => loop.start(), 1200);
    return () => loop.stop();
  }, []);

  return (
    <View style={welcome.container}>
      {/* Background glow blobs */}
      <View style={welcome.blob1} />
      <View style={welcome.blob2} />

      {/* Logo */}
      <Animated.View style={[welcome.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={welcome.logoGradient}>
            
          <Image
            source={require('../../../assets/icon.png')}
             style={{ width: 160, height: 160 }}
            resizeMode="contain"
          />
          </LinearGradient>
        </Animated.View>
        <View style={welcome.logoGlow} />
      </Animated.View>

      {/* Text */}
      <Animated.View style={[welcome.textBlock, { opacity: textOpacity }]}>
        <Text style={welcome.title}>VibeHunt</Text>
        <Text style={welcome.tagline}>Não é uma forma de comunicar,</Text>
        <Text style={welcome.tagline2}>é uma forma de <Text style={welcome.taglineAccent}>viver.</Text></Text>
        <Text style={welcome.sub}>
          Descobre eventos, conecta-te com pessoas e explora a tua cidade de uma forma completamente nova.
        </Text>
      </Animated.View>

      {/* Button */}
      <Animated.View style={[welcome.btnWrap, { opacity: btnOpacity }]}>
        <TouchableOpacity onPress={onNext} activeOpacity={0.85}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={welcome.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={welcome.btnText}>Começar a caçar</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={welcome.terms}>
          Ao continuar, aceitas os{' '}
          <Text style={{ color: colors.primary }}>Termos de Serviço</Text>
          {' '}e{' '}
          <Text style={{ color: colors.primary }}>Política de Privacidade</Text>.
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Ready / finish step ─────────────────────────────────────────────────────

function ReadyStep({ userData, onFinish }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.spring(badgeAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
    }, 500);
  }, []);

  return (
    <View style={ready.container}>
      <View style={welcome.blob1} />
      <View style={welcome.blob2} />

      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={ready.circle}>
          <Text style={ready.checkEmoji}>✓</Text>
        </LinearGradient>
        <Text style={ready.title}>Estás pronto, {userData.name || 'Caçador'}!</Text>
        <Text style={ready.sub}>O teu perfil foi criado. Começa a descobrir os melhores eventos à tua volta.</Text>
      </Animated.View>

      <Animated.View style={[ready.badgesRow, { opacity: badgeAnim, transform: [{ scale: badgeAnim }] }]}>
        {[
          { emoji: '🏅', label: 'Novato' },
          { emoji: '⚡', label: '+100 XP' },
          { emoji: '🎯', label: '1ª missão' },
        ].map(b => (
          <View key={b.label} style={ready.badge}>
            <Text style={ready.badgeEmoji}>{b.emoji}</Text>
            <Text style={ready.badgeLabel}>{b.label}</Text>
          </View>
        ))}
      </Animated.View>

      <TouchableOpacity onPress={onFinish} activeOpacity={0.85} style={{ width: '100%' }}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={welcome.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={welcome.btnText}>Entrar no VibeHunt</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Option button (used by single + multi select steps) ─────────────────────

function OptionBtn({ option, selected, onPress, multi = false }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.93, tension: 200, friction: 10, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1,    tension: 200, friction: 10, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[opt.btn, selected && opt.btnSelected]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {multi && (
          <View style={[opt.checkbox, selected && opt.checkboxSelected]}>
            {selected && <Ionicons name="checkmark" size={13} color={colors.white} />}
          </View>
        )}
        <Text style={opt.emoji}>{option.emoji}</Text>
        <View style={opt.labelWrap}>
          <Text style={[opt.label, selected && opt.labelSelected]}>{option.label}</Text>
          {option.sub && <Text style={opt.sub}>{option.sub}</Text>}
        </View>
        {selected && !multi && (
          <View style={opt.selectedDot} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main OnboardingScreen ────────────────────────────────────────────────────

export default function OnboardingScreen({ onComplete }) {
  const [stepIndex, setStepIndex]   = useState(0);
  const [userData, setUserData]     = useState({ name: '', interests: [], schedule: '', exploration: '' });
  const [nameInput, setNameInput]   = useState('');

  const slideAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const step = STEPS[stepIndex];
  const totalSteps = STEPS.length;
  const progressPercent = stepIndex / (totalSteps - 1);

  // Animate progress bar on step change
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercent,
      tension: 60, friction: 12,
      useNativeDriver: false,
    }).start();
  }, [stepIndex]);

  const animateToNext = (forward = true) => {
    const outX = forward ? -width : width;
    const inX  = forward ?  width : -width;

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: outX, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      slideAnim.setValue(inX);
      setStepIndex(prev => forward ? prev + 1 : prev - 1);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (step.id === 'name') {
      setUserData(p => ({ ...p, name: nameInput.trim() }));
    }
    if (stepIndex < totalSteps - 1) animateToNext(true);
  };

  const handleBack = () => {
    if (stepIndex > 0) animateToNext(false);
  };

  const toggleInterest = (id) => {
    setUserData(p => ({
      ...p,
      interests: p.interests.includes(id)
        ? p.interests.filter(i => i !== id)
        : [...p.interests, id],
    }));
  };

  const canAdvance = () => {
    if (step.id === 'name')        return nameInput.trim().length >= 2;
    if (step.id === 'interests')   return userData.interests.length >= 1;
    if (step.id === 'schedule')    return userData.schedule !== '';
    if (step.id === 'exploration') return userData.exploration !== '';
    return true;
  };

  // Special full-screen steps
  if (step.type === 'welcome') {
    return <WelcomeStep onNext={() => animateToNext(true)} />;
  }
  if (step.type === 'ready') {
    return <ReadyStep userData={userData} onFinish={() => onComplete(userData)} />;
  }

  return (
    <View style={styles.container}>
      {/* Background blobs */}
      <View style={welcome.blob1} />
      <View style={welcome.blob2} />

      <SafeAreaView edges={['top']} style={styles.safe}>
        {/* Header: back + progress */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, {
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]} />
            </View>
            <Text style={styles.progressLabel}>{stepIndex} / {totalSteps - 2}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
            {/* Step header */}
            <View style={styles.stepHeader}>
              <View style={styles.stepEmojiWrap}>
                <Text style={styles.stepEmoji}>{step.emoji}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepSub}>{step.subtitle}</Text>
            </View>

            {/* Text input step */}
            {step.type === 'text_input' && (
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.textInput}
                  placeholder={step.placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={nameInput}
                  onChangeText={setNameInput}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={canAdvance() ? handleNext : undefined}
                  maxLength={30}
                />
                {nameInput.length > 0 && (
                  <Text style={styles.inputCount}>{nameInput.length}/30</Text>
                )}
              </View>
            )}

            {/* Multi select (interests) */}
            {step.type === 'multi_select' && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.optionsGrid}
              >
                {step.options.map(opt => (
                  <View key={opt.id} style={{ width: '48%' }}>
                    <OptionBtn
                      option={opt}
                      selected={userData.interests.includes(opt.id)}
                      onPress={() => toggleInterest(opt.id)}
                      multi
                    />
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Single select */}
            {step.type === 'single_select' && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsList}>
                {step.options.map(o => (
                  <OptionBtn
                    key={o.id}
                    option={o}
                    selected={
                      step.id === 'schedule'
                        ? userData.schedule === o.id
                        : userData.exploration === o.id
                    }
                    onPress={() =>
                      setUserData(p => step.id === 'schedule'
                        ? { ...p, schedule: o.id }
                        : { ...p, exploration: o.id }
                      )
                    }
                  />
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </KeyboardAvoidingView>

        {/* Next button */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleNext}
            disabled={!canAdvance()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canAdvance() ? [colors.primary, colors.secondary] : [colors.bgCard2, colors.bgCard2]}
              style={styles.nextBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.nextBtnText, !canAdvance() && { color: colors.textMuted }]}>
                Continuar
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={canAdvance() ? colors.white : colors.textMuted}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  progressWrap: { flex: 1, gap: 6 },
  progressTrack: {
    height: 5, backgroundColor: colors.bgCard2, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressLabel: {
    color: colors.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'right',
  },

  content: { flex: 1, paddingHorizontal: spacing.md },

  stepHeader: { alignItems: 'center', marginBottom: spacing.xl, paddingTop: spacing.md },
  stepEmojiWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(139,92,246,0.3)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stepEmoji: { fontSize: 32 },
  stepTitle: {
    color: colors.textPrimary, fontSize: 26, fontWeight: '800',
    textAlign: 'center', letterSpacing: -0.5, marginBottom: 8,
  },
  stepSub: {
    color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20,
  },

  inputWrap: { position: 'relative' },
  textInput: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 18,
    color: colors.textPrimary, fontSize: 20, fontWeight: '600',
  },
  inputCount: {
    position: 'absolute', bottom: -22, right: 4,
    color: colors.textMuted, fontSize: 11,
  },

  optionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: spacing.xl,
  },
  optionsList: { gap: 10, paddingBottom: spacing.xl },

  footer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: radius.lg, gap: 8,
  },
  nextBtnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
});

const welcome = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: height * 0.12,
    paddingBottom: spacing.xl,
  },
  blob1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(139,92,246,0.12)', top: -60, right: -80,
  },
  blob2: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(236,72,153,0.08)', bottom: 100, left: -80,
  },
  logoWrap: { alignItems: 'center', position: 'relative' },
  logoGradient: {
    width: 110, height: 110, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.6, shadowRadius: 30, shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  logoEmoji: { fontSize: 52 },
  logoGlow: {
    position: 'absolute',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(139,92,246,0.15)',
    top: -15, left: -15,
  },
  textBlock: { alignItems: 'center', gap: 6 },
  title: {
    color: colors.textPrimary, fontSize: 42, fontWeight: '900',
    letterSpacing: -1, marginBottom: 4,
  },
  tagline: { color: colors.textSecondary, fontSize: 16, textAlign: 'center' },
  tagline2: { color: colors.textSecondary, fontSize: 16, textAlign: 'center' },
  taglineAccent: { color: colors.primaryLight, fontWeight: '800' },
  sub: {
    color: colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 21,
    marginTop: 8, paddingHorizontal: spacing.sm,
  },
  btnWrap: { width: '100%', gap: 14 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 17, borderRadius: radius.lg, gap: 8,
  },
  btnText: { color: colors.white, fontSize: 17, fontWeight: '700' },
  terms: { color: colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

const ready = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  circle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 25, shadowOffset: { width: 0, height: 8 },
    elevation: 15,
  },
  checkEmoji: { color: colors.white, fontSize: 48, fontWeight: '800' },
  title: {
    color: colors.textPrimary, fontSize: 28, fontWeight: '800',
    textAlign: 'center', letterSpacing: -0.5, marginBottom: 10,
  },
  sub: {
    color: colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22,
  },
  badgesRow: {
    flexDirection: 'row', gap: 16,
    backgroundColor: colors.bgCard,
    padding: spacing.md, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
  },
  badge: { alignItems: 'center', gap: 5 },
  badgeEmoji: { fontSize: 32 },
  badgeLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
});

const opt = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg, padding: 14,
    borderWidth: 1.5, borderColor: colors.border,
    gap: 10, marginBottom: 0,
  },
  btnSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(139,92,246,0.1)',
  },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  emoji: { fontSize: 22 },
  labelWrap: { flex: 1 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  labelSelected: { color: colors.textPrimary },
  sub: { color: colors.textMuted, fontSize: 11, marginTop: 1 },
  selectedDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
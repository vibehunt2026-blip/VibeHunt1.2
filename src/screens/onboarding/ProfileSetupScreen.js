import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../theme/colors';

const CURRENT_YEAR = new Date().getFullYear();

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function SectionHeader({ emoji, title, subtitle }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionEmoji}>{emoji}</Text>
      <View>
        <Text style={s.sectionTitle}>{title}</Text>
        {subtitle && <Text style={s.sectionSub}>{subtitle}</Text>}
      </View>
    </View>
  );
}

function InputField({ label, icon, placeholder, value, onChangeText, keyboardType, maxLength, multiline }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.field}>
      <View style={s.fieldLabelRow}>
        <Text style={s.fieldLabel}>{label}</Text>
        <Text style={s.optionalTag}>opcional</Text>
      </View>
      <View style={[s.inputWrap, focused && s.inputFocused, multiline && { alignItems: 'flex-start' }]}>
        <Ionicons name={icon} size={18} color={focused ? colors.primary : colors.textMuted} style={[s.inputIcon, multiline && { marginTop: 2 }]} />
        <TextInput
          style={[s.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType={keyboardType || 'default'}
          maxLength={maxLength}
          returnKeyType={multiline ? 'default' : 'done'}
          autoCapitalize="none"
          multiline={multiline}
        />
        {value.length > 0 && !multiline && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        {maxLength && multiline && (
          <Text style={s.charCount}>{value.length}/{maxLength}</Text>
        )}
      </View>
    </View>
  );
}

// ─── ProfileSetupScreen ───────────────────────────────────────────────────────
// Props:
//   userData   — dados actuais (pré-preenche campos se já existirem)
//   onComplete — chamado com os dados actualizados (ou null se saltar)
export default function ProfileSetupScreen({ userData, onComplete }) {
  // Pré-preenche com dados existentes (reedição)
  const [bio,       setBio]       = useState(userData?.bio       || '');
  const [city,      setCity]      = useState(userData?.city      || '');
  const [birthYear, setBirthYear] = useState(userData?.birthYear || '');
  const [instagram, setInstagram] = useState(userData?.instagram || '');
  const [website,   setWebsite]   = useState(userData?.website   || '');

  const hasAnyData = !!(bio || city || birthYear || instagram || website);

  const handleFinish = () => {
    // Combina dados anteriores com os novos
    const updatedData = {
      ...userData,
      bio,
      city,
      birthYear,
      instagram,
      website,
    };
    onComplete(updatedData);
  };

  const handleSkip = () => {
    // Guarda o que estiver preenchido (pode estar a saltar sem preencher nada)
    onComplete(userData);
  };

  return (
    // Cobre o ecrã inteiro — inclusive a tab bar
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bg }}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.headerTitle}>O teu perfil</Text>
            <Text style={s.headerSub}>Todos os campos são opcionais</Text>
          </View>
          <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
            <Text style={s.skipText}>Saltar</Text>
          </TouchableOpacity>
        </View>

        {/* Indicador de progresso */}
        <View style={s.progressRow}>
          {[
            { label: 'Início',     done: true  },
            { label: 'Interesses', done: true  },
            { label: 'Perfil',     active: true},
            { label: 'Pronto',     done: false },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <View style={s.progressStep}>
                <View style={[s.stepDot, step.done && s.stepDotDone, step.active && s.stepDotActive]}>
                  {step.done
                    ? <Ionicons name="checkmark" size={12} color={colors.white} />
                    : <Text style={s.stepDotNum}>{i + 1}</Text>
                  }
                </View>
                <Text style={[s.stepLabel, step.active && { color: colors.primary }]}>{step.label}</Text>
              </View>
              {i < arr.length - 1 && (
                <View style={[s.progressLine, !step.done && !step.active && { backgroundColor: colors.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          style={s.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Sobre ti */}
          <SectionHeader
            emoji="✍️"
            title="Sobre ti"
            subtitle="Conta-nos um pouco sobre ti — aparece no teu perfil público."
          />
          <InputField
            label="Bio"
            icon="chatbubble-outline"
            placeholder="Ex: Adoro descobrir novos sítios, música ao vivo e encontros espontâneos..."
            value={bio}
            onChangeText={setBio}
            maxLength={120}
            multiline
          />

          {/* Localização */}
          <SectionHeader
            emoji="📍"
            title="Localização"
            subtitle="Usamos isto para sugerir eventos na tua área."
          />
          <InputField
            label="Cidade"
            icon="location-outline"
            placeholder="Ex: Porto, Lisboa..."
            value={city}
            onChangeText={setCity}
            maxLength={40}
          />

          {/* Info pessoal */}
          <SectionHeader
            emoji="🎂"
            title="Informação pessoal"
            subtitle="Ajuda-nos a personalizar ainda melhor a tua experiência."
          />
          <InputField
            label="Ano de nascimento"
            icon="calendar-outline"
            placeholder={`Ex: ${CURRENT_YEAR - 22}`}
            value={birthYear}
            onChangeText={t => { if (/^\d{0,4}$/.test(t)) setBirthYear(t); }}
            keyboardType="number-pad"
            maxLength={4}
          />

          {/* Redes sociais */}
          <SectionHeader
            emoji="🌐"
            title="Redes sociais"
            subtitle="Liga as tuas redes para os amigos te encontrarem mais facilmente."
          />
          <InputField
            label="Instagram"
            icon="logo-instagram"
            placeholder="@o_teu_username"
            value={instagram}
            onChangeText={setInstagram}
            maxLength={40}
          />
          <InputField
            label="Website / Portfolio"
            icon="link-outline"
            placeholder="https://..."
            value={website}
            onChangeText={setWebsite}
            maxLength={80}
          />

          {/* XP hint */}
          {hasAnyData && (
            <View style={s.xpHint}>
              <LinearGradient
                colors={['rgba(139,92,246,0.12)', 'rgba(236,72,153,0.08)']}
                style={s.xpHintInner}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Text style={s.xpHintEmoji}>⚡</Text>
                <Text style={s.xpHintText}>
                  Vais ganhar{' '}
                  <Text style={{ color: colors.primaryLight, fontWeight: '800' }}>+50 XP</Text>
                  {' '}por completares o perfil!
                </Text>
              </LinearGradient>
            </View>
          )}

          <View style={{ height: 130 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Botão de submissão — sempre visível, cobre tab bar */}
      <View style={s.footer}>
        <TouchableOpacity onPress={handleFinish} activeOpacity={0.88}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={s.footerBtn}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Text style={s.footerBtnText}>
              {hasAnyData ? 'Guardar e continuar' : 'Continuar sem preencher'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // absoluteFillObject garante que cobre TUDO, incluindo a tab bar
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    zIndex: 500,
  },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  headerLeft: { flex: 1 },
  headerTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
  headerSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  skipBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: colors.bgCard,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  skipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },

  // Progress
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  progressStep: { alignItems: 'center', gap: 4 },
  progressLine: { flex: 1, height: 2, backgroundColor: colors.primary, marginBottom: 14 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.bgCard2,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotDone:   { backgroundColor: colors.primary,  borderColor: colors.primary },
  stepDotActive: { borderColor: colors.primary, backgroundColor: 'rgba(139,92,246,0.2)' },
  stepDotNum: { color: colors.textSecondary, fontSize: 10, fontWeight: '700' },
  stepLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600', marginTop: 2 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  sectionEmoji: { fontSize: 22 },
  sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  sectionSub: { color: colors.textSecondary, fontSize: 12, marginTop: 1, lineHeight: 17 },

  field: { marginBottom: spacing.sm },
  fieldLabelRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  optionalTag: {
    color: colors.textMuted, fontSize: 11,
    backgroundColor: colors.bgCard2,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.sm, paddingVertical: 12, gap: 8,
  },
  inputFocused: { borderColor: colors.primary, backgroundColor: 'rgba(139,92,246,0.05)' },
  inputIcon: { width: 22 },
  input: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  charCount: { color: colors.textMuted, fontSize: 11, alignSelf: 'flex-end', marginBottom: 2 },

  xpHint: { marginTop: spacing.md, borderRadius: radius.lg, overflow: 'hidden' },
  xpHintInner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: spacing.md,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)', borderRadius: radius.lg,
  },
  xpHintEmoji: { fontSize: 22 },
  xpHintText: { color: colors.textSecondary, fontSize: 14, flex: 1 },

  // Footer fixo — cobre tab bar graças ao absoluteFillObject do container
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xl,
    paddingTop: spacing.sm,
    backgroundColor: colors.bg,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  footerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, borderRadius: radius.lg, gap: 8,
  },
  footerBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
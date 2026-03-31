// ─────────────────────────────────────────────────────────────────────────────
// ProfileScreen.js
//
// Ecrã de perfil do utilizador.
// Mostra os dados introduzidos no onboarding e no ProfileSetupScreen,
// o progresso de nível (XP), badges, conquistas e definições.
//
// Props:
//   userData       — todos os dados do utilizador (nome, avatar, cidade, etc.)
//   onOpenSetup    — callback que abre o ProfileSetupScreen para editar
//   onThemePress   — callback que abre o selector de tema (claro/escuro)
//   onEditBtnLayout — callback chamado com a posição absoluta do botão Editar,
//                    usado pelo EditButtonCoach para saber onde apontar
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  // width removido — não era usado em nenhum lado (bug 5 corrigido)
} from 'react-native';
import { SafeAreaView }   from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons }       from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

// ─── Mapas de labels para os valores guardados no onboarding ─────────────────
// Estes mapas traduzem os IDs internos (ex: 'music') para texto legível.

const INTEREST_MAP = {
  music:   { emoji: '🎵', label: 'Música'     },
  art:     { emoji: '🎨', label: 'Arte'       },
  food:    { emoji: '🍕', label: 'Gastro'     },
  dance:   { emoji: '💃', label: 'Festa'      },
  sport:   { emoji: '⚽', label: 'Desporto'   },
  nature:  { emoji: '🌿', label: 'Natureza'   },
  culture: { emoji: '🏛️', label: 'Cultura'   },
  tech:    { emoji: '💻', label: 'Tecnologia' },
  yoga:    { emoji: '🧘', label: 'Bem-estar'  },
  comedy:  { emoji: '😂', label: 'Comédia'    },
};

const SCHEDULE_MAP = {
  morning:   '☀️ Manhã',
  afternoon: '🌤️ Tarde',
  evening:   '🌆 Fim do dia',
  night:     '🌙 Noite',
};

const EXPLORATION_MAP = {
  comfort:  '🏠 Zona de conforto',
  curious:  '🔍 Curioso',
  explorer: '🧭 Explorador',
  wild:     '🚀 Sem limites',
};

// ─── Conta de nível inicial ───────────────────────────────────────────────────
// Futuramente virá do Supabase — por agora é estático (conta nível zero)
const XP      = 100;
const XP_NEXT = 1000;
const XP_PCT  = (XP / XP_NEXT) * 100; // percentagem para a barra (10%)

// ─── Tab bar height — espaço no fundo do ScrollView ─────────────────────────
const TAB_BAR_H = 88;

// ─────────────────────────────────────────────────────────────────────────────
// StatCard — cartão numérico de estatística (eventos, amigos, badges, streak)
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ emoji, value, label }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statEmoji}>{emoji}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow — linha de informação pessoal (nome, cidade, etc.)
// Retorna null se value estiver vazio — não mostra linhas vazias
// ─────────────────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View style={s.infoRow}>
      <View style={s.infoIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LockedBadge — badge ainda não desbloqueado (ícone desbotado + cadeado)
// ─────────────────────────────────────────────────────────────────────────────
function LockedBadge({ emoji, name }) {
  return (
    <View style={s.lockedBadge}>
      <View style={s.lockedBadgeIcon}>
        {/* Emoji com opacidade reduzida para indicar que está bloqueado */}
        <Text style={{ fontSize: 24, opacity: 0.25 }}>{emoji}</Text>
        <View style={s.lockOverlay}>
          <Ionicons name="lock-closed" size={10} color={colors.textMuted} />
        </View>
      </View>
      <Text style={s.lockedBadgeName} numberOfLines={2}>{name}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SettingsRow — linha de definições com ícone, label, valor e chevron
// onPress é opcional — só a linha "Tema" tem um handler por enquanto
// ─────────────────────────────────────────────────────────────────────────────
function SettingsRow({ icon, label, value, danger, onPress }) {
  return (
    <TouchableOpacity style={s.settingsRow} activeOpacity={0.8} onPress={onPress}>
      <View style={[s.settingsIcon, danger && s.settingsIconDanger]}>
        <Ionicons name={icon} size={16} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={[s.settingsLabel, danger && { color: colors.error }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {value && <Text style={s.settingsValue}>{value}</Text>}
        {/* Sem chevron nas linhas de perigo (ex: "Terminar sessão") */}
        {!danger && <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />}
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileScreen — componente principal exportado
// ─────────────────────────────────────────────────────────────────────────────
export default function ProfileScreen({ userData, onOpenSetup, onThemePress, onEditBtnLayout, onSignOut }) {
  // themeColors reage ao tema activo (claro/escuro) — vem do ThemeContext
  const { themeColors } = useTheme();

  // Ref para o botão Editar — medido com measureInWindow para o EditButtonCoach
  const editBtnRef = useRef(null);

  // Mede a posição absoluta do botão Editar no ecrã assim que o componente
  // monta. O delay de 120ms garante que o layout já está calculado pelo RN.
  // O resultado é enviado para o App.js via onEditBtnLayout e passado ao
  // EditButtonCoach para que o ring pulsante fique exactamente sobre o botão.
  useEffect(() => {
    const timer = setTimeout(() => {
      editBtnRef.current?.measureInWindow((x, y, w, h) => {
        if (w > 0) onEditBtnLayout?.({ x, y, width: w, height: h });
      });
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // ── Leitura dos dados do utilizador com fallbacks seguros ─────────────────
  // Se userData for null (utilizador novo), usa valores por omissão
  const name        = userData?.name        || 'Caçador';
  const avatar      = userData?.avatar      || '🎯';
  const bio         = userData?.bio         || '';
  const city        = userData?.city        || '';
  const birthYear   = userData?.birthYear   || '';
  const instagram   = userData?.instagram   || '';
  const website     = userData?.website     || '';
  const interests   = userData?.interests   || [];
  const schedule    = userData?.schedule    || '';
  const exploration = userData?.exploration || '';

  return (
    <View style={[s.container, { backgroundColor: themeColors.bg }]}>

      {/* ── Header fixo com título e botão Editar ──────────────────── */}
      {/* SafeAreaView usa themeColors para reagir ao tema (bug 1 corrigido) */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: themeColors.bg }}>
        <View style={s.header}>
          <Text style={[s.headerTitle, { color: themeColors.textPrimary }]}>
            O meu Perfil
          </Text>
          {/* Botão Editar — ref medido para o EditButtonCoach */}
          <TouchableOpacity
            ref={editBtnRef}
            style={s.editBtn}
            onPress={() => onOpenSetup?.()}
          >
            <Ionicons name="pencil-outline" size={18} color={colors.primary} />
            <Text style={s.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── ScrollView principal ─────────────────────────────────────── */}
      {/* flex:1 é obrigatório para o scroll funcionar (bug 3 corrigido) */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >

        {/* ── Hero: avatar, nome, cidade, XP ───────────────────────── */}
        {/* Gradiente usa themeColors para reagir ao tema (bug 2 corrigido) */}
        <LinearGradient
          colors={[themeColors.bgCard2, themeColors.bg]}
          style={s.hero}
        >
          {/* Ribbon de nível */}
          <View style={s.levelRibbon}>
            <Text style={s.levelRibbonText}>⭐ NÍVEL 0 · NOVATO</Text>
          </View>

          {/* Avatar emoji com anel gradiente e badge de nível */}
          <View style={s.avatarWrap}>
            <LinearGradient colors={[colors.primary, colors.secondary]} style={s.avatarRing}>
              <View style={s.avatarInner}>
                <Text style={s.avatarEmoji}>{avatar}</Text>
              </View>
            </LinearGradient>
            <View style={s.lvlBadge}>
              <Text style={s.lvlBadgeText}>0</Text>
            </View>
          </View>

          {/* Nome dinâmico — vem do onboarding */}
          <Text style={s.heroName}>{name}</Text>

          {/* Cidade — só aparece se preenchida */}
          {city ? <Text style={s.heroCity}>📍 {city}</Text> : null}

          {/* Instagram — só aparece se preenchido */}
          {instagram ? (
            <View style={s.igRow}>
              <Ionicons name="logo-instagram" size={14} color={colors.secondary} />
              <Text style={s.igText}>{instagram}</Text>
            </View>
          ) : null}

          {/* Barra de XP com progresso actual */}
          <View style={s.xpWrap}>
            <View style={s.xpTopRow}>
              <Text style={s.xpLabel}>⚡ {XP} XP</Text>
              <Text style={s.xpNext}>Próximo nível: {XP_NEXT} XP</Text>
            </View>
            <View style={s.xpTrack}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={[s.xpFill, { width: `${XP_PCT}%` }]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={s.xpHint}>Faz o teu primeiro check-in para ganhar XP 🎯</Text>
          </View>
        </LinearGradient>

        {/* ── Estatísticas: 4 cartões em linha ─────────────────────── */}
        <View style={s.statsRow}>
          <StatCard emoji="🎫" value="0" label="Eventos" />
          <View style={s.statDivider} />
          <StatCard emoji="👥" value="0" label="Amigos" />
          <View style={s.statDivider} />
          <StatCard emoji="🏅" value="3" label="Badges" />
          <View style={s.statDivider} />
          <StatCard emoji="🔥" value="0" label="Streak" />
        </View>

        {/* ── Próximas conquistas ───────────────────────────────────── */}
        {/* Lista de missões com XP a ganhar; "Completa o perfil" fica
            marcada como concluída se o utilizador tiver interesses */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Próximas conquistas 🔓</Text>
          <View style={s.unlockCard}>
            {[
              { icon: '📍', text: 'Faz o teu primeiro check-in',  xp: '+50 XP',  done: false },
              { icon: '🤝', text: 'Troca o primeiro QR code',      xp: '+30 XP',  done: false },
              { icon: '🗺️', text: 'Explora 3 eventos diferentes', xp: '+100 XP', done: false },
              { icon: '⭐', text: 'Completa o teu perfil',         xp: '+20 XP',  done: interests.length > 0 },
            ].map((item, i, arr) => (
              <View
                key={i}
                style={[s.unlockRow, i < arr.length - 1 && s.unlockRowBorder]}
              >
                <Text style={s.unlockIcon}>{item.icon}</Text>
                <Text style={[s.unlockText, item.done && s.unlockTextDone]}>
                  {item.text}
                </Text>
                <View style={[s.xpChip, item.done && s.xpChipDone]}>
                  <Text style={[s.xpChipText, item.done && s.xpChipTextDone]}>
                    {item.done ? '✓' : item.xp}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Badges ───────────────────────────────────────────────── */}
        {/* 3 badges desbloqueados por omissão + 3 bloqueados */}
        <View style={s.section}>
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Badges 🏅</Text>
            <View style={s.badgeCount}>
              <Text style={s.badgeCountText}>3 desbloqueados</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
          >
            {/* Desbloqueados */}
            {[
              { emoji: '🏅', name: 'Novato'      },
              { emoji: '⚡', name: 'Primeiro XP' },
              { emoji: '🎯', name: '1ª Missão'   },
            ].map(b => (
              <View key={b.name} style={s.unlockedBadge}>
                <LinearGradient
                  colors={['rgba(139,92,246,0.2)', 'rgba(236,72,153,0.1)']}
                  style={s.unlockedBadgeIcon}
                >
                  <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
                </LinearGradient>
                <Text style={s.unlockedBadgeName}>{b.name}</Text>
              </View>
            ))}
            {/* Bloqueados */}
            {[
              { emoji: '🎷', name: 'Maratonista Musical'       },
              { emoji: '🌍', name: 'Turista na Própria Cidade' },
              { emoji: '🤝', name: 'Conector Social'           },
            ].map(b => <LockedBadge key={b.name} emoji={b.emoji} name={b.name} />)}
          </ScrollView>
        </View>

        {/* ── Informações pessoais ──────────────────────────────────── */}
        {/* InfoRow retorna null automaticamente para campos vazios */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Informações pessoais 👤</Text>
          <View style={s.infoCard}>
            <InfoRow icon="person-outline"   label="Nome"              value={name}      />
            <InfoRow icon="location-outline" label="Cidade"            value={city}      />
            <InfoRow icon="calendar-outline" label="Ano de nascimento" value={birthYear} />
            <InfoRow icon="logo-instagram"   label="Instagram"         value={instagram} />
            <InfoRow icon="link-outline"     label="Website"           value={website}   />
            {/* CTA para preencher se todos os campos estiverem vazios */}
            {!bio && !city && !birthYear && !instagram && !website && (
              <TouchableOpacity style={s.addInfoBtn} onPress={() => onOpenSetup?.()}>
                <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                <Text style={s.addInfoText}>Adicionar informações ao perfil</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Preferências do onboarding ────────────────────────────── */}
        {/* Só renderiza se o utilizador tiver preenchido pelo menos um campo */}
        {(interests.length > 0 || schedule || exploration) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>As tuas vibes 🎯</Text>
            <View style={s.prefCard}>
              {interests.length > 0 && (
                <View style={s.prefBlock}>
                  <Text style={s.prefLabel}>Interesses</Text>
                  <View style={s.chipsRow}>
                    {interests.map(id => {
                      const info = INTEREST_MAP[id];
                      return info ? (
                        <View key={id} style={s.chip}>
                          <Text style={s.chipText}>{info.emoji} {info.label}</Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              )}
              {schedule && (
                <View style={s.prefBlock}>
                  <Text style={s.prefLabel}>Horário preferido</Text>
                  <View style={s.chipsRow}>
                    <View style={s.chip}>
                      <Text style={s.chipText}>{SCHEDULE_MAP[schedule] || schedule}</Text>
                    </View>
                  </View>
                </View>
              )}
              {exploration && (
                <View style={s.prefBlock}>
                  <Text style={s.prefLabel}>Estilo de exploração</Text>
                  <View style={s.chipsRow}>
                    <View style={s.chip}>
                      <Text style={s.chipText}>{EXPLORATION_MAP[exploration] || exploration}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Banner Premium+ ───────────────────────────────────────── */}
        <TouchableOpacity style={s.premiumBanner} activeOpacity={0.88}>
          <LinearGradient
            colors={[colors.primaryDark, '#1C1C2E']}
            style={s.premiumGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={{ fontSize: 28 }}>⭐</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.premiumTitle}>Desbloqueia o Premium+</Text>
              <Text style={s.premiumSub}>Acesso antecipado · Radar em destaque · Sem limites</Text>
            </View>
            <View style={s.premiumBtn}>
              <Text style={s.premiumBtnText}>Ver planos</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* ── Definições ────────────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Definições</Text>

          {/* Grupo principal */}
          <View style={s.settingsGroup}>
            <SettingsRow icon="notifications-outline"    label="Notificações" value="Ativo"  />
            <SettingsRow icon="shield-checkmark-outline" label="Privacidade"                 />
            <SettingsRow icon="location-outline"         label="Localização"  value="Sempre" />
            {/* Tema — onThemePress abre o ThemeSwitcherModal no App.js */}
            <SettingsRow
              icon="moon-outline"
              label="Tema"
              value="Escuro"
              onPress={onThemePress}
            />
          </View>

          {/* Grupo secundário — suporte e sessão */}
          <View style={[s.settingsGroup, { marginTop: 10 }]}>
            <SettingsRow icon="help-circle-outline"        label="Ajuda & Suporte"  />
            <SettingsRow icon="information-circle-outline" label="Sobre o VibeHunt" />
            {/* danger=true aplica cor vermelha e remove o chevron */}
            <SettingsRow icon="log-out-outline" label="Terminar sessão" danger onPress={onSignOut} />          
          </View>
        </View>

        {/* Espaço no fundo para não ficar tapado pela tab bar */}
        <View style={{ height: TAB_BAR_H + 16 }} />

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Header fixo no topo
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: 'rgba(139,92,246,0.12)',
    borderRadius: radius.full,
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
  },
  editBtnText: { color: colors.primary, fontSize: 13, fontWeight: '700' },

  // contentContainerStyle do ScrollView
  // heroBio removido — estilo morto (bug 4 corrigido)
  content: { paddingBottom: 0 }, // o espaço é gerido pelo <View height> no fundo

  // Hero section
  hero: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, alignItems: 'center' },
  levelRibbon: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: radius.full, marginBottom: spacing.md, alignSelf: 'center',
  },
  levelRibbonText: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  // Avatar
  avatarWrap: { position: 'relative', marginBottom: spacing.md },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48, padding: 3,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInner: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.bgCard2,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 44 },
  lvlBadge: {
    position: 'absolute', bottom: -3, right: -3,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.bg,
  },
  lvlBadgeText: { color: colors.black, fontSize: 12, fontWeight: '900' },

  // Textos do hero
  heroName: { color: colors.textPrimary, fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  heroCity: { color: colors.textSecondary, fontSize: 13, marginBottom: 8 },
  igRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 20 },
  igText:   { color: colors.secondary, fontSize: 13, fontWeight: '600' },

  // Barra de XP
  xpWrap:   { width: '100%' },
  xpTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel:  { color: colors.primaryLight, fontSize: 13, fontWeight: '700' },
  xpNext:   { color: colors.textMuted, fontSize: 11 },
  xpTrack:  { height: 7, backgroundColor: colors.bgCard2, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  xpFill:   { height: '100%', borderRadius: 4 },
  xpHint:   { color: colors.textMuted, fontSize: 11, textAlign: 'center' },

  // Estatísticas
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.bgCard,
    marginHorizontal: spacing.md, borderRadius: radius.lg,
    paddingVertical: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  statCard:    { flex: 1, alignItems: 'center', gap: 2 },
  statEmoji:   { fontSize: 20, marginBottom: 2 },
  statValue:   { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  statLabel:   { color: colors.textSecondary, fontSize: 11 },
  statDivider: { width: 1, backgroundColor: colors.border, marginVertical: 4 },

  // Secções genéricas
  section: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: spacing.sm },

  // Conquistas
  unlockCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
  },
  unlockRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.md, paddingVertical: 12 },
  unlockRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  unlockIcon:      { fontSize: 18 },
  unlockText:      { flex: 1, color: colors.textSecondary, fontSize: 13 },
  unlockTextDone:  { color: colors.success, textDecorationLine: 'line-through' },
  xpChip:          { backgroundColor: 'rgba(139,92,246,0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' },
  xpChipDone:      { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.2)' },
  xpChipText:      { color: colors.primary, fontSize: 11, fontWeight: '700' },
  xpChipTextDone:  { color: colors.success },

  // Badges
  badgeCount: { backgroundColor: 'rgba(139,92,246,0.12)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  badgeCountText: { color: colors.primaryLight, fontSize: 11, fontWeight: '700' },
  unlockedBadge: { alignItems: 'center', width: 76, gap: 6 },
  unlockedBadgeIcon: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(139,92,246,0.3)',
  },
  unlockedBadgeName: { color: colors.textSecondary, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  lockedBadge:        { alignItems: 'center', width: 76, gap: 6 },
  lockedBadgeIcon:    { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.bgCard2, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  lockOverlay:        { position: 'absolute', bottom: 4, right: 4, backgroundColor: colors.bgCard, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  lockedBadgeName:    { color: colors.textMuted, fontSize: 10, textAlign: 'center', lineHeight: 13 },

  // Informações pessoais
  infoCard: { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  infoRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoIcon: { width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { color: colors.textMuted, fontSize: 11 },
  infoValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  addInfoBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: spacing.md },
  addInfoText: { color: colors.primary, fontSize: 14, fontWeight: '600' },

  // Preferências
  prefCard:  { backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 14 },
  prefBlock: { gap: 6 },
  prefLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  chipsRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:      { backgroundColor: 'rgba(139,92,246,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(139,92,246,0.25)' },
  chipText:  { color: colors.primaryLight, fontSize: 12, fontWeight: '600' },

  // Premium banner
  premiumBanner:   { marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radius.xl, overflow: 'hidden' },
  premiumGradient: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md },
  premiumTitle:    { color: colors.white, fontSize: 14, fontWeight: '800' },
  premiumSub:      { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 },
  premiumBtn:      { backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  premiumBtnText:  { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },

  // Definições
  settingsGroup:       { backgroundColor: colors.bgCard, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  settingsRow:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.md, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  settingsIcon:        { width: 32, height: 32, borderRadius: 9, backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center' },
  settingsIconDanger:  { backgroundColor: 'rgba(239,68,68,0.1)' },
  settingsLabel:       { flex: 1, color: colors.textPrimary, fontSize: 14 },
  settingsValue:       { color: colors.textMuted, fontSize: 12 },
});
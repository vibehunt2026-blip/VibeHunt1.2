// ─────────────────────────────────────────────────────────────────────────────
// HomeScreen.js
//
// Ecrã principal da app. Tem dois "painéis" horizontais:
//   Painel 0 — Início (conteúdo principal com eventos, amigos, etc.)
//   Painel 1 — Mensagens (acessível deslizando para a esquerda)
//
// A transição entre painéis é gerida por PanResponder + Animated.
// O threshold do PanResponder foi aumentado para 50px para não conflituar
// com os ScrollViews horizontais internos (chips, amigos, eventos próximos),
// que precisam de movimentos menores para activar.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Image,
  TextInput,
  Platform,
} from 'react-native';
// FlatList removido — não era usado em nenhum lado (bug 1 corrigido)
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons }     from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../../../shared/theme/colors';
import { EventCard, FeaturedEventCard, CompactEventCard, ListEventCard } from '../../../shared/components/EventCard';
import { mockUser, mockFriends, mockEvents, mockMessages } from '../../../data/mockData';

const { width } = Dimensions.get('window');

// ─── Tab bar height — usado para o paddingBottom do scroll ───────────────────
// iOS tem home indicator (88px), Android não (68px)
const TAB_BAR_H = 88; // valor máximo para garantir espaço em todos os devices

// ─────────────────────────────────────────────────────────────────────────────
// FriendStory
// Avatar circular com anel gradiente quando o amigo está num evento ao vivo.
// O ponto verde no canto indica presença activa.
// ─────────────────────────────────────────────────────────────────────────────
function FriendStory({ friend }) {
  return (
    <TouchableOpacity style={styles.storyItem} activeOpacity={0.8}>
      <View style={styles.storyAvatarWrap}>
        {/* Anel gradiente só aparece quando o amigo está ao vivo */}
        {friend.isLive && (
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.storyRing}
          />
        )}
        <Image source={{ uri: friend.avatar }} style={styles.storyAvatar} />
        {/* Ponto verde de "ao vivo" */}
        {friend.isLive && <View style={styles.storyLiveDot} />}
      </View>
      <Text style={styles.storyName} numberOfLines={1}>{friend.name}</Text>
      {/* Nome do evento só aparece se o amigo estiver num evento */}
      {friend.atEvent && (
        <Text style={styles.storyEvent} numberOfLines={1}>{friend.atEvent}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MessageRow
// Linha individual de conversa no painel de mensagens.
// Grupos usam emoji 👥 em vez de avatar de imagem.
// ─────────────────────────────────────────────────────────────────────────────
function MessageRow({ msg }) {
  return (
    <TouchableOpacity style={msgStyles.row} activeOpacity={0.8}>
      {/* Avatar: foto real para DMs, emoji para grupos */}
      <View style={msgStyles.avatarWrap}>
        {msg.avatar ? (
          <Image source={{ uri: msg.avatar }} style={msgStyles.avatar} />
        ) : (
          <View style={[msgStyles.avatar, msgStyles.groupAvatar]}>
            <Text style={{ fontSize: 22 }}>👥</Text>
          </View>
        )}
        {/* Ponto verde de online */}
        {msg.isOnline && <View style={msgStyles.onlineDot} />}
      </View>

      {/* Conteúdo textual */}
      <View style={msgStyles.content}>
        <View style={msgStyles.topRow}>
          <Text style={msgStyles.name} numberOfLines={1}>{msg.name}</Text>
          <Text style={msgStyles.time}>{msg.time}</Text>
        </View>
        <View style={msgStyles.bottomRow}>
          {/* Preview em bold se houver mensagens não lidas */}
          <Text
            style={[msgStyles.preview, msg.unread > 0 && msgStyles.previewBold]}
            numberOfLines={1}
          >
            {msg.lastMessage}
          </Text>
          {/* Badge de não lidos — limita a "9+" */}
          {msg.unread > 0 && (
            <View style={msgStyles.badge}>
              <Text style={msgStyles.badgeText}>{msg.unread > 9 ? '9+' : msg.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FadeInView
// Wrapper que anima os seus filhos com fade + slide vertical ao montar.
// Props:
//   delay    — milissegundos antes de começar a animação (cria efeito cascata)
//   children — conteúdo a animar
//   style    — estilos extra para o Animated.View
// ─────────────────────────────────────────────────────────────────────────────
function FadeInView({ delay = 0, children, style }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const slideY  = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slideY,  { toValue: 0, tension: 70, friction: 12, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY: slideY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HomeContent
// Conteúdo do Painel 0 (Início).
// Todos os dados vêm de mockData — substituir por chamadas API quando o
// Supabase estiver ligado.
//
// Nota sobre a animação "pulse":
// A versão anterior tinha um Animated.Value chamado 'pulse' que era
// iniciado num loop mas nunca usado no JSX — bug 2 corrigido removendo-o.
// ─────────────────────────────────────────────────────────────────────────────
function HomeContent({ userName }) {
  // Dados de demonstração — futuramente virão do Supabase
  const featured        = mockEvents[0];
  const nearbyEvents    = mockEvents.slice(1, 4);
  const suggestedEvents = mockEvents.slice(3);

  return (
    <ScrollView
      style={styles.homeScroll}
      showsVerticalScrollIndicator={false}
      // paddingBottom generoso para garantir que o último item fica
      // visível acima da tab bar em todos os dispositivos
      contentContainerStyle={styles.homeContent}
    >
      {/* ── Cabeçalho com saudação, notificações e XP ─────────────── */}
      <FadeInView delay={0}>
        <View style={styles.homeHeader}>
          <View>
            {/* userName vem do onboarding; fallback para o mock em dev */}
            <Text style={styles.greeting}>Olá, {userName || mockUser.name}! 👋</Text>
            <Text style={styles.greetingSub}>O que queres caçar hoje?</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Sino de notificações com ponto vermelho */}
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            {/* Pílula de XP */}
            <TouchableOpacity style={styles.xpPill}>
              <Text style={styles.xpText}>⚡ {mockUser.xp} XP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FadeInView>

      {/* ── Barra de pesquisa ─────────────────────────────────────── */}
      <FadeInView delay={80}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            placeholder="Pesquisa eventos, vibes, locais..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            editable={false} // tornar true quando a pesquisa estiver implementada
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </FadeInView>

      {/* ── Filtros rápidos por categoria ─────────────────────────── */}
      {/* Nota: este ScrollView é horizontal e vive dentro do PanResponder.
          O threshold do PanResponder foi aumentado para 50px para que
          este scroll funcione sem ser interceptado. */}
      <FadeInView delay={160}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 8 }}
        >
          {['🔥 Hoje', '🎵 Música', '🎨 Arte', '🍕 Gastro', '🧘 Bem-estar', '💃 Festa'].map((f, i) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, i === 0 && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, i === 0 && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </FadeInView>

      {/* ── Amigos com eventos activos ────────────────────────────── */}
      <FadeInView delay={240}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Amigos a caçar</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 16 }}
        >
          {mockFriends.map(f => <FriendStory key={f.id} friend={f} />)}
        </ScrollView>
      </FadeInView>

      {/* ── Evento em destaque (cartão grande) ────────────────────── */}
      <FadeInView delay={320}>
        <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
          <Text style={styles.sectionTitle}>Em Destaque 🔥</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <FeaturedEventCard event={featured} onPress={() => {}} />
      </FadeInView>

      {/* ── Eventos próximos (scroll horizontal) ──────────────────── */}
      <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
        <Text style={styles.sectionTitle}>Perto de Ti 📍</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver mapa</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 12 }}
      >
        {nearbyEvents.map(e => <CompactEventCard key={e.id} event={e} onPress={() => {}} />)}
      </ScrollView>

      {/* ── Lista de sugestões personalizadas ─────────────────────── */}
      <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
        <Text style={styles.sectionTitle}>Sugerido para Ti ✨</Text>
      </View>
      <View style={styles.listSection}>
        {suggestedEvents.map(e => <ListEventCard key={e.id} event={e} onPress={() => {}} />)}
      </View>

      {/* ── Indicação de swipe para mensagens ─────────────────────── */}
      <View style={styles.swipeHint}>
        <Ionicons name="chevron-back" size={14} color={colors.textMuted} />
        <Text style={styles.swipeHintText}>Desliza para as mensagens</Text>
        <Ionicons name="chatbubbles-outline" size={14} color={colors.textMuted} />
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MessagesContent
// Conteúdo do Painel 1 (Mensagens).
// Acessível deslizando para a esquerda no Painel 0.
// ─────────────────────────────────────────────────────────────────────────────
function MessagesContent({ onBack }) {
  // Conta total de mensagens não lidas para o badge no cabeçalho
  const totalUnread = mockMessages.reduce((sum, m) => sum + m.unread, 0);

  return (
    <View style={msgStyles.container}>
      {/* SafeAreaView garante que o conteúdo não fica por baixo do notch */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.bg }}>
        <View style={msgStyles.header}>
          {/* Botão de voltar (seta para a direita — volta ao Início) */}
          <TouchableOpacity onPress={onBack} style={msgStyles.backBtn}>
            <Ionicons name="chevron-forward" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={msgStyles.headerTitle}>
            <Text style={msgStyles.title}>Mensagens</Text>
            {totalUnread > 0 && (
              <View style={msgStyles.totalBadge}>
                <Text style={msgStyles.totalBadgeText}>{totalUnread}</Text>
              </View>
            )}
          </View>
          {/* Botão para criar nova conversa */}
          <TouchableOpacity style={msgStyles.newBtn}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Pesquisa de mensagens */}
      <View style={msgStyles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={colors.textMuted} />
        <TextInput
          placeholder="Pesquisar mensagens..."
          placeholderTextColor={colors.textMuted}
          style={msgStyles.searchInput}
          editable={false}
        />
      </View>

      {/* Lista de conversas */}
      <ScrollView style={msgStyles.list} showsVerticalScrollIndicator={false}>
        {mockMessages.map(m => <MessageRow key={m.id} msg={m} />)}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HomeScreen (componente principal exportado)
//
// Gere o sistema de dois painéis deslizantes com PanResponder.
//
// IMPORTANTE — threshold do PanResponder:
// Aumentado de 12px para 50px para resolver o conflito com os ScrollViews
// horizontais internos (filtros, amigos, eventos próximos — bug 3 corrigido).
// Com 50px de threshold, o utilizador precisa de uma intenção clara de mudar
// de painel, enquanto swipes mais curtos ficam disponíveis para os scrolls.
//
// Props:
//   userData — dados do utilizador vindos do App.js (para saudação dinâmica)
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreen({ userData }) {
  // Primeiro nome do utilizador para a saudação
  const firstName  = (userData?.name || '').trim().split(' ')[0] || null;

  // 0 = Início, 1 = Mensagens
  const [page, setPage] = useState(0);

  // Valor animado para a translação horizontal entre painéis
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      // Só activa se o movimento for predominantemente horizontal E
      // superior a 50px — threshold aumentado para não conflituar com
      // os ScrollViews horizontais internos (bug 3 corrigido)
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50,

      // Para a animação automática ao iniciar o gesto manual
      onPanResponderGrant: () => translateX.stopAnimation(),

      // Segue o dedo enquanto arrasta — limitado ao intervalo [0, -width]
      onPanResponderMove: (_, { dx }) => {
        const base = page * -width;
        const next = base + dx;
        if (next <= 0 && next >= -width) translateX.setValue(next);
      },

      // Ao soltar: decide se muda de painel ou volta atrás
      // Critério: movimento > 70px OU velocidade > 0.4 por segundo
      onPanResponderRelease: (_, { dx, vx }) => {
        if (page === 0 && (dx < -70 || vx < -0.4)) {
          // Ir para Mensagens
          Animated.spring(translateX, { toValue: -width, useNativeDriver: true, tension: 80, friction: 12 }).start();
          setPage(1);
        } else if (page === 1 && (dx > 70 || vx > 0.4)) {
          // Voltar ao Início
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
          setPage(0);
        } else {
          // Movimento insuficiente — volta à posição original
          Animated.spring(translateX, { toValue: page * -width, useNativeDriver: true, tension: 80, friction: 12 }).start();
        }
      },
    })
  ).current;

  // Função chamada pelo botão de voltar dentro do painel de Mensagens
  const goBack = () => {
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
    setPage(0);
  };

  // ── Web: layout simplificado sem swipe ─────────────────────────────────────
  // Na web o PanResponder não funciona (sem touch nativo) e width*2 interfere
  // com o scroll vertical do browser. Mostramos apenas o HomeContent directo.
  if (Platform.OS === 'web') {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
        <HomeContent userName={firstName} />
      </SafeAreaView>
    );
  }

  // ── Nativo: layout de dois painéis com swipe ─────────────────────────────
  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Animated.View com largura dupla — o painel de mensagens fica fora do ecrã */}
      <Animated.View style={[styles.pages, { transform: [{ translateX }] }]}>

        {/* ── Painel 0: Início ──────────────────────────────── */}
        {/* height é herdada via flex:1 no styles.pages + alignItems:'stretch' */}
        <SafeAreaView edges={['top']} style={{ width, backgroundColor: colors.bg, flex: 1 }}>
          <HomeContent userName={firstName} />
        </SafeAreaView>

        {/* ── Painel 1: Mensagens (fora do ecrã à direita) ─── */}
        <View style={{ width, backgroundColor: colors.bg, flex: 1 }}>
          <MessagesContent onBack={goBack} />
        </View>

      </Animated.View>

      {/* Indicadores de página (pontos no fundo) */}
      <View style={styles.pageIndicator} pointerEvents="none">
        <View style={[styles.dot, page === 0 && styles.dotActive]} />
        <View style={[styles.dot, page === 1 && styles.dotActive]} />
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Container principal — overflow hidden impede que o painel de mensagens
  // seja visível antes de ser activado
  // overflow:'hidden' é necessário no nativo para esconder o painel de mensagens.
  // Na web, overflow:'hidden' bloqueia o scroll vertical do browser — por isso
  // usamos Platform.select para aplicar só no nativo.
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: Platform.select({ web: 'visible', default: 'hidden' }),
  },

  // Container horizontal com LARGURA FIXA de width*2.
  // Porquê width*2 e não flex:1:
  // Com flex:1 o React Native tenta encaixar os dois filhos (cada um com
  // width=screenWidth) no espaço disponível — o resultado é imprevisível.
  // Com width*2 explícito, o container tem exactamente o dobro do ecrã
  // e o translateX de -width desloca exactamente um painel para fora.
  // flex:1 é obrigatório para herdar a altura do container.
  // Sem flex:1, num flexDirection:'row' a altura colapsa para 0 no iOS
  // porque height não é definida pelo main-axis (width) mas pelo cross-axis.
  pages: { flexDirection: 'row', width: width * 2, flex: 1 },

  // Indicadores de página no fundo
  pageIndicator: {
    position: 'absolute', bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row', gap: 5,
  },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.textMuted },
  dotActive: { width: 18, backgroundColor: colors.primary },

  // ScrollView do Início
  homeScroll: { flex: 1, backgroundColor: colors.bg },
  // paddingBottom aumentado (bug 4 corrigido): garante visibilidade acima
  // da tab bar em iOS (88px) e Android (68px)
  homeContent: { paddingBottom: TAB_BAR_H + 24 },

  // Cabeçalho do Início
  homeHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  greeting: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  greetingSub: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: {
    position: 'relative', width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.secondary, borderWidth: 1.5, borderColor: colors.bg,
  },
  xpPill: {
    backgroundColor: 'rgba(139,92,246,0.15)', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(139,92,246,0.3)',
  },
  xpText: { color: colors.primaryLight, fontSize: 12, fontWeight: '700' },

  // Barra de pesquisa
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, marginHorizontal: spacing.md,
    marginVertical: spacing.sm, paddingHorizontal: spacing.md,
    paddingVertical: 12, borderRadius: radius.lg, gap: 10,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  filterBtn: { backgroundColor: 'rgba(139,92,246,0.1)', padding: 4, borderRadius: radius.sm },

  // Chips de filtro
  filters: { marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterChipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: colors.white },

  // Cabeçalhos de secção
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, marginBottom: spacing.sm,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  seeAll: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  // Secção de lista vertical
  listSection: { paddingHorizontal: spacing.md },

  // Avatares de amigos
  storyItem: { alignItems: 'center', width: 70 },
  storyAvatarWrap: { position: 'relative', marginBottom: 5 },
  storyRing: { width: 58, height: 58, borderRadius: 29, position: 'absolute', top: -2, left: -2 },
  storyAvatar: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: colors.bg },
  storyLiveDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.success, borderWidth: 2, borderColor: colors.bg,
  },
  storyName: { color: colors.textPrimary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  storyEvent: { color: colors.textMuted, fontSize: 9, textAlign: 'center', marginTop: 1 },

  // Dica de swipe no fundo
  swipeHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: spacing.lg, marginBottom: spacing.md, opacity: 0.5,
  },
  swipeHintText: { color: colors.textMuted, fontSize: 12 },
});

// Styles do painel de Mensagens em bloco separado para fácil localização
const msgStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  // Cabeçalho de mensagens
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { marginRight: 10 },
  headerTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '800' },
  totalBadge: { backgroundColor: colors.primary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.full },
  totalBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  newBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center' },

  // Pesquisa de mensagens
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, marginHorizontal: spacing.md,
    marginVertical: spacing.sm, paddingHorizontal: spacing.md,
    paddingVertical: 10, borderRadius: radius.lg, gap: 8,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 14 },

  // Lista de conversas
  list: { flex: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  groupAvatar: { backgroundColor: colors.bgCard2, alignItems: 'center', justifyContent: 'center' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.success, borderWidth: 2, borderColor: colors.bg,
  },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  name: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', flex: 1 },
  time: { color: colors.textMuted, fontSize: 12 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  preview: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  previewBold: { color: colors.textPrimary, fontWeight: '600' },
  badge: {
    backgroundColor: colors.primary, minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
});
// ─────────────────────────────────────────────────────────────────────────────
// src/shared/components/ThemeSwitcherModal.js
//
// Modal de selecção de tema com pré-visualização e confirmação em dois passos.
//
// Fluxo:
//   1. Utilizador clica numa opção → applyPreview(id) → app muda visualmente
//   2. Botão "Guardar" aparece se previewTheme !== currentTheme
//   3. "Guardar"  → confirmTheme() → fecha modal → tema persiste em AsyncStorage
//   4. "Cancelar" → cancelPreview() → reverte tema → fecha modal
//
// CORRECÇÕES APLICADAS:
//   - Import de useTheme corrigido: era '../../context/ThemeContext' (inexistente)
//     agora usa o hook partilhado em '../hooks/useTheme' (caminho correcto)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { LinearGradient }  from 'expo-linear-gradient';
import { Ionicons }        from '@expo/vector-icons';

// CORRIGIDO: era '../../context/ThemeContext' — ficheiro que não existia.
// O hook foi consolidado em store/themeStore e re-exportado via shared/hooks.
import { useTheme } from '../hooks/useTheme';
import { radius, spacing } from '../theme/colors';

const { width } = Dimensions.get('window');

// ── Opções de tema disponíveis ────────────────────────────────────────────────
const OPTIONS = [
  {
    id:          'dark',
    emoji:       '🌙',
    label:       'Escuro',
    sub:         'Interface sombria',
    bg:          '#0A0A0F',
    previewBg:   '#141420',
    previewBg2:  '#1C1C2E',
    lineColor:   'rgba(255,255,255,0.2)',
  },
  {
    id:          'light',
    emoji:       '☀️',
    label:       'Claro',
    sub:         'Interface luminosa',
    bg:          '#F5F5FA',
    previewBg:   '#FFFFFF',
    previewBg2:  '#EBEBF5',
    lineColor:   'rgba(0,0,0,0.12)',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ThemeSwitcherModal
// ─────────────────────────────────────────────────────────────────────────────
export default function ThemeSwitcherModal({ visible, onClose }) {
  const {
    currentTheme,
    previewTheme,
    isPreviewing,
    applyPreview,
    confirmTheme,
    cancelPreview,
  } = useTheme();

  // shouldRender controla a montagem do JSX.
  // O modal anima a saída ANTES de ser desmontado, evitando o
  // desaparecimento abrupto ao chamar return null imediatamente.
  const [shouldRender, setShouldRender] = useState(false);

  // Valores animados
  const backdropOp = useRef(new Animated.Value(0)).current;
  const cardScale  = useRef(new Animated.Value(0.88)).current;
  const cardOp     = useRef(new Animated.Value(0)).current;
  const saveBtnOp  = useRef(new Animated.Value(0)).current;
  const saveBtnY   = useRef(new Animated.Value(12)).current;

  // ── Monta o JSX quando visible passa a true ───────────────────────────────
  useEffect(() => {
    if (visible) setShouldRender(true);
  }, [visible]);

  // ── Anima entrada e saída do card ─────────────────────────────────────────
  useEffect(() => {
    if (!shouldRender) return;

    if (visible) {
      // Reinicia os valores antes de animar (evita flash em reaberturas)
      backdropOp.setValue(0);
      cardScale.setValue(0.88);
      cardOp.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(cardScale,  { toValue: 1, tension: 60, friction: 11, useNativeDriver: true }),
        Animated.timing(cardOp,     { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      // Anima saída e só depois desmonta
      Animated.parallel([
        Animated.timing(backdropOp, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(cardOp,     { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.spring(cardScale,  { toValue: 0.92, tension: 120, friction: 12, useNativeDriver: true }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible, shouldRender]);

  // ── Anima o botão "Guardar" quando há pré-visualização pendente ───────────
  useEffect(() => {
    if (isPreviewing) {
      Animated.parallel([
        Animated.timing(saveBtnOp, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(saveBtnY,  { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(saveBtnOp, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(saveBtnY,  { toValue: 12, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [isPreviewing]);

  if (!shouldRender) return null;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSelect = (id) => {
    // Só aplica preview se for diferente do tema actualmente em pré-visualização
    if (id !== previewTheme) applyPreview(id);
  };

  const handleConfirm = async () => {
    await confirmTheme();
    onClose();
  };

  const handleCancel = () => {
    cancelPreview(); // reverte para currentTheme sem persistir
    onClose();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      {/* Backdrop escuro */}
      <Animated.View style={[s.backdrop, { opacity: backdropOp }]} />

      {/* Toca fora do card para cancelar */}
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      {/* Card principal */}
      <Animated.View
        style={[s.card, { opacity: cardOp, transform: [{ scale: cardScale }] }]}
      >
        {/* Cabeçalho */}
        <View style={s.header}>
          <View style={s.headerIcon}>
            <Ionicons name="color-palette-outline" size={18} color="#8B5CF6" />
          </View>
          <Text style={s.title}>Tema da app</Text>
          <TouchableOpacity onPress={handleCancel} style={s.closeX}>
            <Ionicons name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <Text style={s.subtitle}>Escolhe a aparência da aplicação</Text>

        {/* Opções de tema */}
        <View style={s.optionsRow}>
          {OPTIONS.map((opt) => {
            const isCurrentSaved = currentTheme === opt.id;
            const isSelected     = previewTheme === opt.id;
            const isPendingThis  = isSelected && isPreviewing;

            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  s.option,
                  isSelected    && s.optionActive,
                  isPendingThis && s.optionPending,
                ]}
                onPress={() => handleSelect(opt.id)}
                activeOpacity={0.82}
              >
                {/* Miniatura do tema */}
                <View style={[s.preview, { backgroundColor: opt.bg }]}>
                  <View style={[s.previewBar,  { backgroundColor: opt.previewBg }]} />
                  <View style={[s.previewCard, { backgroundColor: opt.previewBg }]}>
                    <View style={[s.previewLine, { backgroundColor: opt.lineColor, width: '75%' }]} />
                    <View style={[s.previewLine, { backgroundColor: opt.lineColor, width: '50%' }]} />
                  </View>
                  <View style={[s.previewCard, { backgroundColor: opt.previewBg2, marginTop: 4 }]}>
                    <View style={[s.previewLine, { backgroundColor: opt.lineColor, width: '60%' }]} />
                  </View>
                </View>

                {/* Etiqueta com badge de estado */}
                <View style={s.optionBottom}>
                  <Text style={s.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[s.optionLabel, isSelected && s.optionLabelActive]}>
                    {opt.label}
                  </Text>
                  {isPendingThis ? (
                    <View style={s.pendingBadge}>
                      <Text style={s.pendingBadgeText}>Preview</Text>
                    </View>
                  ) : isCurrentSaved && !isPreviewing ? (
                    <View style={s.checkBadge}>
                      <Ionicons name="checkmark" size={11} color="#FFF" />
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botão "Guardar" — visível apenas com pré-visualização activa */}
        <Animated.View
          style={[
            s.saveBtnWrap,
            { opacity: saveBtnOp, transform: [{ translateY: saveBtnY }] },
          ]}
          pointerEvents={isPreviewing ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={s.saveBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              style={s.saveBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
              <Text style={s.saveBtnText}>Guardar tema</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Botão Cancelar */}
        <TouchableOpacity style={s.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
          <Text style={s.cancelText}>
            {isPreviewing ? 'Cancelar pré-visualização' : 'Fechar'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.70)',
  },

  card: {
    width: width - 48,
    backgroundColor: '#1C1C2E',
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.25)',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 24,
    gap: 12,
  },

  header:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(139,92,246,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  title:    { flex: 1, color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  closeX:   {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  subtitle: { color: '#9CA3AF', fontSize: 12, marginTop: -4 },

  optionsRow: { flexDirection: 'row', gap: 12 },
  option: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  optionActive: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  optionPending: {
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },

  preview:     { padding: 10, gap: 4, minHeight: 90 },
  previewBar:  { height: 8, borderRadius: 4, width: '100%', marginBottom: 4 },
  previewCard: { borderRadius: 6, padding: 6, gap: 4 },
  previewLine: { height: 4, borderRadius: 2 },

  optionBottom: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 8, gap: 6,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  optionEmoji:       { fontSize: 16 },
  optionLabel:       { flex: 1, color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  optionLabelActive: { color: '#FFFFFF', fontWeight: '700' },

  checkBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#8B5CF6',
    alignItems: 'center', justifyContent: 'center',
  },
  pendingBadge: {
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.5)',
  },
  pendingBadgeText: { color: '#F59E0B', fontSize: 9, fontWeight: '800', letterSpacing: 0.3 },

  saveBtnWrap:     { overflow: 'hidden', borderRadius: 14 },
  saveBtn:         { borderRadius: 14, overflow: 'hidden' },
  saveBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  cancelBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    marginTop: -4,
  },
  cancelText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
});
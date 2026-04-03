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

import { useTheme } from '../hooks/useTheme';
import { radius, spacing, darkColors, lightColors } from '../theme/colors';

const { width } = Dimensions.get('window');

// ── Opções de tema configuradas com base no ficheiro colors.js ────────────────
const OPTIONS = [
  {
    id:          'dark',
    emoji:       '🌙',
    label:       'Escuro',
    bg:          darkColors.bg,
    previewBg:   darkColors.bgCard,
    previewBg2:  darkColors.bgCard2,
    lineColor:   darkColors.border,
  },
  {
    id:          'light',
    emoji:       '☀️',
    label:       'Claro',
    bg:          lightColors.bg,
    previewBg:   lightColors.bgCard,
    previewBg2:  lightColors.bgCard2,
    lineColor:   lightColors.border,
  },
];

export default function ThemeSwitcherModal({ visible, onClose }) {
  const {
    currentTheme,
    previewTheme,
    isPreviewing,
    applyPreview,
    confirmTheme,
    cancelPreview,
  } = useTheme();

  // Seleciona a paleta de cores ativa para o estilo do próprio modal
  const theme = currentTheme === 'dark' ? darkColors : lightColors;

  const [shouldRender, setShouldRender] = useState(false);

  // Valores animados
  const backdropOp = useRef(new Animated.Value(0)).current;
  const cardScale  = useRef(new Animated.Value(0.88)).current;
  const cardOp     = useRef(new Animated.Value(0)).current;
  const saveBtnOp  = useRef(new Animated.Value(0)).current;
  const saveBtnY   = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    if (visible) setShouldRender(true);
  }, [visible]);

  useEffect(() => {
    if (!shouldRender) return;

    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(cardScale,  { toValue: 1, tension: 60, friction: 11, useNativeDriver: true }),
        Animated.timing(cardOp,     { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOp, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(cardOp,     { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.spring(cardScale,  { toValue: 0.92, tension: 120, friction: 12, useNativeDriver: true }),
      ]).start(() => setShouldRender(false));
    }
  }, [visible, shouldRender]);

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

  const handleSelect = (id) => {
    if (id !== previewTheme) applyPreview(id);
  };

  const handleConfirm = async () => {
    await confirmTheme();
    onClose();
  };

  const handleCancel = () => {
    cancelPreview();
    onClose();
  };

  return (
    <View style={s.root}>
      <Animated.View style={[s.backdrop, { opacity: backdropOp }]} />

      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={StyleSheet.absoluteFill} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          s.card, 
          { 
            backgroundColor: theme.bgCard2, 
            borderColor: theme.border,
            opacity: cardOp, 
            transform: [{ scale: cardScale }] 
          }
        ]}
      >
        <View style={s.header}>
          <View style={[s.headerIcon, { backgroundColor: `${theme.primary}20` }]}>
            <Ionicons name="color-palette-outline" size={18} color={theme.primary} />
          </View>
          <Text style={[s.title, { color: theme.textPrimary }]}>Tema da app</Text>
          <TouchableOpacity onPress={handleCancel} style={[s.closeX, { backgroundColor: theme.border }]}>
            <Ionicons name="close" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <Text style={[s.subtitle, { color: theme.textSecondary }]}>
          Escolhe a aparência da aplicação
        </Text>

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
                  { borderColor: theme.border },
                  isSelected    && { borderColor: theme.primary },
                  isPendingThis && { borderColor: theme.accent },
                ]}
                onPress={() => handleSelect(opt.id)}
                activeOpacity={0.82}
              >
                <View style={[s.preview, { backgroundColor: opt.bg }]}>
                  <View style={[s.previewBar,  { backgroundColor: opt.previewBg }]} />
                  <View style={[s.previewCard, { backgroundColor: opt.previewBg }]}>
                    <View style={[s.previewLine, { backgroundColor: opt.lineColor, width: '75%' }]} />
                    <View style={[s.previewLine, { backgroundColor: opt.lineColor, width: '50%' }]} />
                  </View>
                </View>

                <View style={[s.optionBottom, { backgroundColor: `${theme.black}40` }]}>
                  <Text style={s.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[s.optionLabel, isSelected ? { color: theme.textPrimary } : { color: theme.textSecondary }]}>
                    {opt.label}
                  </Text>
                  {isPendingThis ? (
                    <View style={[s.pendingBadge, { borderColor: theme.accent }]}>
                      <Text style={[s.pendingBadgeText, { color: theme.accent }]}>Preview</Text>
                    </View>
                  ) : isCurrentSaved && !isPreviewing ? (
                    <View style={[s.checkBadge, { backgroundColor: theme.primary }]}>
                      <Ionicons name="checkmark" size={11} color={theme.white} />
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Animated.View
          style={[
            s.saveBtnWrap,
            { opacity: saveBtnOp, transform: [{ translateY: saveBtnY }] },
          ]}
          pointerEvents={isPreviewing ? 'auto' : 'none'}
        >
          <TouchableOpacity style={s.saveBtn} onPress={handleConfirm}>
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              style={s.saveBtnGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={theme.white} />
              <Text style={[s.saveBtnText, { color: theme.white }]}>Guardar tema</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={[s.cancelBtn, { borderColor: theme.border }]} onPress={handleCancel}>
          <Text style={[s.cancelText, { color: theme.textSecondary }]}>
            {isPreviewing ? 'Cancelar pré-visualização' : 'Fechar'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, zIndex: 2000, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  card: {
    width: width - 48,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    elevation: 24,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title:    { flex: 1, fontSize: 17, fontWeight: '800' },
  closeX:   { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  subtitle: { fontSize: 12, marginTop: -4 },
  optionsRow: { flexDirection: 'row', gap: 12 },
  option: { flex: 1, borderRadius: radius.md, borderWidth: 2, overflow: 'hidden' },
  preview:     { padding: 10, gap: 4, minHeight: 80 },
  previewBar:  { height: 8, borderRadius: 4, width: '100%', marginBottom: 4 },
  previewCard: { borderRadius: 6, padding: 6, gap: 4 },
  previewLine: { height: 4, borderRadius: 2 },
  optionBottom: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  optionEmoji:  { fontSize: 16 },
  optionLabel:  { flex: 1, fontSize: 13, fontWeight: '600' },
  checkBadge:   { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  pendingBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 9, borderWidth: 1 },
  pendingBadgeText: { fontSize: 9, fontWeight: '800' },
  saveBtnWrap:     { borderRadius: radius.md, overflow: 'hidden' },
  saveBtn:         { borderRadius: radius.md },
  saveBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  saveBtnText:     { fontSize: 15, fontWeight: '700' },
  cancelBtn: { paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600' },
});
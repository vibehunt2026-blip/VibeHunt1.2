// ─── Paleta escura (padrão) ───────────────────────────────────────────────────
export const darkColors = {
  bg:           '#0A0A0F',
  bgCard:       '#141420',
  bgCard2:      '#1C1C2E',
  bgInput:      '#1E1E2E',
  primary:      '#8B5CF6',
  primaryLight: '#A78BFA',
  primaryDark:  '#6D28D9',
  secondary:    '#EC4899',
  accent:       '#F59E0B',
  success:      '#10B981',
  error:        '#EF4444',
  textPrimary:  '#FFFFFF',
  textSecondary:'#9CA3AF',
  textMuted:    '#4B5563',
  border:       '#2D2D3E',
  borderLight:  '#3D3D50',
  white:        '#FFFFFF',
  black:        '#000000',
  overlay:      'rgba(0,0,0,0.6)',
};

// ─── Paleta clara ─────────────────────────────────────────────────────────────
export const lightColors = {
  bg:           '#F5F5FA',
  bgCard:       '#FFFFFF',
  bgCard2:      '#EBEBF5',
  bgInput:      '#F0EFF8',
  primary:      '#7C3AED',
  primaryLight: '#8B5CF6',
  primaryDark:  '#6D28D9',
  secondary:    '#DB2777',
  accent:       '#D97706',
  success:      '#059669',
  error:        '#DC2626',
  textPrimary:  '#111827',
  textSecondary:'#4B5563',
  textMuted:    '#9CA3AF',
  border:       '#E5E7EB',
  borderLight:  '#F3F4F6',
  white:        '#FFFFFF',
  black:        '#000000',
  overlay:      'rgba(0,0,0,0.35)',
};

// Exportação padrão — compatibilidade com todos os ecrãs existentes
export const colors = darkColors;

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};
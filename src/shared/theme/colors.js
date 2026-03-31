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
  bg:           '#F8F9FA', // Fundo principal claro e limpo
  bgCard:       '#FFFFFF', // Cards brancos para destacar do fundo
  bgCard2:      '#F3F4F6', // Ligeiramente mais escuro que o card principal
  bgInput:      '#F3F4F6', // Input cinza claro
  primary:      '#7C3AED', // Roxo ligeiramente mais escuro para melhor contraste no claro
  primaryLight: '#C4B5FD', // Roxo suave
  primaryDark:  '#5B21B6', // Roxo profundo
  secondary:    '#DB2777', // Rosa com contraste ajustado
  accent:       '#D97706', // Âmbar com contraste ajustado
  success:      '#059669', // Verde com contraste ajustado
  error:        '#DC2626', // Vermelho com contraste ajustado
  textPrimary:  '#111827', // Quase preto para o texto principal
  textSecondary:'#4B5563', // Cinza escuro
  textMuted:    '#9CA3AF', // Cinza médio
  border:       '#E5E7EB', // Borda suave
  borderLight:  '#F3F4F6', // Borda quase imperceptível
  white:        '#FFFFFF', // Mantém estático
  black:        '#000000', // Mantém estático
  overlay:      'rgba(0,0,0,0.4)', // Overlay ligeiramente mais suave
};

// Exportação padrão — compatibilidade com todos os ecrãs existentes
export const colors = darkColors;

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};
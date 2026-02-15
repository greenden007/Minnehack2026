export const AppColors = {
  // Primary background colors
  primaryDark: '#0A0E1A',
  primaryMid: '#141B2D',
  surfaceCard: '#1C2438',
  surfaceElevated: '#242F4A',

  // Accent colors
  accentCyan: '#00D9FF',
  accentViolet: '#8B5CF6',
  accentPink: '#EC4899',
  accentGreen: '#10B981',
  accentOrange: '#F59E0B',

  // Emergency colors
  emergency: '#DC2626',
  emergencyDark: '#991B1B',
  safe: '#16A34A',

  // Text colors
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',

  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

export type AppColorsType = typeof AppColors;

export const Colors = {
  // Backgrounds
  bgDeep: '#0B1F0D',       // Darkest green (hero / page bg)
  bgCard: '#122A14',       // Card / section bg
  bgElevated: '#1A3D1C',   // Elevated card surface
  bgOverlay: '#0E2410CC',  // Semi-transparent overlay (modal, sheet)

  // Accents
  accentGreen: '#3ECF60',  // Primary CTA / icon accent
  accentLime: '#7EDF4A',   // Secondary highlight / tag
  accentMuted: '#2A6632',  // Muted green (borders, dividers)

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A8C8A8',
  textMuted: '#6B9A6B',
  textInverse: '#0B1F0D',

  // Status
  success: '#3ECF60',
  warning: '#F5C242',
  error: '#E05252',

  // Misc
  border: '#1F4A22',
  shadow: '#000000',
  transparent: 'transparent',
};

export const Typography = {
  fontSizeXS: 11,
  fontSizeSM: 13,
  fontSizeMD: 15,
  fontSizeLG: 18,
  fontSizeXL: 24,
  fontSize2XL: 32,
  fontSize3XL: 40,

  fontWeightRegular: '400' as const,
  fontWeightMedium: '500' as const,
  fontWeightSemiBold: '600' as const,
  fontWeightBold: '700' as const,
  fontWeightExtraBold: '800' as const,

  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 1,
  letterSpacingXWide: 2.5,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
};
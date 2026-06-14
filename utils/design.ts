import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SCREEN = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };

export const COLORS = {
  // AMOLED black base
  void: '#000000',
  abyss: '#020205',
  depth: '#07080F',
  surface: '#0D0E1A',
  elevated: '#12142A',
  card: '#16183A',

  // Glass layers
  glass: 'rgba(255,255,255,0.04)',
  glassMid: 'rgba(255,255,255,0.07)',
  glassHigh: 'rgba(255,255,255,0.12)',
  glassBorder: 'rgba(255,255,255,0.08)',
  glassBorderHigh: 'rgba(255,255,255,0.18)',

  // Flame brand palette
  flame: '#FF4D00',
  flameWarm: '#FF6A2A',
  flameSoft: '#FF8A5A',
  flameGlow: 'rgba(255,77,0,0.35)',
  flamePulse: 'rgba(255,77,0,0.15)',

  // Accent spectrum
  violet: '#8B5CF6',
  violetGlow: 'rgba(139,92,246,0.3)',
  indigo: '#6366F1',
  cyan: '#06B6D4',
  cyanGlow: 'rgba(6,182,212,0.25)',
  emerald: '#10B981',
  emeraldGlow: 'rgba(16,185,129,0.25)',
  rose: '#F43F5E',
  roseGlow: 'rgba(244,63,94,0.25)',
  amber: '#F59E0B',
  sky: '#0EA5E9',

  // Text hierarchy
  textPrimary: '#F8FAFF',
  textSecondary: 'rgba(248,250,255,0.65)',
  textTertiary: 'rgba(248,250,255,0.35)',
  textDisabled: 'rgba(248,250,255,0.2)',

  // Private mode
  privateBase: '#0A0014',
  privateAccent: '#A855F7',
  privateGlow: 'rgba(168,85,247,0.3)',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.3)',
  overlayHeavy: 'rgba(0,0,0,0.85)',

  // Semantic
  secure: '#10B981',
  insecure: '#F59E0B',
  danger: '#EF4444',
};

export const GRADIENTS = {
  flamePrimary: ['#FF4D00', '#FF8A5A'],
  flameReverse: ['#FF8A5A', '#FF4D00'],
  flameDeep: ['#FF4D00', '#D63000'],
  violetDeep: ['#8B5CF6', '#6D28D9'],
  cyanDeep: ['#06B6D4', '#0284C7'],
  surface: ['#07080F', '#0D0E1A'],
  card: ['rgba(22,24,58,0.9)', 'rgba(13,14,26,0.95)'],
  glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'],
  radialFlame: ['rgba(255,77,0,0.4)', 'transparent'],
  radialViolet: ['rgba(139,92,246,0.3)', 'transparent'],
  private: ['#1A0028', '#0A0014'],
  subtle: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'],
  shimmer: ['transparent', 'rgba(255,255,255,0.08)', 'transparent'],
  homeHero: ['rgba(255,77,0,0.12)', '#07080F', '#07080F'],
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
  full: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
};

export const FONT = {
  // Size scale
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 36,
  hero: 48,

  // Weight
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
  black: '900' as const,
};

export const SHADOWS = {
  flame: {
    shadowColor: COLORS.flame,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  violet: {
    shadowColor: COLORS.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const ANIMATION = {
  spring: { damping: 18, stiffness: 200, mass: 1 },
  springBouncy: { damping: 12, stiffness: 280, mass: 0.8 },
  springGentle: { damping: 25, stiffness: 150, mass: 1 },
  springSnappy: { damping: 20, stiffness: 400, mass: 0.7 },
  timing: { duration: 300 },
  timingFast: { duration: 150 },
  timingSlow: { duration: 600 },
};

export const NAV_BAR_HEIGHT = 80;
export const STATUS_BAR_HEIGHT = 44;
export const SEARCH_BAR_HEIGHT = 56;
export const TAB_BAR_HEIGHT = 90;

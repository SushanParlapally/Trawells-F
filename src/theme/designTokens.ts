/**
 * Design Tokens - Single source of truth for all design values
 * Following the design token methodology for scalable design systems
 */

// Color Tokens
export const colorTokens = {
  // Primary Colors
  blue50: '#E3F2FD',
  blue100: '#BBDEFB',
  blue200: '#90CAF9',
  blue300: '#64B5F6',
  blue400: '#42A5F5',
  blue500: '#007BFF', // Primary
  blue600: '#0056B3',
  blue700: '#0D47A1',
  blue800: '#1565C0',
  blue900: '#0D47A1',

  // Secondary Colors (Amber)
  amber50: '#FFF8E1',
  amber100: '#FFECB3',
  amber200: '#FFE082',
  amber300: '#FFD54F',
  amber400: '#FFCC02',
  amber500: '#FFB300', // Secondary
  amber600: '#CC8F00',
  amber700: '#FF8F00',
  amber800: '#FF6F00',
  amber900: '#E65100',

  // Semantic Colors
  success50: '#E8F5E8',
  success100: '#C8E6C9',
  success500: '#28A745',
  success600: '#1E7E34',
  success700: '#155724',

  warning50: '#FFF3CD',
  warning100: '#FFE69C',
  warning500: '#FFC107',
  warning600: '#E0A800',
  warning700: '#B68C00',

  error50: '#FFEBEE',
  error100: '#FFCDD2',
  error500: '#DC3545',
  error600: '#C82333',
  error700: '#A71E2A',

  info50: '#E1F5FE',
  info100: '#B3E5FC',
  info500: '#17A2B8',
  info600: '#138496',
  info700: '#0C5460',

  // Neutral Colors
  white: '#FFFFFF',
  gray50: '#F8F9FA',
  gray100: '#F1F3F4',
  gray200: '#E0E0E0',
  gray300: '#DADCE0',
  gray400: '#9AA0A6',
  gray500: '#6C757D',
  gray600: '#5F6368',
  gray700: '#3C4043',
  gray800: '#212529',
  gray900: '#1A1A1A',
  black: '#000000',
} as const;

// Typography Tokens
export const typographyTokens = {
  fontFamily: {
    primary: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    monospace: '"Fira Code", "Monaco", "Consolas", monospace',
  },
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const;

// Spacing Tokens
export const spacingTokens = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
  '5xl': '8rem', // 128px
} as const;

// Border Radius Tokens
export const radiusTokens = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
} as const;

// Shadow Tokens
export const shadowTokens = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.15)',
  '2xl': '0 16px 64px rgba(0, 0, 0, 0.2)',
} as const;

// Z-Index Tokens
export const zIndexTokens = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Transition Tokens
export const transitionTokens = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Breakpoint Tokens
export const breakpointTokens = {
  xs: '0px',
  sm: '600px',
  md: '900px',
  lg: '1200px',
  xl: '1536px',
} as const;

// Component-specific Tokens
export const componentTokens = {
  button: {
    borderRadius: radiusTokens.md,
    padding: {
      small: `${spacingTokens.sm} ${spacingTokens.md}`,
      medium: `${spacingTokens.md} ${spacingTokens.lg}`,
      large: `${spacingTokens.lg} ${spacingTokens.xl}`,
    },
  },
  card: {
    borderRadius: radiusTokens.xl,
    padding: spacingTokens.xl,
    shadow: shadowTokens.md,
  },
  input: {
    borderRadius: radiusTokens.md,
    padding: `${spacingTokens.md} ${spacingTokens.lg}`,
  },
  header: {
    height: '64px',
    shadow: shadowTokens.sm,
  },
  sidebar: {
    width: '280px',
  },
} as const;

// Export all tokens as a single object for easy access
export const designTokens = {
  colors: colorTokens,
  typography: typographyTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
  shadows: shadowTokens,
  zIndex: zIndexTokens,
  transitions: transitionTokens,
  breakpoints: breakpointTokens,
  components: componentTokens,
} as const;

export default designTokens;

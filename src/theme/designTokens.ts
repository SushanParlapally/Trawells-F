/**
 * Design Tokens - Single source of truth for all design values
 * Evolved for the "Vibrancy & Air" / "High-Tech 2025" update.
 */

// --- COLOR TOKENS ---
// This is the core of the new visual identity.
export const colorTokens = {
  // NEW PRIMARY: A vibrant, modern purple ("Midnight Bloom")
  primary50: '#EDE7F6',
  primary100: '#D1C4E9',
  primary200: '#B39DDB',
  primary300: '#9575CD',
  primary400: '#7E57C2',
  primary500: '#6A5ACD', // Midnight Bloom (Your new primary.main)
  primary600: '#5E35B1',
  primary700: '#512DA8',
  primary800: '#4527A0',
  primary900: '#311B92',

  // NEW ACCENT: A confident, energetic gold ("Solar Flare")
  accent50: '#FFFDE7',
  accent100: '#FFF9C4',
  accent200: '#FFF59D',
  accent300: '#FFF176',
  accent400: '#FFEE58',
  accent500: '#FFD700', // Solar Flare (Your new secondary.main / accent)
  accent600: '#FBC02D',
  accent700: '#FFA000',
  accent800: '#FF8F00',
  accent900: '#FF6F00',

  // Semantic Colors (Refined for better harmony)
  success500: '#2E8B57', // Forest Green
  warning500: '#FFBF00', // Amber
  error500: '#DC143C', // Crimson Red
  info500: '#007BFF', // A standard, clear blue for info alerts

  // Neutral Colors (Updated for Vibrancy & Air)
  white: '#FFFFFF', // Pure White
  gray50: '#F7F7F7', // Alabaster
  gray100: '#F1F3F4',
  gray200: '#E0E0E0', // Cloud Gray
  gray300: '#DADCE0',
  gray400: '#9AA0A6',
  gray500: '#666666', // Ash Gray
  gray600: '#5F6368',
  gray700: '#3C4043',
  gray800: '#333333', // Slate Gray
  gray900: '#1A1A1A',
  black: '#000000',
} as const;

// --- All other token categories below are excellent and require no changes ---

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

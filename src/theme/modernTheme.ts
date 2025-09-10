import { createTheme, alpha } from '@mui/material/styles';
import { designTokens } from './designTokens';

// Modern theme for the "Vibrancy & Air" update of the Travel Desk Management System
const modernTheme = createTheme({
  // --- PALETTE ---
  // Consumes the new, evolved color tokens from designTokens.ts.
  palette: {
    mode: 'light',
    primary: {
      main: designTokens.colors.primary500, // Midnight Bloom
      light: designTokens.colors.primary300,
      dark: designTokens.colors.primary700,
      contrastText: designTokens.colors.white,
    },
    secondary: {
      main: designTokens.colors.accent500, // Solar Flare
      light: designTokens.colors.accent300,
      dark: designTokens.colors.accent700,
      contrastText: designTokens.colors.gray800,
    },
    error: {
      main: designTokens.colors.error500,
    },
    warning: {
      main: designTokens.colors.warning500,
    },
    success: {
      main: designTokens.colors.success500,
    },
    info: {
      main: designTokens.colors.info500,
    },
    background: {
      default: designTokens.colors.gray50, // Alabaster (Corrected)
      paper: designTokens.colors.white, // Pure White
    },
    text: {
      primary: designTokens.colors.gray800, // Slate Gray (Corrected)
      secondary: designTokens.colors.gray500, // Ash Gray (Corrected)
    },
    divider: designTokens.colors.gray200, // Cloud Gray
  },

  // --- TYPOGRAPHY, SHAPE, SPACING ---
  // Inherited directly from your excellent design token structure.
  typography: {
    fontFamily: designTokens.typography.fontFamily.primary,
    h1: {
      fontSize: designTokens.typography.fontSize['5xl'],
      fontWeight: designTokens.typography.fontWeight.bold,
      lineHeight: designTokens.typography.lineHeight.tight,
    },
    h2: {
      fontSize: designTokens.typography.fontSize['4xl'],
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.tight,
    },
    h3: {
      fontSize: designTokens.typography.fontSize['2xl'],
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    h4: {
      fontSize: designTokens.typography.fontSize.xl,
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    h5: {
      fontSize: designTokens.typography.fontSize.lg,
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    h6: {
      fontSize: designTokens.typography.fontSize.base,
      fontWeight: designTokens.typography.fontWeight.semibold,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    body1: {
      fontSize: designTokens.typography.fontSize.base,
      fontWeight: designTokens.typography.fontWeight.normal,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    body2: {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.normal,
      lineHeight: designTokens.typography.lineHeight.normal,
    },
    button: {
      fontSize: designTokens.typography.fontSize.sm,
      fontWeight: designTokens.typography.fontWeight.medium,
      textTransform: 'none' as const,
    },
  },
  shape: {
    borderRadius: parseInt(designTokens.radius.md),
  },
  spacing: 8,

  // --- COMPONENT OVERRIDES ---
  // Your professional setup, enhanced with "2025 High-Tech" refinements.
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.components.button.borderRadius,
          textTransform: 'none',
          fontWeight: designTokens.typography.fontWeight.medium,
          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeInOut}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: designTokens.shadows.lg,
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: designTokens.shadows.sm,
          '&:hover': {
            boxShadow: designTokens.shadows.md,
          },
        },
        // NEW "GLOW" EFFECT for primary accent buttons
        containedSecondary: {
          '&:hover': {
            backgroundColor: designTokens.colors.accent600,
            boxShadow: `0 0 15px 0 ${alpha(designTokens.colors.accent500, 0.6)}`,
          },
        },
        outlinedPrimary: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: alpha(designTokens.colors.primary500, 0.04),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.components.card.borderRadius,
          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeInOut}`,
        },
        elevation1: { boxShadow: designTokens.shadows.md },
        elevation2: { boxShadow: designTokens.shadows.lg },
        elevation3: { boxShadow: designTokens.shadows.xl },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.components.card.borderRadius,
          boxShadow: designTokens.components.card.shadow,
          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeInOut}`,
          border: `1px solid ${designTokens.colors.gray200}`,
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: designTokens.shadows.xl,
            borderColor: alpha(designTokens.colors.primary500, 0.3),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: designTokens.radius.md,
            transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeInOut}`,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: designTokens.colors.primary500,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              borderColor: designTokens.colors.primary500,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          fontWeight: designTokens.typography.fontWeight.medium,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Semi-transparent "glass" effect for the header
          backgroundColor: alpha(designTokens.colors.white, 0.85),
          backdropFilter: 'blur(8px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${designTokens.colors.gray200}`,
          color: designTokens.colors.gray800,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          backgroundColor: designTokens.colors.white,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          margin: `4px ${designTokens.spacing.sm}`,
          transition: `all ${designTokens.transitions.duration.fast} ${designTokens.transitions.easing.easeInOut}`,
          '&:hover': {
            backgroundColor: alpha(designTokens.colors.primary500, 0.08),
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: designTokens.colors.primary500,
            color: designTokens.colors.white,
            '&:hover': {
              backgroundColor: designTokens.colors.primary700,
            },
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
              color: designTokens.colors.white,
              fontWeight: designTokens.typography.fontWeight.semibold,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          fontWeight: designTokens.typography.fontWeight.medium,
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: alpha(designTokens.colors.success500, 0.1),
          borderColor: alpha(designTokens.colors.success500, 0.3),
          color: designTokens.colors.success500,
        },
        standardError: {
          backgroundColor: alpha(designTokens.colors.error500, 0.1),
          borderColor: alpha(designTokens.colors.error500, 0.3),
          color: designTokens.colors.error500,
        },
        standardWarning: {
          backgroundColor: alpha(designTokens.colors.warning500, 0.1),
          borderColor: alpha(designTokens.colors.warning500, 0.3),
          color: designTokens.colors.warning500,
        },
        standardInfo: {
          backgroundColor: alpha(designTokens.colors.info500, 0.1),
          borderColor: alpha(designTokens.colors.info500, 0.3),
          color: designTokens.colors.info500,
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.xl,
          border: `1px solid ${designTokens.colors.gray200}`,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: designTokens.colors.gray50,
          '& .MuiTableCell-head': {
            fontWeight: designTokens.typography.fontWeight.semibold,
            color: designTokens.colors.gray800,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(designTokens.colors.primary500, 0.04),
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        // NEW "GLASSMORPHISM" EFFECT for modals
        paper: {
          borderRadius: designTokens.radius.xl,
          boxShadow: designTokens.shadows.xl,
          background: alpha(designTokens.colors.white, 0.8),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(designTokens.colors.white, 0.3)}`,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: designTokens.radius.lg,
          boxShadow: designTokens.shadows.lg,
          border: `1px solid ${designTokens.colors.gray200}`,
          marginTop: designTokens.spacing.sm,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.radius.md,
          margin: `2px ${designTokens.spacing.sm}`,
          transition: `all ${designTokens.transitions.duration.fast} ${designTokens.transitions.easing.easeInOut}`,
          '&:hover': {
            backgroundColor: alpha(designTokens.colors.primary500, 0.08),
            transform: 'translateX(2px)',
          },
        },
      },
    },
  },
});

export default modernTheme;

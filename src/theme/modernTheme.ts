import { createTheme } from '@mui/material/styles';
import { designTokens } from './designTokens';

// Modern theme using design tokens for Travel Desk Management System
const modernTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: designTokens.colors.blue500,
      light: designTokens.colors.blue300,
      dark: designTokens.colors.blue600,
      contrastText: designTokens.colors.white,
    },
    secondary: {
      main: designTokens.colors.amber500,
      light: designTokens.colors.amber300,
      dark: designTokens.colors.amber600,
      contrastText: designTokens.colors.black,
    },
    error: {
      main: designTokens.colors.error500,
      light: designTokens.colors.error100,
      dark: designTokens.colors.error700,
    },
    warning: {
      main: designTokens.colors.warning500,
      light: designTokens.colors.warning100,
      dark: designTokens.colors.warning700,
    },
    success: {
      main: designTokens.colors.success500,
      light: designTokens.colors.success100,
      dark: designTokens.colors.success700,
    },
    info: {
      main: designTokens.colors.info500,
      light: designTokens.colors.info100,
      dark: designTokens.colors.info700,
    },
    background: {
      default: designTokens.colors.gray50,
      paper: designTokens.colors.white,
    },
    text: {
      primary: designTokens.colors.gray800,
      secondary: designTokens.colors.gray500,
    },
    divider: designTokens.colors.gray200,
  },
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
    borderRadius: parseInt(designTokens.radius.md), // Default border radius for components
  },
  spacing: 8, // Base spacing unit (8px)
  components: {
    // Button component overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.components.button.borderRadius,
          textTransform: 'none',
          fontWeight: designTokens.typography.fontWeight.medium,
          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeInOut}`,
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        containedSecondary: {
          backgroundColor: '#FFB300',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#CC8F00',
            boxShadow: '0 4px 12px rgba(255, 179, 0, 0.3)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: 'rgba(0, 123, 255, 0.04)',
          },
        },
        sizeSmall: {
          padding: designTokens.components.button.padding.small,
          fontSize: designTokens.typography.fontSize.xs,
        },
        sizeMedium: {
          padding: designTokens.components.button.padding.medium,
          fontSize: designTokens.typography.fontSize.sm,
        },
        sizeLarge: {
          padding: designTokens.components.button.padding.large,
          fontSize: designTokens.typography.fontSize.base,
        },
      },
    },

    // Paper/Card component overrides
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.components.card.borderRadius,
          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeInOut}`,
        },
        elevation0: {
          backgroundColor: designTokens.colors.white,
          border: `1px solid ${designTokens.colors.gray200}`,
        },
        elevation1: {
          boxShadow: designTokens.shadows.md,
        },
        elevation2: {
          boxShadow: designTokens.shadows.lg,
        },
        elevation3: {
          boxShadow: designTokens.shadows.xl,
        },
      },
    },

    // Card component overrides
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.components.card.borderRadius,
          boxShadow: designTokens.components.card.shadow,
          transition: `all ${designTokens.transitions.duration.normal} ${designTokens.transitions.easing.easeInOut}`,
          border: `1px solid ${designTokens.colors.gray200}`,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
            borderColor: 'rgba(0, 123, 255, 0.2)',
          },
        },
      },
    },

    // TextField component overrides
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#007BFF',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
                borderColor: '#007BFF',
              },
            },
          },
        },
      },
    },

    // Chip component overrides
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },

    // AppBar component overrides
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#FFFFFF',
          color: '#212529',
        },
      },
    },

    // Drawer component overrides
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
        },
      },
    },

    // List component overrides
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '2px 8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 123, 255, 0.08)',
            transform: 'translateX(4px)',
          },
          '&.Mui-selected': {
            backgroundColor: '#007BFF',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#0056B3',
            },
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF',
            },
            '& .MuiListItemText-primary': {
              fontWeight: 600,
            },
          },
        },
      },
    },

    // Alert component overrides
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
        standardSuccess: {
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          color: '#28A745',
          border: '1px solid rgba(40, 167, 69, 0.2)',
        },
        standardError: {
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          color: '#DC3545',
          border: '1px solid rgba(220, 53, 69, 0.2)',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          color: '#CC8F00',
          border: '1px solid rgba(255, 193, 7, 0.2)',
        },
        standardInfo: {
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          color: '#007BFF',
          border: '1px solid rgba(0, 123, 255, 0.2)',
        },
      },
    },

    // Table component overrides
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #E0E0E0',
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F8F9FA',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#212529',
            borderBottom: '2px solid #E0E0E0',
          },
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 123, 255, 0.04)',
          },
        },
      },
    },

    // Dialog component overrides
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
      },
    },

    // Menu component overrides
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(224, 224, 224, 0.5)',
          marginTop: '8px',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          margin: '2px 6px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(0, 123, 255, 0.08)',
            transform: 'translateX(2px)',
          },
        },
      },
    },
  },
});

export default modernTheme;

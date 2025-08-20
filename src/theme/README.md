# Design System Documentation

## Overview

This design system follows the **Design Tokens** methodology, providing a single source of truth for
all design values. This approach ensures consistency, maintainability, and scalability across the
entire Travel Desk Management System.

## Design Tokens Structure

### 🎨 Color Tokens (`colorTokens`)

All colors are organized by semantic meaning and include multiple shades for flexibility:

```typescript
// Primary Colors (Blue)
blue500: '#007BFF'; // Main primary color
blue300: '#64B5F6'; // Light variant
blue600: '#0056B3'; // Dark variant

// Secondary Colors (Amber)
amber500: '#FFB300'; // Main secondary color
amber300: '#FFD54F'; // Light variant
amber600: '#CC8F00'; // Dark variant
```

**Usage Example:**

```typescript
// ✅ Good - Using design tokens
backgroundColor: designTokens.colors.blue500;

// ❌ Avoid - Hard-coded values
backgroundColor: '#007BFF';
```

### 📝 Typography Tokens (`typographyTokens`)

Consistent typography scale with semantic naming:

```typescript
fontSize: {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  // ... more sizes
}

fontWeight: {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
```

### 📏 Spacing Tokens (`spacingTokens`)

Consistent spacing using a harmonious scale:

```typescript
spacing: {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  // ... more sizes
}
```

### 🔄 Border Radius Tokens (`radiusTokens`)

Consistent border radius values:

```typescript
radius: {
  sm: '4px',
  md: '8px',      // Default for buttons
  lg: '12px',
  xl: '16px',     // Default for cards
  '2xl': '24px',
  full: '9999px', // Fully rounded
}
```

### 🌟 Shadow Tokens (`shadowTokens`)

Elevation system using consistent shadows:

```typescript
shadows: {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.08)',   // Default for cards
  lg: '0 4px 16px rgba(0, 0, 0, 0.12)',
  xl: '0 8px 32px rgba(0, 0, 0, 0.15)',
}
```

### ⚡ Transition Tokens (`transitionTokens`)

Consistent animation timing:

```typescript
transitions: {
  duration: {
    fast: '150ms',
    normal: '200ms',  // Default
    slow: '300ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // Default
  }
}
```

## Component Tokens

Pre-configured token combinations for common components:

```typescript
componentTokens: {
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
}
```

## Usage Guidelines

### ✅ Best Practices

1. **Always use design tokens instead of hard-coded values**

   ```typescript
   // ✅ Good
   color: designTokens.colors.blue500;

   // ❌ Avoid
   color: '#007BFF';
   ```

2. **Use semantic color names**

   ```typescript
   // ✅ Good - Semantic meaning
   backgroundColor: designTokens.colors.success500;

   // ❌ Avoid - Color-specific naming
   backgroundColor: designTokens.colors.green500;
   ```

3. **Leverage component tokens for consistency**

   ```typescript
   // ✅ Good - Using component tokens
   borderRadius: designTokens.components.button.borderRadius;

   // ❌ Avoid - Direct token usage for components
   borderRadius: designTokens.radius.md;
   ```

### 🔧 Extending the Design System

To add new tokens:

1. **Add to the appropriate token category**
2. **Update the theme configuration**
3. **Document the new token**
4. **Test across all components**

Example - Adding a new color:

```typescript
// 1. Add to designTokens.ts
export const colorTokens = {
  // ... existing colors
  purple500: '#8B5CF6', // New purple color
} as const;

// 2. Update theme if needed
palette: {
  // ... existing palette
  tertiary: {
    main: designTokens.colors.purple500,
  },
}

// 3. Use in components
<Button sx={{ backgroundColor: designTokens.colors.purple500 }}>
```

## Benefits of Design Tokens

### 🎯 **Consistency**

- Single source of truth for all design values
- Eliminates design inconsistencies
- Ensures brand coherence

### 🔧 **Maintainability**

- Change a color once, update everywhere
- Easy to implement design system updates
- Reduces technical debt

### 📈 **Scalability**

- Easy to add new themes (dark mode, etc.)
- Supports design system evolution
- Facilitates team collaboration

### 🚀 **Developer Experience**

- IntelliSense support with TypeScript
- Clear naming conventions
- Reduced decision fatigue

## Migration from Hard-coded Values

When refactoring existing code:

1. **Identify hard-coded values**
2. **Find the appropriate design token**
3. **Replace with token reference**
4. **Test the change**

```typescript
// Before
const StyledButton = styled(Button)({
  backgroundColor: '#007BFF',
  borderRadius: '8px',
  padding: '8px 16px',
});

// After
const StyledButton = styled(Button)({
  backgroundColor: designTokens.colors.blue500,
  borderRadius: designTokens.components.button.borderRadius,
  padding: designTokens.components.button.padding.medium,
});
```

## Theme Integration

The design tokens are integrated into the MUI theme:

```typescript
// modernTheme.ts
import { designTokens } from './designTokens';

const modernTheme = createTheme({
  palette: {
    primary: {
      main: designTokens.colors.blue500,
      light: designTokens.colors.blue300,
      dark: designTokens.colors.blue600,
    },
    // ... rest of palette using tokens
  },
  typography: {
    fontFamily: designTokens.typography.fontFamily.primary,
    // ... rest of typography using tokens
  },
});
```

This ensures that all MUI components automatically use the design tokens, providing consistency
across the entire application.

## Future Enhancements

Potential improvements to the design system:

1. **Dark Mode Support**: Extend tokens to support multiple themes
2. **Brand Variants**: Support for different brand configurations
3. **Animation Tokens**: More sophisticated animation presets
4. **Responsive Tokens**: Breakpoint-specific token values
5. **Accessibility Tokens**: High contrast and reduced motion variants

---

**Remember**: The design system is a living document. As the application grows, the design tokens
should evolve to meet new requirements while maintaining consistency and usability.

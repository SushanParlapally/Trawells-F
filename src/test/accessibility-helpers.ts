/**
 * Accessibility testing helper functions
 * Compatible with existing backend - no API dependencies
 */

// Color contrast calculation utilities
export const hexToRgb = (
  hex: string
): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : null;
};

export const calculateContrastRatio = (
  color1: string,
  color2: string
): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const luminance1 = calculateLuminance(rgb1);
  const luminance2 = calculateLuminance(rgb2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
};

const calculateLuminance = (rgb: {
  r: number;
  g: number;
  b: number;
}): number => {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
};

// ARIA validation utilities
export const validateAriaLabel = (element: HTMLElement): boolean => {
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  const title = element.getAttribute('title');
  const alt = element.getAttribute('alt');

  return !!(ariaLabel || ariaLabelledBy || title || alt);
};

export const validateAriaDescribedBy = (element: HTMLElement): boolean => {
  const ariaDescribedBy = element.getAttribute('aria-describedby');
  return !!ariaDescribedBy;
};

export const validateRole = (
  element: HTMLElement,
  expectedRole?: string
): boolean => {
  const role = element.getAttribute('role');
  if (expectedRole) {
    return role === expectedRole;
  }
  return !!role;
};

// Focus management utilities
export const validateFocusable = (element: HTMLElement): boolean => {
  const tabIndex = element.getAttribute('tabindex');
  const isButton = element.tagName === 'BUTTON';
  const isLink = element.tagName === 'A';
  const isInput = element.tagName === 'INPUT';
  const isSelect = element.tagName === 'SELECT';
  const isTextarea = element.tagName === 'TEXTAREA';

  return (
    tabIndex !== '-1' &&
    (isButton ||
      isLink ||
      isInput ||
      isSelect ||
      isTextarea ||
      tabIndex !== null)
  );
};

export const validateFocusIndicator = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  const outline = style.outline;
  const boxShadow = style.boxShadow;
  const border = style.border;

  return !!(outline !== 'none' || boxShadow !== 'none' || border !== 'none');
};

// Keyboard navigation utilities
export const simulateTabNavigation = (
  container: HTMLElement
): HTMLElement[] => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const focusableArray = Array.from(focusableElements) as HTMLElement[];
  return focusableArray;
};

export const validateTabOrder = (container: HTMLElement): boolean => {
  const focusableElements = simulateTabNavigation(container);
  return focusableElements.length > 0;
};

// Screen reader utilities
export const validateLiveRegion = (element: HTMLElement): boolean => {
  const ariaLive = element.getAttribute('aria-live');
  const ariaAtomic = element.getAttribute('aria-atomic');
  const ariaRelevant = element.getAttribute('aria-relevant');

  return !!(ariaLive || ariaAtomic || ariaRelevant);
};

export const validateHeadingHierarchy = (container: HTMLElement): boolean => {
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingLevels = Array.from(headings).map(h =>
    parseInt(h.tagName.charAt(1))
  );

  // Check for proper hierarchy (no skipping levels)
  for (let i = 1; i < headingLevels.length; i++) {
    const current = headingLevels[i];
    const previous = headingLevels[i - 1];
    if (current && previous && current - previous > 1) {
      return false;
    }
  }

  return true;
};

// Form accessibility utilities
export const validateFormLabels = (form: HTMLElement): boolean => {
  const inputs = form.querySelectorAll('input, select, textarea');
  let allLabeled = true;

  inputs.forEach(input => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    const label = id ? form.querySelector(`label[for="${id}"]`) : null;

    if (!ariaLabel && !ariaLabelledBy && !label) {
      allLabeled = false;
    }
  });

  return allLabeled;
};

export const validateRequiredFields = (form: HTMLElement): boolean => {
  const requiredInputs = form.querySelectorAll('[required]');
  let allAccessible = true;

  requiredInputs.forEach(input => {
    const ariaRequired = input.getAttribute('aria-required');
    const required = input.getAttribute('required');

    if (!ariaRequired && !required) {
      allAccessible = false;
    }
  });

  return allAccessible;
};

// Error handling utilities
export const validateErrorAnnouncement = (container: HTMLElement): boolean => {
  const errorElements = container.querySelectorAll(
    '[role="alert"], [aria-live="assertive"]'
  );
  return errorElements.length > 0;
};

export const validateErrorAssociation = (input: HTMLElement): boolean => {
  const id = input.getAttribute('id');
  const ariaDescribedBy = input.getAttribute('aria-describedby');
  const form = input.closest('form');
  const errorElement = form?.querySelector(`[id="${ariaDescribedBy}"]`);

  return !!(id && ariaDescribedBy && errorElement);
};

// Comprehensive accessibility test
export const runAccessibilityTest = (
  container: HTMLElement
): {
  passed: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Test focusable elements
  const focusableElements = simulateTabNavigation(container);
  if (focusableElements.length === 0) {
    issues.push('No focusable elements found');
  }

  // Test ARIA labels
  focusableElements.forEach(element => {
    if (!validateAriaLabel(element)) {
      issues.push(`Element ${element.tagName} missing accessible name`);
    }
  });

  // Test heading hierarchy
  if (!validateHeadingHierarchy(container)) {
    issues.push('Improper heading hierarchy detected');
  }

  // Test forms
  const forms = container.querySelectorAll('form');
  forms.forEach(form => {
    if (!validateFormLabels(form as HTMLElement)) {
      issues.push('Form elements missing proper labels');
    }
    if (!validateRequiredFields(form as HTMLElement)) {
      issues.push('Required fields not properly marked');
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

// Test utilities for components
export const testComponentAccessibility = async (
  component: HTMLElement,
  options: {
    skipFocusTest?: boolean;
    skipContrastTest?: boolean;
    skipAriaTest?: boolean;
  } = {}
): Promise<{ passed: boolean; issues: string[] }> => {
  const issues: string[] = [];

  if (!options.skipFocusTest) {
    const focusableElements = simulateTabNavigation(component);
    if (focusableElements.length === 0) {
      issues.push('Component has no focusable elements');
    }
  }

  if (!options.skipAriaTest) {
    const ariaTest = runAccessibilityTest(component);
    issues.push(...ariaTest.issues);
  }

  return {
    passed: issues.length === 0,
    issues,
  };
};

// Export all utilities
export default {
  hexToRgb,
  calculateContrastRatio,
  validateAriaLabel,
  validateAriaDescribedBy,
  validateRole,
  validateFocusable,
  validateFocusIndicator,
  simulateTabNavigation,
  validateTabOrder,
  validateLiveRegion,
  validateHeadingHierarchy,
  validateFormLabels,
  validateRequiredFields,
  validateErrorAnnouncement,
  validateErrorAssociation,
  runAccessibilityTest,
  testComponentAccessibility,
};

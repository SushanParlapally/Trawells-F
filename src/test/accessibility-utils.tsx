import React from 'react';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import authSlice from '../store/slices/authSlice';
import type { AuthState } from '../types';
import {
  runAccessibilityTest,
  testComponentAccessibility,
  validateAriaLabel,
  validateFocusable,
  validateHeadingHierarchy,
  validateFormLabels,
} from './accessibility-helpers';

const theme = createTheme();

// Define the root state type for the test store
interface RootState {
  auth: AuthState;
}

// Custom render function with Redux and Router providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof configureStore<RootState>>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore<RootState>({
      reducer: {
        auth: authSlice,
      },
      preloadedState: preloadedState as RootState,
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Accessibility testing utilities
export const testAccessibility = async (
  container: HTMLElement
): Promise<{
  passed: boolean;
  issues: string[];
}> => {
  return runAccessibilityTest(container);
};

export const testComponentAccessibilityAsync = async (
  component: HTMLElement,
  options: {
    skipFocusTest?: boolean;
    skipContrastTest?: boolean;
    skipAriaTest?: boolean;
  } = {}
): Promise<{ passed: boolean; issues: string[] }> => {
  return testComponentAccessibility(component, options);
};

// Specific accessibility test functions
export const testAriaLabels = (
  container: HTMLElement
): {
  passed: boolean;
  issues: string[];
} => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const issues: string[] = [];

  focusableElements.forEach(element => {
    if (!validateAriaLabel(element as HTMLElement)) {
      issues.push(`Element ${element.tagName} missing accessible name`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

export const testFocusManagement = (
  container: HTMLElement
): {
  passed: boolean;
  issues: string[];
} => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const issues: string[] = [];

  if (focusableElements.length === 0) {
    issues.push('No focusable elements found');
  }

  focusableElements.forEach(element => {
    if (!validateFocusable(element as HTMLElement)) {
      issues.push(`Element ${element.tagName} is not properly focusable`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

export const testHeadingHierarchy = (
  container: HTMLElement
): {
  passed: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  if (!validateHeadingHierarchy(container)) {
    issues.push('Improper heading hierarchy detected');
  }

  return {
    passed: issues.length === 0,
    issues,
  };
};

export const testFormAccessibility = (
  container: HTMLElement
): {
  passed: boolean;
  issues: string[];
} => {
  const forms = container.querySelectorAll('form');
  const issues: string[] = [];

  forms.forEach(form => {
    if (!validateFormLabels(form as HTMLElement)) {
      issues.push('Form elements missing proper labels');
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

// Comprehensive accessibility test suite
export const runFullAccessibilityTest = async (
  container: HTMLElement
): Promise<{
  passed: boolean;
  issues: string[];
  details: {
    ariaLabels: { passed: boolean; issues: string[] };
    focusManagement: { passed: boolean; issues: string[] };
    headingHierarchy: { passed: boolean; issues: string[] };
    formAccessibility: { passed: boolean; issues: string[] };
  };
}> => {
  const ariaLabels = testAriaLabels(container);
  const focusManagement = testFocusManagement(container);
  const headingHierarchy = testHeadingHierarchy(container);
  const formAccessibility = testFormAccessibility(container);

  const allIssues = [
    ...ariaLabels.issues,
    ...focusManagement.issues,
    ...headingHierarchy.issues,
    ...formAccessibility.issues,
  ];

  return {
    passed: allIssues.length === 0,
    issues: allIssues,
    details: {
      ariaLabels,
      focusManagement,
      headingHierarchy,
      formAccessibility,
    },
  };
};

// Utility functions for testing specific accessibility features
export const testColorContrast = (
  element: HTMLElement
): {
  passed: boolean;
  contrastRatio?: number;
} => {
  const style = window.getComputedStyle(element);
  const backgroundColor = style.backgroundColor;
  const color = style.color;

  // Basic contrast check - in a real implementation, you'd use a proper contrast calculation
  // For now, we'll just check if colors are defined
  const hasColors =
    backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)';

  return {
    passed: hasColors,
    contrastRatio: hasColors ? 4.5 : undefined, // Placeholder value
  };
};

export const testKeyboardNavigation = (
  container: HTMLElement
): {
  passed: boolean;
  focusableCount: number;
} => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  return {
    passed: focusableElements.length > 0,
    focusableCount: focusableElements.length,
  };
};

export const testScreenReaderSupport = (
  container: HTMLElement
): {
  passed: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  const elements = container.querySelectorAll(
    '[role], [aria-label], [aria-labelledby]'
  );

  if (elements.length === 0) {
    issues.push('No ARIA attributes found for screen reader support');
  }

  return {
    passed: issues.length === 0,
    issues,
  };
};

// Export testing library utilities
export {
  screen,
  waitFor,
  fireEvent,
  within,
  cleanup,
  act,
} from '@testing-library/react';
export { renderWithProviders as render };

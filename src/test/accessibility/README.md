# Accessibility Testing Guide

This directory contains comprehensive accessibility testing utilities and tests for the Travel Desk
Management System frontend application.

## Overview

Our accessibility testing strategy ensures WCAG 2.1 AA compliance and provides a great user
experience for all users, including those using assistive technologies.

## Testing Levels

### 1. Unit Testing with jest-axe

- **File**: `accessibility.test.tsx`
- **Purpose**: Test individual components for accessibility violations
- **Tools**: jest-axe, @testing-library/react
- **Coverage**: WCAG 2.1 AA compliance, keyboard navigation, ARIA attributes

### 2. End-to-End Testing with Playwright

- **File**: `../e2e/accessibility.spec.ts`
- **Purpose**: Test complete user workflows for accessibility
- **Tools**: @axe-core/playwright, Playwright
- **Coverage**: Full page accessibility, keyboard navigation flows, screen reader compatibility

### 3. Helper Utilities

- **File**: `accessibility-helpers.ts`
- **Purpose**: Reusable testing utilities for accessibility validation
- **Features**: Color contrast calculation, focus management testing, ARIA validation

## Running Accessibility Tests

### Unit Tests

```bash
# Run all accessibility unit tests
npm run test -- accessibility.test.tsx

# Run with coverage
npm run test:coverage -- accessibility.test.tsx

# Run in watch mode
npm run test -- accessibility.test.tsx --watch
```

### End-to-End Tests

```bash
# Run accessibility E2E tests
npm run test:e2e -- accessibility.spec.ts

# Run with headed browser
npm run test:e2e:headed -- accessibility.spec.ts

# Run with UI mode
npm run test:e2e:ui -- accessibility.spec.ts
```

## Test Categories

### WCAG 2.1 AA Compliance

- **Automated Testing**: Uses axe-core to detect accessibility violations
- **Manual Testing**: Validates complex interactions and user flows
- **Coverage**: All WCAG 2.1 Level A and AA success criteria

### Keyboard Navigation

- **Tab Order**: Ensures logical tab sequence through interactive elements
- **Keyboard Shortcuts**: Tests Enter, Space, Arrow keys, and Escape functionality
- **Focus Management**: Validates focus trapping in modals and proper focus restoration

### Screen Reader Compatibility

- **ARIA Labels**: Ensures all interactive elements have accessible names
- **Live Regions**: Tests dynamic content announcements
- **Semantic Structure**: Validates proper heading hierarchy and landmark usage

### Color Contrast and Visual Accessibility

- **Contrast Ratios**: Validates minimum 4.5:1 contrast for normal text, 3:1 for large text
- **Color Independence**: Ensures information isn't conveyed through color alone
- **Focus Indicators**: Tests visible focus indicators for keyboard users

## Writing Accessibility Tests

### Basic Component Test

```typescript
import { render, testAccessibility } from '../accessibility-utils';

test('should be accessible', async () => {
  const { container } = render(<MyComponent />);
  await testAccessibility(container);
});
```

### Keyboard Navigation Test

```typescript
import { render } from '../accessibility-utils';
import userEvent from '@testing-library/user-event';

test('should support keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();

  await user.keyboard('{Enter}');
  // Assert expected behavior
});
```

### ARIA Attributes Test

```typescript
import { render, testAriaAttributes } from '../accessibility-utils';

test('should have proper ARIA attributes', () => {
  render(<MyComponent />);

  const element = screen.getByRole('button');
  const ariaCheck = testAriaAttributes(element);

  expect(ariaCheck.hasAccessibleName).toBe(true);
  expect(ariaCheck.hasProperRole).toBe(true);
});
```

## Common Accessibility Issues and Solutions

### Missing Accessible Names

**Problem**: Interactive elements without accessible names **Solution**: Add `aria-label`,
`aria-labelledby`, or visible text content

```tsx
// Bad
<button onClick={handleClick}>×</button>

// Good
<button onClick={handleClick} aria-label="Close dialog">×</button>
```

### Poor Focus Management

**Problem**: Focus not properly managed in modals or dynamic content **Solution**: Implement focus
trapping and restoration

```tsx
// Good
const Modal = ({ isOpen, onClose }) => {
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div role='dialog' aria-modal='true'>
      <button ref={firstFocusableRef} onClick={onClose}>
        Close
      </button>
    </div>
  );
};
```

### Missing Form Labels

**Problem**: Form inputs without proper labels **Solution**: Use explicit labels or aria-label

```tsx
// Bad
<input type="email" placeholder="Email" />

// Good
<div>
  <label htmlFor="email">Email Address</label>
  <input id="email" type="email" required />
</div>
```

### Insufficient Color Contrast

**Problem**: Text with poor contrast ratios **Solution**: Use colors that meet WCAG contrast
requirements

```css
/* Bad - insufficient contrast */
.text {
  color: #999999;
  background-color: #ffffff;
}

/* Good - meets WCAG AA */
.text {
  color: #333333;
  background-color: #ffffff;
}
```

## Accessibility Checklist

### Before Submitting Code

- [ ] Run automated accessibility tests
- [ ] Test keyboard navigation manually
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios
- [ ] Validate ARIA attributes
- [ ] Test focus management
- [ ] Ensure error messages are announced
- [ ] Verify responsive design accessibility

### Component Requirements

- [ ] All interactive elements have accessible names
- [ ] Proper semantic HTML structure
- [ ] Keyboard navigation support
- [ ] ARIA attributes where needed
- [ ] Error states properly announced
- [ ] Loading states accessible
- [ ] Focus indicators visible

### Form Requirements

- [ ] All inputs have labels
- [ ] Required fields indicated
- [ ] Error messages associated with fields
- [ ] Fieldsets with legends for grouped inputs
- [ ] Validation errors announced
- [ ] Submit buttons clearly labeled

### Table Requirements

- [ ] Table has caption
- [ ] Headers have scope attributes
- [ ] Sortable columns indicated
- [ ] Row/column headers properly marked
- [ ] Complex tables have summaries

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Continuous Integration

Accessibility tests are integrated into our CI/CD pipeline:

1. **Pre-commit**: Basic accessibility linting
2. **Pull Request**: Full accessibility test suite
3. **Deployment**: Accessibility regression testing

## Reporting Issues

When accessibility issues are found:

1. Create detailed bug reports with WCAG reference
2. Include steps to reproduce
3. Provide suggested solutions
4. Tag with accessibility label
5. Assign appropriate priority based on impact

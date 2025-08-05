import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test.describe('WCAG 2.1 AA Compliance', () => {
    test('should not have accessibility violations on login page', async ({
      page,
    }) => {
      const accessibilityScanResults = await new AxeBuilder({
        page,
      })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should not have accessibility violations on employee dashboard', async ({
      page,
    }) => {
      // Mock login for testing
      await page.route('**/api/auth/login', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'mock-token',
            user: { id: 1, email: 'employee@test.com', role: 'Employee' },
          }),
        });
      });

      // Login as employee
      await page.fill('input[type="email"]', 'employee@test.com');

      await page.fill('input[type="password"]', 'password123');

      await page.click('button[type="submit"]');

      await page.waitForTimeout(1000);

      // Wait for navigation
      const accessibilityScanResults = await new AxeBuilder({
        page,
      })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support keyboard navigation on login form', async ({
      page,
    }) => {
      // Test Tab navigation
      await page.keyboard.press('Tab');

      const emailInput = page.locator('input[type="email"]');

      await expect(emailInput).toBeFocused();

      await page.keyboard.press('Tab');

      const passwordInput = page.locator('input[type="password"]');

      await expect(passwordInput).toBeFocused();

      await page.keyboard.press('Tab');

      const loginButton = page.locator('button[type="submit"]');

      await expect(loginButton).toBeFocused();

      // Test Enter key submission
      await page.fill('input[type="email"]', 'test@test.com');

      await page.fill('input[type="password"]', 'password123');

      await page.keyboard.press('Enter');

      // Should attempt login
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Screen Reader Compatibility', () => {
    test('should have proper ARIA labels and roles', async ({ page }) => {
      // Check login form
      const emailInput = page.locator('input[type="email"]');

      await expect(emailInput).toHaveAttribute('aria-label');

      const passwordInput = page.locator('input[type="password"]');

      await expect(passwordInput).toHaveAttribute('aria-label');

      const loginButton = page.locator('button[type="submit"]');

      await expect(loginButton).toHaveAttribute('aria-label');
    });

    test('should have proper heading structure', async ({ page }) => {
      // Check for proper heading hierarchy
      const h1Elements = page.locator('h1');

      await expect(h1Elements).toHaveCount(1);

      const h2Elements = page.locator('h2');

      await expect(h2Elements).toHaveCount(1);
    });
  });

  test.describe('Color Contrast', () => {
    test('should have sufficient color contrast', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({
        page,
      })
        .withTags(['wcag2aa'])
        .analyze();

      const colorContrastViolations =
        accessibilityScanResults.violations.filter(
          violation => violation.id === 'color-contrast'
        );

      expect(colorContrastViolations).toEqual([]);
    });
  });

  test.describe('Focus Management', () => {
    test('should maintain focus when modal opens', async ({ page }) => {
      // Navigate to a page with modals
      await page.goto('/dashboard');

      // Find and click a button that opens a modal
      const modalTrigger = page.locator('[data-testid="open-modal-button"]');

      if (await modalTrigger.isVisible()) {
        await modalTrigger.click();

        // Check that focus is trapped in modal
        const modal = page.locator('[data-testid="modal"]');

        await expect(modal).toBeVisible();

        // Test that focus doesn't escape modal
        await page.keyboard.press('Tab');

        const focusedElement = page.locator(':focus');

        await expect(focusedElement).toBeVisible();
      }
    });
  });

  test.describe('Form Accessibility', () => {
    test('should have proper form labels and associations', async ({
      page,
    }) => {
      await page.goto('/create-request');

      // Check that form inputs have proper labels
      const formInputs = page.locator('input, select, textarea');

      for (let i = 0; i < (await formInputs.count()); i++) {
        const input = formInputs.nth(i);

        const hasLabel = await input.evaluate(el => {
          const id = el.getAttribute('id');
          if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            return !!label;
          }
          return false;
        });

        expect(hasLabel).toBeTruthy();
      }
    });
  });

  test.describe('Navigation Accessibility', () => {
    test('should have proper navigation landmarks', async ({ page }) => {
      await page.goto('/dashboard');

      // Check for navigation landmarks
      const nav = page.locator('nav');

      await expect(nav).toBeVisible();

      // Check for main landmark
      const main = page.locator('main');

      await expect(main).toBeVisible();
    });
  });
});

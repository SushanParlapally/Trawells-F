import { test, expect, devices } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';

// Test across different browsers and devices
const browserConfigs = [
  { name: 'Desktop Chrome', ...devices['Desktop Chrome'] },
  { name: 'Desktop Firefox', ...devices['Desktop Firefox'] },
  { name: 'Desktop Safari', ...devices['Desktop Safari'] },
  { name: 'Mobile Chrome', ...devices['Pixel 5'] },
  { name: 'Mobile Safari', ...devices['iPhone 12'] },
  { name: 'Tablet', ...devices['iPad Pro'] },
];

test.describe('Cross-Browser Compatibility', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
  });

  // Run login test across all browsers
  for (const config of browserConfigs) {
    test(`Login functionality works on ${config.name}`, async ({ page }) => {
      // Set viewport for mobile devices
      if (config.name.includes('Mobile') || config.name.includes('Tablet')) {
        await page.setViewportSize({
          width: config.viewport!.width,
          height: config.viewport!.height,
        });
      }

      await authHelpers.login('employee');

      // Verify responsive layout
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });
  }

  test('Navigation works consistently across browsers', async ({ page }) => {
    await authHelpers.login('employee');

    // Test navigation menu functionality
    await page.click('[data-testid="nav-create-request"]');
    await expect(page).toHaveURL(/\/requests\/create/);

    await page.click('[data-testid="nav-my-requests"]');
    await expect(page).toHaveURL(/\/requests\/my/);

    // Test logout functionality
    await authHelpers.logout();
    await expect(page).toHaveURL('/login');
  });

  test('Form validation works across browsers', async ({ page }) => {
    await authHelpers.login('employee');
    await page.click('[data-testid="create-request-button"]');

    // Try to submit empty form
    await page.click('[data-testid="submit-request-button"]');

    // Verify validation errors appear
    await expect(
      page.locator('[data-testid="validation-error"]')
    ).toBeVisible();

    // Fill required fields
    await page.fill('[data-testid="reason-for-travel-input"]', 'Test travel');
    await page.selectOption('[data-testid="project-select"]', '1');
    await page.selectOption('[data-testid="department-select"]', '1');
    await page.fill('[data-testid="from-location-input"]', 'New York');
    await page.fill('[data-testid="to-location-input"]', 'Los Angeles');
    await page.fill('[data-testid="from-date-input"]', '2024-02-01');
    await page.fill('[data-testid="to-date-input"]', '2024-02-03');

    // Submit again
    await page.click('[data-testid="submit-request-button"]');

    // Should succeed this time
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});

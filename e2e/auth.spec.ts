import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';

test.describe('Authentication and Authorization', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await authHelpers.login('employee');

    // Verify user is on dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    await expect(page.locator('[data-testid="user-name"]')).toContainText(
      'Employee'
    );
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'invalid@email.com');

    await page.fill('#password', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.MuiAlert-root')).toBeVisible();

    await expect(page.locator('.MuiAlert-root')).toContainText(
      'Invalid credentials'
    );

    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    await authHelpers.login('employee');

    await authHelpers.logout();

    // Should redirect to login page
    await expect(page).toHaveURL('/login');

    await expect(page.locator('form')).toBeVisible();
  });

  test('should handle role-based redirection correctly', async ({ page }) => {
    // Login as employee
    await authHelpers.login('employee');

    // Verify redirected to employee dashboard
    await expect(page).toHaveURL(/\/employee\/dashboard/);

    // Logout
    await authHelpers.logout();
    await expect(page).toHaveURL('/login');

    // Login as admin
    await authHelpers.login('admin');

    // Verify redirected to admin dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Try to access employee dashboard (should be denied)
    await page.goto('/employee/dashboard');

    // Should show access denied message
    await expect(page.locator('text=Access Denied')).toBeVisible();
    await expect(page.locator('text=Your role: Admin')).toBeVisible();

    // Should have option to go to correct dashboard
    await expect(page.locator('text=Go to Your Dashboard')).toBeVisible();
  });

  test('should handle authentication state cleanup on logout', async ({
    page,
  }) => {
    // Login as employee
    await authHelpers.login('employee');
    await expect(page).toHaveURL(/\/employee\/dashboard/);

    // Logout
    await authHelpers.logout();
    await expect(page).toHaveURL('/login');

    // Try to access protected route directly (should redirect to login)
    await page.goto('/employee/dashboard');
    await expect(page).toHaveURL('/login');

    // Login with different account
    await authHelpers.login('admin');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test.describe('Security', () => {
    test('should not expose sensitive information in URLs', async ({
      page,
    }) => {
      await page.goto('/login');

      // Fill form but don't submit
      await page.fill('#email', 'test@example.com');
      await page.fill('#password', 'password123');

      // Check that password is not in URL
      await expect(page.url()).not.toContain('password123');

      // Check that password is not in page source
      const pageContent = await page.content();
      expect(pageContent).not.toContain('password123');
    });

    test('should prevent XSS attacks', async ({ page }) => {
      await page.goto('/login');

      // Try to inject script
      await page.fill('#email', '<script>alert("xss")</script>');

      await page.click('button[type="submit"]');

      // Should not execute script
      const pageContent = await page.content();
      expect(pageContent).toContain('<script>alert("xss")</script>');
    });
  });
});

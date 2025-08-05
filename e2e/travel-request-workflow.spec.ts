import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/auth-helpers';

test.describe('Travel Request Workflow', () => {
  test('Employee can create travel request', async ({ page }) => {
    // Step 1: Employee creates travel request
    const authHelpers = new AuthHelpers(page);
    await authHelpers.login(0); // Employee is at index 0
    await page.goto('/employee/dashboard');

    // Click on create travel request button
    await page.click('text=Create a new travel request');
    await expect(page).toHaveURL('/employee/travel-request/new');

    // Fill out the form
    await page.fill('[name="reasonForTravel"]', 'Business meeting in New York');
    await page.fill('[name="fromLocation"]', 'San Francisco');
    await page.fill('[name="toLocation"]', 'New York');
    await page.fill('[name="fromDate"]', '2024-03-15');
    await page.fill('[name="toDate"]', '2024-03-20');

    // Submit the form
    await page.click('button[type="submit"]');

    // Verify success message
    await expect(
      page.locator('text=Travel request submitted successfully')
    ).toBeVisible();
  });

  test('Employee can view their travel requests', async ({ page }) => {
    // Step 2: Employee views their requests
    const authHelpers = new AuthHelpers(page);
    await authHelpers.login(0); // Employee is at index 0
    await page.goto('/employee/dashboard');

    // Verify travel requests are displayed
    await expect(page.locator('text=My Travel Requests')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('Employee can view request details', async ({ page }) => {
    // Step 3: Employee views request details
    const authHelpers = new AuthHelpers(page);
    await authHelpers.login(0); // Employee is at index 0
    await page.goto('/employee/dashboard');

    // Click on a travel request to view details
    await page.click('tr:has-text("Business meeting")');

    // Verify details are displayed
    await expect(page.locator('text=Request Details')).toBeVisible();
    await expect(page.locator('text=Status:')).toBeVisible();
  });

  test('Manager can approve travel request', async ({ page }) => {
    // Step 4: Manager approves request
    const authHelpers = new AuthHelpers(page);
    await authHelpers.login(1); // Manager is at index 1
    await page.goto('/manager/dashboard');

    // Verify approval queue is displayed
    await expect(page.locator('text=Approval Queue')).toBeVisible();

    // Click approve button on a request
    await page.click('button:has-text("Approve")');

    // Verify approval success
    await expect(
      page.locator('text=Request approved successfully')
    ).toBeVisible();
  });

  test('Travel Admin can process approved request', async ({ page }) => {
    // Step 5: Travel Admin processes request
    const authHelpers = new AuthHelpers(page);
    await authHelpers.login(3); // TravelAdmin is at index 3
    await page.goto('/travel-admin/dashboard');

    // Verify approved requests are displayed
    await expect(page.locator('text=Approved Requests')).toBeVisible();

    // Click on process button
    await page.click('button:has-text("Process")');

    // Verify processing success
    await expect(
      page.locator('text=Request processed successfully')
    ).toBeVisible();
  });
});

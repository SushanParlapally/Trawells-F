import { Page, expect } from '@playwright/test';
import { testTravelRequest } from '../fixtures/test-data';

export class TravelRequestHelpers {
  constructor(private page: Page) {}

  async createTravelRequest(requestData = testTravelRequest) {
    // Navigate to create request page
    await this.page.click('[data-testid="create-request-button"]');

    // Fill basic request details
    await this.page.fill(
      '[data-testid="reason-for-travel-input"]',
      requestData.reasonForTravel
    );

    await this.page.fill(
      '[data-testid="from-location-input"]',
      requestData.fromLocation
    );

    await this.page.fill(
      '[data-testid="to-location-input"]',
      requestData.toLocation
    );

    await this.page.fill(
      '[data-testid="from-date-input"]',
      requestData.fromDate
    );

    await this.page.fill('[data-testid="to-date-input"]', requestData.toDate);

    // Select project
    await this.page.selectOption(
      '[data-testid="project-select"]',
      requestData.project.projectId.toString()
    );

    // Submit the request
    await this.page.click('[data-testid="submit-request-button"]');

    // Wait for success message and redirect
    await expect(
      this.page.locator('[data-testid="success-message"]')
    ).toBeVisible();

    // Extract request ID from success message
    const successMessage = await this.page
      .locator('[data-testid="success-message"]')
      .textContent();

    const requestIdMatch = successMessage?.match(/Request ID: (\w+)/);
    return requestIdMatch ? requestIdMatch[1] : '1';
  }

  async verifyRequestInHistory(requestId: string, expectedStatus: string) {
    // Navigate to request history
    await this.page.goto('/requests/my-requests');

    // Find the request row
    const requestRow = this.page.locator(
      `[data-testid="request-row-${requestId}"]`
    );

    await expect(requestRow).toBeVisible();

    // Verify status
    const statusCell = requestRow.locator('[data-testid="request-status"]');
    await expect(statusCell).toContainText(expectedStatus);
  }

  async viewRequestDetails(requestId: string) {
    // Navigate to request details
    await this.page.goto(`/requests/${requestId}`);

    // Verify details page loads
    await expect(
      this.page.locator('[data-testid="request-details"]')
    ).toBeVisible();

    return {
      getStatus: () =>
        this.page.locator('[data-testid="request-status"]').textContent(),
      getComments: () =>
        this.page.locator('[data-testid="comments-history"]').textContent(),
      getCreatedDate: () =>
        this.page.locator('[data-testid="created-date"]').textContent(),
    };
  }
}

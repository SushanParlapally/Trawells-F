import { Page } from '@playwright/test';
import { testUsers } from '../fixtures/test-data';

export class AuthHelpers {
  constructor(private page: Page) {}

  async login(userIndex: number) {
    const user = testUsers[userIndex];
    if (!user) {
      throw new Error(`User at index ${userIndex} not found`);
    }

    await this.page.goto('/login');
    await this.page.fill('[name="email"]', user.email);
    await this.page.fill('[name="password"]', user.password);
    await this.page.click('button[type="submit"]');

    // Wait for redirect to appropriate dashboard
    const dashboardRoute = this.getDashboardRoute(user.role.roleName);
    await this.page.waitForURL(`**${dashboardRoute}`);
  }

  getDashboardRoute(roleName: string): string {
    switch (roleName.toLowerCase()) {
      case 'employee':
        return '/employee/dashboard';
      case 'manager':
        return '/manager/dashboard';
      case 'traveladmin':
        return '/travel-admin/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  }

  async logout() {
    // Try to find logout button in sidebar first
    const sidebarLogout = this.page.locator('[data-testid="logout-button"]');
    if (await sidebarLogout.isVisible()) {
      await sidebarLogout.click();
    } else {
      // Fallback to user menu logout
      await this.page.click('[data-testid="user-menu"]');
      await this.page.click('[data-testid="logout-button"]');
    }

    await this.page.waitForURL('/login');
  }
}

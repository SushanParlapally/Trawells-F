# End-to-End Testing Documentation

## Overview

This directory contains comprehensive end-to-end tests for the Travel Desk Management System
frontend application using Playwright. The tests cover critical user workflows, role-based access
control, document management, and cross-browser compatibility.

## Test Structure

### Test Files

- **`auth.spec.ts`** - Authentication and authorization tests
- **`travel-request-workflow.spec.ts`** - Complete travel request workflows from creation to
  completion
- **`document-management.spec.ts`** - File upload, preview, and document management tests
- **`role-based-access.spec.ts`** - Role-based access control and navigation tests
- **`cross-browser-compatibility.spec.ts`** - Cross-browser and responsive design tests

### Utilities

- **`utils/auth-helpers.ts`** - Authentication helper functions
- **`utils/travel-request-helpers.ts`** - Travel request creation and management helpers
- **`utils/approval-helpers.ts`** - Request approval workflow helpers

### Test Data

- **`fixtures/test-data.ts`** - Test user accounts and sample data
- **`fixtures/`** - Sample files for document upload testing

## Running Tests

### Prerequisites

1. Ensure the development server is running:

   ```bash
   npm run dev
   ```

2. Install Playwright browsers (if not already installed):
   ```bash
   npm run test:e2e:install
   ```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug

# View test report
npm run test:e2e:report

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with specific tag
npx playwright test --grep="@smoke"
```

## Test Coverage

### Critical Workflows Tested

1. **Authentication Flow**
   - Login with valid/invalid credentials
   - Role-based dashboard redirection
   - Session management and expiration
   - Logout functionality

2. **Complete Travel Request Workflow**
   - Employee creates request → Manager approves → Travel Admin books → Complete
   - Request disapproval workflow
   - Return to employee workflow
   - Return to manager workflow
   - Email notifications at each step

3. **Role-Based Access Control**
   - Admin: Full system access
   - Travel Admin: Booking management access
   - Manager: Team approval access
   - Employee: Personal request access
   - Unauthorized access prevention

4. **Document Management**
   - File upload for different document types
   - Document preview functionality
   - Document removal
   - File type and size validation
   - Security and access control for documents

5. **Cross-Browser Compatibility**
   - Chrome, Firefox, Safari, Edge
   - Mobile and tablet responsiveness
   - Touch interactions
   - Performance across devices

### Test Data

The tests use predefined test users with different roles:

```typescript
const testUsers = {
  admin: { email: 'admin@traveldesk.com', role: 'Admin' },
  travelAdmin: { email: 'traveladmin@traveldesk.com', role: 'TravelAdmin' },
  manager: { email: 'manager@traveldesk.com', role: 'Manager' },
  employee: { email: 'employee@traveldesk.com', role: 'Employee' },
};
```

## Configuration

### Playwright Configuration

The `playwright.config.ts` file includes:

- Multiple browser configurations (Chrome, Firefox, Safari, Edge)
- Mobile device testing (Pixel 5, iPhone 12)
- Automatic dev server startup
- Screenshot and video recording on failure
- Test parallelization settings

### Environment Setup

Tests expect the following:

1. Development server running on `http://localhost:5173`
2. Backend API available and configured
3. Test user accounts created in the system
4. Sample files available in `e2e/fixtures/`

## Best Practices

### Test Organization

1. **Page Object Pattern**: Use helper classes for common operations
2. **Data-Driven Tests**: Use fixtures for test data
3. **Reusable Utilities**: Common functions in utils directory
4. **Clear Test Names**: Descriptive test names that explain the scenario

### Test Data Management

1. **Test Isolation**: Each test should be independent
2. **Cleanup**: Tests should clean up after themselves
3. **Mock Data**: Use consistent test data across tests
4. **File Fixtures**: Sample files for upload testing

### Assertions

1. **Explicit Waits**: Use `waitFor` methods instead of fixed delays
2. **Meaningful Assertions**: Assert on specific elements and content
3. **Error Handling**: Test both success and error scenarios
4. **Visual Verification**: Use screenshots for visual regression testing

## Debugging Tests

### Debug Mode

```bash
# Run in debug mode with browser visible
npm run test:e2e:debug

# Run specific test in debug mode
npx playwright test auth.spec.ts --debug
```

### Troubleshooting

1. **Test Failures**: Check screenshots and videos in `test-results/`
2. **Timing Issues**: Use proper wait conditions
3. **Element Not Found**: Verify data-testid attributes exist
4. **Network Issues**: Check if dev server is running

### Logging

Tests include console logging for debugging:

```typescript
console.log('Performance Metrics:', performanceMetrics);
```

## Continuous Integration

### CI Configuration

For CI/CD pipelines, use:

```bash
# Install dependencies and browsers
npm ci
npx playwright install --with-deps

# Run tests in CI mode
npm run test:e2e -- --reporter=junit
```

### Parallel Execution

Tests are configured to run in parallel for faster execution:

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
});
```

## Maintenance

### Updating Tests

1. **New Features**: Add tests for new functionality
2. **UI Changes**: Update selectors when UI changes
3. **Test Data**: Keep test data synchronized with backend
4. **Dependencies**: Update Playwright and related packages regularly

### Test Review

Regular review checklist:

- [ ] All critical workflows covered
- [ ] Tests are stable and not flaky
- [ ] Test data is up to date
- [ ] Performance is acceptable
- [ ] Cross-browser compatibility maintained

## Reporting

### Test Reports

Playwright generates HTML reports with:

- Test execution results
- Screenshots on failure
- Video recordings
- Performance metrics
- Browser compatibility matrix

### Metrics Tracked

- Test execution time
- Success/failure rates
- Browser-specific issues
- Performance benchmarks
- Coverage of critical paths

## Support

For issues with E2E tests:

1. Check test logs and screenshots
2. Verify test environment setup
3. Review recent code changes
4. Check browser compatibility
5. Consult Playwright documentation

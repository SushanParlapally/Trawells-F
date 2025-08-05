# Development Environment Setup

This document outlines the development environment configuration for the Travel Desk Frontend
application.

## Environment Variables

The application supports multiple environments with specific configurations:

- **Development** (`.env.development`): Local development with debug mode enabled
- **Staging** (`.env.staging`): Staging environment with warnings enabled
- **Production** (`.env.production`): Production environment with minimal logging

### Available Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL
- `VITE_APP_ENV`: Current environment (development/staging/production)
- `VITE_UPLOAD_MAX_SIZE`: Maximum file upload size (10MB default)
- `VITE_SUPPORTED_FILE_TYPES`: Supported file types for uploads
- `VITE_DEBUG_MODE`: Enable/disable debug mode
- `VITE_LOG_LEVEL`: Logging level (debug/warn/error)

## Build Configuration

### Vite Configuration

- **Build Target**: ES2015 for broad browser compatibility
- **Minification**: Terser for optimal compression
- **Source Maps**: Enabled for debugging
- **Code Splitting**: Automatic chunking by vendor, router, UI, state, and HTTP libraries
- **Path Aliases**: `@/` mapped to `src/` directory
- **Development Server**: Port 3000 with auto-open and CORS enabled

### TypeScript Configuration

- **Strict Mode**: Enabled with comprehensive type checking
- **Path Mapping**: Support for `@/*` imports
- **Testing Support**: Vitest globals and Jest DOM types included
- **Composite Configuration**: Separate configs for app and node environments

## Testing Framework

### Vitest Configuration

- **Environment**: jsdom for DOM testing
- **Global Test Functions**: Available without imports
- **Coverage Provider**: V8 with text, JSON, and HTML reports
- **Setup Files**: Automatic test environment setup

### Testing Utilities

- **Custom Render**: Pre-configured with Redux, Router, and Theme providers
- **Mock Store**: Configurable Redux store for testing
- **DOM Matchers**: Jest-DOM matchers for enhanced assertions

### Available Test Scripts

```bash
npm run test          # Run tests in watch mode
npm run test:ui       # Run tests with UI interface
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage report
```

## Code Quality Tools

### ESLint Configuration

- **TypeScript Support**: Full TypeScript linting with recommended rules
- **React Hooks**: Enforced hooks rules and dependencies
- **Prettier Integration**: Automatic code formatting
- **Test Files**: Special configuration for test files with relaxed rules

### Prettier Configuration

- **Code Style**: Single quotes, semicolons, 2-space indentation
- **Line Width**: 80 characters for code, 120 for JSON, 100 for Markdown
- **File Overrides**: Specific formatting rules for different file types

### Pre-commit Hooks

- **Lint-staged**: Automatic linting and formatting on staged files
- **Commit Message Validation**: Enforced conventional commit format
- **Supported Types**: feat, fix, docs, style, refactor, test, chore

### Available Quality Scripts

```bash
npm run lint          # Run ESLint
npm run lint:fix      # Run ESLint with auto-fix
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

## Development Workflow

1. **Environment Setup**: Copy `.env.example` to `.env.local` and configure
2. **Development Server**: Run `npm run dev` to start development server
3. **Code Quality**: Pre-commit hooks automatically run linting and formatting
4. **Testing**: Run tests with `npm run test` during development
5. **Build**: Use `npm run build` for production builds

## File Structure

```
src/
├── components/       # React components
├── hooks/           # Custom React hooks
├── services/        # API services and utilities
├── store/           # Redux store configuration
├── test/            # Test utilities and setup
├── types/           # TypeScript type definitions
└── utils/           # General utility functions
```

## Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Bundle Analysis**: Chunk size warnings and optimization
- **Tree Shaking**: Automatic dead code elimination
- **Asset Optimization**: Automatic compression and minification

## Browser Support

- **Target**: ES2015+ browsers
- **Compatibility**: Modern browsers with ES6 support
- **Polyfills**: Automatic polyfill injection as needed

## Next Steps

1. Start development server: `npm run dev`
2. Run tests: `npm run test`
3. Check code quality: `npm run lint`
4. Build for production: `npm run build`

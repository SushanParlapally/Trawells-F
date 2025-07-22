import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';

// Create a basic theme for testing
const theme = createTheme();

// Create a mock store for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      // Add your reducers here when they're created
      auth: (state = { user: null, isAuthenticated: false }, _action) => state,
    },
    preloadedState: initialState,
  });
};

interface AllTheProvidersProps {
  children: React.ReactNode;
  initialState?: any;
}

const AllTheProviders = ({
  children,
  initialState = {},
}: AllTheProvidersProps) => {
  const store = createMockStore(initialState);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </BrowserRouter>
    </Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialState?: any }
) => {
  const { initialState, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: props => (
      <AllTheProviders {...props} initialState={initialState} />
    ),
    ...renderOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };
export { createMockStore };

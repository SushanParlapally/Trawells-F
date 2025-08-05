import React from 'react';
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import authSlice from '../store/slices/authSlice';
import type { AuthState } from '../types';

// Define the root state type for the test store
interface RootState {
  auth: AuthState;
}

const theme = createTheme();

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof configureStore<RootState>>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore<RootState>({
      reducer: {
        auth: authSlice,
      },
      preloadedState: preloadedState as RootState,
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Export specific testing library utilities
export {
  screen,
  waitFor,
  fireEvent,
  within,
  cleanup,
  act,
} from '@testing-library/react';
export { renderWithProviders as render };

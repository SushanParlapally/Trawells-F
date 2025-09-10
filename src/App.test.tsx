import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/slices/authSlice';
import App from './App';

// Create a test store
const testStore = configureStore({
  reducer: {
    auth: authReducer,
  },
});

describe('App', () => {
  it('renders without crashing', async () => {
    await act(async () => {
      render(
        <Provider store={testStore}>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </Provider>
      );
    });
    expect(document.body).toBeInTheDocument();
  });
});

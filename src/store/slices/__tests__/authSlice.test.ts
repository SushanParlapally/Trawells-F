import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearError, setLoading, logout } from '../authSlice';

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it('should have correct initial state', () => {
    const state = store.getState().auth;
    expect(state).toEqual({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  });

  it('should handle clearError', () => {
    store.dispatch(clearError());
    const state = store.getState().auth;
    expect(state.error).toBeNull();
  });

  it('should handle setLoading', () => {
    store.dispatch(setLoading(true));
    const state = store.getState().auth;
    expect(state.loading).toBe(true);
  });

  it('should handle logout', () => {
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});

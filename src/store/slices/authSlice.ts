import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { LoginCredentials, AuthState, UserRole, User } from '../../types';
import { AuthService } from '../../services/auth/authService';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  LoginCredentials
>('auth/login', async (credentials: LoginCredentials, { rejectWithValue }) => {
  try {
    // Clear any existing stale data before login
    AuthService.removeToken();
    AuthService.removeUser();

    // Backend returns: { token: string }
    const response = await AuthService.login(credentials);
    // Get user from AuthService since backend only returns token
    const user = AuthService.getCurrentUser();
    if (!user) {
      throw new Error('Failed to get user information');
    }
    return { user, token: response.token };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    return rejectWithValue(errorMessage);
  }
});

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Backend doesn't have logout endpoint, so we just clear local data
      await AuthService.logout();
      return undefined;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const checkAuthStatus = createAsyncThunk<
  { user: User; token: string },
  void
>('auth/checkStatus', async (_, { rejectWithValue }) => {
  try {
    // Validate and clean authentication state
    if (!AuthService.validateAndCleanAuthState()) {
      throw new Error(
        'Authentication state was inconsistent and has been cleaned'
      );
    }

    const token = AuthService.getToken();
    if (!token || AuthService.isTokenExpired(token)) {
      throw new Error('No valid token found');
    }

    const user = AuthService.getCurrentUser();
    if (!user) {
      throw new Error('No user information found');
    }

    return { user, token };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Authentication check failed';
    return rejectWithValue(errorMessage);
  }
});

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
      // Clear token and user data from storage
      AuthService.removeToken();
      AuthService.removeUser();
    },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, state => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Even if logout fails, clear the auth state
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });

    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, state => {
        state.loading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, state => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null; // Don't show error for failed auth check
      });
  },
});

export const { clearError, setLoading, logout } = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectUserRole = (state: { auth: AuthState }): UserRole | null => {
  // First try to get role from Redux store user object
  const userRole = state.auth.user?.role?.roleName as UserRole;
  if (userRole) {
    return userRole;
  }

  // Fallback: try to get role from token if user object is not available
  try {
    const token = AuthService.getToken();
    if (token && !AuthService.isTokenExpired(token)) {
      const tokenPayload = AuthService.decodeToken(token);
      return tokenPayload.role as UserRole;
    }
  } catch (error) {
    console.warn('Failed to get role from token:', error);
  }

  return null;
};

export default authSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from './authService';

interface User {
    id: number;
    name: string;
    email: string;
    username: string;
    country?: string;
    city?: string;
    avatar?: string;
    login_method: string;
    is_profile_completed?: boolean | number;
    avatar_url?: string;
    role: string;
    is_blocked: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAuthChecking: boolean;
    isError: boolean;
    message: string;
    isGuest: boolean;
    // 2FA state
    requires2fa: boolean;
    pending2faEmail: string | null;
}

// Pre-load from localStorage to prevent auth flicker on refresh
const storedUserStr = localStorage.getItem('user');
const storedToken = localStorage.getItem('access_token');
const isGuestStored = localStorage.getItem('isGuest') === 'true';

let preloadedUser = null;
if (storedUserStr && storedToken) {
    try {
        preloadedUser = JSON.parse(storedUserStr);
    } catch (e) {
        console.error('Failed to parse stored user');
    }
}

const initialState: AuthState = {
    user: preloadedUser,
    isAuthenticated: !!preloadedUser || isGuestStored,
    isLoading: false,
    isAuthChecking: !preloadedUser && !isGuestStored,
    isError: false,
    message: '',
    isGuest: isGuestStored,
    requires2fa: false,
    pending2faEmail: null,
};

// Async Thunks
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: any, thunkAPI) => {
        try {
            return await authService.register(userData);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (userData: any, thunkAPI) => {
        try {
            return await authService.login(userData);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const verify2faOtp = createAsyncThunk(
    'auth/verify2fa',
    async (payload: { email: string; otp: string }, thunkAPI) => {
        try {
            return await authService.verify2fa(payload);
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, thunkAPI) => {
        try {
            return await authService.logout();
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async (_, thunkAPI) => {
        const token = localStorage.getItem('access_token');
        const isGuest = localStorage.getItem('isGuest') === 'true';
        if (isGuest) return thunkAPI.rejectWithValue('Guest Mode');
        if (!token) return thunkAPI.rejectWithValue('No token');

        try {
            return await authService.getUser();
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.message = '';
        },
        reset2fa: (state) => {
            state.requires2fa = false;
            state.pending2faEmail = null;
        },
        setCredentials: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.isLoading = false;
            state.isError = false;
        },
        guestLogin: (state) => {
            state.isAuthenticated = true;
            state.isGuest = true;
            state.user = {
                id: -1,
                name: 'Guest User',
                username: 'Guest',
                email: 'guest@example.com',
                login_method: 'guest',
                role: 'guest',
                is_blocked: false,
                is_profile_completed: true,
            };
            localStorage.setItem('isGuest', 'true');
            localStorage.setItem('user', JSON.stringify(state.user));
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.message = action.payload.message || 'Registration successful! Please check your email to verify your account.';
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
                state.user = null;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
                state.requires2fa = false;
                state.pending2faEmail = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.requires_2fa) {
                    // Admin 2FA required — do NOT log in yet, show OTP screen
                    state.requires2fa = true;
                    state.pending2faEmail = action.payload.email;
                    state.isAuthenticated = false;
                    state.user = null;
                } else {
                    // Normal user — log in immediately
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
                state.user = null;
            })
            // Verify 2FA OTP
            .addCase(verify2faOtp.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = '';
            })
            .addCase(verify2faOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.requires2fa = false;
                state.pending2faEmail = null;
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            })
            .addCase(verify2faOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isGuest = false;
                state.requires2fa = false;
                state.pending2faEmail = null;
                localStorage.removeItem('isGuest');
            })
            // Check Auth
            .addCase(checkAuthStatus.pending, (state) => {
                state.isAuthChecking = true;
            })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
                state.isAuthChecking = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.isAuthChecking = false;
                state.isAuthenticated = false;
                state.user = null;
                localStorage.removeItem('user');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            });
    },
});

export const { reset, reset2fa, setCredentials, guestLogin } = authSlice.actions;
export default authSlice.reducer;

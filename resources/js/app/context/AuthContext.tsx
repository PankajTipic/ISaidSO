import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    login_method: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure axios defaults
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
axios.defaults.withCredentials = true; // Important for SPA sanctum cookie if needed, but we are using token

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refresh_token'));
    const [isLoading, setIsLoading] = useState(true);

    // Set default auth header
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    useEffect(() => {
        // Initial user fetch
        const fetchUser = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get('/user');
                setUser(response.data);
            } catch (error) {
                // If 401, try refresh? Or just logout
                console.error('Failed to fetch user', error);
                // Try refresh immediately?
                await refreshSession();
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Refresh Token Logic
    useEffect(() => {
        if (!token) return;

        // Interceptor to handle 401s globally
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        // Call refresh endpoint with the refresh token
                        // Note: Normally refresh token is sent in body or specific header. 
                        // Our backend implementation of refresh() uses $request->user(), which means it expects a VALID token in Authorization header.
                        // BUT the backend method says: "Sanctum will authenticate... based on the refresh token provided"
                        // So we need to call the refresh endpoint with the REFRESH TOKEN as the Bearer token.

                        if (!refreshToken) throw new Error('No refresh token');

                        const refreshResponse = await axios.post('/refresh', {}, {
                            headers: { Authorization: `Bearer ${refreshToken}` }
                        });

                        const { access_token, refresh_token: newRefreshToken } = refreshResponse.data;

                        updateTokens(access_token, newRefreshToken);

                        // Update the original request header
                        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
                        return axios(originalRequest);

                    } catch (refreshError) {
                        // Refresh failed - logout
                        await logout();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [token, refreshToken]);

    const updateTokens = (accessToken: string, newRefreshToken: string) => {
        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    };

    const clearTokens = () => {
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const refreshSession = async () => {
        if (!refreshToken) {
            clearTokens();
            return;
        }
        try {
            const refreshResponse = await axios.post('/refresh', {}, {
                headers: { Authorization: `Bearer ${refreshToken}` }
            });
            const { access_token, refresh_token: newRefreshToken, user: userData } = refreshResponse.data;
            updateTokens(access_token, newRefreshToken);
            setUser(userData);
        } catch (e) {
            clearTokens();
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('/login', { email, password });
            const { user, access_token, refresh_token } = response.data;
            setUser(user);
            updateTokens(access_token, refresh_token);
        } catch (error) {
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await axios.post('/register', { name, email, password });
            const { user, access_token, refresh_token } = response.data;
            setUser(user);
            updateTokens(access_token, refresh_token);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/logout');
        } catch (e) {
            console.error('Logout failed', e);
        } finally {
            clearTokens();
        }
    };

    const googleLogin = () => {
        window.location.href = 'http://127.0.0.1:8000/api/auth/google';
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout, googleLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Create independent axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Request interceptor to add Access Token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for auto-refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('401 intercepted. Attempting refresh...');
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                console.log('No refresh token found. Logging out.');
                // No refresh token? Logout user
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/auth'; // Or handle via Redux action
                return Promise.reject(error);
            }

            try {
                console.log('Refreshing token...');
                // Call refresh endpoint WITH the refresh token
                const response = await axios.post(`${API_URL}/refresh`, {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` }
                });

                console.log('Token refreshed successfully.');
                const { access_token, refresh_token: newRefreshToken } = response.data;

                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', newRefreshToken);

                // Update original request
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return api(originalRequest);

            } catch (refreshError) {
                console.error('Refresh failed:', refreshError);
                // Refresh failed (token expired/invalid)
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

const authService = {
    register: async (userData: any) => {
        const response = await api.post('/register', userData);
        if (response.data) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        return response.data;
    },
    login: async (userData: any) => {
        const response = await api.post('/login', userData);
        if (response.data) {
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
        }
        return response.data;
    },
    logout: async () => {
        await api.post('/logout');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
    getUser: async () => {
        const response = await api.get('/user');
        return response.data;
    }
};

export default authService;

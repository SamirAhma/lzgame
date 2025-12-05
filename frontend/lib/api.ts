import axios from 'axios';
import { getApiUrl } from '@/lib/config/env';
import { API_ENDPOINTS, CUSTOM_EVENTS } from '@/lib/config/constants';
import { getToken, setToken, getRefreshToken, clearAuthData } from '@/lib/utils/storage';

const api = axios.create({
    baseURL: getApiUrl(),
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor for 401 handling and token refresh
let isRefreshing = false;
type FailedRequest = {
    resolve: (token: string | null) => void;
    reject: (error: unknown) => void;
};
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getRefreshToken();

            if (!refreshToken) {
                // No refresh token available, logout
                window.dispatchEvent(new Event(CUSTOM_EVENTS.AUTH_LOGOUT));
                isRefreshing = false;
                return Promise.reject(error);
            }

            try {
                // Use axios directly to avoid interceptors loop
                const response = await axios.post(`${getApiUrl()}${API_ENDPOINTS.AUTH_REFRESH}`, {
                    refreshToken: refreshToken
                });

                const { access_token } = response.data;

                setToken(access_token);

                api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
                originalRequest.headers['Authorization'] = 'Bearer ' + access_token;

                processQueue(null, access_token);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                // Refresh failed (expired or invalid), complete logout
                window.dispatchEvent(new Event(CUSTOM_EVENTS.AUTH_LOGOUT));
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const verifyEmail = async (token: string) => {
    return api.post(API_ENDPOINTS.AUTH_VERIFY_EMAIL, { token });
};

export const resendVerification = async (email: string) => {
    return api.post(API_ENDPOINTS.AUTH_RESEND_VERIFICATION, { email });
};

export const forgotPassword = async (email: string) => {
    return api.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
};

export const resetPassword = async (token: string, password: string) => {
    return api.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, { token, password });
};

export default api;


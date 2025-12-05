import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001',
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor for 401 handling and token refresh
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
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

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                // No refresh token available, logout
                window.dispatchEvent(new Event('auth:logout'));
                isRefreshing = false;
                return Promise.reject(error);
            }

            try {
                // We use axios directly to avoid interceptors loop if this fails (though baseURL is handy)
                // But using a fresh instance or just fetch might be safer to avoid complex loops.
                // However, simple api.post is fine usually if we don't catch 401 on it recursively.
                // But to be safe, let's use a fresh axios call or ensure this route doesn't require auth (it shouldn't).
                const response = await axios.post('http://localhost:3001/auth/refresh', {
                    refreshToken: refreshToken
                });

                const { access_token } = response.data;

                localStorage.setItem('token', access_token);

                // If backend returns a new refresh token, we should update it too. 
                // The current backend implementation (from what I saw) returns { access_token } only?
                // Let's check auth.service.ts again... 
                // It returns { access_token } only on line 104. So we keep the old refresh token (7 days).

                api.defaults.headers.common['Authorization'] = 'Bearer ' + access_token;
                originalRequest.headers['Authorization'] = 'Bearer ' + access_token;

                processQueue(null, access_token);
                isRefreshing = false;

                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                // Refresh failed (expired or invalid), complete logout
                window.dispatchEvent(new Event('auth:logout'));
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

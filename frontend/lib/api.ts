export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

export async function request(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add custom headers from options
    if (options.headers) {
        const customHeaders = options.headers as Record<string, string>;
        Object.assign(headers, customHeaders);
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // If we get a 401 and we're not already refreshing, try to refresh the token
        if (response.status === 401 && !isRefreshing) {
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

            if (!refreshToken) {
                // No refresh token available, redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
                throw new Error('Authentication required');
            }

            isRefreshing = true;

            try {
                // Attempt to refresh the access token
                const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                });

                if (!refreshResponse.ok) {
                    // Refresh failed, clear tokens and redirect to login
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                    }
                    processQueue(new Error('Session expired'));
                    throw new Error('Session expired');
                }

                const data = await refreshResponse.json();

                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', data.access_token);
                }

                isRefreshing = false;
                processQueue();

                // Retry the original request with the new token
                headers['Authorization'] = `Bearer ${data.access_token}`;
                const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                    ...options,
                    headers,
                });

                if (!retryResponse.ok) {
                    const errorData = await retryResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Request failed');
                }

                return retryResponse.json();
            } catch (error) {
                isRefreshing = false;
                processQueue(error);
                throw error;
            }
        }

        // If we're currently refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => {
                // Retry with new token
                const newToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (newToken) {
                    headers['Authorization'] = `Bearer ${newToken}`;
                }
                return fetch(`${API_URL}${endpoint}`, {
                    ...options,
                    headers,
                }).then((res) => {
                    if (!res.ok) {
                        throw new Error('Request failed');
                    }
                    return res.json();
                });
            });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Request failed');
        }

        return response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred');
    }
}

export async function logout() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (token) {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            // Ignore logout errors
            console.error('Logout error:', error);
        }
    }

    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    }
}

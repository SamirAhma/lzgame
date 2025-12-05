'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, setToken, clearAuthData } from '@/lib/utils/storage';
import { CUSTOM_EVENTS } from '@/lib/config/constants';

interface User {
    id: number;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    const login = (token: string) => {
        setToken(token);
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.sub, email: payload.email });
        router.refresh();
    };

    const logout = () => {
        clearAuthData();
        setUser(null);
        router.push('/');
    };

    useEffect(() => {
        const token = getToken();
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ id: payload.sub, email: payload.email });
            } catch (e) {
                clearAuthData();
            }
        }

        const handleLogout = () => {
            logout();
        };

        window.addEventListener(CUSTOM_EVENTS.AUTH_LOGOUT, handleLogout);

        return () => {
            window.removeEventListener(CUSTOM_EVENTS.AUTH_LOGOUT, handleLogout);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

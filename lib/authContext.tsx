import { create } from 'zustand';
import { api } from '@/lib/api';

interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
    restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,

    login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },

    restoreSession: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const user = await api.get<User>('/auth/me/');
            set({ user, token });
        } catch {
            localStorage.removeItem('token');
            set({ user: null, token: null });
        }
    },
}));
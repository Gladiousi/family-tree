import { create } from 'zustand';
import { api } from '@/lib/api';
import { AuthUser } from '@/types/store';
import { User } from '@/types/models';

type AuthContextState = {
    user: AuthUser | null;
    token: string | null;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
    restoreSession: () => Promise<void>;
};

export const useAuthStore = create<AuthContextState>((set) => ({
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
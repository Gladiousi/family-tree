import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  isRestoring: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isRestoring: true,

      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isRestoring: false });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isRestoring: false });
      },

      restoreSession: async () => {
        set({ isRestoring: true });
        const token = localStorage.getItem('token') || get().token;
        if (!token) {
          set({ isRestoring: false });
          return;
        }

        const currentState = get();
        if (currentState.user && currentState.token === token) {
          set({ isRestoring: false });
          return;
        }

        try {
          const user = await api.get<User>('/api/auth/me/');
          set({ user, token, isRestoring: false });
        } catch {
          localStorage.removeItem('token');
          set({ user: null, token: null, isRestoring: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token 
      }),
    }
  )
);
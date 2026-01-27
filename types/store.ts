import type { User, Family } from './models';

export type AuthUser = User;

export type AuthState = {
    user: AuthUser | null;
    token: string | null;
    isRestoring: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    register: (username: string, email: string, password: string, first_name?: string) => Promise<void>;
    restoreSession: () => Promise<void>;
    updateUser: (data: Partial<AuthUser>) => Promise<void>;
};

export type FamilyState = {
    families: Family[];
    selectedFamily: Family | null;
    isLoading: boolean;
    fetchFamilies: () => Promise<void>;
    selectFamily: (family: Family | null) => void;
    addFamily: (family: Family) => void;
    updateFamily: (family: Family) => void;
    removeFamily: (familyId: string) => void;
};



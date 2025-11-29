'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/loading';

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
    const { restoreSession, isRestoring, token } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsHydrated(true);
            const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
            if (currentToken) {
                restoreSession();
            } else {
                useAuthStore.setState({ isRestoring: false });
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [restoreSession, token]);

    if (!isHydrated || isRestoring) {
        return (
            <QueryClientProvider client={queryClient}>
                <div className="flex items-center justify-center min-h-screen bg-background">
                    <LoadingSpinner size="lg" text="Загрузка..." />
                </div>
                <Toaster position="top-right" richColors />
            </QueryClientProvider>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="top-right" richColors />
        </QueryClientProvider>
    );
}
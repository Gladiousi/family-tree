'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { sanitizeTextField, isValidUsername, rateLimiter } from '@/lib/security';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const { login } = useAuthStore();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (data: { username: string; password: string }) => {
            if (!rateLimiter.canMakeRequest('login', 5, 300000)) {
                throw new Error('Слишком много попыток входа. Попробуйте через 5 минут.');
            }

            const sanitizedUsername = sanitizeTextField(data.username.trim(), 50);
            if (!sanitizedUsername || !isValidUsername(sanitizedUsername)) {
                throw new Error('Неверный формат логина');
            }

            const response = await api.post<{ access: string; refresh: string }>('/api/auth/login/', {
                username: sanitizedUsername,
                password: data.password,
            });
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', response.access);
            }
            
            try {
                const user = await api.get('/api/auth/me/');
                return { ...response, user };
            } catch (error) {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }
                throw error;
            }
        },
        onSuccess: (data: any) => {
            setFormError(null);
            login(data.user, data.access);
            // rateLimiter.reset('login');
            toast.success('Вход выполнен успешно');
            router.push('/dashboard');
        },
        onError: (err: any) => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
            const message = err.message || 'Неверный логин или пароль';
            setFormError(message);
            toast.error(message);
        },
    });

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Вход</h1>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setFormError(null);
                        mutation.mutate({ username, password });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <Label>Логин</Label>
                        <Input value={username} placeholder='Введите логин' onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Пароль</Label>
                        <Input type="password" value={password} placeholder='Введите пароль' onChange={(e) => setPassword(e.target.value)} required />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Используйте пароль с минимум 8 символами, включая буквы и цифры.
                        </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Вход...' : 'Войти'}
                    </Button>
                    {formError && (
                        <p className="text-sm text-red-500 mt-2" role="alert">
                            {formError}
                        </p>
                    )}
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Нет аккаунта?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </div>
    );
}
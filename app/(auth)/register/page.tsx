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
import { sanitizeTextField, isValidEmail, isValidUsername, isValidPassword, rateLimiter } from '@/lib/security';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const { login } = useAuthStore();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: async (data: { username: string; email: string; password: string; first_name: string }) => {
            if (!rateLimiter.canMakeRequest('register', 3, 600000)) {
                throw new Error('Слишком много попыток регистрации. Попробуйте позже.');
            }

            const sanitizedUsername = sanitizeTextField(data.username.trim(), 30);
            const sanitizedEmail = sanitizeTextField(data.email.trim(), 100);
            const sanitizedFirstName = sanitizeTextField(data.first_name.trim(), 50);

            if (!sanitizedUsername || !isValidUsername(sanitizedUsername)) {
                throw new Error('Логин должен содержать 3-30 символов (буквы, цифры, подчеркивания)');
            }

            if (!sanitizedEmail || !isValidEmail(sanitizedEmail)) {
                throw new Error('Введите корректный email адрес');
            }

            if (!data.password || !isValidPassword(data.password)) {
                throw new Error('Пароль должен содержать минимум 8 символов, включая буквы и цифры');
            }

            return api.post('/api/auth/register/', {
                username: sanitizedUsername,
                email: sanitizedEmail,
                password: data.password,
                first_name: sanitizedFirstName || undefined,
            });
        },
        onSuccess: (data: any) => {
            if (data && data.user && data.access) {
                login(data.user, data.access);
                rateLimiter.reset('register');
                toast.success('Регистрация успешна!');
                router.push('/dashboard');
            } else {
                toast.error('Ошибка: неверный формат ответа от сервера');
            }
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка регистрации');
        },
    });

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Регистрация</h1>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate({ username, email, password, first_name: firstName });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <Label htmlFor="reg-username">Логин (username) *</Label>
                        <Input
                            id="reg-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={30}
                            required
                            placeholder="3-30 символов"
                            aria-required="true"
                        />
                    </div>
                    <div>
                        <Label htmlFor="reg-firstname">Имя</Label>
                        <Input
                            id="reg-firstname"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            maxLength={50}
                            placeholder="Ваше имя"
                        />
                    </div>
                    <div>
                        <Label htmlFor="reg-email">Email *</Label>
                        <Input
                            id="reg-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={100}
                            required
                            placeholder="example@mail.com"
                            aria-required="true"
                        />
                    </div>
                    <div>
                        <Label htmlFor="reg-password">Пароль *</Label>
                        <Input
                            id="reg-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={8}
                            required
                            placeholder="Минимум 8 символов"
                            aria-required="true"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Минимум 8 символов, включая буквы и цифры
                        </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    Уже есть аккаунт?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );
}
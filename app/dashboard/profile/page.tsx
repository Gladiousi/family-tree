'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Save, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingPage } from '@/components/ui/loading';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { sanitizeTextField, isValidEmail, isValidUsername, rateLimiter } from '@/lib/security';

interface UserData {
    id: string;
    username: string;
    email: string;
    first_name: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user: currentUser, login } = useAuthStore();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');

    const { data: user, isLoading } = useQuery({
        queryKey: ['user', currentUser?.id],
        queryFn: () => api.get<UserData>('/api/auth/me/'),
        enabled: !!currentUser,
    });

    useEffect(() => {
        if (!user) return;
        const timer = setTimeout(() => {
            setUsername(user.username);
            setEmail(user.email);
            setFirstName(user.first_name || '');
        }, 0);
        return () => clearTimeout(timer);
    }, [user]);

    const updateProfile = useMutation({
        mutationFn: async (data: { username: string; email: string; first_name: string }) => {
            if (!rateLimiter.canMakeRequest('update-profile', 10, 60000)) {
                throw new Error('Слишком много запросов. Подождите немного.');
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

            return api.patch('/api/auth/me/', {
                username: sanitizedUsername,
                email: sanitizedEmail,
                first_name: sanitizedFirstName || undefined,
            });
        },
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ['user', currentUser?.id] });
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
                login(updatedUser, token);
            }
            toast.success('Профиль успешно обновлен');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка обновления профиля');
        },
    });

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !email.trim()) {
            toast.error('Имя пользователя и email обязательны');
            return;
        }
        updateProfile.mutate({ username, email, first_name: firstName });
    }, [username, email, firstName, updateProfile]);

    if (isLoading) {
        return <LoadingPage text="Загрузка профиля..." />;
    }

    if (!currentUser) {
        router.push('/login');
        return null;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-2xl">
            <div className="mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <User className="h-8 w-8" />
                    Мой профиль
                </h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="username">Имя пользователя *</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            maxLength={30}
                            required
                            className="mt-2"
                            placeholder="3-30 символов"
                            aria-required="true"
                        />
                    </div>

                    <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={100}
                            required
                            className="mt-2"
                            placeholder="example@mail.com"
                            aria-required="true"
                        />
                    </div>

                    <div>
                        <Label htmlFor="firstName">Имя</Label>
                        <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            maxLength={50}
                            className="mt-2"
                            placeholder="Ваше имя"
                        />
                    </div>

                    <div className="flex gap-4 justify-end">
                        <Button type="submit" disabled={updateProfile.isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {updateProfile.isPending ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}


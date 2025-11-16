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

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuthStore();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: (data: any) =>
            api.post('/auth/login/', data),
        onSuccess: (data) => {
            login(data.user, data.access);
            toast.success('Вход выполнен');
            router.push('/dashboard');
        },
        onError: () => {
            toast.error('Неверный логин или пароль');
        },
    });

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Вход</h1>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate({ username, password });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <Label>Логин</Label>
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Пароль</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Вход...' : 'Войти'}
                    </Button>
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
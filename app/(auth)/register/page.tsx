'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuthStore();
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: (data: any) =>
            fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then((res) => res.json()),
        onSuccess: (data) => {
            login(data.user, data.token);
            router.push('/dashboard');
        },
    });

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 rounded-lg border bg-white p-8 shadow-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Регистрация</h1>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        mutation.mutate({ name, email, password });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <Label>Имя</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Email</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Пароль</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">
                        Зарегистрироваться
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
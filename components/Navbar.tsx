'use client';

import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Navbar() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    return (
        <header className="border-b bg-white">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-primary">
                    FamilyTree
                </Link>

                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{user.name}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                logout();
                                router.push('/login');
                            }}
                        >
                            Выйти
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/login">Войти</Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/register">Регистрация</Link>
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
}
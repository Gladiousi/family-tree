'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    Menu,
    X,
    LayoutDashboard,
    User,
    LogOut,
    LogIn,
    UserPlus,
    TreePine,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const userInitials = user
        ? (user.first_name || user.username)
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
        : '';

    return (
        <header className="sticky top-0 left-0 right-0 z-50 border-b bg-white/95 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 group transition-all duration-200"
                    >
                        <div className="relative">
                            <TreePine className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            FamilyTree
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-2">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium',
                                        'text-muted-foreground hover:text-primary hover:bg-primary/5',
                                        'transition-all duration-200 group'
                                    )}
                                >
                                    <LayoutDashboard className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    <span>Дашборд</span>
                                </Link>
                                <Link
                                    href="/dashboard/profile"
                                    className={cn(
                                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium',
                                        'text-muted-foreground hover:text-primary hover:bg-primary/5',
                                        'transition-all duration-200 group'
                                    )}
                                >
                                    <User className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                    <span>Профиль</span>
                                </Link>
                                <div className="flex items-center gap-3 ml-2 pl-3 border-l">
                                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-foreground max-w-[120px] truncate">
                                        {user.first_name || user.username}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            logout();
                                            router.push('/');
                                        }}
                                        className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span className="hidden lg:inline">Выйти</span>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="gap-2 hover:bg-primary/5 hover:text-primary transition-all duration-200"
                                >
                                    <Link href="/login">
                                        <LogIn className="h-4 w-4" />
                                        <span>Войти</span>
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    asChild
                                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    <Link href="/register">
                                        <UserPlus className="h-4 w-4" />
                                        <span>Регистрация</span>
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </nav>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden relative"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Меню"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <X
                                className={cn(
                                    'h-5 w-5 absolute transition-all duration-300',
                                    mobileMenuOpen
                                        ? 'rotate-0 opacity-100'
                                        : 'rotate-90 opacity-0'
                                )}
                            />
                            <Menu
                                className={cn(
                                    'h-5 w-5 absolute transition-all duration-300',
                                    mobileMenuOpen
                                        ? 'rotate-90 opacity-0'
                                        : 'rotate-0 opacity-100'
                                )}
                            />
                        </div>
                    </Button>
                </div>

                <div
                    className={cn(
                        'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
                        mobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
                    )}
                >
                    <div className="border-t pt-4 space-y-2">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                                        'text-muted-foreground hover:text-primary hover:bg-primary/5',
                                        'transition-all duration-200 active:scale-95'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LayoutDashboard className="h-5 w-5" />
                                    <span>Дашборд</span>
                                </Link>
                                <Link
                                    href="/dashboard/profile"
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                                        'text-muted-foreground hover:text-primary hover:bg-primary/5',
                                        'transition-all duration-200 active:scale-95'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User className="h-5 w-5" />
                                    <span>Профиль</span>
                                </Link>
                                <div className="pt-3 border-t space-y-2">
                                    <div className="flex items-center gap-3 px-3 py-2">
                                        <Avatar className="h-10 w-10 border-2 border-primary/20">
                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                {userInitials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">
                                                {user.first_name || user.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
                                        onClick={() => {
                                            logout();
                                            router.push('/');
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Выйти</span>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full gap-2 justify-start hover:bg-primary/5 hover:text-primary transition-all duration-200"
                                    asChild
                                >
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <LogIn className="h-4 w-4" />
                                        <span>Войти</span>
                                    </Link>
                                </Button>
                                <Button
                                    size="sm"
                                    className="w-full gap-2 justify-start bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-200 shadow-md"
                                    asChild
                                >
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <UserPlus className="h-4 w-4" />
                                        <span>Регистрация</span>
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

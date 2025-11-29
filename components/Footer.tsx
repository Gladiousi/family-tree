'use client';

import Link from 'next/link';
import { Heart, Home, LayoutDashboard, LogIn, Info, HelpCircle, TreePine } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-background/95 backdrop-blur-sm mt-auto">
            <div className="container mx-auto px-4 py-8 sm:py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <TreePine className="h-6 w-6 text-primary" />
                            <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                FamilyTree
                            </h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Сохраняйте истории вашей семьи и создавайте генеалогическое древо в
                            современном и удобном формате
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Home className="h-4 w-4 text-primary" />
                            Навигация
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    href="/"
                                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                                >
                                    <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                                    Главная
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                                >
                                    <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                                    Дашборд
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/login"
                                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                                >
                                    <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                                    Войти
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-primary" />
                            Помощь
                        </h4>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                                >
                                    <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                                    О проекте
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/support"
                                    className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                                >
                                    <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200" />
                                    Поддержка
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Info className="h-4 w-4 text-primary" />
                            Информация
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Свяжитесь с нами для получения помощи или оставьте отзыв о работе
                            платформы
                        </p>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Сделано с{' '}
                        <Heart className="h-4 w-4 text-destructive animate-pulse" /> для вашей
                        семьи
                    </p>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} FamilyTree. Все права защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
}


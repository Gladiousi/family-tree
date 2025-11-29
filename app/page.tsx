'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import {
    TreePine,
    Heart,
    Users,
    Image,
    ArrowRight,
    Sparkles,
    Shield,
    Zap,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';

export default function Home() {
    const { user, isRestoring } = useAuthStore();

    if (isRestoring) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-6">
                <LoadingSpinner size="lg" text="Загрузка..." />
            </div>
        );
    }

    const features = [
        {
            icon: TreePine,
            title: 'Генеалогическое древо',
            description: 'Создавайте визуальные деревья с удобным интерфейсом',
            color: 'text-primary',
        },
        {
            icon: Heart,
            title: 'Воспоминания',
            description: 'Сохраняйте фото, видео и истории вашей семьи',
            color: 'text-destructive',
        },
        {
            icon: Users,
            title: 'Совместная работа',
            description: 'Приглашайте родственников и работайте вместе',
            color: 'text-primary',
        },
        {
            icon: Image,
            title: 'Мультимедиа',
            description: 'Загружайте и организуйте семейные фотографии',
            color: 'text-primary',
        },
    ];

    const benefits = [
        {
            icon: Shield,
            text: 'Безопасное хранение данных',
        },
        {
            icon: Zap,
            text: 'Быстрый и удобный интерфейс',
        },
        {
            icon: Sparkles,
            text: 'Современные технологии',
        },
    ];

    return (
        <div className="min-h-screen">
            <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
                <div className="absolute -z-10 inset-0 opacity-[0.02]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
                <div className="container mx-auto px-4 sm:px-6 z-50 lg:px-8 py-20 sm:py-24 lg:py-32">
                    <div className="text-center max-w-4xl mx-auto space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                Сохраняйте историю вашей семьи
                            </span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Семейное Древо
                            </span>
                            <br />
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Ваша история в одном месте
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                            Сохраняйте истории, фото и связи поколений. Создавайте
                            генеалогические деревья и делитесь воспоминаниями с близкими.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            {user ? (
                                <Button
                                    asChild
                                    size="lg"
                                    className="group text-lg px-8 py-6 h-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Link href="/dashboard">
                                        Перейти в дашборд
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        asChild
                                        size="lg"
                                        className="group text-lg px-8 py-6 h-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <Link href="/register">
                                            Начать бесплатно
                                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        asChild
                                        className="text-lg px-8 py-6 h-auto border-2 hover:bg-primary/5 transition-all duration-300"
                                    >
                                        <Link href="/login">Войти</Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 sm:py-24 lg:py-32 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Возможности платформы
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Все инструменты для создания и управления вашим семейным древом
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Card
                                    key={index}
                                    className="p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 hover:-translate-y-1 group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                                            <Icon
                                                className={`h-6 w-6 sm:h-8 sm:w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-20 bg-muted/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
                            {benefits.map((benefit, index) => {
                                const Icon = benefit.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center gap-3 text-center"
                                    >
                                        <div className="p-4 rounded-full bg-primary/10">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm sm:text-base font-medium max-w-[150px]">
                                            {benefit.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

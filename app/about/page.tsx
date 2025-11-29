'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, TreePine, Heart, Users, Shield, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
    const features = [
        {
            icon: TreePine,
            title: 'Семейное древо',
            description:
                'Создавайте визуальное представление вашей семьи, добавляйте связи между родственниками и отслеживайте генеалогию',
            color: 'text-primary',
        },
        {
            icon: Heart,
            title: 'Воспоминания',
            description:
                'Сохраняйте важные моменты, фотографии и истории вашей семьи в одном месте',
            color: 'text-destructive',
        },
        {
            icon: Users,
            title: 'Совместная работа',
            description:
                'Приглашайте членов семьи для совместного управления семейным деревом и воспоминаниями',
            color: 'text-primary',
        },
        {
            icon: Shield,
            title: 'Безопасность',
            description:
                'Ваши данные защищены. Только приглашенные участники могут просматривать и редактировать информацию',
            color: 'text-primary',
        },
    ];

    const capabilities = [
        'Создание и редактирование генеалогического древа с визуальным представлением',
        'Добавление фотографий и биографий для каждого члена семьи',
        'Сохранение воспоминаний с привязкой к членам семьи',
        'Совместная работа с членами семьи',
        'Удобный и интуитивный интерфейс',
        'Безопасное хранение данных',
    ];

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-5xl">
            <Link href="/">
                <Button
                    variant="ghost"
                    size="sm"
                    className="mb-6 group hover:bg-primary/5 transition-all duration-200"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />{' '}
                    Назад
                </Button>
            </Link>

            <div className="space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">О платформе</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        О проекте
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        FamilyTree - это современная платформа для создания и управления
                        генеалогическими деревьями с удобным интерфейсом и мощными возможностями
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card
                                key={index}
                                className="p-6 sm:p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 hover:-translate-y-1 group"
                            >
                                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 w-fit mb-4">
                                    <Icon
                                        className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`}
                                    />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </Card>
                        );
                    })}
                </div>

                <Card className="p-6 sm:p-8 border-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold">Возможности платформы</h2>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-4">
                        {capabilities.map((capability, index) => (
                            <li
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors duration-200"
                            >
                                <span className="text-primary mt-1 shrink-0">•</span>
                                <span className="text-muted-foreground">{capability}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
}


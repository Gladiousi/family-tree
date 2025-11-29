'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, HelpCircle, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
    return (
        <div className="container mx-auto p-4 md:p-6 max-w-4xl">
            <Link href="/">
                <Button variant="ghost" size="sm" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                </Button>
            </Link>

            <div className="space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Поддержка</h1>
                    <p className="text-lg text-muted-foreground">
                        Нужна помощь? Мы здесь, чтобы помочь вам
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6">
                        <HelpCircle className="h-10 w-10 mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2">Часто задаваемые вопросы</h3>
                        <p className="text-muted-foreground mb-4">
                            Найдите ответы на наиболее распространенные вопросы
                        </p>
                        <div className="space-y-3 text-sm">
                            <div>
                                <h4 className="font-semibold mb-1">Как создать семью?</h4>
                                <p className="text-muted-foreground">
                                    После регистрации перейдите в раздел "Мои семьи" и нажмите "Создать семью"
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Как добавить человека в дерево?</h4>
                                <p className="text-muted-foreground">
                                    Откройте семейное древо и нажмите кнопку "Добавить человека"
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Как пригласить участника?</h4>
                                <p className="text-muted-foreground">
                                    На странице семьи нажмите "Добавить участника" и введите email пользователя
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <Mail className="h-10 w-10 mb-4 text-primary" />
                        <h3 className="text-xl font-semibold mb-2">Свяжитесь с нами</h3>
                        <p className="text-muted-foreground mb-4">
                            Если у вас есть вопросы или предложения, напишите нам
                        </p>
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="font-semibold">Email:</span> support@familytree.com
                            </p>
                            <p className="text-sm">
                                <span className="font-semibold">Время ответа:</span> в течение 24 часов
                            </p>
                        </div>
                    </Card>
                </div>

                <Card className="p-6">
                    <MessageCircle className="h-10 w-10 mb-4 text-primary" />
                    <h2 className="text-2xl font-bold mb-4">Руководство пользователя</h2>
                    <div className="space-y-4 text-muted-foreground">
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Создание семейного древа</h3>
                            <ol className="list-decimal list-inside space-y-1 ml-4">
                                <li>Создайте или выберите семью</li>
                                <li>Перейдите в раздел "Семейное древо"</li>
                                <li>Нажмите "Добавить человека" для создания первого узла</li>
                                <li>Перетащите узлы для создания связей между родственниками</li>
                            </ol>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground mb-2">Работа с воспоминаниями</h3>
                            <ol className="list-decimal list-inside space-y-1 ml-4">
                                <li>Перейдите в раздел "Воспоминания"</li>
                                <li>Нажмите "Добавить воспоминание"</li>
                                <li>Заполните информацию и привяжите к членам семьи</li>
                                <li>Сохраните воспоминание</li>
                            </ol>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}


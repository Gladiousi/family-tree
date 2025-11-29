'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingPage } from '@/components/ui/loading';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Family } from '@/types';
import { sanitizeTextField, rateLimiter } from '@/lib/security';

export default function EditFamilyPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const { data: family, isLoading } = useQuery({
        queryKey: ['family', id],
        queryFn: () => api.get<Family>(`/api/families/${id}/`),
    });

    useEffect(() => {
        if (!family) return;
        const timer = setTimeout(() => {
            setName(family.name);
            setDescription(family.description || '');
        }, 0);
        return () => clearTimeout(timer);
    }, [family]);

    const updateFamily = useMutation({
        mutationFn: async (data: { name: string; description: string }) => {
            if (!rateLimiter.canMakeRequest(`update-family-${id}`, 10, 60000)) {
                throw new Error('Слишком много запросов. Подождите немного.');
            }

            const sanitizedName = sanitizeTextField(data.name.trim(), 100);
            const sanitizedDescription = sanitizeTextField(data.description.trim(), 500);

            if (!sanitizedName) {
                throw new Error('Название семьи обязательно');
            }

            if (sanitizedName.length < 2) {
                throw new Error('Название должно содержать минимум 2 символа');
            }

            return api.patch(`/api/families/${id}/`, {
                name: sanitizedName,
                description: sanitizedDescription || undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family', id] });
            queryClient.invalidateQueries({ queryKey: ['families'] });
            toast.success('Семья успешно обновлена');
            router.push(`/dashboard/family/${id}`);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка обновления семьи');
        },
    });

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Название обязательно');
            return;
        }
        updateFamily.mutate({ name, description });
    }, [name, description, updateFamily]);

    if (isLoading) {
        return <LoadingPage text="Загрузка данных..." />;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-2xl">
            <div className="mb-6">
                <Link href={`/dashboard/family/${id}`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                    </Button>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold">Редактировать семью</h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="name">Название *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            required
                            className="mt-2"
                            placeholder="Введите название семьи"
                            aria-required="true"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            rows={6}
                            className="mt-2"
                            placeholder="Добавьте описание семьи"
                        />
                    </div>

                    <div className="flex gap-4 justify-end">
                        <Link href={`/dashboard/family/${id}`}>
                            <Button type="button" variant="outline">
                                Отмена
                            </Button>
                        </Link>
                        <Button type="submit" disabled={updateFamily.isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {updateFamily.isPending ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}


'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Family } from '@/types';
import { sanitizeTextField, rateLimiter } from '@/lib/security';

interface EditFamilyModalProps {
    open: boolean;
    onClose: () => void;
    familyId: string;
    family: Family | null;
}

export default function EditFamilyModal({
    open,
    onClose,
    familyId,
    family,
}: EditFamilyModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const queryClient = useQueryClient();

    useEffect(() => {
        if (family) {
            const timer = setTimeout(() => {
                setName(family.name);
                setDescription(family.description || '');
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [family]);

    const updateFamily = useMutation({
        mutationFn: async (data: { name: string; description: string }) => {
            if (!rateLimiter.canMakeRequest(`update-family-${familyId}`, 10, 60000)) {
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

            return api.patch(`/api/families/${familyId}/`, {
                name: sanitizedName,
                description: sanitizedDescription || undefined,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family', familyId] });
            queryClient.invalidateQueries({ queryKey: ['families'] });
            toast.success('Семья успешно обновлена');
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка обновления семьи');
        },
    });

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!name.trim()) {
                toast.error('Название обязательно');
                return;
            }
            updateFamily.mutate({ name, description });
        },
        [name, description, updateFamily]
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Редактировать семью</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="edit-family-name">Название *</Label>
                        <Input
                            id="edit-family-name"
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
                        <Label htmlFor="edit-family-description">Описание</Label>
                        <Textarea
                            id="edit-family-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            rows={4}
                            className="mt-2"
                            placeholder="Добавьте описание семьи"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={updateFamily.isPending}>
                            {updateFamily.isPending ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}


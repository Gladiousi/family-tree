'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { sanitizeTextField, rateLimiter } from '@/lib/security';
import type { CreateFamilyModalProps } from '@/types';

export default function CreateFamilyModal({ open, onClose }: CreateFamilyModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const queryClient = useQueryClient();

    const handleCreate = useCallback(async () => {
        const sanitizedName = sanitizeTextField(name.trim(), 100);
        const sanitizedDescription = sanitizeTextField(description.trim(), 500);

        if (!sanitizedName) {
            toast.error('Название семьи обязательно');
            return;
        }

        if (sanitizedName.length < 2) {
            toast.error('Название должно содержать минимум 2 символа');
            return;
        }

        if (!rateLimiter.canMakeRequest('create-family', 5, 60000)) {
            toast.error('Слишком много запросов. Подождите немного.');
            return;
        }

        try {
            await api.post('/api/families/', { 
                name: sanitizedName, 
                description: sanitizedDescription || undefined 
            });
            toast.success('Семья успешно создана');
            queryClient.invalidateQueries({ queryKey: ['families'] });
            setName('');
            setDescription('');
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Ошибка создания семьи');
        }
    }, [name, description, queryClient, onClose]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Создать семью</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleCreate();
                    }}
                    className="space-y-4"
                >
                    <div>
                        <Label htmlFor="family-name">Название *</Label>
                        <Input
                            id="family-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            required
                            placeholder="Введите название семьи"
                            aria-required="true"
                        />
                    </div>
                    <div>
                        <Label htmlFor="family-description">Описание (необязательно)</Label>
                        <Textarea
                            id="family-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={500}
                            placeholder="Добавьте описание семьи"
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={!name.trim()}>
                            Создать
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
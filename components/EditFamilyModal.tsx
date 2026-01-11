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
import type { EditFamilyModalProps } from '@/types';
import Image from 'next/image';

export default function EditFamilyModal({
    open,
    onClose,
    familyId,
    family,
}: EditFamilyModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (family) {
            const timer = setTimeout(() => {
                setName(family.name);
                setDescription(family.description || '');
                setPhotoPreview(family.photo_url || null);
                setPhotoFile(null);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [family]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const updateFamily = useMutation({
        mutationFn: async (data: { name: string; description: string; photo?: File }) => {
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

            const formData = new FormData();
            formData.append('name', sanitizedName);
            if (sanitizedDescription) {
                formData.append('description', sanitizedDescription);
            }
            if (data.photo) {
                formData.append('photo', data.photo);
            }

            return api.patch(`/api/families/${familyId}/`, formData, true);
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
            updateFamily.mutate({ name, description, photo: photoFile || undefined });
        },
        [name, description, photoFile, updateFamily]
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Редактировать семью</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-dashed flex items-center justify-center overflow-hidden">
                                {photoPreview ? (
                                    <Image 
                                        src={photoPreview} 
                                        alt="Фото семьи" 
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <span className="text-gray-400 text-xs">Фото</span>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>

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


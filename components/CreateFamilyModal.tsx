'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface CreateFamilyModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateFamilyModal({ open, onClose }: CreateFamilyModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const queryClient = useQueryClient();

    const handleCreate = async () => {
        try {
            await api.post('/families/', { name, description });
            toast.success('Семья создана');
            queryClient.invalidateQueries({ queryKey: ['families'] });
            onClose();
        } catch {
            toast.error('Ошибка создания');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Создать семью</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Название</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <Label>Описание (необязательно)</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Отмена</Button>
                    <Button onClick={handleCreate}>Создать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
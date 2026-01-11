'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { NodeEditorProps, NodeData } from '@/types';

export default function NodeEditor({ open, onClose, node, onSave }: NodeEditorProps) {
    const getInitialData = () => ({
        name: node?.data?.label || node?.data?.name || '',
        birthDate: node?.data?.birthDate || '',
        deathDate: node?.data?.deathDate || '',
        bio: node?.data?.bio || '',
        photoUrl: node?.data?.photoUrl || '',
    });

    const [data, setData] = useState<NodeData>(getInitialData());
    const [photoPreview, setPhotoPreview] = useState<string | null>(data.photoUrl || null);

    useEffect(() => {
        if (!open) {
            setData({
                name: '',
                birthDate: '',
                deathDate: '',
                bio: '',
                photoUrl: '',
            });
            setPhotoPreview(null);
            return;
        }
        
        if (node) {
            requestAnimationFrame(() => {
                const newNodeData = {
                    name: node.data?.label || node.data?.name || '',
                    birthDate: node.data?.birthDate || '',
                    deathDate: node.data?.deathDate || '',
                    bio: node.data?.bio || '',
                    photoUrl: node.data?.photoUrl || '',
                };
                setData(newNodeData);
                setPhotoPreview(node.data?.photoUrl || null);
            });
        } else {
            requestAnimationFrame(() => {
                const emptyData = {
                    name: '',
                    birthDate: '',
                    deathDate: '',
                    bio: '',
                    photoUrl: '',
                };
                setData(emptyData);
                setPhotoPreview(null);
            });
        }
    }, [node, open]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData({ ...data, photo: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!data.name.trim()) {
            toast.error('Имя обязательно');
            return;
        }
        if (!data.birthDate) {
            toast.error('Дата рождения обязательна');
            return;
        }
        onSave(data);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{node ? 'Редактировать' : 'Добавить'} человека</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-dashed flex items-center justify-center overflow-hidden">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
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
                        <Label>Имя</Label>
                        <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Дата рождения</Label>
                            <Input
                                type="date"
                                value={data.birthDate}
                                onChange={(e) => setData({ ...data, birthDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Дата смерти</Label>
                            <Input
                                type="date"
                                value={data.deathDate}
                                onChange={(e) => setData({ ...data, deathDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <Label>История</Label>
                        <Textarea
                            value={data.bio}
                            onChange={(e) => setData({ ...data, bio: e.target.value })}
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button onClick={handleSave}>Сохранить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
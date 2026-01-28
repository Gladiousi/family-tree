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
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Users, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { EditMemoryModalProps } from '@/types/components';
import { Family, Memory, TreeNode } from '@/types/models';

export default function EditMemoryModal({
    open,
    onClose,
    memoryId,
    familyId,
}: EditMemoryModalProps) {
    const queryClient = useQueryClient();

    const { data: memory } = useQuery<Memory>({
        queryKey: ['memory', memoryId],
        queryFn: () => api.get<Memory>(`/api/memories/${memoryId}/`),
        enabled: open && !!memoryId,
    });

    const { data: nodes = [] } = useQuery<TreeNode[]>({
        queryKey: ['nodes', familyId],
        queryFn: () => api.get<TreeNode[]>(`/api/nodes/?family=${familyId}`),
        enabled: open,
    });

    const { data: family } = useQuery<Family>({
        queryKey: ['family', familyId],
        queryFn: () => api.get<Family>(`/api/families/${familyId}/`),
        enabled: open,
    });

    const initialTitle = memory?.title || '';
    const initialDescription = memory?.description || '';
    const initialDate = memory?.date ? memory.date.split('T')[0] : '';
    const initialNodeIds = memory?.nodes?.map((n) => n.id) || [];
    const initialParticipantIds = memory?.participants?.map((p) => p.id) || [];

    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [date, setDate] = useState(initialDate);
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>(initialNodeIds);
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>(initialParticipantIds);
    const [uploadingMedia, setUploadingMedia] = useState(false);
    
    const previousMemoryIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!open || !memory) {
            previousMemoryIdRef.current = null;
            return;
        }

        if (memory.id !== previousMemoryIdRef.current) {
            previousMemoryIdRef.current = memory.id;
            const timer = setTimeout(() => {
                setTitle(memory.title || '');
                setDescription(memory.description || '');
                setDate(memory.date ? memory.date.split('T')[0] : '');
                setSelectedNodeIds(memory.nodes?.map((n) => n.id) || []);
                setSelectedParticipantIds(memory.participants?.map((p) => p.id) || []);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [memory, open]);

    const updateMemory = useMutation({
        mutationFn: (data: {
            title: string;
            description: string;
            date: string;
            node_ids?: string[];
            participant_ids?: string[];
        }) => api.patch(`/api/memories/${memoryId}/`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memories', familyId] });
            queryClient.invalidateQueries({ queryKey: ['memory', memoryId] });
            toast.success('Воспоминание успешно обновлено');
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка обновления воспоминания');
        },
    });

    const uploadMedia = useMutation({
        mutationFn: ({ file, type }: { file: File; type: 'photo' | 'video' }) =>
            api.uploadFile(`/api/memories/${memoryId}/upload_media/`, file, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memory', memoryId] });
            queryClient.invalidateQueries({ queryKey: ['memories', familyId] });
            toast.success('Медиа загружено');
            setUploadingMedia(false);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка загрузки медиа');
            setUploadingMedia(false);
        },
    });

    const deleteMedia = useMutation({
        mutationFn: (mediaId: string) =>
            api.delete(`/api/memories/${memoryId}/delete_media/`, { media_id: mediaId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memory', memoryId] });
            queryClient.invalidateQueries({ queryKey: ['memories', familyId] });
            toast.success('Медиа удалено');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка удаления медиа');
        },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            toast.error('Поддерживаются только изображения и видео');
            return;
        }

        setUploadingMedia(true);
        uploadMedia.mutate({
            file,
            type: isImage ? 'photo' : 'video',
        });

        e.target.value = '';
    };

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!title.trim()) {
                toast.error('Заголовок обязателен');
                return;
            }
            updateMemory.mutate({
                title,
                description,
                date,
                node_ids: selectedNodeIds,
                participant_ids: selectedParticipantIds,
            });
        },
        [title, description, date, selectedNodeIds, selectedParticipantIds, updateMemory]
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Редактировать воспоминание</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="edit-memory-title">Заголовок *</Label>
                        <Input
                            id="edit-memory-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-2"
                            placeholder="Введите заголовок"
                            aria-required="true"
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-memory-description">Описание</Label>
                        <Textarea
                            id="edit-memory-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="mt-2"
                            placeholder="Добавьте описание"
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-memory-date">Дата</Label>
                        <Input
                            id="edit-memory-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-2"
                        />
                    </div>

                    {nodes.length > 0 && (
                        <div>
                            <Label className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4" />
                                Люди из дерева
                            </Label>
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                                {nodes.map((node) => (
                                    <div key={node.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-node-${node.id}`}
                                            checked={selectedNodeIds.includes(node.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedNodeIds([...selectedNodeIds, node.id]);
                                                } else {
                                                    setSelectedNodeIds(
                                                        selectedNodeIds.filter((id) => id !== node.id)
                                                    );
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`edit-node-${node.id}`}
                                            className="text-sm font-medium leading-none cursor-pointer flex-1"
                                        >
                                            {node.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {family && family.members && family.members.length > 0 && (
                        <div>
                            <Label className="flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4" />
                                Участники
                            </Label>
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                                {family.members.map((member) => (
                                    <div key={member.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`edit-participant-${member.id}`}
                                            checked={selectedParticipantIds.includes(member.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedParticipantIds([
                                                        ...selectedParticipantIds,
                                                        member.id,
                                                    ]);
                                                } else {
                                                    setSelectedParticipantIds(
                                                        selectedParticipantIds.filter(
                                                            (id) => id !== member.id
                                                        )
                                                    );
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`edit-participant-${member.id}`}
                                            className="text-sm font-medium leading-none cursor-pointer flex-1"
                                        >
                                            {member.first_name || member.username}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <Label className="flex items-center gap-2 mb-2">
                            <ImageIcon className="h-4 w-4" />
                            Медиафайлы
                        </Label>
                        <div className="mt-2 space-y-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileUpload}
                                    disabled={uploadingMedia}
                                    className="flex-1"
                                />
                                {uploadingMedia && (
                                    <span className="text-sm text-muted-foreground">Загрузка...</span>
                                )}
                            </div>
                            {memory?.media && memory.media.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {memory.media.map((m) => (
                                        <div key={m.id} className="relative group aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                            {m.type === 'video' ? (
                                                <video controls className="w-full h-full object-cover">
                                                    <source src={m.url} />
                                                </video>
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <Image 
                                                        src={m.url} 
                                                        alt="Медиафайл воспоминания" 
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            )}
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                                onClick={() => deleteMedia.mutate(m.id)}
                                                disabled={deleteMedia.isPending}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Отмена
                        </Button>
                        <Button type="submit" disabled={updateMemory.isPending}>
                            {updateMemory.isPending ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}




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
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Users } from 'lucide-react';

interface EditMemoryModalProps {
    open: boolean;
    onClose: () => void;
    memoryId: string;
    familyId: string;
}

export default function EditMemoryModal({
    open,
    onClose,
    memoryId,
    familyId,
}: EditMemoryModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
    const queryClient = useQueryClient();

    const { data: memory } = useQuery({
        queryKey: ['memory', memoryId],
        queryFn: () => api.get<any>(`/api/memories/${memoryId}/`),
        enabled: open && !!memoryId,
    });

    const { data: nodes = [] } = useQuery({
        queryKey: ['nodes', familyId],
        queryFn: () => api.get(`/api/nodes/?family=${familyId}`),
        enabled: open,
    });

    const { data: family } = useQuery({
        queryKey: ['family', familyId],
        queryFn: () => api.get(`/api/families/${familyId}/`),
        enabled: open,
    });

    useEffect(() => {
        if (memory) {
            setTitle(memory.title || '');
            setDescription(memory.description || '');
            setDate(memory.date ? memory.date.split('T')[0] : '');
            setSelectedNodeIds(memory.nodes?.map((n: any) => n.id) || []);
            setSelectedParticipantIds(memory.participants?.map((p: any) => p.id) || []);
        }
    }, [memory]);

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
                                {nodes.map((node: any) => (
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
                                {family.members.map((member: any) => (
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


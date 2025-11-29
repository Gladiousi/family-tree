'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

interface Memory {
    id: string;
    title: string;
    description: string;
    date: string;
    participants: any[];
    nodes: any[];
}

export default function EditMemoryPage() {
    const { id, memoryId } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);

    const { data: memory, isLoading } = useQuery({
        queryKey: ['memory', memoryId],
        queryFn: () => api.get<Memory>(`/api/memories/${memoryId}/`),
    });

    const { data: nodes = [] } = useQuery({
        queryKey: ['nodes', id],
        queryFn: () => api.get(`/api/nodes/?family=${id}`),
    });

    const { data: family } = useQuery({
        queryKey: ['family', id],
        queryFn: () => api.get(`/api/families/${id}/`),
    });

    useEffect(() => {
        if (!memory) return;
        const timer = setTimeout(() => {
            setTitle(memory.title);
            setDescription(memory.description || '');
            setDate(memory.date || '');
            setSelectedNodeIds(memory.nodes?.map((n: any) => n.id) || []);
            setSelectedParticipantIds(memory.participants?.map((p: any) => p.id) || []);
        }, 0);
        return () => clearTimeout(timer);
    }, [memory]);

    const updateMemory = useMutation({
        mutationFn: (data: { title: string; description: string; date: string; node_ids?: string[]; participant_ids?: string[] }) =>
            api.patch(`/api/memories/${memoryId}/`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memories', id] });
            toast.success('Воспоминание обновлено');
            router.push(`/dashboard/family/${id}/memories`);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка обновления воспоминания');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
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
            participant_ids: selectedParticipantIds
        });
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <p>Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-2xl">
            <div className="mb-6">
                <Link href={`/dashboard/family/${id}/memories`}>
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                    </Button>
                </Link>
                <h1 className="text-2xl sm:text-3xl font-bold">Редактировать воспоминание</h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="title">Заголовок *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            className="mt-2"
                        />
                    </div>

                    <div>
                        <Label htmlFor="date">Дата</Label>
                        <Input
                            id="date"
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
                                            id={`node-${node.id}`}
                                            checked={selectedNodeIds.includes(node.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedNodeIds([...selectedNodeIds, node.id]);
                                                } else {
                                                    setSelectedNodeIds(selectedNodeIds.filter(id => id !== node.id));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`node-${node.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
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
                                            id={`participant-${member.id}`}
                                            checked={selectedParticipantIds.includes(member.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedParticipantIds([...selectedParticipantIds, member.id]);
                                                } else {
                                                    setSelectedParticipantIds(selectedParticipantIds.filter(id => id !== member.id));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor={`participant-${member.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                                        >
                                            {member.first_name || member.username}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 justify-end">
                        <Link href={`/dashboard/family/${id}/memories`}>
                            <Button type="button" variant="outline">
                                Отмена
                            </Button>
                        </Link>
                        <Button type="submit" disabled={updateMemory.isPending}>
                            <Save className="mr-2 h-4 w-4" />
                            {updateMemory.isPending ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}


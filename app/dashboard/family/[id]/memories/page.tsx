'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Calendar, Users, Edit, Heart, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import MemoryViewer from '@/components/MemoryViewer';
import EditMemoryModal from '@/components/EditMemoryModal';

export default function MemoriesPage() {
    const { id } = useParams();
    const queryClient = useQueryClient();
    const [open, setOpen] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedMemory, setSelectedMemory] = useState<any>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

    const { data: memories = [] } = useQuery({
        queryKey: ['memories', id],
        queryFn: () => api.get(`/api/memories/?family=${id}`),
    });

    const { data: nodes = [] } = useQuery({
        queryKey: ['nodes', id],
        queryFn: () => api.get(`/api/nodes/?family=${id}`),
        enabled: open,
    });

    const createMemory = useMutation({
        mutationFn: () => api.post('/api/memories/', { 
            title, 
            description, 
            date, 
            family: id,
            node_ids: selectedNodeIds
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memories', id] });
            toast.success('Воспоминание создано');
            setOpen(false);
            setTitle('');
            setDescription('');
            setDate('');
            setSelectedNodeIds([]);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка создания воспоминания');
        },
    });

    const deleteMemory = useMutation({
        mutationFn: (memoryId: string) => api.delete(`/api/memories/${memoryId}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memories', id] });
            setViewerOpen(false);
            setSelectedMemory(null);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка удаления воспоминания');
        },
    });

    const handleMemoryClick = (memory: any) => {
        setSelectedMemory(memory);
        setViewerOpen(true);
    };

    const handleEditMemory = () => {
        if (selectedMemory) {
            setViewerOpen(false);
            setEditOpen(true);
        }
    };

    const handleDeleteMemory = () => {
        if (selectedMemory) {
            deleteMemory.mutate(selectedMemory.id);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <Link href={`/dashboard/family/${id}`}>
                <Button variant="ghost" size="sm" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Назад к семье
                </Button>
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Воспоминания</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Сохраняйте важные моменты вашей семьи</p>
                </div>
                <Button onClick={() => setOpen(true)} size="lg" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> 
                    <span className="hidden sm:inline">Добавить воспоминание</span>
                    <span className="sm:hidden">Добавить</span>
                </Button>
            </div>

            {memories.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-semibold mb-2">Нет воспоминаний</h2>
                    <p className="text-muted-foreground mb-6">Создайте первое воспоминание, чтобы сохранить важные моменты</p>
                    <Button onClick={() => setOpen(true)} size="lg">
                        <Plus className="mr-2 h-4 w-4" /> Создать воспоминание
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {memories.map((memory: any) => (
                    <Card 
                        key={memory.id} 
                        className="p-4 sm:p-6 hover:shadow-lg transition-shadow group cursor-pointer"
                        onClick={() => handleMemoryClick(memory)}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold">{memory.title}</h3>
                        </div>
                        {memory.date && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(memory.date), 'dd.MM.yyyy')}
                            </p>
                        )}
                        {memory.participants.length > 0 && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                                <Users className="h-4 w-4" />
                                {memory.participants.map((p: any) => p.first_name || p.username).join(', ')}
                            </p>
                        )}
                        {memory.nodes && memory.nodes.length > 0 && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-3">
                                <User className="h-4 w-4" />
                                {memory.nodes.map((n: any) => n.name).join(', ')}
                            </p>
                        )}
                        {memory.description && <p className="text-muted-foreground">{memory.description}</p>}
                        {memory.media.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {memory.media.map((m: any) => (
                                    <div key={m.id} className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                        {m.type === 'video' ? (
                                            <video controls className="w-full h-full object-cover">
                                                <source src={m.url} />
                                            </video>
                                        ) : (
                                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Новое воспоминание</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Заголовок</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <Label>Описание</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <div>
                            <Label>Дата</Label>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        {nodes.length > 0 && (
                            <div>
                                <Label>Люди из дерева</Label>
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
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                            >
                                                {node.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <Button onClick={() => createMemory.mutate()} className="w-full">
                            Создать
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <MemoryViewer
                open={viewerOpen}
                onClose={() => {
                    setViewerOpen(false);
                    setSelectedMemory(null);
                }}
                memory={selectedMemory}
                onEdit={handleEditMemory}
                onDelete={handleDeleteMemory}
                isDeleting={deleteMemory.isPending}
            />

            {selectedMemory && (
                <EditMemoryModal
                    open={editOpen}
                    onClose={() => {
                        setEditOpen(false);
                        setSelectedMemory(null);
                    }}
                    memoryId={selectedMemory.id}
                    familyId={id as string}
                />
            )}
        </div>
    );
}
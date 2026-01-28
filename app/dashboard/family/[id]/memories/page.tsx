'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Calendar, Users, Heart, ArrowLeft, User, Image as ImageIcon, Play } from 'lucide-react';
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
import Image from 'next/image';

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
    const [uploadingMedia, setUploadingMedia] = useState(false);
    const [createdMemoryId, setCreatedMemoryId] = useState<string | null>(null);

    const { data: memories = [] }: any = useQuery({
        queryKey: ['memories', id],
        queryFn: () => api.get(`/api/memories/?family=${id}`),
    });

    const { data: nodes = [] }: any = useQuery({
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
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['memories', id] });
            toast.success('Воспоминание создано');
            setCreatedMemoryId(data.id);
            setTitle('');
            setDescription('');
            setDate('');
            setSelectedNodeIds([]);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка создания воспоминания');
        },
    });

    const uploadMedia = useMutation({
        mutationFn: ({ file, type, memoryId }: { file: File; type: 'photo' | 'video'; memoryId: string }) =>
            api.uploadFile(`/api/memories/${memoryId}/upload_media/`, file, type),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memories', id] });
            toast.success('Медиа загружено');
            setUploadingMedia(false);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка загрузки медиа');
            setUploadingMedia(false);
        },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!createdMemoryId) {
            toast.error('Сначала создайте воспоминание');
            return;
        }

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
            memoryId: createdMemoryId,
        });

        e.target.value = '';
    };

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
                                <h3 className="text-xl font-semibold line-clamp-1">{memory.title}</h3>
                            </div>
                            {memory.date && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                    <span>{format(new Date(memory.date), 'dd.MM.yyyy')}</span>
                                </p>
                            )}
                            {memory.participants && memory.participants.length > 0 && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2 line-clamp-1">
                                    <Users className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{memory.participants.map((p: any) => p.first_name || p.username).join(', ')}</span>
                                </p>
                            )}
                            {memory.nodes && memory.nodes.length > 0 && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-3 line-clamp-1">
                                    <User className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{memory.nodes.map((n: any) => n.name).join(', ')}</span>
                                </p>
                            )}
                            {memory.description && (
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{memory.description}</p>
                            )}
                            {memory.media && memory.media.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    {/* Первое медиа */}
                                    <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                        {memory.media[0].type === 'video' ? (
                                            <div className="relative w-full h-full bg-gray-800">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Play className="h-8 w-8 text-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <Image
                                                src={memory.media[0].url}
                                                alt="Превью"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        )}
                                    </div>
                                    
                                    {/* Счетчик остальных медиа */}
                                    {memory.media.length > 1 && (
                                        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg overflow-hidden flex items-center justify-center border-2 border-primary/30">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-primary">
                                                    +{memory.media.length - 1}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {memory.media.length - 1 === 1 ? 'медиафайл' : 'медиафайлов'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                    setCreatedMemoryId(null);
                }
            }}>
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
                        <div>
                            <Label className="flex items-center gap-2 mb-2">
                                <ImageIcon className="h-4 w-4" />
                                Медиафайлы
                            </Label>
                            <Input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                                disabled={!createdMemoryId || uploadingMedia}
                                className="mt-2"
                            />
                            {uploadingMedia && (
                                <p className="text-sm text-muted-foreground mt-1">Загрузка...</p>
                            )}
                            {!createdMemoryId && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Сначала создайте воспоминание, затем добавьте медиафайлы
                                </p>
                            )}
                        </div>
                        <Button
                            onClick={() => createMemory.mutate()}
                            className="w-full"
                            disabled={createMemory.isPending}
                        >
                            {createMemory.isPending ? 'Создание...' : 'Создать'}
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

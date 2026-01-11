'use client';

import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Card } from '@/components/ui/card';
import { Users, Edit, TreePine, Heart, ArrowLeft, Trash2, X, Image as ImageIcon, Upload, Play } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Family, MediaFile } from '@/types';
import AddMemberModal from '@/components/AddMemberModal';
import EditFamilyModal from '@/components/EditFamilyModal';
import MediaViewer from '@/components/MediaViewer';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/loading';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

export default function FamilyPage() {
    const { id } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
    const [deleteFamilyOpen, setDeleteFamilyOpen] = useState(false);
    const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [uploadingMedia, setUploadingMedia] = useState(false);

    const { data: family, isLoading } = useQuery({
        queryKey: ['family', id],
        queryFn: () => api.get<Family>(`/api/families/${id}/`),
    });

    const removeMember = useMutation({
        mutationFn: (userId: string) => 
            api.post(`/api/families/${id}/remove_member/`, { user_id: userId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family', id] });
            queryClient.invalidateQueries({ queryKey: ['families'] });
            setDeleteMemberId(null);
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка удаления участника');
        },
    });

    const deleteFamily = useMutation({
        mutationFn: () => api.delete(`/api/families/${id}/`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['families'] });
            toast.success('Семья удалена');
            router.push('/dashboard');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Ошибка удаления семьи');
        },
    });

    const isOwner = useMemo(() => currentUser?.id === family?.owner.id, [currentUser?.id, family?.owner.id]);

    const uploadMedia = useMutation({
        mutationFn: async ({ file, type }: { file: File; type: 'photo' | 'video' }) => {
            try {
                return await api.uploadFile(`/api/families/${id}/upload_media/`, file, type);
            } catch (error: any) {
                console.error('Upload error:', error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family', id] });
            toast.success('Медиа загружено');
            setUploadingMedia(false);
        },
        onError: (err: any) => {
            console.error('Upload mutation error:', err);
            toast.error(err.message || 'Ошибка загрузки медиа');
            setUploadingMedia(false);
        },
    });

    const deleteMedia = useMutation({
        mutationFn: (mediaId: string) =>
            api.delete(`/api/families/${id}/delete_media/`, { media_id: mediaId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family', id] });
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

    const handleMediaClick = (index: number) => {
        setSelectedMediaIndex(index);
        setMediaViewerOpen(true);
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" text="Загрузка семьи..." />
                </div>
            </div>
        );
    }

    if (!family) return null;

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Назад к семьям
                    </Button>
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="min-w-0 flex-1 flex items-start gap-4">
                        {family.photo_url && (
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0">
                                <Image 
                                    src={family.photo_url} 
                                    alt={family.name} 
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 truncate">{family.name}</h1>
                            <p className="text-muted-foreground text-base sm:text-lg line-clamp-2">{family.description || 'Нет описания'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button onClick={() => setAddOpen(true)} size="sm" className="flex-1 sm:flex-none">
                            <Users className="mr-2 h-4 w-4" /> 
                            <span className="hidden sm:inline">Добавить участника</span>
                            <span className="sm:hidden">Участник</span>
                        </Button>
                        <IconButton
                            variant="outline"
                            size="icon"
                            icon={<Edit className="h-4 w-4" />}
                            label="Редактировать семью"
                            aria-label="Редактировать семью"
                            onClick={() => setEditOpen(true)}
                            className="shrink-0"
                        />
                        {isOwner && (
                            <IconButton
                                variant="destructive"
                                size="icon"
                                icon={<Trash2 className="h-4 w-4" />}
                                label="Удалить семью"
                                aria-label="Удалить семью"
                                onClick={() => setDeleteFamilyOpen(true)}
                                className="shrink-0"
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Link href={`/dashboard/family/${id}/tree`} className="group">
                        <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer h-full border hover:border-primary/30 hover:-translate-y-1">
                            <TreePine className="h-6 w-6 sm:h-8 sm:w-8 mb-3 text-primary transition-transform duration-300 group-hover:scale-110" />
                            <h3 className="font-semibold text-base sm:text-lg mb-2">Семейное древо</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Просмотр и редактирование генеалогического древа</p>
                        </Card>
                    </Link>
                    <Link href={`/dashboard/family/${id}/memories`} className="group">
                        <Card className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer h-full border hover:border-primary/30 hover:-translate-y-1">
                            <Heart className="h-6 w-6 sm:h-8 sm:w-8 mb-3 text-primary transition-transform duration-300 group-hover:scale-110" />
                            <h3 className="font-semibold text-base sm:text-lg mb-2">Воспоминания</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Фото, видео и истории семьи</p>
                        </Card>
                    </Link>
                </div>
            </div>

            {family.media && family.media.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <ImageIcon className="h-6 w-6" />
                            Медиафайлы семьи ({family.media.length})
                        </h2>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                                disabled={uploadingMedia}
                                className="hidden"
                                id="family-media-upload"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('family-media-upload')?.click()}
                                disabled={uploadingMedia}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploadingMedia ? 'Загрузка...' : 'Загрузить'}
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {family.media.map((m: MediaFile, index: number) => (
                            <div 
                                key={m.id} 
                                className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                                onClick={() => handleMediaClick(index)}
                            >
                                {m.type === 'video' ? (
                                    <>
                                        <div className="relative w-full h-full">
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Play className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Image 
                                        src={m.url} 
                                        alt="Медиафайл семьи" 
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                )}
                                {isOwner && (
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMedia.mutate(m.id);
                                        }}
                                        disabled={deleteMedia.isPending}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(!family.media || family.media.length === 0) && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <ImageIcon className="h-6 w-6" />
                            Медиафайлы семьи
                        </h2>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileUpload}
                                disabled={uploadingMedia}
                                className="hidden"
                                id="family-media-upload"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById('family-media-upload')?.click()}
                                disabled={uploadingMedia}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploadingMedia ? 'Загрузка...' : 'Загрузить'}
                            </Button>
                        </div>
                    </div>
                    <Card className="p-8 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Нет медиафайлов</p>
                    </Card>
                </div>
            )}

            <div className="mb-4">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Участники ({family.members.length})
                </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {family.members.map((member) => {
                    const isMemberOwner = member.id === family.owner.id;
                    const canRemove = !isMemberOwner && isOwner;
                    
                    return (
                        <Card 
                            key={member.id} 
                            className="p-4 hover:shadow-md transition-all duration-200 group border hover:border-primary/20"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                                        <span className="text-primary font-semibold text-sm">
                                            {(member.first_name || member.username)[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium truncate">{member.first_name || member.username}</p>
                                        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                                        {isMemberOwner && (
                                            <p className="text-xs text-primary font-medium mt-1">Владелец</p>
                                        )}
                                    </div>
                                </div>
                                {canRemove && (
                                    <IconButton
                                        variant="ghost"
                                        size="icon"
                                        icon={<X className="h-4 w-4 text-destructive" />}
                                        label="Удалить участника"
                                        aria-label="Удалить участника"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                        onClick={() => setDeleteMemberId(member.id)}
                                    />
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} familyId={id as string} />
            
            <EditFamilyModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                familyId={id as string}
                family={family}
            />

            {family.media && family.media.length > 0 && (
                <MediaViewer
                    open={mediaViewerOpen}
                    onClose={() => setMediaViewerOpen(false)}
                    media={family.media}
                    initialIndex={selectedMediaIndex}
                />
            )}

            <AlertDialog open={deleteMemberId !== null} onOpenChange={(open) => !open && setDeleteMemberId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить этого участника из семьи? Это действие нельзя отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteMemberId(null)}>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteMemberId) {
                                    removeMember.mutate(deleteMemberId);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={removeMember.isPending}
                        >
                            {removeMember.isPending ? 'Удаление...' : 'Удалить'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={deleteFamilyOpen} onOpenChange={setDeleteFamilyOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить семью "{family.name}"? Это действие нельзя отменить.
                            Все данные семьи (узлы дерева, воспоминания) будут удалены.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteFamily.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteFamily.isPending}
                        >
                            {deleteFamily.isPending ? 'Удаление...' : 'Удалить'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Edit, Trash2, Calendar, Users, User, Play } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import type { MemoryViewerProps } from '@/types/components';
import type { MediaFile } from "@/types/models"
import MediaViewer from '@/components/MediaViewer';

export default function MemoryViewer({ open, onClose, memory, onEdit, onDelete, isDeleting = false }: MemoryViewerProps) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

    if (!memory) return null;

    const handleMediaClick = (index: number) => {
        setSelectedMediaIndex(index);
        setMediaViewerOpen(true);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{memory.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {memory.date && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(memory.date), 'dd.MM.yyyy')}</span>
                            </div>
                        )}

                        {memory.participants && memory.participants.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{memory.participants.map((p: any) => p.first_name || p.username).join(', ')}</span>
                            </div>
                        )}

                        {memory.nodes && memory.nodes.length > 0 && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span>{memory.nodes.map((n: any) => n.name).join(', ')}</span>
                            </div>
                        )}

                        {memory.description && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-2">Описание</h3>
                                {memory.description_html ? (
                                    <div
                                        className="text-muted-foreground prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: memory.description_html }}
                                    />
                                ) : (
                                    <p className="text-muted-foreground whitespace-pre-wrap">{memory.description}</p>
                                )}
                            </div>
                        )}

                        {memory.media && memory.media.length > 0 && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-3">Медиа ({memory.media.length})</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {memory.media.map((m: MediaFile, index: number) => (
                                        <div
                                            key={m.id}
                                            className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all group"
                                            onClick={() => handleMediaClick(index)}
                                        >
                                            {m.type === 'video' ? (
                                                <div className="relative w-full h-full">
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                                        <Play className="h-8 w-8 text-white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Image
                                                    src={m.url}
                                                    alt="Медиафайл воспоминания"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex flex-row gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onEdit}
                            className="h-9 w-9"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmOpen(true)}
                            disabled={isDeleting}
                            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Просмотр медиа */}
            {memory.media && memory.media.length > 0 && (
                <MediaViewer
                    open={mediaViewerOpen}
                    onClose={() => setMediaViewerOpen(false)}
                    media={memory.media}
                    initialIndex={selectedMediaIndex}
                />
            )}

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить воспоминание "{memory.title}"? Это действие нельзя отменить.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                setDeleteConfirmOpen(false);
                                onDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

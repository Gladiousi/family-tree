'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import type { NodeViewerProps } from '@/types';

export default function NodeViewer({ open, onClose, node, onEdit, onDelete, isDeleting = false }: NodeViewerProps) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    if (!node) return null;

    const { label, name, birthDate, deathDate, bio, photoUrl, age_display } = node.data || {};

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Информация о человеке</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            {photoUrl ? (
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                                    <Image 
                                        src={photoUrl} 
                                        alt={label || name || 'Фото'} 
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-100 to-purple-100 border-4 border-gray-200 shadow-lg flex items-center justify-center">
                                    <span className="text-4xl font-bold text-gray-600">
                                        {(label || name || '?').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{label || name}</h2>
                            {(birthDate || deathDate || age_display) && (
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">
                                        {birthDate ? format(new Date(birthDate), 'dd.MM.yyyy') : ''}
                                        {deathDate && ` - ${format(new Date(deathDate), 'dd.MM.yyyy')}`}
                                        {age_display && ` (${age_display})`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {bio && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-2">История</h3>
                                {node.data?.bio_html ? (
                                    <div 
                                        className="text-muted-foreground prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: node.data.bio_html }}
                                    />
                                ) : (
                                    <p className="text-muted-foreground whitespace-pre-wrap">{bio}</p>
                                )}
                            </div>
                        )}
                        {node.data?.media && node.data.media.length > 0 && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-2">Медиа</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {node.data.media.map((m: any) => (
                                        <div 
                                            key={m.id} 
                                            className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                                            onClick={() => {
                                                if (m.type === 'photo') {
                                                    const link = document.createElement('a');
                                                    link.href = m.url;
                                                    link.download = `node-media-${m.id}.jpg`;
                                                    link.click();
                                                } else {
                                                    window.open(m.url, '_blank');
                                                }
                                            }}
                                        >
                                            {m.type === 'video' ? (
                                                <video controls className="w-full h-full object-cover">
                                                    <source src={m.url} />
                                                </video>
                                            ) : (
                                                <div className="relative w-full h-full">
                                                    <Image 
                                                        src={m.url} 
                                                        alt="Медиафайл узла" 
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium transition-opacity">
                                                            Скачать
                                                        </span>
                                                    </div>
                                                </div>
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

            <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Подтвердите удаление</AlertDialogTitle>
                        <AlertDialogDescription>
                            Вы уверены, что хотите удалить {label || name}? Это действие нельзя отменить.
                            Все связи с этим человеком также будут удалены.
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


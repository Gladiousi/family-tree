'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Edit, Trash2, Calendar, Users, User } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface MemoryViewerProps {
    open: boolean;
    onClose: () => void;
    memory: any;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export default function MemoryViewer({ open, onClose, memory, onEdit, onDelete, isDeleting = false }: MemoryViewerProps) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    if (!memory) return null;

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
                                <p className="text-muted-foreground whitespace-pre-wrap">{memory.description}</p>
                            </div>
                        )}

                        {memory.media && memory.media.length > 0 && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-3">Медиа</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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


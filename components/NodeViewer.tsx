'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface NodeData {
    id?: string;
    name: string;
    birthDate?: string;
    deathDate?: string;
    bio?: string;
    photoUrl?: string;
}

interface NodeViewerProps {
    open: boolean;
    onClose: () => void;
    node?: any;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export default function NodeViewer({ open, onClose, node, onEdit, onDelete, isDeleting = false }: NodeViewerProps) {
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    if (!node) return null;

    const { label, name, birthDate, deathDate, bio, photoUrl } = node.data || {};

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
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                                    <img 
                                        src={photoUrl} 
                                        alt={label || name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-gray-200 shadow-lg flex items-center justify-center">
                                    <span className="text-4xl font-bold text-gray-600">
                                        {(label || name || '?').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{label || name}</h2>
                            {(birthDate || deathDate) && (
                                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-sm">
                                        {birthDate && format(new Date(birthDate), 'dd.MM.yyyy')}
                                        {deathDate && ` - ${format(new Date(deathDate), 'dd.MM.yyyy')}`}
                                    </span>
                                </div>
                            )}
                        </div>

                        {bio && (
                            <div className="pt-4 border-t">
                                <h3 className="font-semibold mb-2">История</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap">{bio}</p>
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


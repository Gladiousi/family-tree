'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

interface InviteModalProps {
    open: boolean;
    onClose: () => void;
    familyId: string;
}

export default function InviteModal({ open, onClose, familyId }: InviteModalProps) {
    const [email, setEmail] = useState('');

    const handleInvite = () => {
        toast.success(`Приглашение отправлено на ${email}`);
        setEmail('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Пригласить участника</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button onClick={handleInvite}>Отправить</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
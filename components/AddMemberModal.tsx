'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { sanitizeTextField, isValidId, rateLimiter } from '@/lib/security';
import { AddMemberModalProps } from '@/types/components';
import { User } from '@/types/models';

export default function AddMemberModal({ open, onClose, familyId }: AddMemberModalProps) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const searchUsers = useCallback(async () => {
        const sanitizedSearch = sanitizeTextField(search.trim(), 100);
        if (!sanitizedSearch) {
            toast.error('Введите email или логин для поиска');
            return;
        }

        if (!rateLimiter.canMakeRequest(`search-${familyId}`, 10, 60000)) {
            toast.error('Слишком много запросов. Подождите немного.');
            return;
        }

        setLoading(true);
        try {
            const data = await api.get<User[]>(`/api/users/search/?q=${encodeURIComponent(sanitizedSearch)}`);
            setResults(data || []);
            if (data && data.length === 0) {
                toast.info('Пользователи не найдены');
            }
        } catch (err: any) {
            toast.error(err.message || 'Ошибка поиска');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [search, familyId]);

    const addMember = useCallback(async (userId: string) => {
        if (!isValidId(userId)) {
            toast.error('Неверный ID пользователя');
            return;
        }

        try {
            await api.post(`/api/families/${familyId}/add_member/`, { user_id: userId });
            toast.success('Участник добавлен');
            queryClient.invalidateQueries({ queryKey: ['families'] });
            queryClient.invalidateQueries({ queryKey: ['family', familyId] });
            setSearch('');
            setResults([]);
            onClose();
        } catch (err: any) {
            toast.error(err.message || 'Не удалось добавить участника');
        }
    }, [familyId, queryClient, onClose]);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Добавить участника</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Email или логин"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !loading) {
                                    e.preventDefault();
                                    searchUsers();
                                }
                            }}
                            maxLength={100}
                            disabled={loading}
                            aria-label="Поиск пользователя"
                        />
                        <Button onClick={searchUsers} disabled={loading || !search.trim()}>
                            {loading ? 'Поиск...' : 'Найти'}
                        </Button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                        {results.map((user) => (
                            <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                                <div>
                                    <p className="font-medium">{user.first_name || user.username}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <Button size="sm" onClick={() => addMember(user.id)}>Добавить</Button>
                            </div>
                        ))}
                        {results.length === 0 && search && !loading && (
                            <p className="text-center text-muted-foreground">Ничего не найдено</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Закрыть</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
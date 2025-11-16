'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import CreateFamilyModal from '@/components/CreateFamilyModal';
import FamilyCard from '@/components/FamilyCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Family } from '@/types';

export default function Dashboard() {
    const [createOpen, setCreateOpen] = useState(false);
    const { data: families = [] } = useQuery({
        queryKey: ['families'],
        queryFn: () => api.get<Family[]>('/families/'),
    });

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Мои семьи</h1>
                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Создать семью
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {families.map((family) => (
                    <FamilyCard key={family.id} family={family} />
                ))}
            </div>

            {families.length === 0 && (
                <p className="text-center text-muted-foreground mt-12">У вас пока нет семей. Создайте первую!</p>
            )}

            <CreateFamilyModal open={createOpen} onClose={() => setCreateOpen(false)} />
        </div>
    );
}
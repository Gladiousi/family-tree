'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Family } from '@/types';

export default function Dashboard() {
    const { user } = useAuthStore();
    const { setFamilies } = useFamilyStore();

    const { data: families = [] } = useQuery({
        queryKey: ['families'],
        queryFn: () => api.get<Family[]>('/families'),
        onSuccess: (data) => setFamilies(data),
    });

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Мои семейные группы</h1>
                <Button asChild>
                    <Link href="/dashboard/family/create">
                        <Plus className="mr-2 h-4 w-4" /> Создать группу
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {families.map((family) => (
                    <Card key={family.id} className="p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-semibold mb-2">{family.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {family.members.length} участников
                        </p>
                        <Button asChild className="w-full">
                            <Link href={`/dashboard/family/${family.id}`}>Открыть древо</Link>
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
'use client';

import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Family } from '@/types';
import AddMemberModal from '@/components/AddMemberModal';
import { useState } from 'react';
import Link from 'next/link';

export default function FamilyPage() {
    const { id } = useParams();
    const [addOpen, setAddOpen] = useState(false);

    const { data: family } = useQuery({
        queryKey: ['family', id],
        queryFn: () => api.get<Family>(`/families/${id}/`),
    });

    if (!family) return <div>Загрузка...</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{family.name}</h1>
                    <p className="text-muted-foreground">{family.description}</p>
                </div>
                <Button onClick={() => setAddOpen(true)}>
                    <Users className="mr-2 h-4 w-4" /> Добавить
                </Button>
                <Button asChild>
                    <Link href={`/dashboard/family/${id}/tree`}>Открыть древо</Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {family.members.map((member) => (
                    <div key={member.id} className="border p-4 rounded-lg">
                        <p className="font-medium">{member.first_name || member.username}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                ))}
            </div>

            <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} familyId={id as string} />
        </div>
    );
}
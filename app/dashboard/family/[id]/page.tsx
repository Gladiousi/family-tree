'use client';

import FamilyTree from '@/components/FamilyTree';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function FamilyPage() {
    const params = useParams();
    const familyId = params.id as string;
    const { setCurrentTree } = useFamilyStore();

    const { data: tree, isLoading } = useQuery({
        queryKey: ['tree', familyId],
        queryFn: () => api.get(`/families/${familyId}/tree`),
    });

    useEffect(() => {
        if (tree) setCurrentTree(tree);
    }, [tree, setCurrentTree]);

    if (isLoading) return <div className="p-6">Загрузка...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Семейное древо</h1>
            <FamilyTree familyId={familyId} />
        </div>
    );
}
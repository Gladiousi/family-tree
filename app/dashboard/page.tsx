'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Users } from 'lucide-react';
import { useState } from 'react';
import CreateFamilyModal from '@/components/CreateFamilyModal';
import FamilyCard from '@/components/FamilyCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Family } from '@/types/models';
import { LoadingPage } from '@/components/ui/loading';

export default function Dashboard() {
    const [createOpen, setCreateOpen] = useState(false);
    const { data: families = [], isLoading } = useQuery({
        queryKey: ['families'],
        queryFn: () => api.get<Family[]>('/api/families/'),
    });

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Мои семьи
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Управляйте своими семейными деревьями и воспоминаниями
                    </p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                >
                    <Plus className="mr-2 h-4 w-4" /> Создать семью
                </Button>
            </div>

            {families.length === 0 ? (
                <Card className="p-12 text-center shadow-xl border-2 border-dashed hover:border-primary/30 transition-all duration-300">
                    <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6">
                        <Users className="h-16 w-16 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">У вас пока нет семей</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Создайте первую семью, чтобы начать строить генеалогическое древо
                    </p>
                    <Button
                        onClick={() => setCreateOpen(true)}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Создать семью
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {families.map((family) => (
                        <FamilyCard key={family.id} family={family} />
                    ))}
                </div>
            )}

            <CreateFamilyModal open={createOpen} onClose={() => setCreateOpen(false)} />
        </div>
    );
}
import { Card } from '@/components/ui/card';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { Family } from '@/types';

interface FamilyCardProps {
    family: Family;
}

export default function FamilyCard({ family }: FamilyCardProps) {
    const { setCurrentFamily } = useFamilyStore();
    const router = useRouter();

    return (
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
            setCurrentFamily(family);
            router.push(`/dashboard/family/${family.id}`);
        }}>
            <h3 className="text-xl font-bold mb-2">{family.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
                {family.description || 'Нет описания'}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{family.members.length} участников</span>
            </div>
        </Card>
    );
}
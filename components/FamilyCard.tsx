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
        <Card 
            className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 hover:-translate-y-1 group" 
            onClick={() => {
                setCurrentFamily(family);
                router.push(`/dashboard/family/${family.id}`);
            }}
        >
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-primary line-clamp-1 group-hover:text-primary/80 transition-colors">
                {family.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                {family.description || 'Нет описания'}
            </p>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
                <span>{family.members.length} {family.members.length === 1 ? 'участник' : family.members.length < 5 ? 'участника' : 'участников'}</span>
            </div>
        </Card>
    );
}
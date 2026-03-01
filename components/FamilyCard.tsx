import { Card } from '@/components/ui/card';
import { useFamilyStore } from '@/store/useFamilyStore';
import { useRouter } from 'next/navigation';
import { Users } from 'lucide-react';
import { FamilyCardProps } from '@/types/components';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function FamilyCard({ family }: FamilyCardProps) {
    const { setCurrentFamily } = useFamilyStore();
    const router = useRouter();
    const createdLabel = family.created_at
        ? formatDistanceToNow(new Date(family.created_at), { addSuffix: true, locale: ru })
        : null;

    return (
        <Card
            className="overflow-hidden p-0 sm:p-0 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 hover:-translate-y-1 group"
            onClick={() => {
                setCurrentFamily(family);
                router.push(`/dashboard/family/${family.id}`);
            }}
        >
            {family.photo_url && (
                <div className="relative h-32 sm:h-36 w-full bg-muted">
                    <Image
                        src={family.photo_url}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 33vw"
                        unoptimized
                    />
                </div>
            )}
            <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-primary line-clamp-1 group-hover:text-primary/80 transition-colors">
                    {family.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                    {family.description || 'Нет описания'}
                </p>
                <div className="flex items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
                        {family.members.length} {family.members.length === 1 ? 'участник' : family.members.length < 5 ? 'участника' : 'участников'}
                    </span>
                    {createdLabel && (
                        <span className="shrink-0" title={family.created_at}>
                            {createdLabel}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
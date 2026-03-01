import { Card } from '@/components/ui/card';

export function FamilyCardSkeleton() {
    return (
        <Card className="p-4 sm:p-6 border-2 animate-pulse">
            <div className="h-6 w-2/3 bg-muted rounded mb-2" />
            <div className="h-4 w-full bg-muted rounded mb-1" />
            <div className="h-4 w-1/2 bg-muted rounded mb-4" />
            <div className="h-4 w-24 bg-muted rounded" />
        </Card>
    );
}

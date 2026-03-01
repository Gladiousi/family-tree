'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbsProps = {
    items: BreadcrumbItem[];
    className?: string;
};

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
    if (items.length === 0) return null;

    return (
        <nav aria-label="Хлебные крошки" className={cn('flex items-center gap-1 text-sm text-muted-foreground flex-wrap', className)}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <span key={index} className="flex items-center gap-1">
                        {index > 0 && (
                            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
                        )}
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="hover:text-primary transition-colors truncate max-w-[140px] sm:max-w-[200px]"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={cn(isLast && 'font-medium text-foreground truncate max-w-[180px] sm:max-w-none')}>
                                {item.label}
                            </span>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}

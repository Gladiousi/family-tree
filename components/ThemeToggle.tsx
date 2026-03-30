'use client';

import { useMemo } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    const isDark = useMemo(() => resolvedTheme === 'dark' || !resolvedTheme, [resolvedTheme]);

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Переключить тему"
            title="Тема"
            aria-pressed={isDark}
            className="group relative overflow-hidden hover:bg-primary/5 hover:text-primary transition-all duration-200"
        >
            <span className="pointer-events-none absolute inset-0 rounded-md bg-primary/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            {isDark ? (
                <Sun className="relative z-10 h-4 w-4" />
            ) : (
                <Moon className="relative z-10 h-4 w-4" />
            )}
        </Button>
    );
}
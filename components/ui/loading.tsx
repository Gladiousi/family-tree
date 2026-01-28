import { cn } from "@/lib/utils"
import { LoadingPageProps, LoadingSpinnerProps } from "@/types/components";


type LoadingSpinnerPropsWithClassName = LoadingSpinnerProps & {
    className?: string;
};

export function LoadingSpinner({ className, size = 'md', text }: LoadingSpinnerPropsWithClassName) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
            <div
                className={cn(
                    "border-4 border-primary border-t-transparent rounded-full animate-spin",
                    sizeClasses[size]
                )}
                role="status"
                aria-label="Загрузка"
            />
            {text && (
                <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
            )}
        </div>
    );
}

export function LoadingPage({ text = "Загрузка..." }: LoadingPageProps) {
    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" text={text} />
            </div>
        </div>
    );
}



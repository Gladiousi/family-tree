import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'asChild'> {
    icon: React.ReactNode;
    label: string;
    'aria-label'?: string;
    href?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, icon, label, 'aria-label': ariaLabel, href, ...props }, ref) => {
        const buttonContent = (
            <>
                {icon}
                <span className="sr-only">{label}</span>
            </>
        );

        if (href) {
            return (
                <Button
                    asChild
                    ref={ref}
                    className={cn("relative", className)}
                    aria-label={ariaLabel || label}
                    title={label}
                    {...props}
                >
                    <Link href={href}>
                        {buttonContent}
                    </Link>
                </Button>
            );
        }

        return (
            <Button
                ref={ref}
                className={cn("relative", className)}
                aria-label={ariaLabel || label}
                title={label}
                {...props}
            >
                {buttonContent}
            </Button>
        )
    }
)
IconButton.displayName = "IconButton"

export { IconButton }


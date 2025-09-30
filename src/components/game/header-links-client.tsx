"use client";

import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<typeof Button>;

interface HeaderLinkProps extends Omit<ButtonProps, 'asChild' | 'variant' | 'size' | 'className'> {
    href: string;
    exact?: boolean;
    className?: string;
    activeClassName?: string;
    children: React.ReactNode;
}

const HeaderLinksClient = ({
    href,
    exact = false,
    className,
    activeClassName = "text-foreground font-semibold underline",
    children,
    ...props
}: HeaderLinkProps) => {
    const pathname = usePathname();

    // Check if the current route matches the link
    const isActive = exact
        ? pathname === href
        : pathname.startsWith(href) && (href !== '/' || pathname === '/');

    return (
        <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
                "px-2 sm:px-3 font-medium hover:bg-transparent hover:underline transition-colors",
                isActive && activeClassName,
                className
            )}
            {...props}
        >
            <Link href={href}>
                {children}
            </Link>
        </Button>
    );
};

export default HeaderLinksClient;
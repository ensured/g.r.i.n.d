"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";


interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    exact?: boolean;
}

export function NavLink({
    href,
    children,
    className = "",
    exact = false,
}: NavLinkProps) {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname.startsWith(href) && (href !== '/' || pathname === '/');

    return (
        <Button
            asChild
            variant="ghost"
            size="sm"
            className={`px-3 font-medium transition-colors hover:bg-accent/20 ${isActive ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'text-muted-foreground hover:text-foreground'
                } ${className}`}
        >
            <Link href={href}>
                {children}
            </Link>
        </Button>
    );
}

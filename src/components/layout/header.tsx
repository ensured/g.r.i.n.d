"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Gamepad2, Book } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur ">
            <div className="px-4 flex h-14 items-center justify-between lg:px-6">
                <div className="flex items-center space-x-4">
                    <Button
                        asChild
                        variant={pathname === "/" ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            <span>Home</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant={pathname.startsWith("/rules") ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center justify-center gap-2 px-3"
                    >
                        <Link href="/rules" className="flex items-center gap-2">
                            <Book className="h-4 w-4 flex-shrink-0" />
                            <span >Rules</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant={pathname.startsWith("/games") ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Link href="/games">
                            <Gamepad2 className="h-4 w-4" />
                            <span>Games</span>
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}

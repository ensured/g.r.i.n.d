"use client";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // Ensure we only render on the client to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder with the same dimensions to prevent layout shift
        return (
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
                <div className="w-5 h-5" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:opacity-70 cursor-pointer"
        >
            {theme === "dark" ? (
                <Sun className="!size-4" />
            ) : (
                <Moon className="!size-4" />
            )}
        </Button>
    );
}

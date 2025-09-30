

import Link from "next/link";
import { Button } from "@/components/ui/button";
// import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur ">
            <div className="px-4 flex h-14 items-center justify-between lg:px-6">
                <div className="flex items-center space-x-4">
                    <Button
                        asChild
                        variant="link"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Link href="/">
                            <span>G.R.I.N.D</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Link href="/games" className="flex items-center gap-2">
                            <span>Games</span>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <Link href="/tricks" className="flex items-center gap-2">
                            <span>Tricks</span>
                        </Link>
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <SignedOut>
                        <SignInButton />
                        <SignUpButton>
                            <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                                Sign Up
                            </button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>

                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}

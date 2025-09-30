import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { NavLink } from "../ui/nav-link";

// Using pill style for all navigation links for a clean, consistent look

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className=" w-full justify-between flex h-16 items-center px-4 sm:px-6 lg:px-8">
                <div className="flex items-center">
                    <nav className="flex items-center space-x-1 sm:space-x-2">
                        <NavLink href="/">G.R.I.N.D</NavLink>
                        <NavLink href="/games">Games</NavLink>
                        <NavLink href="/tricks">Tricks</NavLink>
                    </nav>
                </div>

                <div className="flex flex-1 items-center justify-end space-x-2">
                    <div className="flex items-center gap-2">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm" className="px-3">
                                    Sign In
                                </Button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <Button size="sm" className="px-3">
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="flex items-center gap-4">
                                <div className="flex h-8 w-8 items-center justify-center">
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                userButtonAvatarBox: 'h-7 w-7',
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </SignedIn>
                        <div className="h-6 w-px bg-border" />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}

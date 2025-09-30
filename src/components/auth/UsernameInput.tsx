'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;

export function UsernameInput({ onSuccess }: { onSuccess: (username: string) => void }) {
    const { user, isSignedIn, isLoaded } = useUser();
    const [username, setUsername] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isSignedIn && user?.username) {
            setUsername(user.username);
        }
    }, [isSignedIn, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoaded) return;

        // Validate username
        if (username.length < USERNAME_MIN_LENGTH) {
            toast.error(`Username must be at least ${USERNAME_MIN_LENGTH} characters`);
            return;
        }

        if (username.length > USERNAME_MAX_LENGTH) {
            toast.error(`Username cannot exceed ${USERNAME_MAX_LENGTH} characters`);
            return;
        }

        // Only allow alphanumeric, underscores, and hyphens
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(username)) {
            toast.error('Username can only contain letters, numbers, underscores, and hyphens');
            return;
        }

        setIsSubmitting(true);

        try {
            // Update the username in Clerk
            await user?.update({
                username: username.toLowerCase() // Store usernames in lowercase
            });

            toast.success('Username set successfully!');
            router.refresh(); // Refresh to update the UI
            onSuccess(username);
        } catch (error) {
            console.error('Error updating username:', error);
            toast.error('Failed to set username. Please try another one.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isSignedIn) return null;

    return (
        <div className="w-full max-w-md mx-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                        Choose a username
                    </label>
                    <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        minLength={USERNAME_MIN_LENGTH}
                        maxLength={USERNAME_MAX_LENGTH}
                        className="w-full"
                        required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {USERNAME_MIN_LENGTH}-{USERNAME_MAX_LENGTH} characters. Letters, numbers, underscores, and hyphens only.
                    </p>
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Saving...' : 'Save Username'}
                </Button>
            </form>
        </div>
    );
}

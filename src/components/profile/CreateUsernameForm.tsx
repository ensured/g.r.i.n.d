'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Profile } from '@/lib/types';


export function CreateUsernameForm({ profile, saveProfile }: { profile: Profile | undefined; saveProfile: (username: string) => Promise<Profile> }) {
  const [username, setUsername] = useState(profile?.username || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setSaveError('Username cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      await saveProfile(username.trim());
    } catch (err) {
      console.error('Error saving username:', err);
      setSaveError(err instanceof Error ? err.message : 'Failed to save username');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {profile ? 'Update Username' : 'Choose a Username'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full max-w-md"
            disabled={isSaving}
            required
          />
          <p className="mt-1 text-sm text-muted-foreground">
            This will be your display name in the game.
          </p>
        </div>

        {saveError && (
          <p className="text-sm text-red-500">{saveError}</p>
        )}

        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : profile ? (
            'Update Username'
          ) : (
            'Save Username'
          )}
        </Button>
      </form>
    </div>
  );
}

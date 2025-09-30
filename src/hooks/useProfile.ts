import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Profile } from "@/lib/types";

export function useProfile() {
  const { getToken, isLoaded, userId } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isLoaded || !userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Profile doesn't exist yet, which is fine
          setProfile(null);
        } else {
          throw new Error("Failed to fetch profile");
        }
      } else {
        const data = await response.json();
        setProfile(data);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, userId]);

  const saveProfile = async (username: string): Promise<Profile> => {
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const token = await getToken();
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save profile");
    }

    const data = await response.json();
    setProfile(data);
    return data;
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    profileLoading: loading,
    error,
    refresh: fetchProfile,
    saveProfile,
  };
}

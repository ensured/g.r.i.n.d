import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getProfileByUserId,
  createProfile,
  updateProfile,
} from "@/lib/profiles";
import { Profile } from "@/lib/types";

// GET /api/profile - Get current user's profile
export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getProfileByUserId(userId);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/profile - Create or update profile
export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = (await request.json()) as { username: string };

    if (!data.username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check if profile exists
    const existingProfile = await getProfileByUserId(userId);

    let profile: Profile;

    if (existingProfile) {
      // Update existing profile
      profile = await updateProfile(userId, { username: data.username });
    } else {
      // Create new profile
      profile = await createProfile({
        user_id: userId,
        username: data.username,
      });
    }

    return NextResponse.json(profile);
  } catch (error: unknown) {
    console.error("Error saving profile:", error);

    if (error instanceof Error && error.message === "Username is already taken") {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

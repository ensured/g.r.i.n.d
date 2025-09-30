import { pool } from "./db";
import { Profile, CreateProfileInput, UpdateProfileInput } from "./types";

export async function getProfileByUserId(
  userId: string
): Promise<Profile | null> {
  const result = await pool.query<Profile>(
    "SELECT * FROM profiles WHERE user_id = $1",
    [userId]
  );
  return result.rows[0] || null;
}

export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const result = await pool.query<Profile>(
    "SELECT * FROM profiles WHERE LOWER(username) = LOWER($1)",
    [username]
  );
  return result.rows[0] || null;
}

export async function createProfile(
  input: CreateProfileInput
): Promise<Profile> {
  const { user_id, username } = input;

  // Check if username is already taken
  const existingProfile = await getProfileByUsername(username);
  if (existingProfile) {
    throw new Error("Username is already taken");
  }

  const result = await pool.query<Profile>(
    `INSERT INTO profiles (user_id, username)
     VALUES ($1, $2)
     RETURNING *`,
    [user_id, username]
  );

  return result.rows[0];
}

export async function updateProfile(
  userId: string,
  updates: UpdateProfileInput
): Promise<Profile> {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  if (updates.username) {
    fields.push(`username = $${paramIndex}`);
    values.push(updates.username);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error("No valid fields to update");
  }

  // Add updated_at timestamp
  fields.push(`updated_at = NOW()`);

  // Add user_id for WHERE clause
  values.push(userId);

  const query = `
    UPDATE profiles
    SET ${fields.join(", ")}
    WHERE user_id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query<Profile>(query, values);

  if (result.rows.length === 0) {
    throw new Error("Profile not found");
  }

  return result.rows[0];
}

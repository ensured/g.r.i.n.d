export interface Profile {
  id: string;
  user_id: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProfileInput {
  user_id: string;
  username: string;
}

export interface UpdateProfileInput {
  username?: string;
}



export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar_url?: string | null;
  avatar_id?: number;
  member_since?: string;
  created_at?: string;
  updated_at?: string;

  major?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  other_url?: string | null;
  fav_language?: string | null;
  fav_class?: string | null;
  fav_professor?: string | null;
  fav_game?: string | null;
  fav_graphics_topic?: string | null;
  fav_custom?: string | null;
  least_fav_language?: string | null;
  operating_system?: string | null;
  graphics_software?: string | null;
}

export interface Channel {
  id: string;
  slug: string;
  name: string;
  description?: string;
  created_at?: string;
  member_count?: number;
  is_member?: boolean;
}

export interface Message {
  id: string;
  author_id?: string;
  author_username?: string;
  author_name?: string;
  author_avatar?: string | null;
  message_type?: "user" | "system_join" | "system_leave";
  text?: string;
  image_data?: string | null;
  parent_id?: string | null;
  parent_text?: string | null;
  parent_image?: string | null;
  parent_author_name?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  project_url?: string;
  date_label?: string;
  created_at?: string;
  updated_at?: string;
  author_id?: string;
  author_username?: string;
  author_name?: string;
  author_avatar?: string | null;
  tags?: { name: string }[] | string[];
  thumbnail?: string | null;

  images?: { id: string; image_url: string; display_order: number }[];
  tech?: { id: string; name: string; display_order: number }[];
  highlights?: { id: string; description: string; display_order: number }[];
}

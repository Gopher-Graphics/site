export interface User {
  x500: string;
  password?: string;
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

export interface Channel {
  id: string;
  name: string;
  desc: string;
}

export interface Message {
  id: number;
  author: string;
  text?: string;
  time: string;
  replyTo?: number;
  avatar?: string;
  isMe?: boolean;
  type?: "system_join" | "system_leave";
  image_data?: string | null;
  replyToMsg?: Message | null;
}

export interface Project {
  id: number;
  title: string;
  author: string;
  tags: string[];
  desc: string;
  date: string;
  longDesc: string;
  tech: string[];
  github: string;
  preview: string[];
  images?: string[];
  img?: string | null;
}

export type MessagesByChannel = Record<string, Message[]>;
export type DirectMessages = Record<string, Message[]>;

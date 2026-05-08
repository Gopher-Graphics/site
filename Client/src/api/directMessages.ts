import { get, post, del } from "./http";
import { Message } from "../types";

export interface Conversation {
  partner_id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  last_message: string | null;
  last_message_at: string;
}

export async function getDirectMessages(userId: string, limit: number = 15, options?: { before?: string; since?: string }) {
  const query = new URLSearchParams();
  query.append("limit", String(limit));
  if (options?.before) query.append("before", options.before);
  if (options?.since) query.append("since", options.since);
  
  return get<Message[]>(`/direct-messages/${userId}?${query.toString()}`);
}

export async function sendDirectMessage(data: { receiver_id: string; text?: string; image_data?: string; parent_id?: string }) {
  return post<Message>("/direct-messages", data);
}

export async function deleteDirectMessage(messageId: string) {
  return del<{ deleted: string }>(`/direct-messages/${messageId}`);
}

export async function getConversations() {
  return get<Conversation[]>("/direct-messages/conversations");
}

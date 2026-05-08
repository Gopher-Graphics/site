import { get, post, del } from "./http";
import { Channel, Message } from "../types";

export async function getChannels() {
  return get<Channel[]>("/channels");
}

export async function getChannel(slug: string) {
  return get<Channel>(`/channels/${slug}`);
}

export async function createChannel(data: { name: string; description?: string }) {
  return post<Channel>("/channels", data);
}

export async function joinChannel(slug: string) {
  return post<{ joined: string }>(`/channels/${slug}/join`);
}

export async function leaveChannel(slug: string) {
  return post<{ left: string }>(`/channels/${slug}/leave`);
}

export async function getChannelMessages(slug: string, limit: number = 15, options?: { before?: string; since?: string }) {
  const query = new URLSearchParams();
  query.append("limit", String(limit));
  if (options?.before) query.append("before", options.before);
  if (options?.since) query.append("since", options.since);
  
  return get<Message[]>(`/channels/${slug}/messages?${query.toString()}`);
}

export async function postChannelMessage(slug: string, data: { text?: string; image_data?: string; parent_id?: string }) {
  return post<Message>(`/channels/${slug}/messages`, data);
}

export async function deleteChannelMessage(slug: string, messageId: string) {
  return del<{ deleted: string }>(`/channels/${slug}/messages/${messageId}`);
}

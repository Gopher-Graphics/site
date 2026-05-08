import { get } from "./http";
import { User } from "../types";

export async function getUsers(): Promise<User[]> {
  return get<User[]>("/users");
}

export async function getUserByUsername(username: string): Promise<User> {
  return get<User>(`/users/${username}`);
}

export async function getUserById(id: string): Promise<User> {
  return get<User>(`/users/id/${id}`);
}

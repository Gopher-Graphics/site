import { post, get, setToken, clearToken, getToken } from "./http";
export { getToken };
import { User } from "../types";

export interface LoginResponse {
  token: string;
  username: string;
}

export async function login(username_raw: string, password: string):Promise<LoginResponse> {
  const res = await post<LoginResponse>("/users/login", { username_raw, password });
  setToken(res.token);
  return res;
}

export async function signup(username_raw: string, password: string, name: string, avatar_string?: string):Promise<LoginResponse> {
  const isBase64 = avatar_string?.startsWith("data:");
  const payload = isBase64 
    ? { username_raw, password, name, avatar_data: avatar_string }
    : { username_raw, password, name, avatar_url: avatar_string };
  const res = await post<LoginResponse>("/users/create", payload);
  setToken(res.token);
  return res;
}

export async function logout() {
  clearToken();
}

export async function getMe(): Promise<User> {
  return get<User>("/users/me");
}

export async function updateProfile(data: {
  name?: string;
  username?: string;
  avatar_data?: string;
  avatar_url?: string;
  role?: string;
  member_since?: string;
  major?: string;
  github_url?: string;
  linkedin_url?: string;
  other_url?: string;
  fav_language?: string;
  fav_class?: string;
  fav_professor?: string;
  fav_game?: string;
  fav_graphics_topic?: string;
  fav_custom?: string;
  least_fav_language?: string;
  operating_system?: string;
  graphics_software?: string;
}): Promise<User> {
  return post<User>("/users/edit", data);
}

export async function deleteAccount() {
  return del<{ message: string }>("/users/delete");
}


import { get, post, put, del } from "./http";
import { Project } from "../types";

export interface ProjectsResponse {
  projects: Project[];
  tags: { id: string; name: string }[];
}

export async function getProjects(params?: { tag?: string; author?: string; limit?: number; offset?: number }) {
  const query = new URLSearchParams();
  if (params?.tag) query.append("tag", params.tag);
  if (params?.author) query.append("author", params.author);
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.offset) query.append("offset", String(params.offset));

  const qs = query.toString();
  const url = qs ? `/projects?${qs}` : "/projects";
  return get<ProjectsResponse>(url);
}

export async function getProject(id: string) {
  return get<Project>(`/projects/${id}`);
}

export async function createProject(data: any) {
  return post<{ id: string }>("/projects", data);
}

export async function updateProject(id: string, data: any) {
  return put<Project>(`/projects/${id}`, data);
}

export async function deleteProject(id: string) {
  return del<{ deleted: string }>(`/projects/${id}`);
}


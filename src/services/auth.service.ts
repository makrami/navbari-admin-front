import { z } from "zod";
import { http } from "../lib/http";
import { useAuthStore } from "../store/auth.store";

const loginResponseSchema = z.object({ token: z.string() });

export async function login(username: string, password: string) {
  const res = await http.post("/auth/login", { username, password });
  const parsed = loginResponseSchema.parse(res.data);
  useAuthStore.getState().setToken(parsed.token);
  return parsed;
}

export function logout() {
  useAuthStore.getState().logout();
}

// Demo-only auth (no API): accept any non-empty credentials and issue a fake token
export async function loginDemo(username: string, password: string) {
  if (!username || !password) {
    throw new Error("Missing credentials");
  }
  const fake = { token: `demo-${btoa(username)}-${Date.now()}` };
  useAuthStore.getState().setToken(fake.token);
  return fake;
}

export async function registerDemo(username: string, password: string) {
  // In real implementation we would call API; demo just logs in
  return loginDemo(username, password);
}



export const API_BASE = "http://localhost:3000";

const token = import.meta.env.ADMIN_TOKEN;

export function authHeaders(): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

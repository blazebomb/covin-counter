export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8089";

// Safely parse JSON while tolerating empty bodies.
export async function parseJsonSafe(res, fallbackValue) {
  const text = await res.text();
  if (!text) return fallbackValue;
  return JSON.parse(text);
}

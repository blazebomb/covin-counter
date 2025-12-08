import { useState } from "react";

// Persist auth token in localStorage so refresh keeps the session alive.
export function usePersistedToken(storageKey = "auth_token") {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey) || "");

  const update = (next) => {
    setToken(next);
    if (next) {
      localStorage.setItem(storageKey, next);
    } else {
      localStorage.removeItem(storageKey);
    }
  };

  return [token, update];
}

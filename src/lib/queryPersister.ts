import type { Persister } from "@tanstack/react-query-persist-client";

const CACHE_KEY = "lamha_query_cache";

export const localStoragePersister: Persister = {
  persistClient: async (client) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(client));
    } catch {
      // Storage full or unavailable
    }
  },
  restoreClient: async () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : undefined;
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // Ignore
    }
  },
};

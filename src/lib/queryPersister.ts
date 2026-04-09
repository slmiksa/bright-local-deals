import { createSyncStoragePersister } from "@tanstack/react-query-persist-client";

export const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "lamha_query_cache",
  throttleTime: 1000,
});

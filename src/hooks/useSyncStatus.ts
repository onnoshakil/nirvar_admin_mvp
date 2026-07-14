import { useQuery } from "@tanstack/react-query";
import type { SyncStatus } from "@/types";

export function useSyncStatus(enabled = false) {
  return useQuery<SyncStatus>({
    queryKey: ["syncStatus"],
    queryFn: async () => {
      const res = await fetch("/api/policy/sync-status");
      if (!res.ok) throw new Error("Failed to fetch sync status");
      return res.json();
    },
    enabled,
    refetchInterval: enabled ? 10_000 : false,
  });
}

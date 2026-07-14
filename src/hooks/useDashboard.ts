import { useQuery } from "@tanstack/react-query";
import type { InstAdminDashboard, SuperAdminDashboard } from "@/types";

export function useDashboard<T = InstAdminDashboard | SuperAdminDashboard>() {
  return useQuery<T>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
    refetchInterval: 60_000,
  });
}

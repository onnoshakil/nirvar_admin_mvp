import { useQuery } from "@tanstack/react-query";
import type { InstitutionListItem } from "@/types";

export function useInstitutions() {
  return useQuery<InstitutionListItem[]>({
    queryKey: ["institutions"],
    queryFn: async () => {
      const res = await fetch("/api/institutions");
      if (!res.ok) throw new Error("Failed to fetch institutions");
      return res.json();
    },
  });
}

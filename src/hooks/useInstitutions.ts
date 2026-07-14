import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InstitutionListItem } from "@/types";
import type { CreateInstitutionInput } from "@/lib/validators/institution";

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

export interface CreateInstitutionError {
  status: number;
  error?: string;
  details?: unknown;
}

export function useCreateInstitution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInstitutionInput) => {
      const res = await fetch("/api/institutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw { status: res.status, ...json } as CreateInstitutionError;
      return json as InstitutionListItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PolicyData } from "@/types";
import type { UpdatePolicyInput } from "@/lib/validators/policy";

export function usePolicy() {
  return useQuery<PolicyData | null>({
    queryKey: ["policy"],
    queryFn: async () => {
      const res = await fetch("/api/policy");
      if (!res.ok) throw new Error("Failed to fetch policy");
      return res.json();
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePolicyInput) => {
      const res = await fetch("/api/policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update policy");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policy"] });
      queryClient.invalidateQueries({ queryKey: ["syncStatus"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

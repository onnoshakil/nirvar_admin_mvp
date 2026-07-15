import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  InstitutionListItem,
  InstitutionDetail,
  InstitutionStatus,
} from "@/types";
import type {
  CreateInstitutionInput,
  AddAdminInput,
} from "@/lib/validators/institution";

export interface ApiError {
  status: number;
  error?: string;
  details?: unknown;
}

/** Backwards-compatible alias (used by InstitutionForm). */
export type CreateInstitutionError = ApiError;

async function parseOrThrow(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw { status: res.status, ...json } as ApiError;
  return json;
}

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

export function useInstitution(id: string) {
  return useQuery<InstitutionDetail>({
    queryKey: ["institution", id],
    queryFn: async () => {
      const res = await fetch(`/api/institutions/${id}`);
      if (!res.ok) throw { status: res.status } as ApiError;
      return res.json();
    },
    enabled: !!id,
  });
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
      return parseOrThrow(res) as Promise<InstitutionListItem>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateInstitutionStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: InstitutionStatus) => {
      const res = await fetch(`/api/institutions/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution", id] });
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useAddAdmin(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddAdminInput) => {
      const res = await fetch(`/api/institutions/${id}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution", id] });
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
    },
  });
}

export function useRemoveAdmin(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adminId: string) => {
      const res = await fetch(`/api/institutions/${id}/admins/${adminId}`, {
        method: "DELETE",
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institution", id] });
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
    },
  });
}

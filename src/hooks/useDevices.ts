import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeviceListItem } from "@/types";

export function useDevices() {
  return useQuery<DeviceListItem[]>({
    queryKey: ["devices"],
    queryFn: async () => {
      const res = await fetch("/api/devices");
      if (!res.ok) throw new Error("Failed to fetch devices");
      return res.json();
    },
  });
}

export function useRegisterDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      deviceId: string;
      deviceModel?: string;
      deviceName?: string;
    }) => {
      const res = await fetch("/api/devices/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw { status: res.status, ...json };
      return { ...json, statusCode: res.status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRemoveDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove device");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

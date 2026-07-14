import { useQuery } from "@tanstack/react-query";
import type { StudentListItem } from "@/types";

export function useStudents() {
  return useQuery<StudentListItem[]>({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await fetch("/api/students");
      if (!res.ok) throw new Error("Failed to fetch students");
      return res.json();
    },
  });
}

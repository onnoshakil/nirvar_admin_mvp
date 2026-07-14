import { auth } from "@/lib/auth";

export async function getAuthSession() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export function getInstitutionScope(
  user: { role: string; institutionId: string | null },
  searchParams?: URLSearchParams
): string | null {
  if (user.role === "INST_ADMIN") {
    return user.institutionId;
  }

  if (user.role === "SUPER_ADMIN" && searchParams) {
    return searchParams.get("institutionId");
  }

  return null;
}

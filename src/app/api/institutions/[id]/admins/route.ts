import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// TODO: Nahid — implement POST (add admin) and DELETE (remove admin) handlers
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const admins = await prisma.adminUser.findMany({
    where: { institutionId: id, role: "INST_ADMIN" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json(admins);
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; adminId: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, adminId } = await params;

  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin || admin.institutionId !== id || admin.role !== "INST_ADMIN") {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const adminCount = await prisma.adminUser.count({
    where: { institutionId: id, role: "INST_ADMIN" },
  });
  if (adminCount <= 1) {
    return NextResponse.json(
      { error: "Cannot remove the last admin of an institution" },
      { status: 400 }
    );
  }

  await prisma.adminUser.delete({ where: { id: adminId } });

  return NextResponse.json({ success: true });
}

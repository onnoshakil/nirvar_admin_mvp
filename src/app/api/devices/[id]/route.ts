import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INST_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const device = await prisma.deviceRegistration.findUnique({
    where: { id },
  });

  if (!device || device.institutionId !== session.user.institutionId) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.deviceSyncStatus.deleteMany({
      where: { deviceId: device.deviceId },
    });
    await tx.student.deleteMany({
      where: { deviceId: device.deviceId },
    });
    await tx.deviceRegistration.delete({
      where: { id },
    });
  });

  return NextResponse.json({ message: "Device removed" });
}

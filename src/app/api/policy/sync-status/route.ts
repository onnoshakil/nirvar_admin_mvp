import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INST_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const institutionId = session.user.institutionId!;

  const policy = await prisma.globalPolicy.findUnique({
    where: { institutionId },
  });

  const policyVersion = policy?.version || 0;

  const totalDevices = await prisma.deviceRegistration.count({
    where: { institutionId },
  });

  const syncedDevices = await prisma.deviceSyncStatus.count({
    where: {
      device: { institutionId },
      policyVersionApplied: policyVersion,
    },
  });

  return NextResponse.json({
    policyVersion,
    totalDevices,
    syncedDevices,
    pendingDevices: totalDevices - syncedDevices,
  });
}

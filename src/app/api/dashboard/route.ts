import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "SUPER_ADMIN") {
    const [total, active, suspended, totalDevices] = await Promise.all([
      prisma.institution.count(),
      prisma.institution.count({ where: { status: "ACTIVE" } }),
      prisma.institution.count({ where: { status: "SUSPENDED" } }),
      prisma.deviceRegistration.count(),
    ]);

    return NextResponse.json({
      totalInstitutions: total,
      activeInstitutions: active,
      suspendedInstitutions: suspended,
      totalDevices,
    });
  }

  const institutionId = session.user.institutionId!;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const [totalDevices, onlineDevices, totalStudents, policy] =
    await Promise.all([
      prisma.deviceRegistration.count({ where: { institutionId } }),
      prisma.deviceSyncStatus.count({
        where: {
          device: { institutionId },
          lastHeartbeatAt: { gte: fiveMinutesAgo },
        },
      }),
      prisma.student.count({ where: { institutionId } }),
      prisma.globalPolicy.findUnique({ where: { institutionId } }),
    ]);

  const currentVersion = policy?.version || 0;
  const actuallySynced =
    currentVersion > 0
      ? await prisma.deviceSyncStatus.count({
          where: {
            device: { institutionId },
            policyVersionApplied: currentVersion,
          },
        })
      : 0;

  return NextResponse.json({
    totalDevices,
    onlineDevices,
    offlineDevices: totalDevices - onlineDevices,
    totalStudents,
    policyVersion: currentVersion || null,
    syncedDevices: actuallySynced,
    hasPolicyConfigured: !!policy,
  });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INST_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const devices = await prisma.deviceRegistration.findMany({
    where: { institutionId: session.user.institutionId! },
    include: {
      student: { select: { name: true, email: true } },
      syncStatus: {
        select: { policyVersionApplied: true, lastHeartbeatAt: true },
      },
    },
    orderBy: { registeredAt: "desc" },
  });

  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  const devicesWithStatus = devices.map((d) => {
    let onlineStatus: "online" | "offline" | "never_connected" =
      "never_connected";
    if (d.syncStatus?.lastHeartbeatAt) {
      const elapsed = now - d.syncStatus.lastHeartbeatAt.getTime();
      onlineStatus = elapsed < fiveMinutes ? "online" : "offline";
    }
    return { ...d, onlineStatus };
  });

  return NextResponse.json(devicesWithStatus);
}

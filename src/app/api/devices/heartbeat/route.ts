import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { heartbeatSchema } from "@/lib/validators/device";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = heartbeatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { deviceId, policyVersionApplied } = parsed.data;

  await prisma.deviceSyncStatus.upsert({
    where: { deviceId },
    update: {
      lastHeartbeatAt: new Date(),
      policyVersionApplied,
      lastSyncAt: new Date(),
    },
    create: {
      deviceId,
      lastHeartbeatAt: new Date(),
      policyVersionApplied,
    },
  });

  return NextResponse.json({ status: "ok" });
}

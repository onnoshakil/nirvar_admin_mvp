import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerDeviceSchema } from "@/lib/validators/device";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INST_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const institutionId = session.user.institutionId!;

  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
  });
  if (institution?.status === "SUSPENDED") {
    return NextResponse.json(
      { error: "Institution is suspended. New device registrations are not allowed." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = registerDeviceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { deviceId, deviceModel, deviceName } = parsed.data;

  const existing = await prisma.deviceRegistration.findUnique({
    where: { deviceId },
  });

  if (existing) {
    if (existing.institutionId === institutionId) {
      return NextResponse.json(
        { message: "Device already registered", device: existing },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { error: "Device is already registered to another institution" },
      { status: 409 }
    );
  }

  const device = await prisma.$transaction(async (tx) => {
    const dev = await tx.deviceRegistration.create({
      data: { deviceId, deviceModel, deviceName, institutionId },
    });

    await tx.deviceSyncStatus.create({
      data: { deviceId, policyVersionApplied: 0 },
    });

    return dev;
  });

  return NextResponse.json(device, { status: 201 });
}

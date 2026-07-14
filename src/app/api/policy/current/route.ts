import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");

  if (!deviceId) {
    return NextResponse.json(
      { error: "deviceId is required" },
      { status: 400 }
    );
  }

  const device = await prisma.deviceRegistration.findUnique({
    where: { deviceId },
  });

  if (!device) {
    return NextResponse.json({ policy: null, version: 0 });
  }

  const policy = await prisma.globalPolicy.findUnique({
    where: { institutionId: device.institutionId },
  });

  if (!policy) {
    return NextResponse.json({ policy: null, version: 0 });
  }

  return NextResponse.json({
    policy: {
      appWhitelist: policy.appWhitelist,
      appBlacklist: policy.appBlacklist,
      categoryFilters: policy.categoryFilters,
      screenTimeLimitMin: policy.screenTimeLimitMin,
      dnsSafeBrowsing: policy.dnsSafeBrowsing,
      installRestriction: policy.installRestriction,
    },
    version: policy.version,
  });
}

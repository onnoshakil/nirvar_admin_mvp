import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INST_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const students = await prisma.student.findMany({
    where: { institutionId: session.user.institutionId! },
    include: {
      device: { select: { deviceId: true, deviceModel: true } },
    },
    orderBy: { registeredAt: "desc" },
  });

  return NextResponse.json(students);
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerStudentSchema } from "@/lib/validators/student";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = registerStudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, email, deviceId } = parsed.data;

  const device = await prisma.deviceRegistration.findUnique({
    where: { deviceId },
    include: { institution: { select: { name: true } } },
  });

  if (!device) {
    return NextResponse.json({ linked: false });
  }

  await prisma.student.deleteMany({ where: { deviceId } });

  const student = await prisma.student.create({
    data: {
      name,
      email,
      deviceId,
      institutionId: device.institutionId,
    },
  });

  return NextResponse.json({
    linked: true,
    institutionName: device.institution.name,
    student,
  });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInstitutionSchema } from "@/lib/validators/institution";
import { hashPassword, generateTempPassword } from "@/lib/password";
import { sendTempPasswordEmail } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const institutions = await prisma.institution.findMany({
    include: {
      _count: { select: { devices: true, students: true, admins: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(institutions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createInstitutionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, address, contactEmail, contactPhone, admin } = parsed.data;

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: admin.email.toLowerCase() },
  });
  if (existingAdmin) {
    return NextResponse.json(
      { error: "Account already exists for this email" },
      { status: 409 }
    );
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const institution = await prisma.$transaction(async (tx) => {
    const inst = await tx.institution.create({
      data: {
        name,
        address: address || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
      },
    });

    await tx.adminUser.create({
      data: {
        email: admin.email.toLowerCase(),
        name: admin.name,
        passwordHash,
        role: "INST_ADMIN",
        institutionId: inst.id,
        mustChangePassword: true,
      },
    });

    return inst;
  });

  try {
    await sendTempPasswordEmail(
      admin.email,
      admin.name,
      name,
      tempPassword
    );
  } catch {
    // Email send failure should not block institution creation
    console.error("Failed to send temp password email");
  }

  return NextResponse.json(institution, { status: 201 });
}

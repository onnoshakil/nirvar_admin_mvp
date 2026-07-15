import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addAdminSchema } from "@/lib/validators/institution";
import { hashPassword, generateTempPassword } from "@/lib/password";
import { sendTempPasswordEmail } from "@/lib/email";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const admins = await prisma.adminUser.findMany({
    where: { institutionId: id, role: "INST_ADMIN" },
    select: { id: true, name: true, email: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(admins);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const institution = await prisma.institution.findUnique({ where: { id } });
  if (!institution) {
    return NextResponse.json(
      { error: "Institution not found" },
      { status: 404 }
    );
  }

  const body = await req.json();
  const parsed = addAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, email } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Account already exists for this email" },
      { status: 409 }
    );
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const admin = await prisma.adminUser.create({
    data: {
      email: normalizedEmail,
      name,
      passwordHash,
      role: "INST_ADMIN",
      institutionId: id,
      mustChangePassword: true,
    },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  try {
    await sendTempPasswordEmail(email, name, institution.name, tempPassword);
  } catch {
    // Email failure should not block admin creation
    console.error("Failed to send temp password email");
  }

  return NextResponse.json(admin, { status: 201 });
}

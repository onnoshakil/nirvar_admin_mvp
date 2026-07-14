import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateInstitutionSchema } from "@/lib/validators/institution";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (
    session.user.role === "INST_ADMIN" &&
    session.user.institutionId !== id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const institution = await prisma.institution.findUnique({
    where: { id },
    include: {
      admins: { select: { id: true, name: true, email: true } },
      _count: { select: { devices: true, students: true } },
    },
  });

  if (!institution) {
    return NextResponse.json(
      { error: "Institution not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(institution);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (
    session.user.role === "INST_ADMIN" &&
    session.user.institutionId !== id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateInstitutionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const institution = await prisma.institution.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(institution);
}

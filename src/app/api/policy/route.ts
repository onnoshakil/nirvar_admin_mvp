import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePolicySchema } from "@/lib/validators/policy";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "INST_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const policy = await prisma.globalPolicy.findUnique({
    where: { institutionId: session.user.institutionId! },
  });

  return NextResponse.json(policy);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INST_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updatePolicySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const institutionId = session.user.institutionId!;

  const existing = await prisma.globalPolicy.findUnique({
    where: { institutionId },
  });

  const policy = await prisma.globalPolicy.upsert({
    where: { institutionId },
    update: {
      ...parsed.data,
      version: (existing?.version || 0) + 1,
      updatedBy: session.user.id,
    },
    create: {
      institutionId,
      ...parsed.data,
      version: 1,
      updatedBy: session.user.id,
    },
  });

  return NextResponse.json(policy);
}

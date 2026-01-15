import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const child = await prisma.child.findUnique({
    where: { id },
    include: {
      parents: {
        include: {
          parent: true,
        },
      },
    },
  });

  if (!child) {
    return NextResponse.json({ error: "Criança não encontrada" }, { status: 404 });
  }

  return NextResponse.json(child);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { full_name, birth_date, classroom, allergies, medical_notes, emergency_contact } = body;

  const child = await prisma.child.update({
    where: { id },
    data: {
      full_name,
      birth_date: birth_date ? new Date(birth_date) : undefined,
      classroom,
      allergies,
      medical_notes,
      emergency_contact,
    },
  });

  return NextResponse.json(child);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.child.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

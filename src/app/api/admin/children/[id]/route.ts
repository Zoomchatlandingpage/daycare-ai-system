import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const child = await prisma.child.findUnique({
    where: { id: params.id },
    include: {
      parent_links: {
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
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, birth_date, classroom, allergies, notes, is_active } = body;

  const child = await prisma.child.update({
    where: { id: params.id },
    data: {
      full_name,
      birth_date: birth_date ? new Date(birth_date) : undefined,
      classroom,
      allergies,
      notes,
      is_active,
    },
  });

  return NextResponse.json(child);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.child.update({
    where: { id: params.id },
    data: { is_active: false },
  });

  return NextResponse.json({ success: true });
}

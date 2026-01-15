import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const children = await prisma.child.findMany({
    include: {
      parent_links: {
        include: {
          parent: true,
        },
      },
    },
    orderBy: { full_name: "asc" },
  });

  return NextResponse.json(children);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { full_name, birth_date, classroom, allergies, notes } = body;

  if (!full_name || !birth_date) {
    return NextResponse.json(
      { error: "Nome e data de nascimento são obrigatórios" },
      { status: 400 }
    );
  }

  const child = await prisma.child.create({
    data: {
      full_name,
      birth_date: new Date(birth_date),
      classroom: classroom || null,
      allergies: allergies || null,
      notes: notes || null,
    },
  });

  return NextResponse.json(child, { status: 201 });
}

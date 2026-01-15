import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parents = await prisma.parent.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
      child_links: {
        include: {
          child: true,
        },
      },
    },
    orderBy: { full_name: "asc" },
  });

  return NextResponse.json(parents);
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
  const { full_name, email, phone, password, child_ids } = body;

  if (!full_name || !email || !password) {
    return NextResponse.json(
      { error: "Nome, email e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Email já cadastrado" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password_hash: hashedPassword,
      role: "PARENT",
    },
  });

  const parent = await prisma.parent.create({
    data: {
      user_id: user.id,
      full_name,
      email,
      phone: phone || null,
    },
  });

  if (child_ids && child_ids.length > 0) {
    await prisma.parentChildLink.createMany({
      data: child_ids.map((child_id: string, index: number) => ({
        parent_id: parent.id,
        child_id,
        relationship: "parent",
        is_primary: index === 0,
        can_pickup: true,
      })),
    });
  }

  return NextResponse.json(parent, { status: 201 });
}

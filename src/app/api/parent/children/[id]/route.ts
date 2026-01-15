import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "PARENT" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  if (role === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { user_id: session.user.id },
      include: {
        children: {
          where: { child_id: id },
        },
      },
    });

    if (!parent || parent.children.length === 0) {
      return NextResponse.json(
        { error: "Criança não encontrada ou acesso não permitido" },
        { status: 404 }
      );
    }
  }

  const child = await prisma.child.findUnique({
    where: { id },
    include: {
      parents: {
        include: {
          parent: {
            select: {
              full_name: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (!child) {
    return NextResponse.json(
      { error: "Criança não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(child);
}

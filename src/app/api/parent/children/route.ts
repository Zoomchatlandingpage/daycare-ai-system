import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "PARENT" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (role === "ADMIN" || role === "SUPER_ADMIN") {
    const children = await prisma.child.findMany({
      where: { is_active: true },
      orderBy: { full_name: "asc" },
    });
    return NextResponse.json(children);
  }

  const parent = await prisma.parent.findUnique({
    where: { user_id: session.user.id },
    include: {
      children: {
        include: {
          child: true,
        },
      },
    },
  });

  if (!parent) {
    return NextResponse.json(
      { error: "Perfil de pai não encontrado" },
      { status: 404 }
    );
  }

  const children = parent.children.map((link) => ({
    ...link.child,
    relationship: link.relationship,
    is_primary: link.is_primary,
  }));

  return NextResponse.json(children);
}

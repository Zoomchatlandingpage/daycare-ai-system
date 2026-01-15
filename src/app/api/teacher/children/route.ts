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
  if (role !== "TEACHER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let classroom: string | null = null;

  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: session.user.id },
    });
    classroom = teacher?.classroom || null;
  }

  const children = await prisma.child.findMany({
    where: {
      is_active: true,
      ...(classroom ? { classroom } : {}),
    },
    orderBy: { full_name: "asc" },
  });

  return NextResponse.json(children);
}

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
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [childrenCount, teachersCount, parentsCount, leadsCount, todayLogs] =
    await Promise.all([
      prisma.child.count(),
      prisma.teacher.count(),
      prisma.parent.count(),
      prisma.lead.count({ where: { status: "NEW_LEAD" } }),
      prisma.routineLog.count({
        where: {
          logged_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

  return NextResponse.json({
    children: childrenCount,
    teachers: teachersCount,
    parents: parentsCount,
    newLeads: leadsCount,
    todayLogs: todayLogs,
  });
}

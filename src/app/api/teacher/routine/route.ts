import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "TEACHER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const childId = searchParams.get("child_id");
  const date = searchParams.get("date");

  const startOfDay = date
    ? new Date(date)
    : new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  let classroomFilter: string | undefined;
  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: session.user.id },
    });
    classroomFilter = teacher?.classroom || undefined;
  }

  const logs = await prisma.routineLog.findMany({
    where: {
      ...(childId ? { child_id: childId } : {}),
      ...(classroomFilter ? { child: { classroom: classroomFilter } } : {}),
      logged_at: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    include: {
      child: true,
      teacher: true,
    },
    orderBy: { logged_at: "desc" },
  });

  return NextResponse.json(logs);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "TEACHER" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { child_id, log_type, details } = body;

  if (!child_id || !log_type) {
    return NextResponse.json(
      { error: "Criança e tipo de registro são obrigatórios" },
      { status: 400 }
    );
  }

  const child = await prisma.child.findUnique({
    where: { id: child_id },
  });

  if (!child) {
    return NextResponse.json(
      { error: "Criança não encontrada" },
      { status: 404 }
    );
  }

  let teacherId: string | null = null;

  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: session.user.id },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado" },
        { status: 404 }
      );
    }

    if (child.classroom !== teacher.classroom) {
      return NextResponse.json(
        { error: "Criança não pertence à sua turma" },
        { status: 403 }
      );
    }

    teacherId = teacher.id;
  } else {
    const adminTeacher = await prisma.teacher.findUnique({
      where: { user_id: session.user.id },
    });
    teacherId = adminTeacher?.id || null;
  }

  const log = await prisma.routineLog.create({
    data: {
      child_id,
      teacher_id: teacherId,
      log_type,
      details: details || {},
      logged_at: new Date(),
    },
  });

  return NextResponse.json(log, { status: 201 });
}

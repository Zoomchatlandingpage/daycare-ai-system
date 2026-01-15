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

  let classroomFilter: string | undefined;
  if (role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: session.user.id },
    });
    classroomFilter = teacher?.classroom || undefined;
  }

  const events = await prisma.learningEvent.findMany({
    where: {
      ...(classroomFilter ? { classroom: classroomFilter } : {}),
      ...(childId
        ? {
            participants: {
              some: { child_id: childId },
            },
          }
        : {}),
    },
    include: {
      recorded_by: true,
      participants: {
        include: {
          child: true,
        },
      },
    },
    orderBy: { logged_at: "desc" },
    take: 50,
  });

  return NextResponse.json(events);
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
  const { child_ids, activity, description, skills, notes, is_group } = body;

  if (!child_ids || child_ids.length === 0 || !activity || !description) {
    return NextResponse.json(
      { error: "Crianças, atividade e descrição são obrigatórios" },
      { status: 400 }
    );
  }

  const children = await prisma.child.findMany({
    where: { id: { in: child_ids } },
  });

  if (children.length !== child_ids.length) {
    return NextResponse.json(
      { error: "Uma ou mais crianças não encontradas" },
      { status: 404 }
    );
  }

  let recordedById: string | null = null;
  let classroom: string | null = null;

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

    const invalidChildren = children.filter((c) => c.classroom !== teacher.classroom);
    if (invalidChildren.length > 0) {
      return NextResponse.json(
        { error: "Uma ou mais crianças não pertencem à sua turma" },
        { status: 403 }
      );
    }

    recordedById = teacher.id;
    classroom = teacher.classroom;
  } else {
    const adminTeacher = await prisma.teacher.findUnique({
      where: { user_id: session.user.id },
    });
    if (!adminTeacher) {
      return NextResponse.json(
        { error: "Administrador precisa de perfil de professor para registrar aprendizado" },
        { status: 400 }
      );
    }
    recordedById = adminTeacher.id;
    classroom = children[0]?.classroom || null;
  }

  const event = await prisma.learningEvent.create({
    data: {
      recorded_by_id: recordedById,
      activity,
      description,
      skills: skills || [],
      classroom,
      is_group: is_group || child_ids.length > 1,
      logged_at: new Date(),
      participants: {
        create: child_ids.map((child_id: string) => ({
          child_id,
          individual_notes: notes || null,
        })),
      },
    },
    include: {
      participants: {
        include: {
          child: true,
        },
      },
    },
  });

  return NextResponse.json(event, { status: 201 });
}

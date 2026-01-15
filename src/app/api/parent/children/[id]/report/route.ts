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
  if (role !== "PARENT" && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");

  const startOfDay = dateParam
    ? new Date(dateParam)
    : new Date(new Date().setHours(0, 0, 0, 0));
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

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
    select: {
      id: true,
      full_name: true,
      classroom: true,
      photo_url: true,
    },
  });

  if (!child) {
    return NextResponse.json(
      { error: "Criança não encontrada" },
      { status: 404 }
    );
  }

  const [routineLogs, incidents, learningEvents] = await Promise.all([
    prisma.routineLog.findMany({
      where: {
        child_id: id,
        logged_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        recorded_by: {
          select: {
            full_name: true,
          },
        },
      },
      orderBy: { logged_at: "desc" },
    }),
    prisma.incident.findMany({
      where: {
        child_id: id,
        occurred_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        recorded_by: {
          select: {
            full_name: true,
          },
        },
      },
      orderBy: { occurred_at: "desc" },
    }),
    prisma.learningEvent.findMany({
      where: {
        participants: {
          some: { child_id: id },
        },
        logged_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        recorded_by: {
          select: {
            full_name: true,
          },
        },
        participants: {
          where: { child_id: id },
          select: {
            individual_notes: true,
          },
        },
      },
      orderBy: { logged_at: "desc" },
    }),
  ]);

  const latestRoutine = routineLogs[0] || null;

  const report = {
    child,
    date: startOfDay.toISOString().split("T")[0],
    summary: {
      mood: latestRoutine?.mood || null,
      food_intake_pct: latestRoutine?.food_intake_pct ?? null,
      sleep_minutes: latestRoutine?.sleep_minutes ?? null,
      diaper: latestRoutine?.diaper || null,
      notes: latestRoutine?.notes || null,
      recorded_at: latestRoutine?.logged_at || null,
      teacher: latestRoutine?.recorded_by?.full_name || null,
    },
    routine_logs: routineLogs.map((log) => ({
      id: log.id,
      mood: log.mood,
      food_intake_pct: log.food_intake_pct,
      sleep_minutes: log.sleep_minutes,
      diaper: log.diaper,
      notes: log.notes,
      logged_at: log.logged_at,
      teacher: log.recorded_by.full_name,
    })),
    incidents: incidents.map((inc) => ({
      id: inc.id,
      severity: inc.severity,
      description: inc.description,
      action_taken: inc.action_taken,
      occurred_at: inc.occurred_at,
      teacher: inc.recorded_by.full_name,
    })),
    learning: learningEvents.map((evt) => ({
      id: evt.id,
      activity: evt.activity,
      description: evt.description,
      skills: evt.skills,
      is_group: evt.is_group,
      notes: evt.participants[0]?.individual_notes || null,
      logged_at: evt.logged_at,
      teacher: evt.recorded_by.full_name,
    })),
  };

  return NextResponse.json(report);
}

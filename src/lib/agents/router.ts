import { enrollmentAgent } from "./enrollment";
import { parentAccessAgent } from "./parent-access";
import { teacherAssistantAgent } from "./teacher-assistant";
import type { ChatRequest, StreamEvent, AgentContext } from "./types";
import prisma from "@/lib/prisma";

export async function* routeToAgent(
  request: ChatRequest,
  session: {
    userId?: string;
    userRole?: string;
    userName?: string;
  } | null
): AsyncGenerator<StreamEvent> {
  if (!session || !session.userId) {
    for await (const event of enrollmentAgent(request)) {
      yield event;
    }
    return;
  }

  const context: AgentContext = {
    userId: session.userId,
    userRole: session.userRole,
    userName: session.userName,
  };

  if (session.userRole === "PARENT") {
    const parent = await prisma.parent.findUnique({
      where: { user_id: session.userId },
    });
    if (parent) {
      context.parentId = parent.id;
    }

    for await (const event of parentAccessAgent({ ...request, context })) {
      yield event;
    }
    return;
  }

  if (session.userRole === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({
      where: { user_id: session.userId },
    });
    if (teacher) {
      context.teacherId = teacher.id;
      context.classroom = teacher.classroom || undefined;
    }

    for await (const event of teacherAssistantAgent({ ...request, context })) {
      yield event;
    }
    return;
  }

  if (session.userRole === "ADMIN" || session.userRole === "SUPER_ADMIN") {
    for await (const event of teacherAssistantAgent({ ...request, context })) {
      yield event;
    }
    return;
  }

  for await (const event of enrollmentAgent(request)) {
    yield event;
  }
}

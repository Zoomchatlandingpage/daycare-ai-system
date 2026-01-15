import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum([
    "NEW_LEAD",
    "CONTACTED",
    "VISIT_SCHEDULED",
    "VISITED",
    "WAITLISTED",
    "ENROLLED",
    "REJECTED",
  ]).optional(),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Get lead error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const validated = updateSchema.parse(body);

    const existingLead = await prisma.lead.findUnique({
      where: { id: params.id },
    });

    if (!existingLead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (validated.status) {
      updateData.status = validated.status;
    }

    if (validated.notes) {
      updateData.notes = existingLead.notes
        ? `${existingLead.notes}\n\n[${new Date().toLocaleDateString("pt-BR")}] ${validated.notes}`
        : `[${new Date().toLocaleDateString("pt-BR")}] ${validated.notes}`;
    }

    if (validated.assigned_to) {
      updateData.assigned_to = validated.assigned_to;
    }

    const lead = await prisma.lead.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("Update lead error:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao atualizar lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Apenas SUPER_ADMIN pode excluir leads" },
        { status: 403 }
      );
    }

    await prisma.lead.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir lead" },
      { status: 500 }
    );
  }
}

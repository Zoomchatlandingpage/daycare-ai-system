import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const leadSchema = z.object({
  parent_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  child_name: z.string().optional().nullable(),
  child_age: z.number().min(0).max(10).optional().nullable(),
  notes: z.string().optional().nullable(),
  source: z.string().optional().default("landing_page"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = leadSchema.parse(body);

    const existingLead = await prisma.lead.findFirst({
      where: { email: validated.email },
    });

    if (existingLead) {
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          parent_name: validated.parent_name,
          phone: validated.phone,
          child_name: validated.child_name,
          child_age: validated.child_age,
          notes: validated.notes
            ? existingLead.notes
              ? `${existingLead.notes}\n---\n${validated.notes}`
              : validated.notes
            : existingLead.notes,
        },
      });
      return NextResponse.json({ success: true, lead: updatedLead, updated: true });
    }

    const lead = await prisma.lead.create({
      data: {
        parent_name: validated.parent_name,
        email: validated.email,
        phone: validated.phone,
        child_name: validated.child_name,
        child_age: validated.child_age,
        notes: validated.notes,
        source: validated.source,
      },
    });

    return NextResponse.json({ success: true, lead, created: true }, { status: 201 });
  } catch (error) {
    console.error("Lead creation error:", error);

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Dados inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Método não permitido" },
    { status: 405 }
  );
}

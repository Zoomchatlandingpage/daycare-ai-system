import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parent_name, email, phone, child_name, child_age, source, notes } = body;

    if (!parent_name || !email || !phone) {
      return NextResponse.json(
        { error: "Nome, email e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    const existingLead = await prisma.lead.findFirst({
      where: { email },
    });

    if (existingLead) {
      const updatedLead = await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          parent_name,
          phone,
          child_name,
          child_age,
          notes: notes ? `${existingLead.notes || ""}\n${notes}`.trim() : existingLead.notes,
          updated_at: new Date(),
        },
      });
      return NextResponse.json(updatedLead);
    }

    const lead = await prisma.lead.create({
      data: {
        parent_name,
        email,
        phone,
        child_name,
        child_age,
        source: source || "CHAT_WIDGET",
        notes,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Erro ao criar lead" },
      { status: 500 }
    );
  }
}

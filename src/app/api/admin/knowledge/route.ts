import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const documents = await prisma.knowledgeDocument.findMany({
    orderBy: { updated_at: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, document_type, agent_target, tags } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Título e conteúdo são obrigatórios" },
      { status: 400 }
    );
  }

  const document = await prisma.knowledgeDocument.create({
    data: {
      title,
      content,
      document_type: document_type || "FAQ",
      agent_target: agent_target || [],
      tags: tags || [],
      uploaded_by: session.user.id,
      is_active: true,
    },
  });

  return NextResponse.json(document, { status: 201 });
}

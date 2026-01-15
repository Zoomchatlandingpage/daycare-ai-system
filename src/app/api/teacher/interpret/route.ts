import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { chat } from "@/lib/agents";

const EXTRACTION_PROMPT = `Você é um assistente que extrai informações estruturadas de texto livre sobre rotina de crianças em uma creche.

Dado um texto descritivo, extraia as seguintes informações em formato JSON:

- mood: VERY_HAPPY | HAPPY | NEUTRAL | SAD | TIRED | SICK (humor da criança)
- food_intake_pct: número de 0 a 100 (percentual de comida ingerida)
- sleep_minutes: número (minutos que dormiu)
- diaper: CLEAN | WET | DIRTY | NOT_APPLICABLE (estado da fralda)
- notes: string (observações adicionais)

Regras:
- "Comeu tudo" = 100%
- "Comeu bem" = 75%
- "Comeu parcialmente" = 50%
- "Comeu pouco" = 25%
- "Não comeu" = 0%
- Se não mencionar alimentação, retorne null para food_intake_pct
- Se não mencionar sono, retorne null para sleep_minutes
- Se não mencionar fralda, retorne "NOT_APPLICABLE"
- Se não mencionar humor explicitamente, tente inferir do contexto

Responda APENAS com o JSON, sem explicações.`;

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
  const { text, child_name } = body;

  if (!text) {
    return NextResponse.json(
      { error: "Texto é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const userMessage = child_name 
      ? `Extraia as informações sobre a criança "${child_name}": ${text}`
      : `Extraia as informações: ${text}`;

    const response = await chat(
      [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: userMessage },
      ],
      { temperature: 0.1, maxTokens: 500 }
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Não foi possível extrair informações do texto" },
        { status: 422 }
      );
    }

    const extracted = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      extracted: {
        mood: extracted.mood || null,
        food_intake_pct: extracted.food_intake_pct ?? null,
        sleep_minutes: extracted.sleep_minutes ?? null,
        diaper: extracted.diaper || "NOT_APPLICABLE",
        notes: extracted.notes || null,
      },
      original_text: text,
    });
  } catch (error) {
    console.error("Interpretation error:", error);
    return NextResponse.json(
      { error: "Erro ao interpretar texto" },
      { status: 500 }
    );
  }
}

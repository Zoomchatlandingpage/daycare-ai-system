import { streamChat, type ChatMessage } from "./openai";
import { getKnowledgeDocs, getAgentConfig } from "./knowledge";
import type { ChatRequest, StreamEvent, AgentContext } from "./types";
import prisma from "@/lib/prisma";

const DEFAULT_SYSTEM_PROMPT = `Você é um assistente virtual para professores da creche Daycare AI.
Você ajuda os professores com suas atividades diárias e dúvidas pedagógicas.

Suas responsabilidades:
1. Sugerir atividades educativas apropriadas para a faixa etária
2. Ajudar com descrições de atividades de aprendizado
3. Orientar sobre como lidar com situações do dia a dia
4. Responder dúvidas sobre procedimentos e políticas

Regras importantes:
- Sempre responda em português brasileiro
- Seja prático e objetivo
- Sugira atividades que desenvolvam habilidades específicas
- Use linguagem pedagógica apropriada
- Para emergências ou incidentes graves, oriente a seguir o protocolo da creche

Habilidades que podem ser trabalhadas:
- Motora fina e grossa
- Linguagem e comunicação
- Socialização
- Criatividade
- Raciocínio lógico
- Autonomia
`;

async function getTeacherContext(context: AgentContext): Promise<string> {
  if (!context.teacherId) return "";

  const teacher = await prisma.teacher.findUnique({
    where: { id: context.teacherId },
    select: {
      full_name: true,
      classroom: true,
    },
  });

  if (!teacher) return "";

  const childrenCount = await prisma.child.count({
    where: { classroom: teacher.classroom || undefined },
  });

  return `\n\nINFORMAÇÕES DO PROFESSOR:
Nome: ${teacher.full_name}
Turma: ${teacher.classroom || "Não definida"}
Crianças na turma: ${childrenCount}`;
}

export async function* teacherAssistantAgent(
  request: ChatRequest
): AsyncGenerator<StreamEvent> {
  try {
    const knowledgeBase = await getKnowledgeDocs(["TEACHER_ASSISTANT"]);
    const agentConfig = await getAgentConfig("TEACHER_ASSISTANT");
    const teacherContext = await getTeacherContext(request.context || {});

    const systemPrompt = agentConfig?.system_prompt || DEFAULT_SYSTEM_PROMPT;
    const temperature = agentConfig?.temperature || 0.7;
    const maxTokens = agentConfig?.max_tokens || 1000;

    const contextSection = knowledgeBase
      ? `\n\n--- DOCUMENTOS DA BASE DE CONHECIMENTO ---\n${knowledgeBase}`
      : "";

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt + contextSection + teacherContext },
      ...(request.conversationHistory || []).map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: request.message },
    ];

    const stream = await streamChat(messages, {
      temperature,
      maxTokens,
    });

    for await (const content of stream) {
      yield { type: "text", content };
    }

    yield { type: "done" };
  } catch (error) {
    console.error("Teacher assistant agent error:", error);
    yield {
      type: "error",
      error: error instanceof Error ? error.message : "Erro ao processar mensagem",
    };
  }
}

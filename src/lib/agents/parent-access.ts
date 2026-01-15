import { streamChat, type ChatMessage } from "./openai";
import { getKnowledgeDocs, getAgentConfig } from "./knowledge";
import type { ChatRequest, StreamEvent, AgentContext } from "./types";
import prisma from "@/lib/prisma";

const DEFAULT_SYSTEM_PROMPT = `Você é um assistente virtual para pais da creche Daycare AI.
Você ajuda os pais com informações sobre a creche e seus filhos.

Suas responsabilidades:
1. Responder perguntas sobre a rotina da creche
2. Explicar como usar o portal de pais
3. Informar sobre políticas, horários e procedimentos
4. Esclarecer dúvidas gerais

Regras importantes:
- Sempre responda em português brasileiro
- Seja acolhedor e empático
- Para ver o relatório diário do filho, oriente a usar o Portal de Pais
- Nunca invente informações - use apenas o que está no contexto
- Para assuntos urgentes, oriente a ligar diretamente para a creche

IMPORTANTE: O relatório diário (humor, alimentação, sono, atividades) está disponível 
no Portal de Pais. Oriente o pai a clicar no nome do filho para ver os detalhes do dia.
`;

async function getParentContext(context: AgentContext): Promise<string> {
  if (!context.parentId) return "";

  const parent = await prisma.parent.findUnique({
    where: { id: context.parentId },
    include: {
      children: {
        include: {
          child: {
            select: {
              full_name: true,
              classroom: true,
            },
          },
        },
      },
    },
  });

  if (!parent) return "";

  const childrenInfo = parent.children
    .map((link) => `- ${link.child.full_name} (${link.child.classroom})`)
    .join("\n");

  return `\n\nINFORMAÇÕES DO PAI:
Nome: ${parent.full_name}
Filhos na creche:
${childrenInfo || "Nenhum filho vinculado"}`;
}

export async function* parentAccessAgent(
  request: ChatRequest
): AsyncGenerator<StreamEvent> {
  try {
    const knowledgeBase = await getKnowledgeDocs(["PARENT_ACCESS"]);
    const agentConfig = await getAgentConfig("PARENT_ACCESS");
    const parentContext = await getParentContext(request.context || {});

    const systemPrompt = agentConfig?.system_prompt || DEFAULT_SYSTEM_PROMPT;
    const temperature = agentConfig?.temperature || 0.7;
    const maxTokens = agentConfig?.max_tokens || 1000;

    const contextSection = knowledgeBase
      ? `\n\n--- DOCUMENTOS DA BASE DE CONHECIMENTO ---\n${knowledgeBase}`
      : "";

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt + contextSection + parentContext },
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
    console.error("Parent access agent error:", error);
    yield {
      type: "error",
      error: error instanceof Error ? error.message : "Erro ao processar mensagem",
    };
  }
}

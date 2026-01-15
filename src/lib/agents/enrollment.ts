import { streamChat, type ChatMessage } from "./openai";
import { getKnowledgeDocs, getAgentConfig } from "./knowledge";
import type { ChatRequest, StreamEvent } from "./types";

const DEFAULT_SYSTEM_PROMPT = `Você é um assistente virtual amigável da creche Daycare AI. 
Seu objetivo é ajudar famílias interessadas em conhecer nossa creche.

Suas responsabilidades:
1. Responder perguntas sobre a creche, metodologia e estrutura
2. Coletar informações de contato de famílias interessadas (nome, email, telefone, nome e idade da criança)
3. Agendar visitas quando solicitado
4. Ser acolhedor, profissional e transmitir confiança

Regras importantes:
- Sempre responda em português brasileiro
- Seja conciso mas informativo
- Quando coletar dados, confirme as informações antes de finalizar
- Nunca invente informações sobre a creche - use apenas o que está no contexto
- Se não souber algo, diga que vai verificar ou sugira uma visita

Informações sobre a creche (use como base):
- Horário: Segunda a Sexta, 7h às 19h
- Turmas: Berçário (0-1 ano), Maternal I (1-2 anos), Maternal II (2-3 anos), Jardim (3-4 anos)
- Diferenciais: Acompanhamento diário via app, alimentação saudável, professores qualificados
`;

export async function* enrollmentAgent(
  request: ChatRequest
): AsyncGenerator<StreamEvent> {
  try {
    const knowledgeBase = await getKnowledgeDocs(["ENROLLMENT"]);
    const agentConfig = await getAgentConfig("ENROLLMENT");

    const systemPrompt = agentConfig?.system_prompt || DEFAULT_SYSTEM_PROMPT;
    const temperature = agentConfig?.temperature || 0.7;
    const maxTokens = agentConfig?.max_tokens || 1000;

    const contextSection = knowledgeBase
      ? `\n\n--- DOCUMENTOS DA BASE DE CONHECIMENTO ---\n${knowledgeBase}`
      : "";

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt + contextSection },
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
    console.error("Enrollment agent error:", error);
    yield {
      type: "error",
      error: error instanceof Error ? error.message : "Erro ao processar mensagem",
    };
  }
}

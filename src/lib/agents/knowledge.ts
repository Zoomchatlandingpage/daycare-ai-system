import prisma from "@/lib/prisma";
import { AgentType as PrismaAgentType } from "@/generated/prisma/client";

export async function getKnowledgeDocs(agentTypes: PrismaAgentType[]): Promise<string> {
  const docs = await prisma.knowledgeDocument.findMany({
    where: {
      agent_target: { hasSome: agentTypes },
      is_active: true,
    },
    orderBy: { updated_at: "desc" },
  });

  if (docs.length === 0) {
    return "";
  }

  return docs
    .map((doc) => `### ${doc.title}\n${doc.content}`)
    .join("\n\n---\n\n");
}

export async function getAgentConfig(agentType: PrismaAgentType) {
  return prisma.agentConfig.findUnique({
    where: { agent_type: agentType },
  });
}

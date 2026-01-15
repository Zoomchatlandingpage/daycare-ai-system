export type AgentType = "ROUTER" | "ENROLLMENT" | "PARENT_ACCESS" | "TEACHER_ASSISTANT";

export interface AgentContext {
  userId?: string;
  userRole?: string;
  userName?: string;
  parentId?: string;
  teacherId?: string;
  classroom?: string;
  knowledgeBase?: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  context?: AgentContext;
}

export interface StreamEvent {
  type: "text" | "done" | "error";
  content?: string;
  error?: string;
}

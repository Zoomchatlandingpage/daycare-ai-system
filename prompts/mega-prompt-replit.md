# 🚀 Mega-Prompt para Replit Agent - Daycare AI System v1.3

> **Status:** SOP v1.3 FROZEN
> **Última Atualização:** Janeiro 2026
> **Repositório:** https://github.com/Zoomchatlandingpage/daycare-ai-system

---

## 📋 Visão Geral do Projeto

Você vai construir o **Daycare AI System**, uma infraestrutura de confiança para gestão de creches com:

- ✅ Sistema de matrícula via chat (LLM)
- ✅ Portal de pais com relatórios visuais (Dashboard)
- ✅ App de professores para registro de atividades (LLM)
- ✅ Painel administrativo (CRUD)
- ✅ Configuração inicial do daycare (Wizard)

---

## 🏗️ Arquitetura de Modelos (CRÍTICO)

### Distribuição de LLMs

| Componente | Modelo | API Key | Justificativa |
|------------|--------|---------|---------------|
| **Agent 01 - Router** | Gemini | Google AI Studio | Classificação rápida, barato |
| **Agent 02 - Enrollment** | Claude | Anthropic | Conversação complexa |
| **Agent 04 - Teacher Assistant** | Claude | Anthropic | Extração JSON de linguagem natural |
| **Agent 07 - Compliance** | Gemini | Google AI Studio | Verificação binária |

### Interfaces SEM LLM (Frontend Puro)

| Interface | Tipo | Descrição |
|-----------|------|-----------|
| **Parent Portal** | Dashboard React | Relatórios visuais, gráficos |
| **Owner Onboarding** | Wizard Form | Configuração inicial |
| **Admin Panel** | CRUD | Gestão de anúncios |

### Orquestração

| Componente | Tech | Função |
|------------|------|--------|
| **N8N** | Webhook + Automation | Conecta agentes, dispara notificações |

---

## 🛠️ Stack Tecnológica
```
Frontend:     Next.js 14 (App Router) + TailwindCSS + Shadcn/UI + Recharts
Backend:      Next.js API Routes + Prisma ORM
Database:     PostgreSQL (Neon/Supabase)
Auth:         NextAuth.js
LLM Claude:   @anthropic-ai/sdk
LLM Gemini:   @google/generative-ai
Orquestração: N8N (webhook integration)
Idioma:       Código 100% em INGLÊS
```

---

## 📊 Schema do Banco de Dados

Consulte o arquivo completo em: `docs/schema/prisma-schema.md`

### Tabelas Principais

| Categoria | Tabelas |
|-----------|---------|
| **Auth** | `User`, `Session` |
| **Config** | `DaycareConfig`, `OperatingDay`, `Holiday`, `IllnessRule`, `PickupPolicy` |
| **CRM** | `Parent`, `Child`, `ParentChildLink`, `Teacher` |
| **Logs** | `RoutineLog`, `Incident`, `LearningEvent` |
| **Enrollment** | `Lead` |
| **Announcements** | `Announcement`, `AnnouncementRead` |
| **Security** | `StrikeLog`, `BlockedUser`, `SecurityLog` |

---

## 🤖 System Prompts dos Agentes

### Agent 01 — Language Router (Gemini)
```
Role: You are the Gatekeeper and Language Detector.

Task: Analyze the user's first input.

Output: JSON ONLY.

Format:
- New user: {"detected_language": "EN|PT|ES", "confidence": "high|low", "routing_target": "ENROLLMENT"}
- Auth keywords detected: {"detected_language": "EN|PT|ES", "routing_target": "PARENT_PORTAL"}

Auth Keywords: "login", "my child", "meu filho", "mi hijo", "report", "relatório"

Constraints:
1. Do NOT answer questions.
2. Do NOT access the database.
3. Output JSON only, nothing else.
```

### Agent 02 — Enrollment (Claude)
```
Role: You are the Enrollment Specialist for the Daycare.

Context Loading: Before responding about hours/availability, ALWAYS query:
- DaycareConfig for timezone and settings
- OperatingDay for schedule
- Holiday for closures

Data Persistence: Trigger database save after EACH piece of information:
1. Parent's Name → SAVE
2. Child's Name → SAVE
3. Child's Age → SAVE
4. Phone Number → SAVE
5. Preferred Visit Date → CHECK availability, then SAVE

Scheduling Rules:
- Only offer slots where OperatingDay.is_open = true
- Never offer slots on Holiday dates
- Confirm timezone with parent if ambiguous

No Vacancy Protocol:
If no slots available within 30 days, set lead_status to WAITLISTED.
Reply: "We are currently at full capacity. I've added you to our waitlist."

Language: Think in English, output in user's detected language.
Tone: Warm, professional, concise.
```

### Agent 04 — Teacher Assistant (Claude)
```
Role: You are the Teacher's Data Assistant.

Goal: Convert natural language into structured JSON for database.

Output: JSON only.

Protocol:
1. Receive input from teacher
2. Classify intent: ROUTINE_LOG | INCIDENT | LEARNING_EVENT
3. Validation Loop:

   ROUTINE_LOG requires:
   - child_name (ASK if missing)
   - food_intake_pct (0-100)
   - sleep_minutes
   - mood (HAPPY|NEUTRAL|SAD|CRANKY|TIRED)
   - diaper (WET|DIRTY|CLEAN|NA)

   INCIDENT requires:
   - child_name (ASK if missing)
   - severity (LOW|MEDIUM|HIGH)
   - description (ASK if vague)
   - action_taken (ASK if missing)
   - timestamp

   LEARNING_EVENT requires:
   - scope (INDIVIDUAL|GROUP|CLASS)
   - activity_type
   - description
   - skills_involved (array)

4. Illness Detection:
   If symptoms mentioned (fever, vomiting, etc.):
   - Query IllnessRule table
   - Add exclusion_required flag if rule exists
   - Include exclusion_hours from database

5. Commit: Generate JSON ONLY when all required fields present.

Rule: Never guess. Never assume. If unclear, ASK.
```

### Agent 07 — Compliance (Gemini)
```
Role: You are the Security Guardian.

Monitoring: Check all data access requests for scope violations.

3-Strike Rule:
- Strike 1-2: Deny access. Reply: "I cannot access information regarding other students."
- Strike 3: TRIGGER 'BLOCK_USER_EVENT'
  - Set user status = BLOCKED
  - Create SecurityLog entry
  - Send alert to Admin
  - Reply: "Security protocol activated. Access suspended."

Validation Checks:
1. Parent requesting child data → Verify ParentChildLink exists
2. Teacher accessing child → Verify teacher is assigned to child's class
3. Any user accessing config → Verify role permissions

Zero Tolerance: Do not explain. Do not negotiate. Block and alert.
```

---

## 📱 Interfaces do Sistema

### 1. Landing Page (`/`)
```
Tipo: Pública
Componentes:
- Hero Section (nome do daycare, CTA)
- Chat Widget (conecta ao Agent 02 via N8N webhook)
- Seção de features
- Footer com contato

Fluxo:
1. Visitante abre chat
2. N8N recebe mensagem → Agent 01 (Gemini) classifica
3. Se novo lead → Agent 02 (Claude) assume
4. Dados salvos em Lead table
```

### 2. Parent Portal (`/parent`)
```
Tipo: Protegido (Role: PARENT)
Tech: Dashboard React (SEM LLM)

Componentes:
- AnnouncementBanner (alertas ativos)
- ChildSelector (lista de filhos vinculados)
- DatePicker (selecionar data do relatório)
- ReportDashboard:
  - MoodCard (emoji + cor)
  - FoodProgressBar (%)
  - SleepBar (minutos → horas)
  - DiaperStatus (ícone)
  - IncidentTimeline (se houver)
  - LearningActivities (se houver)

API Endpoints:
- GET /api/parent/children → Lista filhos vinculados
- GET /api/parent/report?child_id=X&date=Y → Dados do dia
- GET /api/parent/announcements → Anúncios ativos
- POST /api/parent/announcements/{id}/read → Marcar como lido

Segurança:
- Query SEMPRE filtra por parent_id da sessão
- Impossível ver dados de outras crianças
```

### 3. Teacher App (`/teacher`)
```
Tipo: Protegido (Role: TEACHER)
Tech: Mobile-First + Chat com LLM

Componentes:
- ClassSelector (turma do professor)
- ChildList (crianças da turma)
- ChatInterface (conversa com Agent 04)
- QuickLogButtons (atalhos para rotina)

Fluxo:
1. Professor seleciona turma/criança
2. Digita naturalmente: "Maria slept 2 hours, ate 80%, happy mood"
3. Agent 04 (Claude) extrai JSON
4. Validação visual: "Confirm: Maria - Sleep 120min, Food 80%, Mood Happy?"
5. Professor confirma → Salva no banco

API Endpoints:
- GET /api/teacher/classes → Turmas do professor
- GET /api/teacher/children?class_id=X → Crianças da turma
- POST /api/teacher/log → Salvar registro (via Agent 04)
```

### 4. Owner Onboarding (`/admin/setup`)
```
Tipo: Protegido (Role: OWNER, primeiro acesso)
Tech: Wizard Form (SEM LLM)

Passos:
1. Básico: Nome, Timezone, Idioma
2. Horários: Segunda-Domingo, abertura/fechamento
3. Regras de Saúde: Checklist + custom
4. Política de Atraso: Tolerância, multa

API Endpoint:
- POST /api/admin/config → Salva DaycareConfig completo

Redirect: Após completar → /admin/dashboard
```

### 5. Admin Panel (`/admin`)
```
Tipo: Protegido (Role: ADMIN, OWNER)
Tech: CRUD Dashboard (SEM LLM)

Seções:
- Dashboard (métricas gerais)
- Announcements (criar/editar/deletar)
- Users (gerenciar staff)
- Config (editar configurações)
- Security (ver logs, usuários bloqueados)

API Endpoints:
- CRUD /api/admin/announcements
- CRUD /api/admin/users
- GET /api/admin/security-logs
- GET /api/admin/blocked-users
```

---

## 🔄 Integração N8N

### Webhook de Entrada (Chat)
```
URL: https://[seu-n8n]/webhook/chat-incoming

Payload:
{
  "message": "string",
  "session_id": "string",
  "timestamp": "ISO8601"
}

Fluxo N8N:
1. Recebe mensagem
2. Chama Agent 01 (Gemini) → Classifica
3. Roteia para Agent 02 ou Agent 03
4. Retorna resposta
```

### Triggers de Notificação
```
Eventos que disparam N8N:
- Novo Lead criado → Email para Admin
- Visita agendada → SMS/Email para Pai
- Incidente HIGH → Alerta imediato para Pai
- 3-Strike Block → Email para Admin
- Novo Anúncio URGENT → Push para todos os Pais
```

---

## 🔐 Regras de Segurança (SOP v1.3)

### Hierarquia de Acesso

| Role | Parent Portal | Teacher App | Admin Panel | Config |
|------|---------------|-------------|-------------|--------|
| PARENT | ✅ Próprios filhos | ❌ | ❌ | ❌ |
| TEACHER | ❌ | ✅ Própria turma | ❌ | ❌ |
| ADMIN | ✅ Todos | ✅ Todos | ✅ Parcial | ❌ |
| OWNER | ✅ Todos | ✅ Todos | ✅ Total | ✅ |

### 3-Strike Rule
```
1º Strike: Log + Deny
2º Strike: Log + Deny + Warning
3º Strike: Log + Block + Alert Admin
```

### Validação de Acesso (Middleware)
```javascript
// Pseudo-código para TODA requisição de dados de criança
async function validateChildAccess(userId, childId) {
  const user = await getUser(userId);

  if (user.role === 'PARENT') {
    const link = await prisma.parentChildLink.findFirst({
      where: { parent_id: user.parent_id, child_id: childId }
    });
    if (!link) {
      await logStrike(userId, childId);
      throw new AccessDeniedError();
    }
  }

  if (user.role === 'TEACHER') {
    const assignment = await prisma.classAssignment.findFirst({
      where: { teacher_id: user.teacher_id, child_id: childId }
    });
    if (!assignment) {
      await logStrike(userId, childId);
      throw new AccessDeniedError();
    }
  }

  return true;
}
```

---

## 📁 Estrutura de Pastas (Next.js)
```
/app
  /page.tsx                    # Landing Page
  /api
    /chat/route.ts             # Webhook para N8N
    /parent
      /children/route.ts
      /report/route.ts
      /announcements/route.ts
    /teacher
      /classes/route.ts
      /children/route.ts
      /log/route.ts
    /admin
      /config/route.ts
      /announcements/route.ts
      /users/route.ts
  /(auth)
    /login/page.tsx
    /register/page.tsx
  /(dashboard)
    /parent
      /page.tsx                # Parent Portal
    /teacher
      /page.tsx                # Teacher App
    /admin
      /page.tsx                # Admin Dashboard
      /setup/page.tsx          # Owner Onboarding

/components
  /ui                          # Shadcn components
  /chat                        # Chat widget
  /dashboard                   # Dashboard components
  /forms                       # Form components

/lib
  /prisma.ts                   # Prisma client
  /auth.ts                     # NextAuth config
  /agents
    /router.ts                 # Agent 01 (Gemini)
    /enrollment.ts             # Agent 02 (Claude)
    /teacher.ts                # Agent 04 (Claude)
    /compliance.ts             # Agent 07 (Gemini)

/prisma
  /schema.prisma               # Database schema
```

---

## ✅ Checklist de Implementação

### Fase 1: Fundação
- [ ] Setup Next.js + Prisma + PostgreSQL
- [ ] Implementar schema v1.3
- [ ] Configurar NextAuth
- [ ] Criar middleware de segurança

### Fase 2: Config & Auth
- [ ] Owner Onboarding Wizard
- [ ] Login/Register pages
- [ ] Role-based routing

### Fase 3: Agentes
- [ ] Agent 01 (Gemini Router)
- [ ] Agent 02 (Claude Enrollment)
- [ ] Agent 04 (Claude Teacher)
- [ ] Agent 07 (Gemini Compliance)

### Fase 4: Interfaces
- [ ] Landing Page + Chat Widget
- [ ] Parent Portal Dashboard
- [ ] Teacher App
- [ ] Admin Panel

### Fase 5: Integração
- [ ] N8N Webhooks
- [ ] Notificações (Email/SMS)
- [ ] Testes end-to-end

---

## 🚨 Regras para o Replit

1. **NÃO invente lógica** — Siga esta spec exatamente
2. **Código em INGLÊS** — Variáveis, funções, comentários
3. **Consulte os docs** — Schema, interfaces, prompts estão definidos
4. **Pergunte se tiver dúvida** — Não assuma
5. **Teste cada componente** — Antes de integrar

---

**FIM DO MEGA-PROMPT v1.3**

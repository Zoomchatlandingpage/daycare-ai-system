# 🚀 MEGA-PROMPT PARA REPLIT (v1.2)

> **Copie e cole este conteúdo no chat do Replit Agent**
> > Versão atualizada com Schema Robusto + Knowledge Base + Query Direta
> >
> > ---
> >
> > ## DOCUMENTO DE EXECUÇÃO: DAYCARE AI SYSTEM (v1.2)
> >
> > ```
> > # ACT AS: Senior Full-Stack Developer & System Architect
> > # STACK: Next.js 14 (App Router), TailwindCSS, PostgreSQL (Prisma), Lucide React, NextAuth
> > # GOAL: Build "Trust Infrastructure" for Daycare - 3 Interfaces + Router + Admin Knowledge Base
> >
> > ---
> >
> > ## PHASE 1: DATABASE (Schema v1.2 Robusto)
> >
> > **Instruction:** Use o schema completo de:
> > https://github.com/Zoomchatlandingpage/daycare-ai-system/blob/main/docs/schema/prisma-schema.md
> >
> > ### Tabelas Principais:
> > - User, Session (autenticação segura)
> > - Parent, Teacher, Child (entidades core)
> > - ParentChildLink (N:N - múltiplos responsáveis)
> > - RoutineLog, Incident, LearningEvent (registros diários)
> > - Lead (funil de enrollment)
> > - StrikeLog, BlockedEntity (segurança 3 strikes)
> > - KnowledgeDocument, AgentConfig (Knowledge Base dinâmico)
> >
> > ### IMPORTANTE - Relacionamento N:N:
> > ```prisma
> > model ParentChildLink {
> >   parent_id     String
> >   child_id      String
> >   relationship  String  // "parent", "guardian", "grandparent"
> >   is_primary    Boolean
> >   can_pickup    Boolean
> >   @@unique([parent_id, child_id])
> > }
> > ```
> >
> > ---
> >
> > ## PHASE 2: THE 4 INTERFACES
> >
> > ### A. PUBLIC LANDING PAGE (/)
> > - Route: `/` (public, no auth)
> > - - Components: Hero Section + Chat Widget (bottom-right)
> >   - - Logic: Chat → Agent 02 (Enrollment)
> >     - - On lead capture: INSERT into `leads` table
> >       - - Design: Clean, professional, trust-building
> >        
> >         - ### B. TEACHER APP (/teacher)
> >         - - Route: `/teacher` (Protected - role: TEACHER or ADMIN)
> >           - - UI: Mobile-First responsive
> >             - - Form Fields:
> >               -   - Child selector (dropdown)
> >                   -   - Mood: Emoji selector (VERY_HAPPY, HAPPY, NEUTRAL, SAD, TIRED, SICK)
> >                       -   - Food: Slider 0-100%
> >                           -   - Sleep: Number input (minutes)
> >                               -   - Diaper: Select (CLEAN, WET, DIRTY, NOT_APPLICABLE)
> >                                   -   - Incidents: Textarea + Severity selector
> >                                       -   - Learning Activities: Textarea + Individual/Group toggle
> >                                           - - Submit: INSERT into routine_logs, incidents, learning_events
> >                                            
> >                                             - ### C. PARENT PORTAL (/parent)
> >                                             - - Route: `/parent` (Protected - role: PARENT)
> >                                               - - Dashboard: "Meus Filhos" list (via ParentChildLink)
> >                                                
> >                                                 - **⚠️ CRÍTICO: Relatório é QUERY DIRETA (sem IA)**
> >                                                 - - Parent selects DATE → clicks "Gerar Relatório"
> >                                                   - - API queries: routine_logs + incidents + learning_events
> >                                                     - - Frontend renders: <MoodEmoji>, <FoodProgress>, <SleepBar>, etc.
> >                                                       - - NO LLM for visualization = deterministic, fast, $0 cost
> >                                                        
> >                                                         - ```typescript
> >                                                           // API Response Contract
> >                                                           {
> >                                                             "meta": { "date": "...", "child_name": "..." },
> >                                                             "routine": { "mood": "HAPPY", "food_intake_pct": 85, ... },
> >                                                             "incidents": [],
> >                                                             "learning": [{ "activity": "...", "skills": [...] }]
> >                                                           }
> >                                                           ```
> >
> > ### D. ADMIN PANEL (/admin)
> > - Route: `/admin` (Protected - role: ADMIN or SUPER_ADMIN)
> > - - Features:
> >   -   - Upload KnowledgeDocuments for agents
> >       -   - Configure AgentConfig (prompts, temperature)
> >           -   - View StrikeLogs and BlockedEntities
> >               -   - Manage Users, Teachers, Parents
> >                
> >                   - ---
> >
> > ## PHASE 3: KNOWLEDGE BASE SYSTEM
> >
> > ### ADMs podem carregar documentos para os agentes
> >
> > **Tabela: KnowledgeDocument**
> > ```prisma
> > model KnowledgeDocument {
> >   title         String
> >   content       String        @db.Text
> >   document_type DocumentType  // POLICY, SCHEDULE, FAQ, RULES, etc.
> >   agent_target  AgentType[]   // [ENROLLMENT, PARENT_ACCESS, etc.]
> >   version       String
> >   is_active     Boolean
> >   tags          String[]
> > }
> > ```
> >
> > **Fluxo:**
> > 1. Admin acessa /admin/knowledge
> > 2. 2. Upload documento (PDF/TXT convertido para texto)
> >    3. 3. Seleciona: Tipo + Agentes que usam + Tags
> >       4. 4. Sistema indexa para consulta dos agentes
> >         
> >          5. **Uso pelos Agentes:**
> >          6. ```typescript
> >             // Antes de responder, agente busca documentos relevantes
> >             const docs = await prisma.knowledgeDocument.findMany({
> >               where: {
> >                 agent_target: { has: 'ENROLLMENT' },
> >                 is_active: true,
> >                 document_type: { in: ['POLICY', 'FAQ'] }
> >               }
> >             });
> >
> >             // Injeta no contexto do prompt
> >             const context = docs.map(d => d.content).join('\n');
> >             ```
> >
> > ---
> >
> > ## PHASE 4: THE ROUTER (Agent 01)
> >
> > - API Route: `/api/chat`
> > - - Logic:
> >   - ```typescript
> >     if (!session) {
> >       // Not logged in → Enrollment Agent + Knowledge Base v2.0
> >       const docs = await getKnowledgeDocs(['ENROLLMENT']);
> >       return enrollmentAgent(message, docs);
> >     } else if (session.user.role === 'PARENT') {
> >       // Parent → Parent Access Agent (chat only, not reports)
> >       const docs = await getKnowledgeDocs(['PARENT_ACCESS']);
> >       return parentAccessAgent(message, session.user, docs);
> >     } else if (session.user.role === 'TEACHER') {
> >       // Teacher → Teacher Assistant
> >       return teacherAssistantAgent(message, session.user);
> >     }
> >     ```
> >
> > ---
> >
> > ## PHASE 5: SECURITY (3 Strikes)
> >
> > **Every sensitive action logs to StrikeLog:**
> > - Failed login attempts
> > - - Unauthorized child access
> >   - - Suspicious queries
> >    
> >     - **Auto-block after 3 strikes:**
> >     - ```typescript
> >       async function checkStrikes(identifier: string) {
> >         const count = await prisma.strikeLog.count({
> >           where: { ip_address: identifier, occurred_at: { gte: last24h } }
> >         });
> >         if (count >= 3) {
> >           await prisma.blockedEntity.create({...});
> >           throw new BlockedError();
> >         }
> >       }
> >       ```
> >
> > ---
> >
> > ## EXECUTION ORDER
> >
> > 1. `npx prisma init` + copy schema from docs/schema
> > 2. 2. `npx prisma migrate dev`
> >    3. 3. Build Admin Panel first (to manage data)
> >       4. 4. Build Teacher App (to generate test data)
> >          5. 5. Build Parent Portal (to view data)
> >             6. 6. Build Landing Page + Router last
> >                7. 7. Configure Knowledge Base documents
> >                  
> >                   8. ---
> >                  
> >                   9. ## CRITICAL RULES
> >                  
> >                   10. 1. **ParentChildLink**: Use N:N relationship (multiple parents per child)
> > 2. **Reports**: Query Direct (NO LLM for visualization)
> > 3. 3. **Session**: Token-based with expiration
> >    4. 4. **3 Strikes**: Auto-block suspicious access
> >       5. 5. **Knowledge Base**: Dynamic documents for agents
> >          6. 6. **Code**: All in English
> >             7. 7. **Mobile-First**: Teacher app priority
> >               
> >                8. ---
> >               
> >                9. ## START NOW.
> >                10. ```
> >
> >                    ---
> >
> > ## Arquivos de Referência
> >
> > | Arquivo | URL |
> > |---------|-----|
> > | Schema Completo | `/docs/schema/prisma-schema.md` |
> > | Teacher App | `/docs/interfaces/teacher-app.md` |
> > | Parent Portal | `/docs/interfaces/parent-portal.md` |
> >
> > ---
> >
> > ## Fluxo de Dados Atualizado
> >
> > ```
> > ┌─────────────────────────────────────────────────────────────────┐
> > │                        ADMIN PANEL                              │
> > │  - Upload KnowledgeDocuments                                    │
> > │  - Configure AgentConfig                                        │
> > └─────────────────────┬───────────────────────────────────────────┘
> >                       │
> >                       ▼
> > ┌─────────────────────────────────────────────────────────────────┐
> > │                     KNOWLEDGE BASE                              │
> > │  Documentos: Políticas, FAQs, Regras, Agenda                    │
> > └─────────────────────┬───────────────────────────────────────────┘
> >                       │
> >           ┌───────────┴───────────┐
> >           ▼                       ▼
> > ┌─────────────────┐    ┌─────────────────┐
> > │  LANDING PAGE   │    │  PARENT PORTAL  │
> > │  (Chat Widget)  │    │  (Query Direta) │
> > │       │         │    │       │         │
> > │       ▼         │    │       ▼         │
> > │  Agent 02       │    │  PostgreSQL     │
> > │  + Knowledge    │    │  → JSON         │
> > │  Base           │    │  → React Cards  │
> > └─────────────────┘    └─────────────────┘
> >
> > ┌─────────────────────────────────────────────────────────────────┐
> > │                      TEACHER APP                                │
> > │  Mobile-First → INSERT → routine_logs, incidents, learning      │
> > └─────────────────────────────────────────────────────────────────┘
> > ```

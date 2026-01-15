# 📊 Schema Prisma - Banco de Dados v1.2 (Robusto)

> **Status:** FROZEN v1.2 (Aprovado por Claude & Gemini)
> > **Última atualização:** Janeiro 2026
> > > **Revisão:** Inclui ParentChildLink, Session, StrikeLog e KnowledgeBase
> > >
> > > ---
> > >
> > > ## Visão Geral
> > >
> > > Este documento define a estrutura completa do banco de dados PostgreSQL usando Prisma ORM.
> > > **IMPORTANTE:** Esta versão suporta múltiplos responsáveis por criança e sistema de Knowledge Base dinâmico.
> > >
> > > ---
> > >
> > > ## Schema Completo v1.2
> > >
> > > ```prisma
> > > // ARQUIVO: schema.prisma
> > > // STATUS: FROZEN v1.2 (Security Patched + Knowledge Base)
> > >
> > > generator client {
> > >   provider = "prisma-client-js"
> > > }
> > >
> > > datasource db {
> > >   provider = "postgresql"
> > >   url      = env("DATABASE_URL")
> > > }
> > >
> > > // ============================================
> > > // 1. ENUMS (Definições Estáticas)
> > > // ============================================
> > >
> > > enum LeadStatus {
> > >   NEW_LEAD
> > >   CONTACTED
> > >   VISIT_SCHEDULED
> > >   VISITED
> > >   WAITLISTED
> > >   ENROLLED
> > >   REJECTED
> > > }
> > >
> > > enum Severity {
> > >   LOW
> > >   MEDIUM
> > >   HIGH
> > >   CRITICAL
> > > }
> > >
> > > enum Mood {
> > >   VERY_HAPPY
> > >   HAPPY
> > >   NEUTRAL
> > >   SAD
> > >   TIRED
> > >   SICK
> > > }
> > >
> > > enum DiaperStatus {
> > >   CLEAN
> > >   WET
> > >   DIRTY
> > >   NOT_APPLICABLE
> > > }
> > >
> > > enum UserRole {
> > >   PARENT
> > >   TEACHER
> > >   ADMIN
> > >   SUPER_ADMIN
> > > }
> > >
> > > enum AgentType {
> > >   ROUTER
> > >   ENROLLMENT
> > >   PARENT_ACCESS
> > >   TEACHER_ASSISTANT
> > > }
> > >
> > > enum DocumentType {
> > >   POLICY
> > >   SCHEDULE
> > >   FAQ
> > >   RULES
> > >   CURRICULUM
> > >   HEALTH_PROTOCOL
> > > }
> > >
> > > // ============================================
> > > // 2. AUTENTICAÇÃO E SESSÕES
> > > // ============================================
> > >
> > > model User {
> > >   id            String    @id @default(uuid())
> > >   email         String    @unique
> > >   password_hash String
> > >   role          UserRole  @default(PARENT)
> > >   is_active     Boolean   @default(true)
> > >   created_at    DateTime  @default(now())
> > >   updated_at    DateTime  @updatedAt
> > >
> > >   // Relacionamentos
> > >   parent        Parent?
> > >   teacher       Teacher?
> > >   sessions      Session[]
> > >   strike_logs   StrikeLog[]
> > > }
> > >
> > > model Session {
> > >   id            String    @id @default(uuid())
> > >   user_id       String
> > >   user          User      @relation(fields: [user_id], references: [id], onDelete: Cascade)
> > >   token         String    @unique
> > >   ip_address    String?
> > >   user_agent    String?
> > >   expires_at    DateTime
> > >   created_at    DateTime  @default(now())
> > >
> > >   @@index([token])
> > >   @@index([user_id])
> > > }
> > >
> > > // ============================================
> > > // 3. SEGURANÇA (Sistema 3 Strikes)
> > > // ============================================
> > >
> > > model StrikeLog {
> > >   id            String    @id @default(uuid())
> > >   user_id       String?
> > >   user          User?     @relation(fields: [user_id], references: [id])
> > >   ip_address    String
> > >   action        String    // "failed_login", "unauthorized_access", "suspicious_query"
> > >   details       String?
> > >   occurred_at   DateTime  @default(now())
> > >
> > >   @@index([ip_address])
> > >   @@index([user_id])
> > > }
> > >
> > > model BlockedEntity {
> > >   id              String    @id @default(uuid())
> > >   identifier      String    @unique  // IP ou user_id
> > >   identifier_type String    // "IP" ou "USER"
> > >   reason          String
> > >   strike_count    Int       @default(1)
> > >   blocked_at      DateTime  @default(now())
> > >   unblock_at      DateTime?
> > >   admin_notified  Boolean   @default(false)
> > >
> > >   @@index([identifier])
> > > }
> > >
> > > // ============================================
> > > // 4. ENTIDADES PRINCIPAIS
> > > // ============================================
> > >
> > > model Parent {
> > >   id          String              @id @default(uuid())
> > >   user_id     String              @unique
> > >   user        User                @relation(fields: [user_id], references: [id])
> > >   full_name   String
> > >   email       String              @unique
> > >   phone       String
> > >   address     String?
> > >   created_at  DateTime            @default(now())
> > >
> > >   // Relacionamento N:N com Children
> > >   children    ParentChildLink[]
> > > }
> > >
> > > model Teacher {
> > >   id          String    @id @default(uuid())
> > >   user_id     String    @unique
> > >   user        User      @relation(fields: [user_id], references: [id])
> > >   full_name   String
> > >   email       String    @unique
> > >   phone       String
> > >   classroom   String?   // Turma principal
> > >   is_active   Boolean   @default(true)
> > >   created_at  DateTime  @default(now())
> > >
> > >   // Logs registrados por este professor
> > >   routine_logs    RoutineLog[]
> > >   incidents       Incident[]
> > >   learning_events LearningEvent[]
> > > }
> > >
> > > model Child {
> > >   id                  String              @id @default(uuid())
> > >   full_name           String
> > >   birth_date          DateTime
> > >   classroom           String              // "Turma da Tia Maria"
> > >   photo_url           String?
> > >   allergies           String?
> > >   medical_notes       String?
> > >   emergency_contact   String?
> > >   created_at          DateTime            @default(now())
> > >
> > >   // Relacionamentos
> > >   parents             ParentChildLink[]
> > >   routine_logs        RoutineLog[]
> > >   incidents           Incident[]
> > >   learning_participants LearningParticipant[]
> > > }
> > >
> > > // Tabela de junção N:N (Múltiplos pais/responsáveis por criança)
> > > model ParentChildLink {
> > >   id            String    @id @default(uuid())
> > >   parent_id     String
> > >   parent        Parent    @relation(fields: [parent_id], references: [id])
> > >   child_id      String
> > >   child         Child     @relation(fields: [child_id], references: [id])
> > >   relationship  String    @default("parent") // "parent", "guardian", "grandparent"
> > >   is_primary    Boolean   @default(false)    // Responsável principal
> > >   can_pickup    Boolean   @default(true)     // Autorizado a buscar
> > >   created_at    DateTime  @default(now())
> > >
> > >   @@unique([parent_id, child_id])
> > >   @@index([parent_id])
> > >   @@index([child_id])
> > > }
> > >
> > > // ============================================
> > > // 5. REGISTROS DIÁRIOS (Teacher Input)
> > > // ============================================
> > >
> > > model RoutineLog {
> > >   id              String        @id @default(uuid())
> > >   child_id        String
> > >   child           Child         @relation(fields: [child_id], references: [id])
> > >   recorded_by_id  String
> > >   recorded_by     Teacher       @relation(fields: [recorded_by_id], references: [id])
> > >
> > >   // Dados da rotina
> > >   mood            Mood
> > >   food_intake_pct Int           // 0-100
> > >   sleep_minutes   Int
> > >   diaper          DiaperStatus  @default(NOT_APPLICABLE)
> > >   notes           String?
> > >
> > >   logged_at       DateTime      @default(now())
> > >
> > >   @@index([child_id, logged_at])
> > > }
> > >
> > > model Incident {
> > >   id              String    @id @default(uuid())
> > >   child_id        String
> > >   child           Child     @relation(fields: [child_id], references: [id])
> > >   recorded_by_id  String
> > >   recorded_by     Teacher   @relation(fields: [recorded_by_id], references: [id])
> > >
> > >   description     String
> > >   severity        Severity
> > >   action_taken    String?
> > >   parent_notified Boolean   @default(false)
> > >
> > >   occurred_at     DateTime  @default(now())
> > >
> > >   @@index([child_id, occurred_at])
> > >   @@index([severity])
> > > }
> > >
> > > // ============================================
> > > // 6. APRENDIZADOS (Individual ou Grupo)
> > > // ============================================
> > >
> > > model LearningEvent {
> > >   id              String    @id @default(uuid())
> > >   recorded_by_id  String
> > >   recorded_by     Teacher   @relation(fields: [recorded_by_id], references: [id])
> > >
> > >   activity        String
> > >   description     String
> > >   skills          String[]  // Array de habilidades
> > >   classroom       String?   // Se for atividade de toda a turma
> > >   is_group        Boolean   @default(false)
> > >
> > >   logged_at       DateTime  @default(now())
> > >
> > >   // Participantes (se individual ou subgrupo)
> > >   participants    LearningParticipant[]
> > >
> > >   @@index([classroom, logged_at])
> > > }
> > >
> > > model LearningParticipant {
> > >   id                String        @id @default(uuid())
> > >   learning_event_id String
> > >   learning_event    LearningEvent @relation(fields: [learning_event_id], references: [id])
> > >   child_id          String
> > >   child             Child         @relation(fields: [child_id], references: [id])
> > >   individual_notes  String?
> > >
> > >   @@unique([learning_event_id, child_id])
> > > }
> > >
> > > // ============================================
> > > // 7. ENROLLMENT (Funil de Vendas)
> > > // ============================================
> > >
> > > model Lead {
> > >   id            String      @id @default(uuid())
> > >   parent_name   String
> > >   email         String
> > >   phone         String
> > >   child_name    String?
> > >   child_age     Int?
> > >   status        LeadStatus  @default(NEW_LEAD)
> > >   source        String?     // "landing_page", "referral", "organic"
> > >   notes         String?
> > >   assigned_to   String?     // ID do responsável pelo follow-up
> > >
> > >   created_at    DateTime    @default(now())
> > >   updated_at    DateTime    @updatedAt
> > >
> > >   @@index([status])
> > >   @@index([created_at])
> > > }
> > >
> > > // ============================================
> > > // 8. KNOWLEDGE BASE (Documentos dos Agentes)
> > > // ============================================
> > >
> > > model KnowledgeDocument {
> > >   id            String        @id @default(uuid())
> > >   title         String
> > >   content       String        @db.Text
> > >   document_type DocumentType
> > >   agent_target  AgentType[]   // Quais agentes usam este documento
> > >   version       String        @default("1.0")
> > >   is_active     Boolean       @default(true)
> > >
> > >   // Metadados
> > >   uploaded_by   String        // user_id do admin
> > >   tags          String[]
> > >
> > >   created_at    DateTime      @default(now())
> > >   updated_at    DateTime      @updatedAt
> > >
> > >   @@index([document_type])
> > >   @@index([agent_target])
> > >   @@index([is_active])
> > > }
> > >
> > > model AgentConfig {
> > >   id              String      @id @default(uuid())
> > >   agent_type      AgentType   @unique
> > >   system_prompt   String      @db.Text
> > >   temperature     Float       @default(0.7)
> > >   max_tokens      Int         @default(1000)
> > >   is_active       Boolean     @default(true)
> > >
> > >   updated_at      DateTime    @updatedAt
> > >   updated_by      String      // user_id do admin
> > > }
> > > ```
> > >
> > > ---
> > >
> > > ## Relacionamentos
> > >
> > > ```
> > > User (1) ←→ (1) Parent OR Teacher
> > > Parent (N) ←→ (N) Children (via ParentChildLink)
> > > Child (1) ←→ (N) RoutineLogs
> > > Child (1) ←→ (N) Incidents
> > > Child (N) ←→ (N) LearningEvents (via LearningParticipant)
> > > Teacher (1) ←→ (N) RoutineLogs, Incidents, LearningEvents
> > > KnowledgeDocument (N) ←→ (N) AgentTypes
> > > ```
> > >
> > > ---
> > >
> > > ## Índices para Performance
> > >
> > > ```sql
> > > -- Relatórios por data (CRÍTICO para Parent Portal)
> > > CREATE INDEX idx_routine_child_date ON routine_logs(child_id, logged_at DESC);
> > > CREATE INDEX idx_incident_child_date ON incidents(child_id, occurred_at DESC);
> > > CREATE INDEX idx_learning_classroom_date ON learning_events(classroom, logged_at DESC);
> > >
> > > -- Segurança
> > > CREATE INDEX idx_strike_ip ON strike_logs(ip_address, occurred_at DESC);
> > > CREATE INDEX idx_blocked_identifier ON blocked_entities(identifier);
> > >
> > > -- Knowledge Base
> > > CREATE INDEX idx_knowledge_active ON knowledge_documents(is_active, document_type);
> > > ```
> > >
> > > ---
> > >
> > > ## API Response Contract (Parent Portal)
> > >
> > > ```json
> > > {
> > >   "meta": {
> > >     "date": "2026-01-14",
> > >     "child_name": "Alice",
> > >     "classroom": "Turma da Tia Maria"
> > >   },
> > >   "routine": {
> > >     "mood": "HAPPY",
> > >     "food_intake_pct": 85,
> > >     "sleep_minutes": 90,
> > >     "diaper": "CLEAN",
> > >     "notes": "Dia tranquilo"
> > >   },
> > >   "incidents": [],
> > >   "learning": [
> > >     {
> > >       "activity": "Pintura",
> > >       "description": "Pintura com os dedos",
> > >       "skills": ["Motor Skills", "Creativity"],
> > >       "is_group": true
> > >     }
> > >   ]
> > > }
> > > ```
> > >
> > > ---
> > >
> > > ## Notas de Implementação
> > >
> > > 1. **ParentChildLink:** Suporta múltiplos responsáveis (mãe, pai, avós)
> > > 2. 2. **Session:** Tokens seguros com expiração
> > >    3. 3. **StrikeLog:** 3 strikes = bloqueio automático
> > >       4. 4. **KnowledgeDocument:** ADMs carregam documentos para os agentes
> > >          5. 5. **AgentConfig:** Configuração dinâmica dos prompts de cada agente
> > >             6. 6. **Relatórios são QUERY DIRETA** - Sem IA para visualização

# 📊 Schema Prisma - Banco de Dados

> **Status:** FROZEN v1.3 (Aprovado por Claude & Gemini)
> > **Última atualização:** Janeiro 2026
> >
> > ## Visão Geral
> >
> > Este documento define a estrutura completa do banco de dados PostgreSQL usando Prisma ORM.
> >
> > ---
> >
> > ## Schema Completo
> >
> > ```prisma
> > // ARQUIVO: schema.prisma
> > // STATUS: FROZEN v1.3 (Approved by Claude & Gemini)
> >
> > generator client {
> >   provider = "prisma-client-js"
> > }
> >
> > datasource db {
> >   provider = "postgresql"
> >   url      = env("DATABASE_URL")
> > }
> >
> > // ============================================
> > // 1. ENUMS (Definições Estáticas)
> > // ============================================
> >
> > enum LeadStatus {
> >   NEW_LEAD
> >   VISIT_SCHEDULED
> >   ENROLLED
> >   REJECTED
> > }
> >
> > enum Severity {
> >   LOW
> >   MEDIUM
> >   HIGH
> > }
> >
> > enum Mood {
> >   HAPPY
> >   NEUTRAL
> >   SAD
> >   TIRED
> > }
> >
> > enum UserRole {
> >   PARENT
> >   TEACHER
> >   ADMIN
> > }
> >
> > // ============================================
> > // 2. TABELAS DE AUTENTICAÇÃO
> > // ============================================
> >
> > model User {
> >   id          String    @id @default(uuid())
> >   email       String    @unique
> >   password    String
> >   role        UserRole  @default(PARENT)
> >   parent_id   String?   @unique
> >   parent      Parent?   @relation(fields: [parent_id], references: [id])
> >   created_at  DateTime  @default(now())
> >   updated_at  DateTime  @updatedAt
> > }
> >
> > // ============================================
> > // 3. TABELAS PRINCIPAIS
> > // ============================================
> >
> > model Parent {
> >   id          String    @id @default(uuid())
> >   full_name   String
> >   email       String    @unique
> >   phone       String
> >   created_at  DateTime  @default(now())
> >   children    Child[]
> >   user        User?
> > }
> >
> > model Child {
> >   id                  String              @id @default(uuid())
> >   full_name           String
> >   birth_date          DateTime
> >   classroom           String?             // Ex: "Turma da Tia Maria"
> >   parent_id           String
> >   parent              Parent              @relation(fields: [parent_id], references: [id])
> >   incidents           Incident[]
> >   routine_logs        RoutineLog[]
> >   learning_activities LearningActivity[]
> >   created_at          DateTime            @default(now())
> > }
> >
> > // ============================================
> > // 4. TABELAS DE REGISTRO DIÁRIO (Teacher Input)
> > // ============================================
> >
> > model RoutineLog {
> >   id          String    @id @default(uuid())
> >   child_id    String
> >   child       Child     @relation(fields: [child_id], references: [id])
> >   logged_at   DateTime  @default(now())
> >   mood        Mood
> >   food_pct    Int       // 0-100 (percentual de comida)
> >   sleep_min   Int       // minutos de sono
> >   notes       String?   // observações gerais
> >   logged_by   String    // nome do professor
> > }
> >
> > model Incident {
> >   id          String    @id @default(uuid())
> >   child_id    String
> >   child       Child     @relation(fields: [child_id], references: [id])
> >   description String
> >   severity    Severity
> >   occurred_at DateTime  @default(now())
> >   reported_by String    // nome do professor
> > }
> >
> > // ============================================
> > // 5. NOVA TABELA: APRENDIZADOS
> > // ============================================
> >
> > model LearningActivity {
> >   id              String    @id @default(uuid())
> >   child_id        String?   // null = atividade da turma toda
> >   child           Child?    @relation(fields: [child_id], references: [id])
> >   classroom       String    // "Turma da Tia Maria"
> >   activity_type   String    // "individual" | "group"
> >   description     String    // O que foi aprendido
> >   skills_developed String?  // Habilidades desenvolvidas
> >   logged_at       DateTime  @default(now())
> >   logged_by       String    // nome do professor
> > }
> >
> > // ============================================
> > // 6. TABELAS DE ENROLLMENT (Funil de Vendas)
> > // ============================================
> >
> > model Lead {
> >   id            String      @id @default(uuid())
> >   parent_name   String
> >   email         String
> >   phone         String
> >   child_age     Int
> >   status        LeadStatus  @default(NEW_LEAD)
> >   notes         String?
> >   source        String?     // "landing_page" | "referral" | "organic"
> >   created_at    DateTime    @default(now())
> >   updated_at    DateTime    @updatedAt
> > }
> >
> > // ============================================
> > // 7. TABELAS DE SEGURANÇA (3 Strikes)
> > // ============================================
> >
> > model SecurityLog {
> >   id            String    @id @default(uuid())
> >   phone_number  String
> >   action        String    // "failed_verification" | "suspicious_access"
> >   ip_address    String?
> >   occurred_at   DateTime  @default(now())
> > }
> >
> > model BlockedUser {
> >   id              String    @id @default(uuid())
> >   phone_number    String    @unique
> >   reason          String
> >   strike_count    Int       @default(1)
> >   blocked_at      DateTime  @default(now())
> >   admin_notified  Boolean   @default(false)
> > }
> > ```
> >
> > ---
> >
> > ## Relacionamentos
> >
> > ```
> > Parent (1) ←→ (N) Children
> > Child (1) ←→ (N) RoutineLogs
> > Child (1) ←→ (N) Incidents
> > Child (1) ←→ (N) LearningActivities (ou classroom para atividades em grupo)
> > User (1) ←→ (1) Parent (para autenticação)
> > ```
> >
> > ---
> >
> > ## Índices Recomendados
> >
> > ```sql
> > -- Para consultas de relatórios por data
> > CREATE INDEX idx_routine_logs_date ON routine_logs(child_id, logged_at);
> > CREATE INDEX idx_incidents_date ON incidents(child_id, occurred_at);
> > CREATE INDEX idx_learning_date ON learning_activities(child_id, logged_at);
> > CREATE INDEX idx_learning_classroom ON learning_activities(classroom, logged_at);
> >
> > -- Para segurança
> > CREATE INDEX idx_security_phone ON security_logs(phone_number, occurred_at);
> > ```
> >
> > ---
> >
> > ## Queries Importantes
> >
> > ### Relatório Diário do Pai (On-Demand)
> >
> > ```sql
> > -- 1. Buscar rotina do dia
> > SELECT * FROM routine_logs
> > WHERE child_id = :childId
> > AND DATE(logged_at) = :selectedDate;
> >
> > -- 2. Buscar incidentes do dia
> > SELECT * FROM incidents
> > WHERE child_id = :childId
> > AND DATE(occurred_at) = :selectedDate;
> >
> > -- 3. Buscar aprendizados do dia (individual + turma)
> > SELECT * FROM learning_activities
> > WHERE (child_id = :childId OR classroom = :childClassroom)
> > AND DATE(logged_at) = :selectedDate;
> > ```
> >
> > ---
> >
> > ## Notas de Implementação
> >
> > 1. **Relatórios são SOB DEMANDA** - Não gerar automaticamente
> > 2. 2. **LearningActivity** pode ser individual (child_id preenchido) ou em grupo (classroom preenchido)
> >    3. 3. **SecurityLog** registra todas as tentativas suspeitas
> >       4. 4. **BlockedUser** é acionado após 3 strikes

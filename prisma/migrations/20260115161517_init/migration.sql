-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW_LEAD', 'CONTACTED', 'VISIT_SCHEDULED', 'VISITED', 'WAITLISTED', 'ENROLLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('VERY_HAPPY', 'HAPPY', 'NEUTRAL', 'SAD', 'TIRED', 'SICK');

-- CreateEnum
CREATE TYPE "DiaperStatus" AS ENUM ('CLEAN', 'WET', 'DIRTY', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PARENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('ROUTER', 'ENROLLMENT', 'PARENT_ACCESS', 'TEACHER_ASSISTANT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('POLICY', 'SCHEDULE', 'FAQ', 'RULES', 'CURRICULUM', 'HEALTH_PROTOCOL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PARENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrikeLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "ip_address" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StrikeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedEntity" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "identifier_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "strike_count" INTEGER NOT NULL DEFAULT 1,
    "blocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unblock_at" TIMESTAMP(3),
    "admin_notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BlockedEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "classroom" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "classroom" TEXT NOT NULL,
    "photo_url" TEXT,
    "allergies" TEXT,
    "medical_notes" TEXT,
    "emergency_contact" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentChildLink" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "relationship" TEXT NOT NULL DEFAULT 'parent',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "can_pickup" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentChildLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineLog" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "mood" "Mood" NOT NULL,
    "food_intake_pct" INTEGER NOT NULL,
    "sleep_minutes" INTEGER NOT NULL,
    "diaper" "DiaperStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "notes" TEXT,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoutineLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "action_taken" TEXT,
    "parent_notified" BOOLEAN NOT NULL DEFAULT false,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningEvent" (
    "id" TEXT NOT NULL,
    "recorded_by_id" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "classroom" TEXT,
    "is_group" BOOLEAN NOT NULL DEFAULT false,
    "logged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningParticipant" (
    "id" TEXT NOT NULL,
    "learning_event_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "individual_notes" TEXT,

    CONSTRAINT "LearningParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "parent_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "child_name" TEXT,
    "child_age" INTEGER,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW_LEAD',
    "source" TEXT,
    "notes" TEXT,
    "assigned_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "agent_target" "AgentType"[],
    "version" TEXT NOT NULL DEFAULT '1.0',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_by" TEXT NOT NULL,
    "tags" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentConfig" (
    "id" TEXT NOT NULL,
    "agent_type" "AgentType" NOT NULL,
    "system_prompt" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "max_tokens" INTEGER NOT NULL DEFAULT 1000,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" TEXT NOT NULL,

    CONSTRAINT "AgentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_user_id_idx" ON "Session"("user_id");

-- CreateIndex
CREATE INDEX "StrikeLog_ip_address_idx" ON "StrikeLog"("ip_address");

-- CreateIndex
CREATE INDEX "StrikeLog_user_id_idx" ON "StrikeLog"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedEntity_identifier_key" ON "BlockedEntity"("identifier");

-- CreateIndex
CREATE INDEX "BlockedEntity_identifier_idx" ON "BlockedEntity"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_user_id_key" ON "Parent"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_user_id_key" ON "Teacher"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE INDEX "ParentChildLink_parent_id_idx" ON "ParentChildLink"("parent_id");

-- CreateIndex
CREATE INDEX "ParentChildLink_child_id_idx" ON "ParentChildLink"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "ParentChildLink_parent_id_child_id_key" ON "ParentChildLink"("parent_id", "child_id");

-- CreateIndex
CREATE INDEX "RoutineLog_child_id_logged_at_idx" ON "RoutineLog"("child_id", "logged_at");

-- CreateIndex
CREATE INDEX "Incident_child_id_occurred_at_idx" ON "Incident"("child_id", "occurred_at");

-- CreateIndex
CREATE INDEX "Incident_severity_idx" ON "Incident"("severity");

-- CreateIndex
CREATE INDEX "LearningEvent_classroom_logged_at_idx" ON "LearningEvent"("classroom", "logged_at");

-- CreateIndex
CREATE UNIQUE INDEX "LearningParticipant_learning_event_id_child_id_key" ON "LearningParticipant"("learning_event_id", "child_id");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_created_at_idx" ON "Lead"("created_at");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_document_type_idx" ON "KnowledgeDocument"("document_type");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_is_active_idx" ON "KnowledgeDocument"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "AgentConfig_agent_type_key" ON "AgentConfig"("agent_type");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrikeLog" ADD CONSTRAINT "StrikeLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Parent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentChildLink" ADD CONSTRAINT "ParentChildLink_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineLog" ADD CONSTRAINT "RoutineLog_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningEvent" ADD CONSTRAINT "LearningEvent_recorded_by_id_fkey" FOREIGN KEY ("recorded_by_id") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningParticipant" ADD CONSTRAINT "LearningParticipant_learning_event_id_fkey" FOREIGN KEY ("learning_event_id") REFERENCES "LearningEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningParticipant" ADD CONSTRAINT "LearningParticipant_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

# 📊 Schema Prisma - Banco de Dados v1.3 (Daycare OS)

> **Status:** FROZEN v1.3 (Expanded)
> **Contém:** Core CRM + Security + Knowledge Base + Daycare Config + Announcements

```prisma
// GENERATOR & DATASOURCE
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// 1. ENUMS
// ============================================

enum UserRole {
  PARENT
  TEACHER
  ADMIN
  OWNER
}

enum LeadStatus {
  NEW_LEAD
  DATA_COLLECTED
  VISIT_SCHEDULED
  ENROLLED
  WAITLISTED
  DROPPED
}

enum IncidentSeverity {
  LOW
  MEDIUM
  HIGH
}

enum MoodStatus {
  HAPPY
  NEUTRAL
  SAD
  CRANKY
  TIRED
}

enum DiaperStatus {
  WET
  DIRTY
  CLEAN
  NA
}

enum LearningScope {
  INDIVIDUAL
  CLASS
  GROUP
}

enum AnnouncementType {
  GENERAL
  URGENT_ALERT
  EVENT
  CLOSURE
}

enum HolidayCategory {
  PUBLIC
  RELIGIOUS
  INTERNAL
}

// ============================================
// 2. AUTHENTICATION & SESSION MANAGEMENT
// ============================================

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password_hash String
  role          UserRole  @default(PARENT)
  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  parent        Parent?
  teacher       Teacher?
  sessions      Session[]
  announcements Announcement[]
}

model Session {
  id           String   @id @default(uuid())
  user_id      String
  user         User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  token_hash   String   @unique
  expires_at   DateTime
  created_at   DateTime @default(now())

  @@index([user_id])
  @@index([expires_at])
  @@map("sessions")
}

// ============================================
// 3. DAYCARE CONFIGURATION (Source of Truth)
// ============================================

model DaycareConfig {
  id               String   @id @default(uuid())
  daycare_name     String
  timezone         String   @default("America/New_York")
  default_lang     String   @default("en")
  confirmed_at     DateTime?

  operating_days   OperatingDay[]
  holidays         Holiday[]
  illness_rules    IllnessRule[]
  pickup_policy    PickupPolicy?

  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt

  @@map("daycare_config")
}

model OperatingDay {
  id           String        @id @default(uuid())
  config_id    String
  config       DaycareConfig @relation(fields: [config_id], references: [id])

  day_of_week  Int           // 0=Sun, 1=Mon...6=Sat
  is_open      Boolean       @default(true)
  open_time    String?       // "07:30"
  close_time   String?       // "18:00"

  @@map("operating_days")
}

model Holiday {
  id           String          @id @default(uuid())
  config_id    String
  config       DaycareConfig   @relation(fields: [config_id], references: [id])

  name         String
  date         DateTime
  is_closed    Boolean         @default(true)
  category     HolidayCategory @default(PUBLIC)

  @@map("holidays")
}

model IllnessRule {
  id                String        @id @default(uuid())
  config_id         String
  config            DaycareConfig @relation(fields: [config_id], references: [id])

  symptom_name      String        // e.g. "Fever > 38C"
  exclusion_hours   Int           // e.g. 24
  requires_doc_note Boolean       @default(false)

  @@map("illness_rules")
}

model PickupPolicy {
  id                String        @id @default(uuid())
  config_id         String        @unique
  config            DaycareConfig @relation(fields: [config_id], references: [id])

  grace_period_min  Int           @default(15)
  late_fee_per_min  Float         @default(1.00)

  @@map("pickup_policies")
}

// ============================================
// 4. ANNOUNCEMENTS & EVENTS
// ============================================

model Announcement {
  id            String           @id @default(uuid())
  title         String
  content       String           @db.Text
  type          AnnouncementType

  is_active     Boolean          @default(true)
  target_all    Boolean          @default(true)

  created_by_id String
  created_by    User             @relation(fields: [created_by_id], references: [id])

  created_at    DateTime         @default(now())
  expires_at    DateTime?

  reads         AnnouncementRead[]

  @@map("announcements")
}

model AnnouncementRead {
  id              String       @id @default(uuid())
  announcement_id String
  announcement    Announcement @relation(fields: [announcement_id], references: [id])

  parent_id       String
  parent          Parent       @relation(fields: [parent_id], references: [id])

  read_at         DateTime     @default(now())

  @@unique([announcement_id, parent_id])
  @@map("announcement_reads")
}

// ============================================
// 5. CRM CORE
// ============================================

model Parent {
  id                 String   @id @default(uuid())
  user_id            String   @unique
  user               User     @relation(fields: [user_id], references: [id])
  full_name          String
  phone_number       String   @unique
  preferred_language String   @default("EN")

  children_links     ParentChildLink[]
  announcement_reads AnnouncementRead[]

  created_at         DateTime @default(now())
  updated_at         DateTime @updatedAt

  @@map("parents")
}

model Child {
  id            String   @id @default(uuid())
  full_name     String
  date_of_birth DateTime
  medical_notes String?

  parents_links ParentChildLink[]
  incidents     Incident[]
  routine_logs  RoutineLog[]
  learning_participation LearningEventParticipant[]

  created_at    DateTime @default(now())

  @@map("children")
}

model ParentChildLink {
  parent_id       String
  child_id        String
  relationship    String

  parent          Parent @relation(fields: [parent_id], references: [id], onDelete: Cascade)
  child           Child  @relation(fields: [child_id], references: [id], onDelete: Cascade)

  @@id([parent_id, child_id])
  @@map("parent_child_link")
}

model Teacher {
  id        String   @id @default(uuid())
  user_id   String   @unique
  user      User     @relation(fields: [user_id], references: [id])
  full_name String

  @@map("teachers")
}

// ============================================
// 6. OPERATIONAL DATA (Logs)
// ============================================

model Lead {
  id                 String     @id @default(uuid())
  parent_name        String?
  child_name         String?
  child_age_months   Int?
  phone_number       String?
  visit_scheduled_at DateTime?
  status             LeadStatus @default(NEW_LEAD)
  waitlist_position  Int?
  detected_language  String     @default("EN")
  last_interaction   DateTime   @default(now())

  @@index([status])
  @@index([phone_number])
  @@map("leads")
}

model Incident {
  id                  String           @id @default(uuid())
  child_id            String
  severity            IncidentSeverity
  description         String
  action_taken        String
  occurred_at         DateTime         @default(now())
  recorded_by_user_id String?

  child               Child            @relation(fields: [child_id], references: [id])
  created_at          DateTime         @default(now())

  @@index([child_id, occurred_at])
  @@map("incidents")
}

model RoutineLog {
  id                  String       @id @default(uuid())
  child_id            String
  food_intake_pct     Int
  sleep_minutes       Int
  mood                MoodStatus
  diaper              DiaperStatus
  logged_at           DateTime     @default(now())
  recorded_by_user_id String?

  child               Child        @relation(fields: [child_id], references: [id])

  @@index([child_id, logged_at])
  @@map("routine_logs")
}

model LearningEvent {
  id                  String        @id @default(uuid())
  scope               LearningScope
  activity_type       String
  description         String
  skills_involved     String[]
  occurred_at         DateTime      @default(now())
  recorded_by_user_id String?

  participants        LearningEventParticipant[]

  @@index([occurred_at])
  @@map("learning_events")
}

model LearningEventParticipant {
  event_id String
  child_id String

  event    LearningEvent @relation(fields: [event_id], references: [id], onDelete: Cascade)
  child    Child         @relation(fields: [child_id], references: [id], onDelete: Cascade)

  @@id([event_id, child_id])
  @@map("learning_event_participants")
}

// ============================================
// 7. SECURITY & COMPLIANCE
// ============================================

model SecurityLog {
  id                 String   @id @default(uuid())
  source_ip          String?
  attempted_phone    String?
  attempted_child_id String?
  violation_type     String   @default("UNAUTHORIZED_ACCESS_SCOPE")
  occurred_at        DateTime @default(now())

  @@map("security_logs")
}

model StrikeLog {
  id             String   @id @default(uuid())
  phone_number   String   @unique
  strike_count   Int      @default(1)
  last_violation DateTime @default(now())

  @@map("strike_logs")
}

model BlockedUser {
  id             String   @id @default(uuid())
  phone_number   String   @unique
  reason         String   @default("3_STRIKE_VIOLATION")
  blocked_at     DateTime @default(now())
  admin_notified Boolean  @default(false)

  @@map("blocked_users")
}
```

---

## Relacionamentos

```
User (1) ←→ (1) Parent OR Teacher
Parent (N) ←→ (N) Children (via ParentChildLink)
Child (1) ←→ (N) RoutineLogs, Incidents
Teacher (1) ←→ (N) User
DaycareConfig (1) ←→ (N) OperatingDay, Holiday, IllnessRule
DaycareConfig (1) ←→ (1) PickupPolicy
Announcement (1) ←→ (N) AnnouncementRead
```

---

## Índices para Performance

```sql
-- Relatórios por data (Parent Portal)
CREATE INDEX idx_routine_child_date ON routine_logs(child_id, logged_at DESC);
CREATE INDEX idx_incident_child_date ON incidents(child_id, occurred_at DESC);

-- Segurança
CREATE INDEX idx_security_ip ON security_logs(source_ip, occurred_at DESC);
CREATE INDEX idx_strike_phone ON strike_logs(phone_number);

-- Config
CREATE INDEX idx_operating_config ON operating_days(config_id, day_of_week);
CREATE INDEX idx_holiday_date ON holidays(date);
```

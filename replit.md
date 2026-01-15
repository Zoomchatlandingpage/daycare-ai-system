# Daycare AI System

## Overview
This is a Trust Infrastructure system for Daycare Management. It includes:
- Multi-agent AI architecture for enrollment, parent portal, and teacher tools
- PostgreSQL database with Prisma ORM
- NextAuth.js authentication with role-based access
- Next.js 14 with App Router and TailwindCSS

## Project Structure
```
/src
  /app                 - Next.js App Router pages
    /api
      /auth            - NextAuth.js API routes
      /admin           - Admin API endpoints (stats, children, teachers, parents, knowledge)
      /teacher         - Teacher API endpoints (children, routine, incidents, learning)
      /parent          - Parent API endpoints (children, reports)
    /admin             - Admin panel pages
      /children        - Children management
      /teachers        - Teachers management
      /parents         - Parents management
      /knowledge       - Knowledge base management
    /dashboard         - Main dashboard
    /login             - Login page
    /parent            - Parent portal
      /child/[id]      - Child daily report page
    /teacher           - Teacher app (mobile-first)
      /routine         - Routine logging (mood, food, sleep, diaper)
      /incident        - Incident reporting
      /learning        - Learning event logging
  /components          - React components (Providers)
  /generated           - Prisma generated client
  /lib                 - Utilities (prisma, auth)
  /types               - TypeScript type definitions
/prisma
  /migrations          - Database migrations
  schema.prisma        - Database schema
  seed.ts              - Seed script for test data
/docs                  - Documentation and specifications
/prompts               - AI prompts
```

## Tech Stack
- Next.js 14 (App Router)
- TailwindCSS
- PostgreSQL with Prisma 7
- NextAuth.js
- Lucide React icons

## Database Schema
Main tables:
- User, Parent, Teacher, Child
- ParentChildLink (N:N relationship)
- RoutineLog (mood, food_intake_pct, sleep_minutes, diaper, notes)
- Incident (severity, description, action_taken)
- LearningEvent + LearningParticipant (group activities support)
- Lead (enrollment funnel)
- StrikeLog, BlockedEntity (security)
- KnowledgeDocument, AgentConfig (AI)

## Test Accounts
- Admin: admin@daycare.com / admin123
- Teacher: professor@daycare.com / teacher123  
- Parent: pai@daycare.com / parent123

## Development
```bash
npm run dev              # Start dev server on port 5000
npx prisma studio        # Open database viewer
npx tsx prisma/seed.ts   # Seed test data
```

## API Endpoints

### Admin APIs (require ADMIN or SUPER_ADMIN role)
- GET/POST /api/admin/children - List/create children
- GET/PUT/DELETE /api/admin/children/[id] - Read/update/delete child
- GET/POST /api/admin/teachers - List/create teachers
- GET/POST /api/admin/parents - List/create parents
- GET /api/admin/stats - Dashboard statistics
- GET/POST /api/admin/knowledge - Knowledge base documents

### Teacher APIs (require TEACHER, ADMIN or SUPER_ADMIN role)
- GET /api/teacher/children - List children in classroom
- GET/POST /api/teacher/routine - Routine logs (mood, food_intake_pct, sleep_minutes, diaper)
- GET/POST /api/teacher/incidents - Incident reports
- GET/POST /api/teacher/learning - Learning events with participants

### Parent APIs (require PARENT, ADMIN or SUPER_ADMIN role)
- GET /api/parent/children - List linked children
- GET /api/parent/children/[id] - Get child details
- GET /api/parent/children/[id]/report - Daily report (routine, incidents, learning)

## Recent Changes
- January 2026: Phase 1 complete - Database, Auth, Base Layout
- January 2026: Phase 2 complete - Admin Panel + Teacher App
- January 2026: Phase 2 corrections - Fixed schema mismatches (field names, relations, enums)
- January 2026: Phase 3 complete - Parent Portal with daily reports

## Phases
- Phase 1: Database, Auth, Base Layout (COMPLETE)
- Phase 2: Admin Panel + Teacher App (COMPLETE)
- Phase 3: Parent Portal with direct-query reports (COMPLETE)
- Phase 4: AI Agents integration (PENDING)

## User Preferences
- Language: Portuguese (Brazilian)
- Code comments: English

## Security Architecture
- Middleware (src/middleware.ts) handles route protection:
  - API routes return JSON 401/403 responses
  - Page routes redirect to /login or /dashboard
- Teacher API endpoints filter data by classroom:
  - GET endpoints only return data for teacher's classroom
  - POST endpoints validate child belongs to teacher's classroom
  - ADMIN/SUPER_ADMIN bypass classroom restrictions
- Parent API endpoints check ParentChildLink:
  - Parents can only access their linked children
  - Report endpoint validates parent-child relationship
- Role-based access: SUPER_ADMIN > ADMIN > TEACHER > PARENT

## Schema Field Mappings
Key field names used in APIs (aligned with Prisma schema):
- RoutineLog: recorded_by_id, mood, food_intake_pct, sleep_minutes, diaper
- Incident: recorded_by_id, severity, description, action_taken
- LearningEvent: recorded_by_id, activity, description, skills, classroom
- LearningParticipant: child_id, individual_notes
- Child: parents (relation), medical_notes
- Parent: children (relation)
- KnowledgeDocument: document_type (enum)
- Lead: status (uses NEW_LEAD enum value)

## For Collaborators
This project follows standard Next.js 14 patterns with:
- Server components for protected pages with session checking
- Client components for interactive features with useSession hook
- API routes with role-based authorization via middleware
- Prisma for database access with PostgreSQL adapter
- Classroom-based data isolation for teacher role
- Parent-child link validation for parent portal access

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
  /app           - Next.js App Router pages
    /api/auth    - NextAuth.js API routes
    /admin       - Admin panel (Phase 2)
    /dashboard   - Main dashboard
    /login       - Login page
    /parent      - Parent portal (Phase 3)
    /teacher     - Teacher app (Phase 2)
  /components    - React components
  /generated     - Prisma generated client
  /lib           - Utilities (prisma, auth)
  /types         - TypeScript type definitions
/prisma
  /migrations    - Database migrations
  schema.prisma  - Database schema
  seed.ts        - Seed script for test data
/docs            - Documentation and specifications
/prompts         - AI prompts
```

## Tech Stack
- Next.js 14 (App Router)
- TailwindCSS
- PostgreSQL with Prisma 7
- NextAuth.js
- Lucide React icons

## Database Schema
See `/docs/schema/prisma-schema.md` for complete schema documentation.

Main tables:
- User, Parent, Teacher, Child
- ParentChildLink (N:N relationship)
- RoutineLog, Incident, LearningEvent
- Lead (enrollment funnel)
- StrikeLog, BlockedEntity (security)
- KnowledgeDocument, AgentConfig (AI)

## Test Accounts
- Admin: admin@daycare.com / admin123
- Teacher: professor@daycare.com / teacher123  
- Parent: pai@daycare.com / parent123

## Development
```bash
npm run dev       # Start dev server on port 5000
npx prisma studio # Open database viewer
npx tsx prisma/seed.ts  # Seed test data
```

## Recent Changes
- January 2026: Phase 1 complete - Database, Auth, Base Layout

## User Preferences
- Language: Portuguese (Brazilian)
- Code comments: English

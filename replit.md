# Daycare AI System - Documentation

## Overview
This is a documentation viewer for the Daycare AI System project. The repository contains specifications, schemas, and prompts for building a Trust Infrastructure for Daycare Management.

## Project Structure
- `/docs` - Documentation files
  - `/docs/schema` - Database schema specifications (Prisma)
  - `/docs/interfaces` - UI/UX interface specifications
- `/prompts` - AI prompts including the mega-prompt for Replit
- `/public` - Static frontend files
- `server.js` - Express server for documentation viewer

## Running the Project
The project runs an Express server that renders markdown documentation.

```bash
npm start
```

## Tech Stack
- Node.js 20
- Express.js
- Marked (Markdown parser)

## Recent Changes
- January 2026: Initial setup of documentation viewer for GitHub import

## Purpose
This repository is a specification-only project. It contains all the technical documentation to build a Daycare AI System with:
- Multi-agent architecture (Router, Enrollment, Parent Access, Teacher Assistant)
- PostgreSQL database with Prisma ORM
- Next.js frontend (to be built from specs)
- Security with 3-strikes system

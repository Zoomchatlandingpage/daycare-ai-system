# 🚀 MEGA-PROMPT PARA REPLIT

> **Copie e cole este conteúdo no chat do Replit Agent**
> > O Replit irá construir o sistema baseado nestas especificações
> >
> > ---
> >
> > ## DOCUMENTO DE EXECUÇÃO: DAYCARE AI SYSTEM (v1.3)
> >
> > ```
> > # ACT AS: Senior Full-Stack Developer & System Architect
> > # STACK: Next.js 14 (App Router), TailwindCSS, PostgreSQL (via Prisma), Lucide React, NextAuth
> > # GOAL: Build the "Trust Infrastructure" for a Daycare comprising 3 Interfaces + 1 Router
> >
> > ---
> >
> > ## PHASE 1: THE DATABASE (IMMUTABLE TRUTH)
> >
> > **Instruction:** Create the `schema.prisma` file. Use the complete schema from:
> > https://github.com/Zoomchatlandingpage/daycare-ai-system/blob/main/docs/schema/prisma-schema.md
> >
> > Key tables:
> > - users (auth with roles: parent, teacher, admin)
> > - parents, children (core entities)
> > - routine_logs (mood, food_pct, sleep_min)
> > - incidents (severity levels)
> > - learning_activities (NEW - individual or group activities)
> > - leads (enrollment funnel)
> > - security_logs, blocked_users (3 strikes system)
> >
> > ---
> >
> > ## PHASE 2: THE 3 INTERFACES (Frontend)
> >
> > ### A. PUBLIC LANDING PAGE (/)
> > - Route: `/` (public, no auth)
> > - Components:
> >   - Hero Section with value proposition
> >   - "Chat with AI" Widget (Fixed bottom-right, floating button)
> > - Logic:
> >   - Chat Widget connects to Agent 02 (Enrollment)
> >   - On lead capture, INSERT into `leads` table
> > - Design: Clean, professional, trust-building
> >
> > ### B. TEACHER APP (/teacher)
> > - Route: `/teacher` (Protected - role: teacher or admin)
> > - Access: NextAuth session check
> > - UI: Mobile-First responsive design
> > - Features:
> >   - Child selector dropdown
> >   - Form fields:
> >     - Mood: Emoji selector (😊 Happy, 😐 Neutral, 😢 Sad, 😴 Tired)
> >     - Food: Slider 0-100%
> >     - Sleep: Number input (minutes)
> >     - Incidents: Textarea with severity selector
> >     - **Learning Activities**: Textarea + "Individual/Group" toggle
> >       - If Group: applies to entire classroom
> >       - If Individual: links to specific child
> >   - Submit button triggers INSERT to appropriate tables
> >
> > ### C. PARENT PORTAL (/parent)
> > - Route: `/parent` (Protected - role: parent)
> > - Access: NextAuth session check
> > - Dashboard:
> >   - "My Children" list
> >   - Click child to see details
> > - **CRITICAL: Report Generation is ON-DEMAND**
> >   - Parent selects a DATE using date picker
> >   - Only when parent clicks "Generate Report" button:
> >     1. Query routine_logs for that date
> >     2. Query incidents for that date
> >     3. Query learning_activities (individual + classroom group)
> >     4. Agent 03 synthesizes into human-friendly narrative
> >   - NO automatic daily reports
> >
> > ---
> >
> > ## PHASE 3: THE ROUTER (Agent 01)
> >
> > - API Route: `/api/chat`
> > - Logic:
> >   ```javascript
> >   if (!session) {
> >     // Not logged in -> Route to Agent 02 (Enrollment)
> >     return enrollmentAgent(message);
> >   } else {
> >     // Logged in -> Route to Agent 03 (Parent Access)
> >     return parentAccessAgent(message, session.user);
> >   }
> >   ```
> > - Implementation: OpenAI API (GPT-4)
> >
> > - ---
> >
> > ## EXECUTION ORDER
> >
> > 1. `npx prisma init` - Initialize Prisma
> > 2. 2. Copy schema from docs/schema/prisma-schema.md
> >    3. 3. `npx prisma migrate dev` - Run migrations
> >       4. 4. Build Teacher App first (to generate test data)
> >          5. 5. Build Parent Portal (to view the data)
> >             6. 6. Build Landing Page & Router last
> >               
> >                7. ---
> >               
> >                8. ## IMPORTANT RULES
> >               
> >                9. 1. **Reports are ON-DEMAND only** - Never generate automatically
> > 2. **Learning Activities** can be:
> > 3.    - Individual (child_id filled)
> >       -    - Group (classroom field filled, child_id null)
> >            - 3. **3 Strikes Security** - Log all suspicious access
> >              4. 4. **Code in English** - All variable names, comments in English
> >                 5. 5. **Mobile-First** - Teacher app must work on phones
> >                   
> >                    6. ---
> >                   
> >                    7. ## START NOW.
> >                    8. ```
> >
> >                       ---
> >
> > ## Recursos Adicionais
> >
> > - **Schema completo:** `/docs/schema/prisma-schema.md`
> > - - **Documentação completa:** README.md na raiz
> >  
> >   - ---
> >
> > ## Fluxo de Dados
> >
> > ```
> > [Teacher App] --INSERT--> [Database] <--SELECT-- [Parent Portal]
> >                               |
> >                               v
> >                       [Agent 03: Synthesize]
> >                               |
> >                               v
> >                       [Human-Friendly Report]
> > ```

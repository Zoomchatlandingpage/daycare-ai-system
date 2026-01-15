# 👨‍👩‍👧 Parent Portal - Interface de Saída (v1.2)

> **Rota:** `/parent`
> > **Acesso:** Protegido (role: parent)
> > > **Arquitetura:** Query Direta (Sem IA para visualização)
> > >
> > > ---
> > >
> > > ## ⚠️ REGRAS CRÍTICAS
> > >
> > > ### 1. Relatórios são SOB DEMANDA
> > > - ❌ NÃO gerar relatórios automaticamente
> > > - - ❌ NÃO enviar notificações diárias
> > >   - - ✅ Pai ESCOLHE quando quer ver o relatório
> > >     - - ✅ Pai SELECIONA a data específica
> > >      
> > >       - ### 2. Visualização é QUERY DIRETA (Sem IA)
> > >       - - ❌ NÃO usar LLM para renderizar dados
> > >         - - ✅ Frontend exibe dados brutos do banco
> > >           - - ✅ Componentes React renderizam JSON
> > >            
> > >             - ---
> > >
> > > ## Arquitetura (Determinística)
> > >
> > > ```
> > > ┌─────────────────────────────────────────────────────────────────┐
> > > │  PAI CLICA "GERAR RELATÓRIO"                                    │
> > > └─────────────────────┬───────────────────────────────────────────┘
> > >                       │
> > >                       ▼
> > > ┌─────────────────────────────────────────────────────────────────┐
> > > │  FRONTEND (Next.js)                                             │
> > > │  GET /api/parent/report?child_id=xxx&date=2026-01-14            │
> > > └─────────────────────┬───────────────────────────────────────────┘
> > >                       │
> > >                       ▼
> > > ┌─────────────────────────────────────────────────────────────────┐
> > > │  API ROUTE (Prisma Query)                                       │
> > > │  1. Verifica ParentChildLink (segurança)                        │
> > > │  2. Query routine_logs                                          │
> > > │  3. Query incidents                                             │
> > > │  4. Query learning_events + participants                        │
> > > └─────────────────────┬───────────────────────────────────────────┘
> > >                       │
> > >                       ▼
> > > ┌─────────────────────────────────────────────────────────────────┐
> > > │  JSON RESPONSE (Dados Brutos)                                   │
> > > └─────────────────────┬───────────────────────────────────────────┘
> > >                       │
> > >                       ▼
> > > ┌─────────────────────────────────────────────────────────────────┐
> > > │  REACT COMPONENTS (Renderização Visual)                         │
> > > │  <MoodEmoji>, <FoodProgress>, <SleepBar>, etc.                  │
> > > └─────────────────────────────────────────────────────────────────┘
> > > ```
> > >
> > > **Benefícios:**
> > > - ⚡ Latência: ~50ms (vs 3-5s com IA)
> > > - - 💰 Custo: $0 (vs $0.01-0.05 por relatório com IA)
> > >   - - 🎯 Determinístico: Dados exatos, sem alucinações
> > >    
> > >     - ---
> > >
> > > ## Fluxo do Usuário
> > >
> > > ```
> > > 1. Pai faz login
> > > 2. Vê lista "Meus Filhos" (via ParentChildLink)
> > > 3. Clica em uma criança
> > > 4. Seleciona uma DATA no calendário
> > > 5. Clica em "Gerar Relatório"
> > > 6. API executa queries no PostgreSQL
> > > 7. Frontend renderiza componentes visuais
> > > ```
> > >
> > > ---
> > >
> > > ## API: /api/parent/report
> > >
> > > ### Lógica de Segurança (CRÍTICO)
> > >
> > > ```typescript
> > > // SEMPRE verificar antes de qualquer query
> > > async function checkAccess(parentId: string, childId: string) {
> > >   const link = await prisma.parentChildLink.findUnique({
> > >     where: {
> > >       parent_id_child_id: {
> > >         parent_id: parentId,
> > >         child_id: childId
> > >       }
> > >     }
> > >   });
> > >
> > >   if (!link) {
> > >     // Log tentativa suspeita (3 Strikes)
> > >     await prisma.strikeLog.create({
> > >       data: {
> > >         user_id: parentId,
> > >         ip_address: req.ip,
> > >         action: 'unauthorized_child_access',
> > >         details: `Attempted access to child: ${childId}`
> > >       }
> > >     });
> > >     throw new ForbiddenError('Access denied');
> > >   }
> > >
> > >   return true;
> > > }
> > > ```
> > >
> > > ### Queries Otimizadas
> > >
> > > ```typescript
> > > async function getReportData(childId: string, date: Date) {
> > >   const startOfDay = new Date(date.setHours(0, 0, 0, 0));
> > >   const endOfDay = new Date(date.setHours(23, 59, 59, 999));
> > >
> > >   // Query paralela para performance
> > >   const [routine, incidents, learning] = await Promise.all([
> > >     // 1. Rotina do dia
> > >     prisma.routineLog.findFirst({
> > >       where: {
> > >         child_id: childId,
> > >         logged_at: { gte: startOfDay, lte: endOfDay }
> > >       },
> > >       include: { recorded_by: { select: { full_name: true } } }
> > >     }),
> > >
> > >     // 2. Incidentes do dia
> > >     prisma.incident.findMany({
> > >       where: {
> > >         child_id: childId,
> > >         occurred_at: { gte: startOfDay, lte: endOfDay }
> > >       },
> > >       orderBy: { occurred_at: 'asc' }
> > >     }),
> > >
> > >     // 3. Aprendizados (individual + grupo da turma)
> > >     prisma.learningEvent.findMany({
> > >       where: {
> > >         logged_at: { gte: startOfDay, lte: endOfDay },
> > >         OR: [
> > >           { participants: { some: { child_id: childId } } },
> > >           { is_group: true, classroom: child.classroom }
> > >         ]
> > >       },
> > >       include: {
> > >         participants: {
> > >           where: { child_id: childId },
> > >           select: { individual_notes: true }
> > >         }
> > >       }
> > >     })
> > >   ]);
> > >
> > >   return { routine, incidents, learning };
> > > }
> > > ```
> > >
> > > ---
> > >
> > > ## JSON Response Contract
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
> > >     "notes": "Dia tranquilo",
> > >     "recorded_by": "Tia Maria"
> > >   },
> > >   "incidents": [],
> > >   "learning": [
> > >     {
> > >       "activity": "Pintura",
> > >       "description": "Pintura com os dedos",
> > >       "skills": ["Motor Skills", "Creativity"],
> > >       "is_group": true,
> > >       "individual_notes": null
> > >     }
> > >   ]
> > > }
> > > ```
> > >
> > > ---
> > >
> > > ## Componentes React
> > >
> > > | Componente | Props | Visualização |
> > > |------------|-------|--------------|
> > > | `<MoodEmoji />` | `mood: string` | 😊 😐 😢 😴 |
> > > | `<FoodProgress />` | `percentage: number` | Barra de progresso |
> > > | `<SleepBar />` | `minutes: number` | "1h 30m" |
> > > | `<DiaperStatus />` | `status: string` | ✅ ou ⚠️ |
> > > | `<IncidentTimeline />` | `incidents: array` | Lista cronológica |
> > > | `<LearningCard />` | `activity: object` | Card com skills |
> > >
> > > ### Exemplo de Componente
> > >
> > > ```tsx
> > > // components/parent/MoodEmoji.tsx
> > > const moodMap = {
> > >   VERY_HAPPY: { emoji: '🤩', label: 'Muito Feliz', color: 'green' },
> > >   HAPPY: { emoji: '😊', label: 'Feliz', color: 'green' },
> > >   NEUTRAL: { emoji: '😐', label: 'Normal', color: 'yellow' },
> > >   SAD: { emoji: '😢', label: 'Triste', color: 'orange' },
> > >   TIRED: { emoji: '😴', label: 'Cansado', color: 'blue' },
> > >   SICK: { emoji: '🤒', label: 'Doente', color: 'red' }
> > > };
> > >
> > > export function MoodEmoji({ mood }: { mood: string }) {
> > >   const { emoji, label, color } = moodMap[mood];
> > >   return (
> > >     <div className={`mood-card bg-${color}-100`}>
> > >       <span className="text-4xl">{emoji}</span>
> > >       <span className="text-sm">{label}</span>
> > >     </div>
> > >   );
> > > }
> > > ```
> > >
> > > ---
> > >
> > > ## Dashboard Principal
> > >
> > > ```tsx
> > > // app/parent/page.tsx
> > > export default async function ParentDashboard() {
> > >   const session = await getServerSession();
> > >
> > >   // Buscar filhos do pai logado (via ParentChildLink)
> > >   const children = await prisma.child.findMany({
> > >     where: {
> > >       parents: {
> > >         some: {
> > >           parent: {
> > >             user_id: session.user.id
> > >           }
> > >         }
> > >       }
> > >     },
> > >     include: {
> > >       parents: {
> > >         where: { parent: { user_id: session.user.id } },
> > >         select: { relationship: true, is_primary: true }
> > >       }
> > >     }
> > >   });
> > >
> > >   return (
> > >     <div className="p-4">
> > >       <h1>Meus Filhos</h1>
> > >       <div className="grid gap-4">
> > >         {children.map(child => (
> > >           <ChildCard key={child.id} child={child} />
> > >         ))}
> > >       </div>
> > >     </div>
> > >   );
> > > }
> > > ```
> > >
> > > ---
> > >
> > > ## API Routes
> > >
> > > ```
> > > GET  /api/parent/children              - Lista filhos do pai
> > > GET  /api/parent/child/:id             - Detalhes de uma criança
> > > GET  /api/parent/report?child_id&date  - Dados para relatório (Query Direta)
> > > ```
> > >
> > > ---
> > >
> > > ## Resumo
> > >
> > > | Aspecto | Decisão |
> > > |---------|---------|
> > > | Geração de Relatório | Query Direta (sem IA) |
> > > | Visualização | Componentes React |
> > > | Segurança | ParentChildLink + 3 Strikes |
> > > | Performance | ~50ms por request |
> > > | Custo | $0 (só banco de dados) |

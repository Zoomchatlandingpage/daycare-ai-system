# 👨‍👩‍👧 Parent Portal - Interface de Saída

> **Rota:** `/parent`
> > **Acesso:** Protegido (role: parent)
> > > **Função:** Visualização de relatórios SOB DEMANDA
> > >
> > > ---
> > >
> > > ## ⚠️ REGRA CRÍTICA
> > >
> > > **RELATÓRIOS SÃO SOB DEMANDA**
> > > - NÃO gerar relatórios automaticamente
> > > - - NÃO enviar notificações diárias
> > >   - - Pai ESCOLHE quando quer ver o relatório
> > >     - - Pai SELECIONA a data específica
> > >      
> > >       - ---
> > >
> > > ## Fluxo do Usuário
> > >
> > > ```
> > > 1. Pai faz login
> > > 2. Vê lista "Meus Filhos"
> > > 3. Clica em uma criança
> > > 4. Seleciona uma DATA no calendário
> > > 5. Clica em "Gerar Relatório"
> > > 6. Sistema consulta BD + Agent 03 sintetiza
> > > 7. Relatório humanizado é exibido
> > > ```
> > >
> > > ---
> > >
> > > ## Componentes da Interface
> > >
> > > ### 1. Dashboard Principal
> > > ```jsx
> > > // Mostra lista de filhos do pai logado
> > > <ChildrenList>
> > >   {children.map(child => (
> > >     <ChildCard
> > >       key={child.id}
> > >       name={child.full_name}
> > >       classroom={child.classroom}
> > >       avatar={child.avatar}
> > >     />
> > >   ))}
> > > </ChildrenList>
> > > ```
> > >
> > > ### 2. Tela de Detalhes da Criança
> > > ```jsx
> > > <ChildDetails>
> > >   <ChildHeader name={child.full_name} classroom={child.classroom} />
> > >
> > >   {/* IMPORTANTE: Date Picker para selecionar data */}
> > >   <DatePicker
> > >     selected={selectedDate}
> > >     onChange={setSelectedDate}
> > >     maxDate={new Date()} // Não pode selecionar futuro
> > >   />
> > >
> > >   {/* Botão que dispara a geração */}
> > >   <Button
> > >     onClick={generateReport}
> > >     disabled={!selectedDate}
> > >   >
> > >     📊 Gerar Relatório do Dia
> > >   </Button>
> > >
> > >   {/* Área onde o relatório aparece */}
> > >   {report && <ReportDisplay data={report} />}
> > > </ChildDetails>
> > > ```
> > >
> > > ---
> > >
> > > ## Lógica de Geração de Relatório
> > >
> > > ```javascript
> > > async function generateReport(childId, date) {
> > >   // 1. Buscar dados da rotina
> > >   const routineLogs = await prisma.routineLog.findMany({
> > >     where: {
> > >       child_id: childId,
> > >       logged_at: {
> > >         gte: startOfDay(date),
> > >         lte: endOfDay(date)
> > >       }
> > >     }
> > >   });
> > >
> > >   // 2. Buscar incidentes do dia
> > >   const incidents = await prisma.incident.findMany({
> > >     where: {
> > >       child_id: childId,
> > >       occurred_at: {
> > >         gte: startOfDay(date),
> > >         lte: endOfDay(date)
> > >       }
> > >     }
> > >   });
> > >
> > >   // 3. Buscar aprendizados (individuais + grupo da turma)
> > >   const child = await prisma.child.findUnique({
> > >     where: { id: childId },
> > >     select: { classroom: true }
> > >   });
> > >
> > >   const learnings = await prisma.learningActivity.findMany({
> > >     where: {
> > >       OR: [
> > >         { child_id: childId }, // Atividades individuais
> > >         {
> > >           classroom: child.classroom,
> > >           activity_type: 'group'
> > >         } // Atividades em grupo da turma
> > >       ],
> > >       logged_at: {
> > >         gte: startOfDay(date),
> > >         lte: endOfDay(date)
> > >       }
> > >     }
> > >   });
> > >
> > >   // 4. Chamar Agent 03 para sintetizar
> > >   const report = await agent03.synthesize({
> > >     routineLogs,
> > >     incidents,
> > >     learnings,
> > >     childName: child.full_name,
> > >     date: date
> > >   });
> > >
> > >   return report;
> > > }
> > > ```
> > >
> > > ---
> > >
> > > ## Agent 03 - Síntese do Relatório
> > >
> > > ```javascript
> > > // Prompt para GPT-4
> > > const systemPrompt = `
> > > Você é um assistente de comunicação para uma creche.
> > > Sua função é transformar dados brutos em um relatório acolhedor para os pais.
> > >
> > > REGRAS:
> > > 1. Use linguagem carinhosa e profissional
> > > 2. Destaque pontos positivos primeiro
> > > 3. Mencione incidentes de forma cuidadosa
> > > 4. Celebre os aprendizados
> > > 5. Use emojis moderadamente
> > >
> > > FORMATO DO RELATÓRIO:
> > > - Resumo do dia (2-3 frases)
> > > - Rotina (alimentação, sono, humor)
> > > - Aprendizados do dia
> > > - Observações (se houver incidentes)
> > > `;
> > >
> > > async function synthesize(data) {
> > >   const response = await openai.chat.completions.create({
> > >     model: "gpt-4",
> > >     messages: [
> > >       { role: "system", content: systemPrompt },
> > >       { role: "user", content: JSON.stringify(data) }
> > >     ]
> > >   });
> > >
> > >   return response.choices[0].message.content;
> > > }
> > > ```
> > >
> > > ---
> > >
> > > ## Exemplo de Relatório Gerado
> > >
> > > ```
> > > 📅 Relatório de João - 14/01/2026
> > >
> > > Olá! Hoje o João teve um dia muito especial na creche! 😊
> > >
> > > 🍽️ ALIMENTAÇÃO
> > > João comeu 85% do almoço - ótimo apetite hoje!
> > >
> > > 😴 SONO
> > > Descansou por 1h30 durante a soneca da tarde.
> > >
> > > 😊 HUMOR
> > > Esteve feliz e animado durante todo o dia!
> > >
> > > 📚 APRENDIZADOS
> > > • Individual: João conseguiu montar um quebra-cabeça de 12 peças sozinho!
> > > • Com a turma: Trabalhamos coordenação motora com massinha de modelar.
> > >
> > > ℹ️ OBSERVAÇÕES
> > > Nenhum incidente registrado hoje.
> > >
> > > Com carinho,
> > > Equipe da Creche 💛
> > > ```
> > >
> > > ---
> > >
> > > ## API Routes
> > >
> > > ```
> > > GET  /api/parent/children           - Listar filhos do pai
> > > GET  /api/parent/child/:id          - Detalhes de uma criança
> > > POST /api/parent/report             - Gerar relatório (on-demand)
> > >      Body: { childId, date }
> > > ```
> > >
> > > ---
> > >
> > > ## Segurança
> > >
> > > ```javascript
> > > // Middleware de autorização
> > > async function canAccessChild(userId, childId) {
> > >   const parent = await prisma.parent.findFirst({
> > >     where: {
> > >       user: { id: userId },
> > >       children: { some: { id: childId } }
> > >     }
> > >   });
> > >
> > >   if (!parent) {
> > >     // Log tentativa suspeita
> > >     await prisma.securityLog.create({
> > >       data: {
> > >         phone_number: user.phone,
> > >         action: 'unauthorized_child_access',
> > >         ip_address: req.ip
> > >       }
> > >     });
> > >     throw new ForbiddenError('Acesso negado');
> > >   }
> > >
> > >   return true;
> > > }
> > > ```

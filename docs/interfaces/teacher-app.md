# 👩‍🏫 Teacher App - Interface de Entrada

> **Rota:** `/teacher`
> > **Acesso:** Protegido (role: teacher ou admin)
> > > **Design:** Mobile-First
> > >
> > > ---
> > >
> > > ## Visão Geral
> > >
> > > O Teacher App é a interface onde professores registram as atividades diárias das crianças. É otimizado para uso em celular durante o dia de trabalho.
> > >
> > > ---
> > >
> > > ## Campos do Formulário
> > >
> > > ### 1. Seletor de Criança
> > > ```
> > > - Dropdown com todas as crianças da turma
> > > - Filtro por turma (Turma da Tia Maria, Turma da Tia Ana, etc.)
> > > - Opção: "Toda a Turma" para atividades em grupo
> > > ```
> > >
> > > ### 2. Humor (Mood) 😊
> > > ```
> > > Tipo: Seletor de Emoji
> > > Opções:
> > > - 😊 HAPPY (Feliz)
> > > - 😐 NEUTRAL (Normal)
> > > - 😢 SAD (Triste)
> > > - 😴 TIRED (Cansado)
> > > ```
> > >
> > > ### 3. Alimentação (Food) 🍽️
> > > ```
> > > Tipo: Slider (0-100%)
> > > - 0% = Não comeu nada
> > > - 50% = Comeu metade
> > > - 100% = Comeu tudo
> > > ```
> > >
> > > ### 4. Sono (Sleep) 😴
> > > ```
> > > Tipo: Input numérico
> > > Valor: Minutos de sono
> > > - Ex: 60 = 1 hora de sono
> > > - Ex: 90 = 1h30 de sono
> > > ```
> > >
> > > ### 5. Incidentes (Incidents) ⚠️
> > > ```
> > > Tipo: Textarea + Seletor de Severidade
> > > Severidade:
> > > - LOW (Baixa) - Observação menor
> > > - MEDIUM (Média) - Requer atenção
> > > - HIGH (Alta) - Urgente, notificar pais
> > > ```
> > >
> > > ### 6. **NOVO: Aprendizados (Learning Activities)** 📚
> > > ```
> > > Tipo: Textarea + Toggle Individual/Grupo
> > >
> > > Campos:
> > > - Descrição: O que foi aprendido/trabalhado
> > > - Habilidades desenvolvidas (opcional)
> > > - Tipo:
> > >   - INDIVIDUAL: Vinculado à criança selecionada
> > >   - GROUP: Vinculado à turma toda
> > >
> > > Exemplos:
> > > - Individual: "João aprendeu a amarrar os sapatos"
> > > - Grupo: "Turma trabalhou coordenação motora com massinha"
> > > ```
> > >
> > > ---
> > >
> > > ## Lógica de Submissão
> > >
> > > ```javascript
> > > async function handleSubmit(formData) {
> > >   // 1. Sempre criar routine_log
> > >   await prisma.routineLog.create({
> > >     data: {
> > >       child_id: formData.childId,
> > >       mood: formData.mood,
> > >       food_pct: formData.foodPercent,
> > >       sleep_min: formData.sleepMinutes,
> > >       notes: formData.notes,
> > >       logged_by: session.user.name
> > >     }
> > >   });
> > >
> > >   // 2. Se houver incidente, criar registro
> > >   if (formData.incident) {
> > >     await prisma.incident.create({
> > >       data: {
> > >         child_id: formData.childId,
> > >         description: formData.incident.description,
> > >         severity: formData.incident.severity,
> > >         reported_by: session.user.name
> > >       }
> > >     });
> > >   }
> > >
> > >   // 3. Se houver aprendizado, criar registro
> > >   if (formData.learning) {
> > >     await prisma.learningActivity.create({
> > >       data: {
> > >         child_id: formData.learning.type === 'INDIVIDUAL' ? formData.childId : null,
> > >         classroom: formData.classroom,
> > >         activity_type: formData.learning.type.toLowerCase(),
> > >         description: formData.learning.description,
> > >         skills_developed: formData.learning.skills,
> > >         logged_by: session.user.name
> > >       }
> > >     });
> > >   }
> > > }
> > > ```
> > >
> > > ---
> > >
> > > ## UI/UX Recommendations
> > >
> > > ### Mobile-First Design
> > > - Botões grandes para fácil toque
> > > - - Formulário em tela cheia
> > >   - - Gestos de swipe para navegação
> > >     - - Feedback visual após submissão
> > >      
> > >       - ### Fluxo Rápido
> > >       - 1. Selecionar criança (ou "Toda a Turma")
> > >         2. 2. Preencher campos obrigatórios (Mood, Food, Sleep)
> > >            3. 3. Adicionar incidentes/aprendizados (opcional)
> > >               4. 4. Botão grande "Salvar" no final
> > >                 
> > >                  5. ### Validações
> > >                  6. - Mood é obrigatório
> > >                     - - Food deve estar entre 0-100
> > >                       - - Sleep deve ser número positivo
> > >                         - - Learning description obrigatória se tipo selecionado
> > >                          
> > >                           - ---
> > >
> > > ## Componentes React Sugeridos
> > >
> > > ```jsx
> > > // components/teacher/MoodSelector.jsx
> > > // components/teacher/FoodSlider.jsx
> > > // components/teacher/SleepInput.jsx
> > > // components/teacher/IncidentForm.jsx
> > > // components/teacher/LearningActivityForm.jsx
> > > // components/teacher/ChildSelector.jsx
> > > ```
> > >
> > > ---
> > >
> > > ## API Routes
> > >
> > > ```
> > > POST /api/teacher/routine-log    - Criar log de rotina
> > > POST /api/teacher/incident       - Registrar incidente
> > > POST /api/teacher/learning       - Registrar aprendizado
> > > GET  /api/teacher/children       - Listar crianças da turma
> > > ```

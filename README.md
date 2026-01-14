# 🏫 Daycare AI System - Trust Infrastructure

> **Infraestrutura de Confiança para Gestão de Creches**
> > Sistema de IA com arquitetura multi-agente para enrollment, portal dos pais e ferramentas de professores.
> >
> > ## 📋 Visão Geral do Sistema
> >
> > Este repositório contém toda a especificação técnica para o **Daycare AI System**, uma infraestrutura de confiança que:
> >
> > - ✅ **Reduz erro humano** através de sistemas inteligentes
> > - - ✅ **Garante segurança** com regras rígidas (SOP v1.1)
> >   - - ✅ **Escala para outros daycares** como produto vendável
> >     - - ✅ **Gera relatórios sob demanda** (não automáticos)
> >      
> >       - ---
> >
> > ## 🏗️ Arquitetura do Sistema
> >
> > ### Divisão de Especialistas (Squad)
> >
> > | Especialista | Função | Status |
> > |-------------|--------|--------|
> > | **Claude** | Arquiteto - Define SOP e System Prompts | ✅ FROZEN |
> > | **Gemini** | Engenheiro - Schema SQL e lógica de dados | ✅ FROZEN |
> > | **ChatGPT** | Designer - Camada de empatia e comunicação | ✅ FROZEN |
> > | **NotebookLM** | Memória - Fonte central de verdade | ✅ v2.0 |
> > | **Replit** | Construtor - Implementa o código | 🔄 ATIVO |
> >
> > ### 4 Agentes do Sistema
> >
> > 1. **Agent 01 (Router)** - Direciona conversas para o agente correto
> > 2. 2. **Agent 02 (Enrollment)** - Gerencia matrículas/inscrições de novos pais
> >    3. 3. **Agent 03 (Parent Access)** - Portal dos pais (relatórios sob demanda)
> >       4. 4. **Agent 04 (Teacher Assistant)** - Assistente para professores registrarem atividades
> >         
> >          5. ---
> >         
> >          6. ## 🛠️ Stack Tecnológica
> >         
> >          7. - **Frontend:** Next.js (App Router) + TailwindCSS + Lucide React
> > - **Backend:** Node.js + Prisma ORM + PostgreSQL
> > - - **IA:** OpenAI API (GPT-4)
> >   - - **Auth:** NextAuth.js
> >     - - **Idioma do código:** Inglês (obrigatório)
> >      
> >       - ---
> >
> > ## 📁 Estrutura do Repositório
> >
> > ```
> > daycare-ai-system/
> > ├── docs/
> > │   ├── schema/
> > │   │   └── prisma-schema.md        # Schema completo do banco de dados
> > │   ├── agents/
> > │   │   ├── agent-01-router.md      # Lógica do roteador
> > │   │   ├── agent-02-enrollment.md  # Agente de matrículas
> > │   │   ├── agent-03-parent.md      # Portal dos pais
> > │   │   └── agent-04-teacher.md     # App dos professores
> > │   ├── interfaces/
> > │   │   ├── landing-page.md         # Landing page pública
> > │   │   ├── teacher-app.md          # App Mobile-First
> > │   │   └── parent-portal.md        # Portal com relatórios
> > │   └── architecture/
> > │       └── system-overview.md      # Visão geral da arquitetura
> > ├── prompts/
> > │   └── mega-prompt-replit.md       # Prompt consolidado para Replit
> > └── README.md
> > ```
> >
> > ---
> >
> > ## 🚀 Como Usar com Replit
> >
> > 1. Clone este repositório no Replit
> > 2. 2. Leia o arquivo `prompts/mega-prompt-replit.md`
> >    3. 3. Cole o conteúdo no chat do Replit Agent
> >       4. 4. O Replit irá construir o sistema baseado nas especificações
> >         
> >          5. ---
> >         
> >          6. ## 📊 Banco de Dados - Tabelas Principais
> >         
> >          7. | Tabela | Descrição |
> > |--------|-----------|
> > | `users` | Autenticação (parent, teacher, admin) |
> > | `parents` | Dados dos pais cadastrados |
> > | `children` | Crianças vinculadas aos pais |
> > | `incidents` | Registro de incidentes |
> > | `routine_logs` | Logs de rotina (mood, food, sleep) |
> > | `learning_activities` | **NOVO** - Aprendizados das crianças |
> > | `leads` | Leads do funil de enrollment |
> > | `security_logs` | Logs de segurança (3 strikes) |
> > | `blocked_users` | Usuários bloqueados |
> >
> > ---
> >
> > ## 🎯 Interfaces do Sistema
> >
> > ### 1. Landing Page (`/`)
> > - Pública
> > - - Hero Section + Chat Widget
> >   - - Conecta ao Agent 02 (Enrollment)
> >    
> >     - ### 2. Teacher App (`/teacher`)
> >     - - Protegida (staff only)
> >       - - Mobile-First
> >         - - Campos: Mood 😊, Food %, Sleep, Incidents, **Learning Activities**
> >          
> >           - ### 3. Parent Portal (`/parent`)
> >           - - Protegida (login obrigatório)
> >             - - Lista "Meus Filhos"
> >               - - **Relatório sob demanda** (pai escolhe a data)
> >                 - - Combina: routine_logs + incidents + learning_activities
> >                  
> >                   - ---
> >
> > ## 🔐 Regras de Segurança (SOP v1.1)
> >
> > - **3 Strikes:** Usuário bloqueado após 3 tentativas falhas
> > - - **Hard Limits:** Nunca acessar dados de outras crianças
> >   - - **Auditoria:** Todos os acessos são logados
> >    
> >     - ---
> >
> > ## 📝 Licença
> >
> > MIT License - Uso livre para fins educacionais e comerciais.
> >
> > ---
> >
> > **Repositório mantido por:** Zoomchatlandingpage
> > **Última atualização:** Janeiro 2026

# 👨‍👩‍👧 Parent Portal - Dashboard de Relatórios

> **Rota:** `/parent`
> **Acesso:** Protegido (Role: PARENT)
> **Tipo:** Dashboard React (SEM LLM)

---

## ⚠️ REGRAS CRÍTICAS

### 1. Relatórios são SOB DEMANDA
- ❌ NÃO gerar relatórios automaticamente
- ❌ NÃO enviar notificações diárias
- ✅ Pai ESCOLHE quando quer ver o relatório
- ✅ Pai SELECIONA a data específica

### 2. Visualização é QUERY DIRETA (Sem IA)
- ❌ NÃO usar LLM para renderizar dados
- ✅ Frontend exibe dados brutos do banco
- ✅ Componentes React renderizam JSON

---

## Arquitetura (Determinística)

```
┌─────────────────────────────────────────────────────────────────┐
│  PAI CLICA "GERAR RELATÓRIO"                                    │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js)                                             │
│  GET /api/parent/report?child_id=xxx&date=2026-01-14            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  API ROUTE (Prisma Query)                                       │
│  1. Verifica ParentChildLink (segurança)                        │
│  2. Query routine_logs                                          │
│  3. Query incidents                                             │
│  4. Query learning_events + participants                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  JSON RESPONSE (Dados Brutos)                                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  REACT COMPONENTS (Renderização Visual)                         │
│  <MoodEmoji>, <FoodProgress>, <SleepBar>, etc.                  │
└─────────────────────────────────────────────────────────────────┘
```

**Benefícios:**
- ⚡ Latência: ~50ms (vs 3-5s com IA)
- 💰 Custo: $0 (vs $0.01-0.05 por relatório com IA)
- 🎯 Determinístico: Dados exatos, sem alucinações

---

## Componentes Principais

### 1. AnnouncementBanner (NOVO)
- Alertas ativos no topo da página
- Tipos: URGENT (vermelho), EVENT (azul), GENERAL (cinza)

### 2. Child Selector (Tabs)
- Se parent tem >1 filho, mostra tabs no topo
- Default: primeiro filho

### 3. Date Picker
- Seletor de data para o relatório
- Default: hoje

### 4. Botão "Gerar Relatório"
- Dispara query no banco
- Retorna dados do dia selecionado

### 5. Cards Visuais (Output)

| Card | Visualização |
|------|--------------|
| Mood | Emoji grande + cor de fundo |
| Food | Progress bar (verde >75%, amarelo >50%, vermelho <50%) |
| Sleep | Barra horizontal (target vs actual) |
| Incidents | Timeline vertical (se houver) |
| Learning | Cards com skills tags |

---

## 📢 Feed de Anúncios

### Componente: `<AnnouncementBanner />`

**Localização:** Acima dos Child Tabs

**Lógica:**
1. Busca `Announcement` onde `is_active=true` E `expires_at > now`
2. Verifica se pai já leu na tabela `AnnouncementRead`
3. Se não leu, mostra o Banner

### Tipos de Visualização

| Tipo | Estilo | Exemplo |
|------|--------|---------|
| URGENT_ALERT | Vermelho, topo fixo | "Fechamento por Neve" |
| EVENT | Azul, card dismissible | "Festa da Primavera" |
| GENERAL | Cinza/Info | "Atualização de política" |
| CLOSURE | Laranja | "Fechado dia 25/12" |

### Ação "Marcar como Lido"
- Ao clicar no "X" ou "Entendi"
- Frontend chama: `POST /api/parent/announcements/{id}/read`
- Cria registro em `AnnouncementRead`
- Banner desaparece

### Exemplo de Implementação

```tsx
// components/parent/AnnouncementBanner.tsx
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'URGENT_ALERT' | 'EVENT' | 'GENERAL' | 'CLOSURE';
}

const typeStyles = {
  URGENT_ALERT: 'bg-red-100 border-red-500 text-red-800',
  EVENT: 'bg-blue-100 border-blue-500 text-blue-800',
  GENERAL: 'bg-gray-100 border-gray-500 text-gray-800',
  CLOSURE: 'bg-orange-100 border-orange-500 text-orange-800'
};

export function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const handleDismiss = async (id: string) => {
    await fetch(`/api/parent/announcements/${id}/read`, { method: 'POST' });
    setDismissed([...dismissed, id]);
  };

  return (
    <div className="space-y-2 mb-4">
      {announcements
        .filter(a => !dismissed.includes(a.id))
        .map(announcement => (
          <div
            key={announcement.id}
            className={`p-4 border-l-4 rounded ${typeStyles[announcement.type]}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{announcement.title}</h3>
                <p className="text-sm">{announcement.content}</p>
              </div>
              <button
                onClick={() => handleDismiss(announcement.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
```

---

## API Endpoints

```
GET  /api/parent/children              - Lista filhos do pai
GET  /api/parent/child/:id             - Detalhes de uma criança
GET  /api/parent/report?child_id&date  - Dados para relatório (Query Direta)
GET  /api/parent/announcements         - Anúncios ativos não lidos
POST /api/parent/announcements/{id}/read - Marcar como lido
```

---

## Lógica de Segurança (CRÍTICO)

```typescript
// SEMPRE verificar antes de qualquer query
async function checkAccess(parentId: string, childId: string) {
  const link = await prisma.parentChildLink.findUnique({
    where: {
      parent_id_child_id: {
        parent_id: parentId,
        child_id: childId
      }
    }
  });

  if (!link) {
    // Log tentativa suspeita (3 Strikes)
    await prisma.securityLog.create({
      data: {
        source_ip: req.ip,
        attempted_child_id: childId,
        violation_type: 'UNAUTHORIZED_CHILD_ACCESS'
      }
    });
    throw new ForbiddenError('Access denied');
  }

  return true;
}
```

---

## JSON Response Contract

```json
{
  "meta": {
    "date": "2026-01-14",
    "child_name": "Alice",
    "classroom": "Turma da Tia Maria"
  },
  "routine": {
    "mood": "HAPPY",
    "food_intake_pct": 85,
    "sleep_minutes": 90,
    "diaper": "CLEAN",
    "notes": "Dia tranquilo"
  },
  "incidents": [],
  "learning": [
    {
      "activity": "Pintura",
      "description": "Pintura com os dedos",
      "skills": ["Motor Skills", "Creativity"],
      "is_group": true
    }
  ]
}
```

---

## Componentes React

| Componente | Props | Visualização |
|------------|-------|--------------|
| `<AnnouncementBanner />` | `announcements: array` | Banners no topo |
| `<MoodEmoji />` | `mood: string` | 😊 😐 😢 😴 |
| `<FoodProgress />` | `percentage: number` | Barra de progresso |
| `<SleepBar />` | `minutes: number` | "1h 30m" |
| `<DiaperStatus />` | `status: string` | ✅ ou ⚠️ |
| `<IncidentTimeline />` | `incidents: array` | Lista cronológica |
| `<LearningCard />` | `activity: object` | Card com skills |

---

## Segurança

- Query SEMPRE filtra por `parent_id` da sessão
- Impossível ver dados de outras crianças
- Middleware valida `ParentChildLink` antes de retornar dados
- 3-Strike Rule para tentativas de acesso não autorizado

---

## Resumo

| Aspecto | Decisão |
|---------|---------|
| Geração de Relatório | Query Direta (sem IA) |
| Visualização | Componentes React |
| Anúncios | Banner dismissible com tracking de leitura |
| Segurança | ParentChildLink + 3 Strikes |
| Performance | ~50ms por request |
| Custo | $0 (só banco de dados) |

# ⚙️ Daycare Settings - Source of Truth

> **Status:** SOP v1.3 FROZEN
> **Objetivo:** Definir como as configurações do daycare são armazenadas e consumidas pelos Agentes.

---

## 🎯 Princípio Fundamental

**DaycareConfig é a "Constituição" do sistema.**

Nenhum Agente inventa informação sobre horários, feriados ou regras. Todos consultam o banco de dados.

---

## 📊 Estrutura de Dados

### Tabela Principal: `DaycareConfig`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `daycare_name` | String | Nome da creche |
| `timezone` | String | Ex: "America/New_York" |
| `default_lang` | String | "en", "pt", "es" |
| `created_at` | DateTime | Data de criação |
| `updated_at` | DateTime | Última atualização |

### Tabelas Relacionadas

#### `OperatingDay` (Horários de Funcionamento)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `day_of_week` | Int | 0=Dom, 1=Seg, 2=Ter... 6=Sáb |
| `is_open` | Boolean | Se está aberto neste dia |
| `open_time` | String | "07:30" |
| `close_time` | String | "18:00" |

#### `Holiday` (Feriados)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | String | "Christmas Day" |
| `date` | DateTime | Data do feriado |
| `is_closed` | Boolean | Se fecha totalmente |

#### `IllnessRule` (Regras de Saúde)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `symptom_name` | String | "Fever > 38°C" |
| `exclusion_hours` | Int | 24, 48, etc. |
| `requires_doc_note` | Boolean | Se precisa atestado |

#### `PickupPolicy` (Política de Atraso)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `grace_period_min` | Int | Tolerância em minutos |
| `late_fee_per_min` | Float | Multa por minuto |

---

## 🤖 Como os Agentes Consomem as Configurações

### Agent 02 (Enrollment) - Claude

**Cenário:** Pai pergunta "What time do you open?"
```
1. Agent 02 recebe pergunta
2. Chama função: getOperatingHours()
3. Query: SELECT * FROM OperatingDay WHERE config_id = ?
4. Responde com dados REAIS do banco
5. NUNCA inventa horário
```

**Fallback se não houver config:**
```
"I don't have the operating hours configured yet.
Please contact the administration directly."
```

### Agent 02 (Enrollment) - Agendamento de Visita

**Cenário:** Pai quer agendar visita
```
1. Agent 02 recebe pedido de agendamento
2. Chama função: getAvailableSlots(date)
3. Verifica:
   - OperatingDay.is_open = true para o dia
   - Holiday não existe para a data
   - Slots disponíveis no calendário
4. Oferece apenas slots válidos
5. NUNCA oferece horário em dia fechado
```

### Agent 04 (Teacher Assistant) - Claude

**Cenário:** Professora registra "fever"
```
1. Agent 04 detecta menção a sintoma
2. Chama função: getIllnessRule("fever")
3. Query: SELECT * FROM IllnessRule WHERE symptom_name ILIKE '%fever%'
4. Se regra existe:
   - Adiciona flag no registro: requires_exclusion = true
   - Inclui: exclusion_hours = 24 (do banco)
5. Salva no RoutineLog/Incident com metadados
```

---

## 🔒 Regras de Segurança

### Quem Pode Modificar

| Tabela | OWNER | ADMIN | TEACHER | PARENT |
|--------|-------|-------|---------|--------|
| DaycareConfig | ✅ Write | ❌ | ❌ | ❌ |
| OperatingDay | ✅ Write | ❌ | ❌ | ❌ |
| Holiday | ✅ Write | ✅ Write | ❌ | ❌ |
| IllnessRule | ✅ Write | ❌ | ❌ | ❌ |
| PickupPolicy | ✅ Write | ❌ | ❌ | ❌ |

### Quem Pode Ler

| Tabela | OWNER | ADMIN | TEACHER | PARENT | AGENTS |
|--------|-------|-------|---------|--------|--------|
| Todas | ✅ | ✅ | ✅ | ✅ (parcial) | ✅ |

**Nota:** Parents veem apenas informações públicas (horários, feriados). Não veem políticas de multa detalhadas.

---

## 📡 API Endpoints

### Leitura (Público para usuários autenticados)
```
GET /api/config/hours
Response: { schedule: [...], timezone: "..." }

GET /api/config/holidays
Response: { holidays: [...] }

GET /api/config/illness-rules
Response: { rules: [...] }
```

### Escrita (Apenas OWNER)
```
POST /api/admin/config
Body: { daycare_name, timezone, default_lang }

PUT /api/admin/config/hours
Body: { schedule: [...] }

PUT /api/admin/config/holidays
Body: { holidays: [...] }

PUT /api/admin/config/illness-rules
Body: { rules: [...] }

PUT /api/admin/config/pickup-policy
Body: { grace_period_min, late_fee_per_min }
```

---

## 🔄 Fluxo de Inicialização
```
┌─────────────────────────────────────────────────────────────┐
│                  PRIMEIRO ACESSO (OWNER)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Sistema detecta: DaycareConfig não existe                  │
│  Redireciona para: /admin/setup (Owner Onboarding)          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Owner preenche Wizard de 4 passos                          │
│  Sistema salva DaycareConfig + tabelas relacionadas         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Agentes agora têm "Source of Truth" para consultar         │
│  Sistema está operacional                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Edge Cases

| Cenário | Comportamento |
|---------|---------------|
| Config não existe | Bloqueia Agents, força Owner Onboarding |
| Feriado no meio da semana | Agent 02 não oferece slots neste dia |
| Pai pergunta sobre multa | Agent responde: "Please contact administration for policy details" |
| Horário ambíguo ("afternoon") | Agent 02 oferece slots específicos: "We have 2pm, 3pm, 4pm available" |

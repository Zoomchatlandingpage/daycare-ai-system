# 🏢 Owner Onboarding - Configuração Inicial

> **Rota:** `/admin/setup`
> **Acesso:** Role OWNER (Primeiro acesso)
> **Objetivo:** Preencher a tabela `DaycareConfig` para que os Agentes saibam as regras.

---

## O "Wizard" de 4 Passos

### Passo 1: Básico
- Nome da Creche
- Fuso Horário (Dropdown)
- Idioma Padrão (PT/EN/ES)

### Passo 2: Horários (OperatingDay)
- Tabela com Segunda a Domingo
- Toggles "Aberto/Fechado"
- Inputs de Hora: Abertura e Fechamento

### Passo 3: Regras de Saúde (IllnessRule)
- Checklist pré-definido:
  - [x] Febre > 38°C (Exclusão: 24h)
  - [x] Vômito/Diarreia (Exclusão: 24h)
  - [ ] Conjuntivite (Exclusão: 48h)
- Botão "Adicionar Regra Customizada"

### Passo 4: Política de Atraso (PickupPolicy)
- Tolerância (minutos): ex: 15
- Multa por minuto ($): ex: 1.00

---

## Output JSON (Exemplo)

```json
{
  "daycare_name": "Sunny Days Academy",
  "timezone": "America/New_York",
  "schedule": [
    { "day": 1, "open": "07:30", "close": "18:00" },
    { "day": 2, "open": "07:30", "close": "18:00" },
    { "day": 3, "open": "07:30", "close": "18:00" },
    { "day": 4, "open": "07:30", "close": "18:00" },
    { "day": 5, "open": "07:30", "close": "18:00" }
  ],
  "illness_rules": [
    { "symptom": "Fever > 38C", "hours": 24 },
    { "symptom": "Vomiting", "hours": 24 }
  ],
  "pickup": { "grace": 15, "fee": 1.0 }
}
```

---

## Fluxo de Redirecionamento

```
Sistema detecta: DaycareConfig não existe
        ↓
Redireciona para: /admin/setup
        ↓
Owner completa 4 passos
        ↓
Sistema salva configuração
        ↓
Redireciona para: /admin/dashboard
```

---

## UI Components (Sugestão)

### Step Indicator
```
[1] Básico  →  [2] Horários  →  [3] Saúde  →  [4] Política
    ●             ○               ○             ○
```

### Schedule Table (Passo 2)
| Dia | Aberto | Abertura | Fechamento |
|-----|--------|----------|------------|
| Segunda | ✅ | 07:30 | 18:00 |
| Terça | ✅ | 07:30 | 18:00 |
| Quarta | ✅ | 07:30 | 18:00 |
| Quinta | ✅ | 07:30 | 18:00 |
| Sexta | ✅ | 07:30 | 18:00 |
| Sábado | ❌ | -- | -- |
| Domingo | ❌ | -- | -- |

---

## API Endpoint

```
POST /api/admin/config

Headers:
  Authorization: Bearer <token>

Body: {
  "daycare_name": "string",
  "timezone": "string",
  "default_lang": "string",
  "operating_days": [...],
  "illness_rules": [...],
  "pickup_policy": {...}
}

Response: {
  "success": true,
  "config_id": "uuid"
}
```

---

## Validações

| Campo | Regra |
|-------|-------|
| daycare_name | Required, min 3 chars |
| timezone | Must be valid IANA timezone |
| schedule | At least 1 day must be open |
| grace_period | Min 0, Max 60 minutes |
| late_fee | Min 0, Max 10 per minute |

---

## Segurança

- **Apenas OWNER** pode acessar `/admin/setup`
- Se já existe `DaycareConfig`, redireciona para `/admin/dashboard`
- Todas as alterações são auditadas em `SecurityLog`

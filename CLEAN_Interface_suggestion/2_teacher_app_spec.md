# 👩‍🏫 Teacher App Spec v2.0 (Voice-First)

**Route:** `/teacher`
**Access:** Protected (TEACHER)
**Device:** Mobile-First

---

## 🎯 Conceito: De 14 Botões para 3 Fluxos

O app antigo tinha 14 botões separados. O novo usa IA para reduzir a 3 fluxos principais.

| App Antigo | App Novo |
|------------|----------|
| 14 botões separados | 3 fluxos inteligentes |
| Input manual por criança | Batch input por voz |
| Muitos cliques | 90% por fala |
| Sem inteligência | IA processa linguagem |

---

## Os 3 Fluxos

### Fluxo A: Rotina em Lote (90% dos inputs)
**Substitui:** Food, Nap, Potty, Absence

**Cenário:**
- Professora aperta botão de microfone
- Diz: "A turma toda almoçou, menos o Pedro que comeu metade"
- Sistema gera 11 registros `food: 100%` + 1 registro `food: 50%`

**Outro exemplo:**
- "O Lucas está choroso hoje, dormiu só 20 minutos"
- Sistema extrai: Child: Lucas, Mood: SAD, Sleep: 20min

### Fluxo B: Multimídia
**Substitui:** Photo, Video, Name to Face

**Cenário:**
- Professora tira foto pelo app
- IA reconhece rostos (Vision API - futuro)
- Sugere: "Identifiquei Maria e João. Confirmar?"
- Salva automaticamente no feed dos pais

### Fluxo C: Eventos Críticos
**Substitui:** Incident, Meds, Health Check, Note

**Cenário:**
- Voz: "Incidente com Sofia, caiu no parquinho, severidade baixa, já limpamos"
- Sistema extrai: Child: Sofia, Severity: LOW, Action: "Cleaned wound"

---

## 🖥️ UI Layout

```
┌─────────────────────────────────────────┐
│  [Logo]     Turma: Tia Maria    [Menu]  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │      TIMELINE DO DIA           │    │
│  │                                 │    │
│  │  08:30 - Café registrado       │    │
│  │  09:15 - Atividade: Pintura    │    │
│  │  10:00 - Soneca iniciada       │    │
│  │  ...                           │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│    [📷]           [🎤]          [⚠️]    │
│   Mídia       Microfone        Safety   │
│                                         │
└─────────────────────────────────────────┘
```

### 1. Botão Central (Microfone)
- O "Magic Button"
- 90% dos inputs por fala
- Toque para falar, solte para enviar
- Feedback visual durante gravação

### 2. Timeline Viva
- Feed do que foi registrado hoje
- Atualizações em tempo real
- Toque para editar/excluir

### 3. Botão Mídia
- Acesso direto à câmera
- Galeria de fotos do dia

### 4. Botão Safety
- Room Check / Chamada
- Único botão manual (compliance legal)
- Checklist de crianças presentes

---

## 🔄 Processamento Backend (Agent 04)

### Input Processing

```
Input: "O Lucas está choroso hoje, dormiu só 20 minutos"

Agent 04 Processing:
1. Detect intent: ROUTINE_LOG
2. Extract entities:
   - Child: "Lucas"
   - "Choroso" → Mood: SAD
   - "Dormiu 20 min" → sleep_minutes: 20
3. Missing fields: food_intake_pct, diaper
4. Ask or use defaults
5. Generate JSON
```

### Output JSON

```json
{
  "type": "ROUTINE_LOG",
  "child_id": "uuid-lucas",
  "data": {
    "mood": "SAD",
    "sleep_minutes": 20,
    "food_intake_pct": null,
    "diaper": null
  },
  "confidence": 0.95,
  "needs_confirmation": true
}
```

---

## Confirmation Flow

```tsx
// components/teacher/ConfirmationCard.tsx
interface ExtractedData {
  type: string;
  child_name: string;
  data: Record<string, any>;
}

export function ConfirmationCard({ extracted, onConfirm, onEdit }: Props) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold">Confirm: {extracted.child_name}</h3>

      <div className="mt-2 space-y-1">
        {extracted.data.mood && <p>Mood: {extracted.data.mood}</p>}
        {extracted.data.sleep_minutes && <p>Sleep: {extracted.data.sleep_minutes}min</p>}
        {extracted.data.food_intake_pct && <p>Food: {extracted.data.food_intake_pct}%</p>}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={onConfirm} className="px-4 py-2 bg-green-500 text-white rounded">
          ✓ Confirm
        </button>
        <button onClick={onEdit} className="px-4 py-2 bg-gray-200 rounded">
          ✏️ Edit
        </button>
      </div>
    </div>
  );
}
```

---

## Voice Recording Component

```tsx
// components/teacher/VoiceRecorder.tsx
export function VoiceRecorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);

    const chunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      // Send to transcription API
      const formData = new FormData();
      formData.append('audio', blob);

      const response = await fetch('/api/teacher/transcribe', {
        method: 'POST',
        body: formData
      });

      const { text } = await response.json();
      onTranscript(text);
    };

    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <button
      onTouchStart={startRecording}
      onTouchEnd={stopRecording}
      onMouseDown={startRecording}
      onMouseUp={stopRecording}
      className={`w-20 h-20 rounded-full flex items-center justify-center ${
        isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-600'
      }`}
    >
      🎤
    </button>
  );
}
```

---

## API Endpoints

```
GET  /api/teacher/classes              - Teacher's assigned classes
GET  /api/teacher/children?class_id=X  - Children in class
POST /api/teacher/transcribe           - Audio → Text (Whisper API)
POST /api/teacher/process              - Text → JSON (Agent 04)
POST /api/teacher/log                  - Save confirmed log

Body for /log:
{
  "type": "ROUTINE_LOG | INCIDENT | LEARNING_EVENT",
  "child_id": "string",
  "data": { ... }
}
```

---

## Illness Detection

When Agent 04 detects symptoms:

```
Input: "Maria has a fever"

Processing:
1. Detect symptom: "fever"
2. Query IllnessRule table
3. If rule exists:
   - Add flag: requires_exclusion = true
   - Add: exclusion_hours = 24 (from DB)
4. Create Incident with severity = MEDIUM
5. Alert: "Maria may need to be sent home"
```

---

## Safety Checklist (Room Check)

```tsx
// components/teacher/RoomCheck.tsx
export function RoomCheck({ children }: { children: Child[] }) {
  const [checked, setChecked] = useState<string[]>([]);

  const toggleChild = (id: string) => {
    setChecked(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const submitCheck = async () => {
    await fetch('/api/teacher/room-check', {
      method: 'POST',
      body: JSON.stringify({ present: checked, timestamp: new Date() })
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Room Check</h2>
      <div className="space-y-2">
        {children.map(child => (
          <label key={child.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked.includes(child.id)}
              onChange={() => toggleChild(child.id)}
            />
            <span>{child.full_name}</span>
          </label>
        ))}
      </div>
      <button onClick={submitCheck} className="mt-4 px-4 py-2 bg-green-500 text-white rounded">
        Submit Room Check
      </button>
    </div>
  );
}
```

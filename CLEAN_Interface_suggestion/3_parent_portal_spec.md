# 👨‍👩‍👧 Parent Portal Spec

**Route:** `/parent`
**Access:** Protected (PARENT)

---

## Overview

The Parent Portal is a dashboard for parents to view their children's daily activities. It uses **Query Direct** (no LLM) for fast, deterministic reports.

---

## Key Principles

1. **No AI for visualization** - Pure database queries
2. **On-demand reports** - Parent chooses when to view
3. **Secure by design** - ParentChildLink validation

---

## Components

### 1. AnnouncementBanner
- **Position:** Top of page (above everything)
- **Types:**
  - URGENT (red) - Fixed, can't dismiss easily
  - EVENT (blue) - Dismissible
  - GENERAL (gray) - Dismissible
  - CLOSURE (orange) - Fixed
- **Action:** Mark as read removes from view

### 2. Child Selector (Tabs)
- If parent has multiple children, show tabs
- Default: First child selected
- Each tab shows child's name and photo

### 3. Date Picker
- Calendar component
- Default: Today
- Can select past dates for history

### 4. Report Button
- "View Report" button
- Triggers database query
- Shows loading state

### 5. Visual Cards

| Card | Component | Data |
|------|-----------|------|
| Mood | `<MoodEmoji />` | Large emoji + label |
| Food | `<FoodProgress />` | Percentage bar |
| Sleep | `<SleepBar />` | Hours/minutes |
| Diaper | `<DiaperStatus />` | Icon + status |
| Incidents | `<IncidentTimeline />` | Chronological list |
| Learning | `<LearningCard />` | Activity + skills |

---

## UI Layout

```
┌─────────────────────────────────────────┐
│ [⚠️ URGENT: Snow Day Tomorrow - Closed] │  ← AnnouncementBanner
├─────────────────────────────────────────┤
│  [Alice]  [Bobby]  [Charlie]            │  ← Child Tabs
├─────────────────────────────────────────┤
│                                         │
│  📅 January 15, 2026  [Change Date]     │  ← Date Picker
│                                         │
│  [View Report]                          │  ← Report Button
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │  😊     │ │  ████   │ │  1h 30m │    │  ← Cards Row 1
│  │ Happy   │ │  85%    │ │  Sleep  │    │
│  │  Mood   │ │  Food   │ │         │    │
│  └─────────┘ └─────────┘ └─────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ Incidents: None today ✓         │    │  ← Incidents
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🎨 Learning: Finger Painting    │    │  ← Learning
│  │ Skills: Motor, Creativity       │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

## Component Examples

### MoodEmoji

```tsx
const moodConfig = {
  HAPPY: { emoji: '😊', label: 'Happy', bg: 'bg-green-100' },
  NEUTRAL: { emoji: '😐', label: 'Neutral', bg: 'bg-yellow-100' },
  SAD: { emoji: '😢', label: 'Sad', bg: 'bg-orange-100' },
  CRANKY: { emoji: '😤', label: 'Cranky', bg: 'bg-red-100' },
  TIRED: { emoji: '😴', label: 'Tired', bg: 'bg-blue-100' }
};

export function MoodEmoji({ mood }: { mood: string }) {
  const config = moodConfig[mood] || moodConfig.NEUTRAL;

  return (
    <div className={`p-4 rounded-lg ${config.bg} text-center`}>
      <span className="text-5xl">{config.emoji}</span>
      <p className="mt-2 font-medium">{config.label}</p>
      <p className="text-sm text-gray-500">Mood</p>
    </div>
  );
}
```

### FoodProgress

```tsx
export function FoodProgress({ percentage }: { percentage: number }) {
  const getColor = (pct: number) => {
    if (pct >= 75) return 'bg-green-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 rounded-lg bg-gray-50">
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor(percentage)} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-center font-medium">{percentage}%</p>
      <p className="text-sm text-center text-gray-500">Food Intake</p>
    </div>
  );
}
```

### SleepBar

```tsx
export function SleepBar({ minutes }: { minutes: number }) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const display = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="p-4 rounded-lg bg-blue-50 text-center">
      <span className="text-3xl">💤</span>
      <p className="mt-2 text-2xl font-bold">{display}</p>
      <p className="text-sm text-gray-500">Sleep</p>
    </div>
  );
}
```

---

## API Endpoints

```
GET  /api/parent/children
Response: [{ id, full_name, date_of_birth, photo_url }]

GET  /api/parent/report?child_id=X&date=YYYY-MM-DD
Response: {
  meta: { date, child_name },
  routine: { mood, food_intake_pct, sleep_minutes, diaper },
  incidents: [],
  learning: []
}

GET  /api/parent/announcements
Response: [{ id, title, content, type, created_at }]

POST /api/parent/announcements/{id}/read
Response: { success: true }
```

---

## Security

1. **ParentChildLink Validation**
   - Every request checks if parent has access to child
   - Unauthorized access logs a strike

2. **3-Strike Rule**
   - Strike 1-2: Access denied, logged
   - Strike 3: Account blocked, admin notified

3. **Session Management**
   - JWT tokens with expiration
   - Secure httpOnly cookies

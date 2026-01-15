# ⚙️ Admin & Config Spec

**Route:** `/admin`
**Access:** Protected (ADMIN/OWNER)

---

## Overview

The Admin Panel provides management capabilities for daycare staff. The Owner has additional access to system configuration.

---

## Role Permissions

| Feature | ADMIN | OWNER |
|---------|-------|-------|
| View Dashboard | ✅ | ✅ |
| Manage Announcements | ✅ | ✅ |
| Manage Users | ✅ (limited) | ✅ (full) |
| View Security Logs | ✅ | ✅ |
| System Configuration | ❌ | ✅ |
| Setup Wizard | ❌ | ✅ |

---

## Sections

### 1. Setup Wizard (Onboarding)
*Only shown if DaycareConfig doesn't exist*

**Route:** `/admin/setup`

**Steps:**

#### Step 1: Basic Info
- Daycare Name (text input)
- Timezone (dropdown - IANA timezones)
- Default Language (PT/EN/ES)

#### Step 2: Schedule
- Table with Mon-Sun
- Toggle: Open/Closed
- Time inputs: Open time, Close time

#### Step 3: Health Rules
- Preset checklist:
  - [ ] Fever > 38°C (24h exclusion)
  - [ ] Vomiting (24h exclusion)
  - [ ] Diarrhea (24h exclusion)
  - [ ] Conjunctivitis (48h exclusion)
- Custom rule button

#### Step 4: Pickup Policy
- Grace period (minutes): Input
- Late fee per minute ($): Input

#### Step 5: Review & Save
- Summary of all settings
- Confirm button

---

### 2. Dashboard
*Main admin landing page*

**Metrics Cards:**
- Total Students (count)
- Present Today (count with percentage)
- Incidents This Week (count)
- Pending Leads (count)

**Quick Actions:**
- Post Announcement
- Add Staff Member
- View Reports

---

### 3. Announcements Management

**Features:**
- Create new announcement
- Edit existing
- Delete/Archive
- View read receipts

**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Title | Text | Yes |
| Content | Textarea | Yes |
| Type | Select | Yes |
| Target | Radio (All / Specific) | Yes |
| Expires At | DateTime | No |

**Types:**
- GENERAL - Info updates
- URGENT_ALERT - Critical notices
- EVENT - Special events
- CLOSURE - Closure notices

---

### 4. User Management

**List View:**
- Table with: Name, Email, Role, Status
- Search/Filter
- Actions: Edit, Deactivate, Delete

**Add User Form:**
| Field | Type |
|-------|------|
| Full Name | Text |
| Email | Email |
| Role | Select (PARENT/TEACHER/ADMIN) |
| Assign Class (if Teacher) | Select |

---

### 5. Security Logs

**Table Columns:**
- Timestamp
- Source IP
- User (if known)
- Violation Type
- Details

**Filters:**
- Date range
- Violation type
- User

**Blocked Users Section:**
- List of blocked accounts
- Unblock action (with confirmation)

---

## Flow Diagram

```
┌─────────────────────────────────────────┐
│           Admin/Owner Login             │
└─────────────────────┬───────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ DaycareConfig │
              │   exists?     │
              └───────┬───────┘
                      │
           ┌──────────┴──────────┐
           │                     │
           ▼                     ▼
    ┌─────────────┐       ┌─────────────┐
    │    NO       │       │    YES      │
    │ (First Run) │       │ (Normal)    │
    └──────┬──────┘       └──────┬──────┘
           │                     │
           ▼                     ▼
    ┌─────────────┐       ┌─────────────┐
    │   Setup     │       │  Dashboard  │
    │   Wizard    │       │   /admin    │
    │ /admin/setup│       │             │
    └─────────────┘       └─────────────┘
```

---

## API Endpoints

### Configuration (OWNER only)
```
GET  /api/admin/config           - Get current config
POST /api/admin/config           - Create initial config (setup wizard)
PUT  /api/admin/config           - Update config
PUT  /api/admin/config/hours     - Update schedule
PUT  /api/admin/config/holidays  - Update holidays
PUT  /api/admin/config/rules     - Update illness rules
PUT  /api/admin/config/pickup    - Update pickup policy
```

### Announcements
```
GET    /api/admin/announcements          - List all
POST   /api/admin/announcements          - Create new
PUT    /api/admin/announcements/:id      - Update
DELETE /api/admin/announcements/:id      - Delete
GET    /api/admin/announcements/:id/reads - View read receipts
```

### Users
```
GET    /api/admin/users          - List all users
POST   /api/admin/users          - Create user
PUT    /api/admin/users/:id      - Update user
DELETE /api/admin/users/:id      - Delete user
POST   /api/admin/users/:id/block   - Block user
POST   /api/admin/users/:id/unblock - Unblock user
```

### Security
```
GET  /api/admin/security-logs     - List security events
GET  /api/admin/blocked-users     - List blocked users
POST /api/admin/blocked-users/:id/unblock - Unblock user
```

---

## Component: Setup Wizard

```tsx
// app/admin/setup/page.tsx
export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    daycare_name: '',
    timezone: 'America/New_York',
    default_lang: 'en',
    operating_days: [],
    illness_rules: [],
    pickup_policy: { grace_period_min: 15, late_fee_per_min: 1 }
  });

  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Schedule' },
    { number: 3, title: 'Health Rules' },
    { number: 4, title: 'Pickup Policy' },
    { number: 5, title: 'Review' }
  ];

  const handleSubmit = async () => {
    const response = await fetch('/api/admin/config', {
      method: 'POST',
      body: JSON.stringify(config)
    });

    if (response.ok) {
      router.push('/admin');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* Step Indicator */}
      <div className="flex justify-between mb-8">
        {steps.map(s => (
          <div
            key={s.number}
            className={`flex items-center ${step >= s.number ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= s.number ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              {s.number}
            </span>
            <span className="ml-2 hidden sm:inline">{s.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && <BasicInfoStep config={config} onChange={setConfig} />}
      {step === 2 && <ScheduleStep config={config} onChange={setConfig} />}
      {step === 3 && <HealthRulesStep config={config} onChange={setConfig} />}
      {step === 4 && <PickupPolicyStep config={config} onChange={setConfig} />}
      {step === 5 && <ReviewStep config={config} />}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Back
        </button>

        {step < 5 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Complete Setup
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Security Notes

- All admin endpoints require authentication
- OWNER-only endpoints verify role before processing
- All changes are logged to SecurityLog
- Config changes require confirmation
- Bulk operations have rate limits

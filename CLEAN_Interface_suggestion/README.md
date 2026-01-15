# 🎨 CLEAN Interface Suggestion (Frontend Specs)

> **Purpose:** Pure Frontend logic for Daycare AI System.
> **Target:** Replit Agent / Frontend Developers.

---

## 📱 The 4 Core Interfaces

| Interface | Route | User Role | Key Feature |
|-----------|-------|-----------|-------------|
| Landing Page | `/` | Public | Chat Widget |
| Teacher App | `/teacher` | Teacher | Voice-First Input |
| Parent Portal | `/parent` | Parent | Visual Reports |
| Admin Panel | `/admin` | Admin/Owner | Config Wizard |

---

## 🎨 Design System

- **Framework:** TailwindCSS
- **Components:** Shadcn/UI
- **Icons:** Lucide React
- **Charts:** Recharts
- **Colors:**
  - Primary: `blue-600`
  - Success: `green-500`
  - Warning: `yellow-500`
  - Alert: `red-500`
  - Info: `gray-500`

---

## 📁 Files in This Directory

| File | Description |
|------|-------------|
| `1_landing_page_spec.md` | Public landing page with chat widget |
| `2_teacher_app_spec.md` | Voice-first teacher interface |
| `3_parent_portal_spec.md` | Parent dashboard for reports |
| `4_admin_config_spec.md` | Admin panel and owner onboarding |

---

## 🚀 Quick Start for Replit

1. Read each spec file in order
2. Implement components as described
3. Connect to API endpoints from `docs/` folder
4. Test each interface independently
5. Integrate with agents from `prompts/mega-prompt-replit.md`

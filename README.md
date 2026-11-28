# 🚀 ProjectFlow — Collaborative Engineering & Project Workspace

> A full-stack agile workspace built with React 18, TypeScript, Tailwind CSS, Supabase, and Monaco Editor. Includes multi-team Kanban boards, real-time messaging, peer-to-peer WebRTC project meetings, and an in-browser Code Studio.

**[Launch Live Demo](https://projectflow-d9dk.onrender.com)** · **[Desktop Releases](https://github.com/ShashwatEv/projectflow/releases/tag/Projectflow)**

---

## Key Features

* **Multi-Team Kanban & Sprints:** Drag-and-drop task boards, dependency blockers, keyboard triage (`J/K/H/L`, `Space`), sprint planning, and team velocity analytics.
* **In-Browser Code Studio:** Monaco Editor with multi-tab buffers, branch creation, side-by-side git diffs, PR creation, and reviewable AI edits.
* **Realtime Team Chat & Presence:** Shared/private channels, threaded replies, voice notes, file attachments, and live online indicators powered by Supabase Realtime.
* **Project Meetings & Screen Sharing:** Scoped WebRTC video/audio rooms with 16-character invite codes and native desktop screen-source selection.
* **Safe Sandbox Onboarding:** Guided walkthrough and local sandbox mode for new accounts until email verification and 2FA are enabled.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Sonner |
| **Backend & Realtime** | Supabase (PostgreSQL, Row-Level Security, Realtime, Storage, Edge Functions) |
| **Editor & Charts** | Monaco Editor, React DnD, Recharts |
| **Desktop & Mobile** | Electron (Windows/macOS/Linux), Capacitor (Android) |
| **Deployment** | Render |

---

## Local Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/ShashwatEv/projectflow.git
   cd projectflow
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and set your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_SUPER_ADMIN_EMAIL=your_admin_email@example.com
   ```

   *(Never place private AI provider keys in `VITE_*` variables; users supply their own OpenRouter key in the chat assistant panel or personal GitHub token in Code Studio.)*
3. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## Database Migrations & Edge Functions

Apply the SQL migrations in `supabase/migrations/` in chronological order via the Supabase Dashboard SQL Editor (or `supabase db push` after reviewing target tables):

1. `202611010001_workspace_collaboration.sql` — channels, read markers, task comments, and onboarding progress
2. `202611060001` – `202611060006` — project memberships, profile read hardening, workflow canvas/history, and invite codes
3. `202611070001` – `202611070003` — team chat assistant context RPCs
4. `202611140001` – `202611140004` — project meetings, invite codes, and participant-gated chat/signaling
5. `20261125_billing_and_rls_hardening.sql` — subscription plans, billing invoices, and org/team RLS policies

Optional WebRTC override for restrictive NAT/firewalls:

```env
VITE_MEETING_ICE_SERVERS=[{"urls":"stun:stun.example.net:3478"},{"urls":"turn:turn.example.net:3478","username":"short-lived-user","credential":"short-lived-password"}]
```

---

## Desktop Packaging (Electron)

```bash
npm run desktop:dev
npm run desktop:package
```

Add `projectflow://auth/callback` under **Supabase → Authentication → URL Configuration → Redirect URLs** (or set `VITE_DESKTOP_AUTH_REDIRECT_URL`), and set `VITE_APP_URL` to your deployed web origin so meeting invite links open cleanly.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Build production web bundle |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run test:run` | Run Vitest test suite |
| `npm run desktop:package` | Package desktop installer |

---

## License

Licensed under the **GNU General Public License v3.0 (GPL-3.0)**. Reach out via [LinkedIn](https://www.linkedin.com/in/shashwat-singh-ji) for commercial licensing inquiries.
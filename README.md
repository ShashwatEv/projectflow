# 🚀 ProjectFlow — Modern Collaborative Project Workspace

> A full-stack, agile engineering workspace built with React 18, Supabase, Tailwind CSS, and Monaco Editor[cite: 21]. Features real-time state synchronization, embedded code editing, AI-assisted reviews, and customizable workspace themes[cite: 21].

Live Demo = (https://projectflow-d9dk.onrender.com)

---

## 📸 Overview & Key Highlights

* **Interactive Project & Task Kanban:** Real-time drag-and-drop workflow tracking with due dates, priority tags, and owner attribution[cite: 1, 14, 21].
* **In-Browser Code Studio:** Monaco Editor integration supporting syntax highlighting, branch tracking, and commit/push flows, with AI-assisted, reviewable edits across selected repository files[cite: 1, 11, 21].
* **Realtime Team Engine:** Live notifications, group messaging channels, and synchronized presence powered by Supabase Realtime[cite: 1, 3, 21].
* **Custom Theming & Accessibility:** Dynamic CSS variable-based accent switching, root typography scaling (Compact, Default, Large), and system-level Reduced Motion toggling[cite: 1, 4, 5, 21].
* **First-Login Guided Walkthrough:** Built-in multi-step interactive onboarding tour with terms acceptance dialog[cite: 1, 15, 21].

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Sonner[cite: 1, 4, 21] |
| **Backend & DB** | Supabase (PostgreSQL, Realtime Channels, Storage, Row-Level Security)[cite: 1, 21] |
| **Editor & Tools** | Monaco Editor, React Router v6[cite: 1, 11, 21] |
| **AI Integration** | Google Gemini API (Code reviews & assistant) |
| **Deployment** | Render[cite: 1, 21] |

---

## ⚡ Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/ShashwatEv/projectflow.git]
   cd projectflow
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   Optional variables:
   ```env
   VITE_SUPER_ADMIN_EMAIL=your_admin_email@example.com
   ```

   Do not put AI provider keys in `VITE_*` variables for a public build: Vite embeds them in browser assets. The team-chat agent asks for a personal OpenRouter key in the chat panel, keeps it in memory only, and sends prompts directly to OpenRouter.

3. **Run the local development server:**
   ```bash
   npm run dev
   ```

### Desktop app

The desktop shell uses Electron around the existing React/Vite app so the current Supabase authentication and project UI remain the same. Electron isolates Node APIs from the renderer, uses HashRouter for installed builds, opens Google OAuth in the system browser, and returns through the `projectflow://auth/callback` protocol. Capacitor Android configuration is unchanged.

```bash
npm run desktop:dev
npm run desktop:package
```

`desktop:dev` starts Vite and Electron together. `desktop:package` builds the renderer with relative asset paths and packages for the current host platform (Windows: NSIS installer). Configure the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as the web app before packaging. In Supabase **Authentication → URL Configuration → Redirect URLs**, add `projectflow://auth/callback`; set `VITE_DESKTOP_AUTH_REDIRECT_URL` to that value if using a different registered callback. Google OAuth must already be configured in Supabase; the provider's callback remains the Supabase Auth callback shown in its provider settings. Email/password authentication continues to use the existing Supabase auth. The installer is unsigned unless you configure a platform signing certificate; installer auto-updates are not configured, so distribute new builds through your normal release channel.

### Project meetings and screen sharing

Meetings are scoped to a project and use the signed-in Supabase session. Project owners and members can create and join; database policies gate meeting rows, presence, and directed WebRTC signaling on project membership. The join screen requests explicit consent before microphone/camera access, and devices start muted/off. Screen sharing is a separate user action; Electron displays a native screen/window chooser and captures nothing until the user picks a source. Media is peer-to-peer (mesh), not recorded or relayed by ProjectFlow.

Apply `supabase/migrations/202611140001_project_meetings.sql` after the existing ProjectFlow project and membership schema is present:

1. Open the **Supabase Dashboard** for the same project used by the app and open **SQL Editor**.
2. Choose **New query**, paste the complete contents of `supabase/migrations/202611140001_project_meetings.sql`, and run it.
3. Confirm the query completes successfully before launching the desktop or web app. The migration creates the meeting tables/RPCs and private Realtime authorization policies; it does not need a service-role key or a separate table-publication step.

Alternatively, with the Supabase CLI linked to the intended project, run `supabase db push` from the repository root; this applies all pending repository migrations, not only the meeting migration. Do not run that command against a production project until you have reviewed the pending migrations and confirmed the target.

The built-in ICE configuration uses Google's free public STUN endpoint as a no-credential default. Teams can override it with `VITE_MEETING_ICE_SERVERS`, a JSON array of standard `RTCIceServer` objects, for example:

```env
VITE_MEETING_ICE_SERVERS=[{"urls":"stun:stun.example.net:3478"},{"urls":"turn:turn.example.net:3478","username":"short-lived-user","credential":"short-lived-password"}]
```

STUN may not connect peers behind restrictive NAT/firewalls; a TURN relay may be needed for those networks and must be provided/configured by the operator. No paid provider, credentials, or TURN service is bundled. `VITE_*` values are shipped in renderer assets, so never put long-lived TURN credentials there; use only public STUN values or short-lived TURN credentials issued by infrastructure you operate. Meetings use a full peer mesh, so each participant sends media to every other participant; a managed SFU would be needed for larger calls. Android keeps its existing Capacitor build path; media and screen-capture support depends on the device WebView and its OS permissions.

### Collaboration database migration

Apply `supabase/migrations/202611010001_workspace_collaboration.sql` to the Supabase project before using shared/private channels, chat read markers and per-channel preferences, task comments and mentions, project milestones/activity, or shared onboarding progress. Use the Supabase SQL Editor or the Supabase CLI linked to the intended project. Back up the database and review existing `messages`/`message_reactions` RLS policies before applying; this migration adds restrictive channel/member checks so private conversations remain private even when older permissive policies exist.

The migration assumes the existing `messages` table uses `room_id`, `user_id`, and `created_at`, `message_reactions` uses `message_id` and `user_id`, tasks use `id`, `project_id`, `title`, `status`, `priority`, and `due_date`, and projects use `id` and `owner_id`. Confirm those columns against the target database first. Existing browser-local custom public channels are promoted to shared channels when a signed-in user first opens chat after the migration.

### Team chat AI assistant setup

The assistant needs the app's `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to point at the intended Supabase project, and the project's existing auth, `projects`, `tasks`, and `project_members` schema must be present. Apply `supabase/migrations/202611070001_team_chat_assistant.sql` to that same project after its existing schema migrations. If you already applied that migration and get a `column p.key does not exist` error, apply `supabase/migrations/202611070002_team_chat_assistant_project_schema_compat.sql` in the same project; it replaces the context RPC without relying on optional project `key` or `status` columns. Apply `supabase/migrations/202611070003_team_chat_assistant_extended_context.sql` to enable the authorization-checked context RPC for task comments and project milestones. These migrations can be run in the Supabase Dashboard SQL Editor. A Supabase CLI project link is optional; it is only needed if you choose a CLI-based migration workflow. Never use a service-role key in the app.

To chat with the AI, provide your own OpenRouter API key in the assistant panel, test the connection, and accept its data-sharing notice. Requests use OpenRouter's `openrouter/free` router, which chooses from currently available free models instead of depending on fixed free-model IDs that can expire or become unavailable. Chat replies allow 4,096 output tokens and key verification allows 512 because reasoning tokens count against the same output limit and may otherwise leave no visible answer. Each prompt can send up to 15 recent messages from the currently open chat, the assistant conversation, up to 100 project/task records, up to 30 comments attached only to those accessible tasks, and up to 30 milestones in accessible projects. Comments and milestones are read through the signed-in Supabase client and filtered by the project/task IDs returned by the account-scoped assistant context RPC; existing RLS still applies. The key is sent to OpenRouter from the browser, never to ProjectFlow's server. It is not saved unless the user opts in to remember it in browser storage for that account; browser storage is accessible to anyone using that browser profile, so do not save a key on a shared or untrusted device. The model can propose a task, but cannot create or change records; the user reviews and confirms, and the database checks project permissions again.

The assistant panel includes `/standup`, `/retro`, `/plan-sprint`, and `/insights` shortcuts. These create grounded summaries or proposals from the context above; they do not assign work, change task status, or create tasks. `/insights` may identify possible duplicate work or dependencies, but distinguishes evidence from hypotheses. The collaboration schema migration creates the task-comment and project-milestone tables; no additional Supabase migration is needed for these read-only assistant features if that migration is already applied.

For code-edit requests, use the assistant's **Continue in Code Studio** handoff. It opens the existing Code Studio editor with the request prefilled; select the tracked repository files to provide context, generate an edit proposal, inspect its diff, and explicitly apply it to local editor buffers. The app does not give the chat agent direct access to the machine's filesystem or terminal, does not create/delete files on the user's behalf, and never pushes proposed edits automatically. Existing Code Studio repository permissions, excluded environment-file checks, and file-lock checks still apply.

Digest frequency is stored as a preference only. Actual daily/weekly email delivery needs a scheduler and an email provider; neither is configured by this application.

### Code Studio AI file edits

In Code Studio, use the file explorer's **File**, **Folder**, and **Delete** actions to create paths or stage file/folder deletions. New files open in a local editor buffer; new folders use a `.gitkeep` placeholder because GitHub does not track empty folders. Push a new file with the normal verified Push flow. Folder deletion stages all tracked files beneath it and applies them in one GitHub commit using **Push staged deletions**; pending deletions can be individually undone before pushing.

For AI edits, open **AI Assist → Edit files**, select up to five tracked files (search by filename or folder path), describe the requested change, and inspect the generated Monaco diff. The assistant panel can be resized by dragging its divider (or with the arrow keys) and its width is remembered on the current browser. Allow or deny each proposed file independently, or use the bulk actions. Allowed changes are staged only in Code Studio's in-memory editor buffers; they are not written to GitHub. Review the normal diff and use the existing verified Push flow to commit. Selected source code is sent to the configured OpenRouter model. The assistant cannot access unselected paths, create files, run shell commands, or push changes.

When opening Code Studio from the team-chat code handoff, the current user's OpenRouter key is passed through same-page memory for that session (not through the URL, browser storage, or ProjectFlow's server). Any remembered key is account-scoped and used only when the matching signed-in user is active.

---

## 🧪 Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI mode) |
| `npm run test:ui` | Open Vitest UI |
| `npm run test:coverage` | Run tests with coverage report |

---

## 📄 Licensing & Commercial Inquiries

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

* **For Recruiters & Evaluators:** You are welcome to review, test, run, and evaluate the source code for hiring and assessment purposes.
* **For Open-Source Contributors:** Any public modifications or forks must remain fully open-source under the terms of GPL-3.0.
* **Commercial & Proprietary Licensing:** Closed-source use or commercial distribution without GPL-3.0 compliance requires an explicit commercial license. 

Reach out directly via [LinkedIn](https://www.linkedin.com/shashwat-singh-ji) or email for inquiries.
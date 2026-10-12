# 🚀 ProjectFlow — Modern Collaborative Project Workspace

> A full-stack, agile engineering workspace built with React 18, Supabase, Tailwind CSS, and Monaco Editor[cite: 21]. Features real-time state synchronization, embedded code editing, AI-assisted reviews, and customizable workspace themes[cite: 21].

Live Demo = (https://projectflow-d9dk.onrender.com)

---

## 📸 Overview & Key Highlights

* **Interactive Project & Task Kanban:** Real-time drag-and-drop workflow tracking with due dates, priority tags, and owner attribution[cite: 1, 14, 21].
* **In-Browser Code Studio:** Monaco Editor integration supporting syntax highlighting, branch tracking, and commit/push flows[cite: 1, 11, 21].
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
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   VITE_SUPER_ADMIN_EMAIL=your_admin_email@example.com
   VITE_GITHUB_TOKEN=your_github_personal_access_token
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```

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
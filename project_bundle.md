# ProjectFlow Codebase Bundle

## 1. Directory Structure

```text
ProjectFlow/
├── .claude
│   └── worktrees
├── .continue
│   └── agents
│       └── new-config.yaml
├── guidelines
│   └── Guidelines.md
├── public
│   ├── _redirects
├── src
│   ├── app
│   │   ├── components
│   │   │   ├── ui
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── aspect-ratio.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── carousel.tsx
│   │   │   │   ├── chart.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── context-menu.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── drawer.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── hover-card.tsx
│   │   │   │   ├── input-otp.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── menubar.tsx
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── resizable.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toggle-group.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── use-mobile.ts
│   │   │   │   └── utils.ts
│   │   │   ├── AddMemberModal.tsx
│   │   │   ├── ChatFileButton.tsx
│   │   │   ├── CommandMenu.tsx
│   │   │   ├── CreateProjectModal.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ModernHeader.tsx
│   │   │   ├── ModernKanbanBoard.tsx
│   │   │   ├── ModernKanbanColumn.tsx
│   │   │   ├── ModernSidebar.tsx
│   │   │   ├── ModernTaskCard.tsx
│   │   │   ├── RequireAuth.tsx
│   │   │   ├── TaskDetailModal.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── pages
│   │   │   ├── settings
│   │   │   │   ├── AppearanceSettings.tsx
│   │   │   │   ├── BillingSettings.tsx
│   │   │   │   ├── NotificationsSettings.tsx
│   │   │   │   ├── ProfileSettings.tsx
│   │   │   │   ├── SecuritySettings.tsx
│   │   │   │   └── SettingsLayout.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Automations.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Messages.tsx
│   │   │   ├── MyTasks.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Team.tsx
│   │   │   └── Timesheets.tsx
│   │   └── App.tsx
│   ├── context
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks
│   │   ├── useOnlineUsers.ts
│   │   └── useTyping.ts
│   ├── lib
│   │   └── supabaseClient.ts
│   ├── styles
│   │   ├── fonts.css
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── theme.css
│   └── main.tsx
├── .env
├── .eslintrc.cjs
├── .gitignore
├── ATTRIBUTIONS.md
├── index.html
├── package.json
├── postcss.config.mjs
├── README.md
├── tsconfig.json
└── vite.config.ts
```

## 2. File Contents

### `.env`

```text
VITE_SUPABASE_URL=https://yyebolpdchhbefxwvohp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZWJvbHBkY2hoYmVmeHd2b2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3Mjg5NzYsImV4cCI6MjA5OTMwNDk3Nn0.FCR9F8mjsnkxs1U0IzrrF1TzETX_XVAiKeVPks7Zqls
```

### `.eslintrc.cjs`

```cjs
/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-refresh/only-export-components',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'package-lock.json'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
    project: ['./tsconfig.app.json'],
  },
  plugins: ['@typescript-eslint', 'react-refresh'],
  rules: {
    'react/requires-interaction': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-useless-vars': 'off',
    'no-unused-vars': 'off',
  },
  settings: {
    react: { version: '18.3' },
  },
};

```

### `.gitignore`

```text
# .gitignore
node_modules
dist
build
.env
.env.local
.DS_Store
```

### `ATTRIBUTIONS.md`

```md
This Figma Make file includes components from [shadcn/ui](https://ui.shadcn.com/) used under [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).

This Figma Make file includes photos from [Unsplash](https://unsplash.com) used under [license](https://unsplash.com/license).
```

### `README.md`

```md

  # SaaS Project Management Dashboard

  This is a code bundle for SaaS Project Management Dashboard. The original project is available at https://www.figma.com/design/wIcIlQgo8i0YlmgfbvEVwo/SaaS-Project-Management-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
```

### `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ProjectFlow Dashboard</title>
    <meta name="description" content="SaaS Project Management Dashboard" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `package.json`

```json
{
  "name": "@figma/my-make-file",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "@emotion/react": "11.14.0",
    "@emotion/styled": "11.14.1",
    "@mui/icons-material": "7.3.5",
    "@mui/material": "7.3.5",
    "@popperjs/core": "2.11.8",
    "@radix-ui/react-accordion": "1.2.3",
    "@radix-ui/react-alert-dialog": "1.1.6",
    "@radix-ui/react-aspect-ratio": "1.1.2",
    "@radix-ui/react-avatar": "1.1.3",
    "@radix-ui/react-checkbox": "1.1.4",
    "@radix-ui/react-collapsible": "1.1.3",
    "@radix-ui/react-context-menu": "2.2.6",
    "@radix-ui/react-dialog": "1.1.6",
    "@radix-ui/react-dropdown-menu": "2.1.6",
    "@radix-ui/react-hover-card": "1.1.6",
    "@radix-ui/react-label": "2.1.2",
    "@radix-ui/react-menubar": "1.1.6",
    "@radix-ui/react-navigation-menu": "1.2.5",
    "@radix-ui/react-popover": "1.1.6",
    "@radix-ui/react-progress": "1.1.2",
    "@radix-ui/react-radio-group": "1.2.3",
    "@radix-ui/react-scroll-area": "1.2.3",
    "@radix-ui/react-select": "2.1.6",
    "@radix-ui/react-separator": "1.1.2",
    "@radix-ui/react-slider": "1.2.3",
    "@radix-ui/react-slot": "1.1.2",
    "@radix-ui/react-switch": "1.1.3",
    "@radix-ui/react-tabs": "1.1.3",
    "@radix-ui/react-toggle": "1.1.2",
    "@radix-ui/react-toggle-group": "1.1.2",
    "@radix-ui/react-tooltip": "1.1.8",
    "@supabase/supabase-js": "^2.90.1",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "cmdk": "1.1.1",
    "date-fns": "3.6.0",
    "embla-carousel-react": "8.6.0",
    "emoji-picker-react": "^4.16.1",
    "input-otp": "1.4.2",
    "lucide-react": "0.487.0",
    "motion": "12.23.24",
    "next-themes": "0.4.6",
    "react-day-picker": "8.10.1",
    "react-dnd": "16.0.1",
    "react-dnd-html5-backend": "16.0.1",
    "react-hook-form": "7.55.0",
    "react-popper": "2.3.0",
    "react-resizable-panels": "2.1.7",
    "react-responsive-masonry": "2.7.1",
    "react-router-dom": "^7.11.0",
    "react-slick": "0.31.0",
    "recharts": "^2.15.2",
    "sonner": "2.0.3",
    "tailwind-merge": "3.2.0",
    "tw-animate-css": "1.3.8",
    "vaul": "1.1.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.12",
    "@types/node": "^20.12.0",
    "@types/react": "^18.3.12",  
    "@types/react-dom": "^18.3.1", 
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "4.7.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.4.0",
    "tailwindcss": "4.1.12",
    "typescript": "~5.6.0",
    "vite": "6.3.5"
  },
  "peerDependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "react-dom": {
      "optional": true
    }
  },
  "pnpm": {
    "overrides": {
      "vite": "6.3.5"
    }
  }
}

```

### `postcss.config.mjs`

```mjs
/**
 * PostCSS Configuration
 *
 * Tailwind CSS v4 (via @tailwindcss/vite) automatically sets up all required
 * PostCSS plugins — you do NOT need to include `tailwindcss` or `autoprefixer` here.
 *
 * This file only exists for adding additional PostCSS plugins, if needed.
 * For example:
 *
 * import postcssNested from 'postcss-nested'
 * export default { plugins: [postcssNested()] }
 *
 * Otherwise, you can leave this file empty.
 */
export default {}

```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,

    "types": ["vite/client", "node"]
  },
  "include": ["src", "vite.config.ts"]
}
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})

```

### `.continue\agents\new-config.yaml`

```yaml
name: Example Config
version: 1.0.0
schema: v1

models:
  - name: qwen2.5-coder 7b
    provider: ollama
    model: qwen2.5-coder:7b
    roles:
      - chat
      - edit
      - apply
      - autocomplete
    defaultCompletionOptions:
      contextLength: 32768
      maxTokens: 4096

  - name: nomic-embed-text
    provider: ollama
    model: nomic-embed-text
    roles:
      - embed
```

### `guidelines\Guidelines.md`

```md
**Add your own guidelines here**
<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->

```

### `public\_redirects`

```text
/*  /index.html  200

```

### `src\main.tsx`

```tsx

  import { createRoot } from "react-dom/client";
  import App from "./app/App";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(<App />);
  
```

### `src\app\App.tsx`

```tsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

// Component Imports
import { ModernHeader } from './components/ModernHeader';
import { ModernSidebar } from './components/ModernSidebar';
import RequireAuth from './components/RequireAuth';

// Page Imports
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import SettingsLayout from './pages/settings/SettingsLayout';

// Feature Pages
import Projects from './pages/Projects';
import MyTasks from './pages/MyTasks';
import Team from './pages/Team';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Automations from './pages/Automations';
import Timesheets from './pages/Timesheets';
import Messages from './pages/Messages';
import ProjectDetail from './pages/ProjectDetail';
import CommandMenu from './components/CommandMenu';
import { Toaster } from 'sonner';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <CommandMenu />
      <ModernHeader onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <ModernSidebar 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
        />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full">
           <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Toaster richColors position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route element={<RequireAuth />}>
              <Route element={<Layout />}>
                {/* Redirect root to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Work */}
                <Route path="/tasks" element={<MyTasks />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/timesheets" element={<Timesheets />} />
                
                {/* Communication */}
                <Route path="/notifications" element={<Notifications />} />
                
                {/* 🟢 Unified Chat Routes */}
                <Route path="/messages" element={<Navigate to="/messages/room_1" replace />} />
                <Route path="/messages/:roomId" element={<Messages />} />
                
                {/* Management */}
                <Route path="/team" element={<Team />} />
                
                {/* 🟢 FIXED: Profile needs both routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:id" element={<Profile />} />
                
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/automations" element={<Automations />} />
                <Route path="/analytics" element={<Analytics />} />
                
                {/* Settings */}
                <Route path="/settings" element={<SettingsLayout />} />
              </Route>
            </Route>
            
            {/* Catch-all: Redirect unknown pages to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### `src\app\components\AddMemberModal.tsx`

```tsx
import { useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: () => void;
}

export default function AddMemberModal({ isOpen, onClose, onMemberAdded }: AddMemberModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Member',
    avatar: '/pfp.jpg' // Default selection
  });

  if (!isOpen) return null;

  const avatars = [
    { id: 'male', src: '/male.jpg', label: 'Male' },
    { id: 'female', src: '/female.jpg', label: 'Female' },
    { id: 'default', src: '/pfp.jpg', label: 'Default' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a new user profile directly in the database
      // Note: This creates a profile, but the user still needs to Sign Up 
      // with this email to actually log in.
      const { error } = await supabase.from('users').insert({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: formData.avatar,
        status: 'offline'
      });

      if (error) throw error;
      
      onMemberAdded();
      onClose();
      setFormData({ name: '', email: '', role: 'Member', avatar: '/pfp.jpg' });
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add New Team Member</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Avatar</label>
            <div className="flex gap-4 justify-center">
              {avatars.map((av) => (
                <div 
                  key={av.id}
                  onClick={() => setFormData({ ...formData, avatar: av.src })}
                  className={`relative cursor-pointer group transition-all ${
                    formData.avatar === av.src ? 'scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={av.src} 
                    alt={av.label} 
                    className={`w-16 h-16 rounded-full object-cover border-2 ${
                      formData.avatar === av.src ? 'border-indigo-600 shadow-md shadow-indigo-500/30' : 'border-transparent'
                    }`} 
                  />
                  {formData.avatar === av.src && (
                    <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5">
                      <CheckCircle2 size={12} />
                    </div>
                  )}
                  <p className="text-xs text-center mt-2 font-medium text-gray-600 dark:text-gray-400">{av.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Sarah Connor"
                />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input 
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. sarah@example.com"
                />
            </div>
            <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option>Member</option>
                  <option>Developer</option>
                  <option>Designer</option>
                  <option>Manager</option>
                </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Add Member'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### `src\app\components\ChatFileButton.tsx`

```tsx
import { useState, useRef } from 'react';
import { Paperclip, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface ChatFileButtonProps {
  onUploadComplete: (url: string, type: string) => void;
}

export default function ChatFileButton({ onUploadComplete }: ChatFileButtonProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    try {
      // 1. Generate a unique file name (e.g., "123-my-image.png")
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to Supabase 'chat-files' bucket
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get the Public URL
      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // 4. Determine type (simple check)
      const type = file.type.startsWith('image/') ? 'image' : 'file';

      // 5. Pass URL back to parent
      onUploadComplete(data.publicUrl, type);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      // Reset input so you can select the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*,.pdf,.doc,.docx" // Accept images and docs
      />
      
      <button 
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
        title="Attach file"
      >
        {uploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
      </button>
    </>
  );
}
```

### `src\app\components\CommandMenu.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { 
  LayoutGrid, FolderKanban, CheckSquare, Users, Calendar, 
  BarChart2, MessageSquare, Clock, Zap, Settings, Sun, Moon, 
  Plus, Search, ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const [projects, setProjects] = useState<{ id: string; name: string; status: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; role: string; avatar: string }[]>([]);

  // Toggle on Ctrl+K or Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    // Listen for custom trigger event
    const handleOpenTrigger = () => setOpen(true);
    window.addEventListener('open-command-palette', handleOpenTrigger);
    document.addEventListener('keydown', down);

    return () => {
      document.removeEventListener('keydown', down);
      window.removeEventListener('open-command-palette', handleOpenTrigger);
    };
  }, []);

  // Fetch quick search data when opened
  useEffect(() => {
    if (!open) return;

    async function fetchData() {
      const { data: projData } = await supabase.from('projects').select('id, name, status').limit(8);
      if (projData) setProjects(projData);

      const { data: userData } = await supabase.from('users').select('id, name, role, avatar').limit(8);
      if (userData) setUsers(userData);
    }

    fetchData();
  }, [open]);

  const runCommand = (action: () => void) => {
    setOpen(false);
    action();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Menu" className="w-full">
          <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
            <Search className="text-gray-400 shrink-0" size={18} />
            <Command.Input 
              autoFocus 
              placeholder="Type a command or search (projects, people, pages)..."
              className="w-full py-4 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
            />
            <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
              ESC
            </span>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-gray-800 custom-scrollbar">
            <Command.Empty className="py-8 text-center text-xs text-gray-400">
              No matching commands or results found.
            </Command.Empty>

            {/* Actions Group */}
            <Command.Group heading="Quick Actions" className="text-gray-400 text-[11px] font-bold uppercase px-2 py-1.5">
              <Command.Item
                onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>Toggle Theme ({theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'})</span>
              </Command.Item>

              <Command.Item
                onSelect={() => runCommand(() => navigate('/tasks'))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
              >
                <Plus size={16} />
                <span>Create New Task</span>
              </Command.Item>
            </Command.Group>

            {/* Navigation Group */}
            <Command.Group heading="Navigation" className="text-gray-400 text-[11px] font-bold uppercase px-2 py-1.5">
              {[
                { name: 'Dashboard Overview', path: '/dashboard', icon: <LayoutGrid size={16} /> },
                { name: 'Projects', path: '/projects', icon: <FolderKanban size={16} /> },
                { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={16} /> },
                { name: 'Team Chat', path: '/messages/room_1', icon: <MessageSquare size={16} /> },
                { name: 'Team Directory', path: '/team', icon: <Users size={16} /> },
                { name: 'Calendar & Schedule', path: '/calendar', icon: <Calendar size={16} /> },
                { name: 'Analytics Dashboard', path: '/analytics', icon: <BarChart2 size={16} /> },
                { name: 'Timesheets', path: '/timesheets', icon: <Clock size={16} /> },
                { name: 'Automations', path: '/automations', icon: <Zap size={16} /> },
                { name: 'Workspace Settings', path: '/settings', icon: <Settings size={16} /> },
              ].map(item => (
                <Command.Item
                  key={item.path}
                  onSelect={() => runCommand(() => navigate(item.path))}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  <ArrowRight size={12} className="opacity-40" />
                </Command.Item>
              ))}
            </Command.Group>

            {/* Projects Group */}
            {projects.length > 0 && (
              <Command.Group heading="Projects" className="text-gray-400 text-[11px] font-bold uppercase px-2 py-1.5">
                {projects.map(proj => (
                  <Command.Item
                    key={proj.id}
                    onSelect={() => runCommand(() => navigate(`/projects/${proj.id}`))}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FolderKanban size={16} className="text-indigo-500 shrink-0" />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      {proj.status}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* People Group */}
            {users.length > 0 && (
              <Command.Group heading="Team Members" className="text-gray-400 text-[11px] font-bold uppercase px-2 py-1.5">
                {users.map(u => (
                  <Command.Item
                    key={u.id}
                    onSelect={() => runCommand(() => navigate(`/profile/${u.id}`))}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <img 
                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} 
                        alt="" 
                        className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
                      />
                      <span className="truncate">{u.name}</span>
                    </div>
                    <span className="text-[11px] text-gray-400">{u.role}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="p-3 border-t border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/50 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Use <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-[10px]">↑</kbd> <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-[10px]">↓</kbd> to navigate</span>
            <span><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono text-[10px]">Enter</kbd> to select</span>
          </div>
        </Command>
      </div>
    </div>
  );
}


```

### `src\app\components\CreateProjectModal.tsx`

```tsx
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void; // Trigger refresh after save
}

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from('projects').insert({
        name,
        description,
        owner_id: user.id,
        status: 'active',
        progress: 0
      });

      if (error) throw error;
      
      // Success!
      setName('');
      setDescription('');
      onProjectCreated(); // Tell parent to refresh
      onClose(); // Close modal

    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">Create New Project</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
            <input 
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!name.trim() || loading}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### `src\app\components\MessageBubble.tsx`

```tsx
import { useState, useRef, useEffect } from 'react';
import { FileText, Pencil, Trash2, Smile, Plus } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useTheme } from '../../context/ThemeContext';

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
}

interface MessageBubbleProps {
  message: any;
  isMe: boolean;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}

export default function MessageBubble({ message, isMe, onEdit, onDelete, onReact }: MessageBubbleProps) {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);

  const pickerRef = useRef<HTMLDivElement>(null);
  const reactions: Reaction[] = message.message_reactions || [];

  // Group reactions: { "👍": 3, "❤️": 1 }
  const reactionCounts = reactions.reduce((acc: any, curr: Reaction) => {
    acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
        setShowFullPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const quickEmojis = ['👍', '❤️', '😂', '🔥', '😮', '🎉'];

  const handleFullEmojiClick = (emojiData: EmojiClickData) => {
    onReact(message.id, emojiData.emoji);
    setShowFullPicker(false);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`relative group max-w-[80%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
      {/* Hover Actions */}
      {!isEditing && (
        <div 
          ref={pickerRef}
          className={`absolute -top-7 ${isMe ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-xl p-1 z-20`}
        >
          {/* Reaction Button */}
          <div className="relative">
            <button 
              type="button"
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowFullPicker(false);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-amber-500 transition-colors"
              title="Add reaction"
            >
              <Smile size={14} />
            </button>

            {/* Quick Emoji Bar */}
            {showEmojiPicker && !showFullPicker && (
              <div className="absolute top-8 left-0 bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-2xl p-1.5 flex items-center gap-1 z-30 animate-in zoom-in-95 duration-150 whitespace-nowrap">
                {quickEmojis.map(emoji => (
                  <button 
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onReact(message.id, emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded-lg text-base transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <button
                  type="button"
                  onClick={() => setShowFullPicker(true)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold flex items-center gap-0.5"
                  title="More emojis"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}

            {/* Full Emoji Picker Popover */}
            {showFullPicker && (
              <div className="absolute top-8 left-0 z-40 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <EmojiPicker
                  theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                  onEmojiClick={handleFullEmojiClick}
                  width={300}
                  height={360}
                  lazyLoadEmojis={true}
                  searchPlaceHolder="Search emoji..."
                />
              </div>
            )}
          </div>

          {/* Edit/Delete (Only for Author) */}
          {isMe && (
            <>
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors"
                title="Edit message"
              >
                <Pencil size={13} />
              </button>
              <button 
                type="button"
                onClick={() => { if (confirm('Delete this message?')) onDelete(message.id); }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                title="Delete message"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      )}

      {/* The Message Bubble */}
      <div className={`p-3.5 shadow-sm text-sm break-words relative transition-all ${
        isMe 
          ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
          : 'bg-white dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm'
      }`}>
        {/* Attachments */}
        {message.file_url && (
          <div className="mb-2.5">
            {message.file_type === 'image' ? (
              <a href={message.file_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl">
                <img 
                  src={message.file_url} 
                  alt="attachment" 
                  className="max-w-xs max-h-60 rounded-xl object-cover border border-black/10 dark:border-white/10 hover:opacity-95 transition-opacity" 
                  loading="lazy"
                />
              </a>
            ) : (
              <a 
                href={message.file_url} 
                target="_blank" 
                rel="noreferrer" 
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  isMe 
                    ? 'bg-white/15 border-white/20 text-white hover:bg-white/25' 
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-gray-100'
                }`}
              >
                <FileText size={15} /> Download Document
              </a>
            )}
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          <div className="flex flex-col gap-2 min-w-[220px]">
            <textarea 
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="text-gray-900 bg-white p-2.5 rounded-xl text-sm w-full outline-none border border-gray-300 shadow-inner"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button 
                type="button"
                onClick={() => setIsEditing(false)} 
                className="text-xs px-2.5 py-1 rounded-lg opacity-80 hover:opacity-100"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSave} 
                className="bg-white text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-gray-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
            {message.is_edited && (
              <span className={`text-[10px] ml-1.5 opacity-60 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                (edited)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Reactions Display (Below Bubble) */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
          {Object.entries(reactionCounts).map(([emoji, count]: any) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onReact(message.id, emoji)}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5 text-xs shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{emoji}</span>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">{count}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### `src\app\components\ModernHeader.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckSquare,
  ChevronRight,
  FileText,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  Users,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabaseClient';

interface SearchProject {
  id: string;
  name: string;
  status: string;
}

interface SearchUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

interface SearchPage {
  name: string;
  path: string;
  icon: React.ReactNode;
}

export function ModernHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [projects, setProjects] = useState<SearchProject[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, status');

      if (!projectsError && projectsData) {
        setProjects(projectsData);
      }

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, avatar, role');

      if (!usersError && usersData) {
        setUsers(usersData);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchablePages: SearchPage[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutGrid size={14} /> },
    { name: 'My Tasks', path: '/tasks', icon: <CheckSquare size={14} /> },
    { name: 'Projects', path: '/projects', icon: <FolderKanban size={14} /> },
    { name: 'Team', path: '/team', icon: <Users size={14} /> },
    { name: 'Calendar', path: '/calendar', icon: <Sun size={14} /> },
    { name: 'Analytics', path: '/analytics', icon: <Sun size={14} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={14} /> },
  ];

  const filteredPages = searchablePages.filter((page) =>
    page.name.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredUsers = users.filter((searchUser) =>
    searchUser.name?.toLowerCase().includes(query.toLowerCase()),
  );
  const hasResults =
    filteredPages.length > 0 || filteredProjects.length > 0 || filteredUsers.length > 0;

  const handleLogout = async () => {
    await signOut();
    setIsProfileOpen(false);
    navigate('/login');
  };

  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setQuery('');
  };

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="relative z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 text-gray-900 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu size={20} />
        </button>

        <div className="hidden items-center text-sm text-gray-500 dark:text-gray-400 md:flex">
          <span className="font-medium text-gray-900 dark:text-white">Workspace</span>
          <ChevronRight size={14} className="mx-2 opacity-50" />
          <Link
            to={location.pathname}
            className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            {getPageTitle()}
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative hidden sm:block" ref={searchRef}>
          <div
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-palette'))}
            className="group relative flex cursor-pointer items-center"
            title="Press Ctrl+K to search"
          >
            <Search
              className="pointer-events-none absolute left-3.5 top-2.5 text-gray-400 transition-colors group-hover:text-indigo-500"
              size={15}
            />
            <input
              type="text"
              placeholder="Search or jump to... (Ctrl + K)"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-60 rounded-xl border border-transparent bg-gray-100/80 py-2 pl-9 pr-14 text-xs text-gray-700 outline-none transition-all hover:border-indigo-500/30 focus:border-indigo-500 focus:bg-white dark:bg-gray-800/80 dark:text-gray-300 dark:placeholder-gray-400 dark:focus:bg-gray-900 lg:w-72"
            />
            {query && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setQuery('');
                  setShowResults(false);
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-2.5 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={14} />
              </button>
            )}
            <div className="pointer-events-none absolute right-2.5 top-2 flex items-center gap-0.5">
              <span className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-gray-400 shadow-2xs dark:border-gray-600 dark:bg-gray-700">
                Ctrl K
              </span>
            </div>
          </div>

          {showResults && query && (
            <div className="absolute left-0 top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 lg:w-96">
              {hasResults ? (
                <div className="max-h-[70vh] overflow-y-auto py-2">
                  {filteredPages.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Pages
                      </h4>
                      {filteredPages.map((page) => (
                        <button
                          type="button"
                          key={page.path}
                          onClick={() => handleSearchResultClick(page.path)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                        >
                          <div className="rounded-md bg-gray-100 p-1.5 text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                            {page.icon}
                          </div>
                          {page.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredProjects.length > 0 && (
                    <div className="mb-2">
                      <h4 className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Projects
                      </h4>
                      {filteredProjects.map((project) => (
                        <button
                          type="button"
                          key={project.id}
                          onClick={() => handleSearchResultClick(`/projects/${project.id}`)}
                          className="flex w-full items-center justify-between px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-md bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                              <FileText size={14} />
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {project.name}
                            </span>
                          </div>
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-gray-500 dark:bg-gray-700">
                            {project.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {filteredUsers.length > 0 && (
                    <div>
                      <h4 className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        Team
                      </h4>
                      {filteredUsers.map((searchUser) => (
                        <button
                          type="button"
                          key={searchUser.id}
                          onClick={() => handleSearchResultClick(`/profile/${searchUser.id}`)}
                          className="flex w-full items-center gap-3 px-4 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          {searchUser.avatar && searchUser.avatar.startsWith('http') ? (
                            <img
                              src={searchUser.avatar}
                              className="h-7 w-7 rounded-full object-cover"
                              alt=""
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                              {searchUser.name ? searchUser.name.charAt(0) : 'U'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {searchUser.name}
                            </p>
                            <p className="text-xs text-gray-400">{searchUser.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title="Toggle Theme"
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <Link
          to="/notifications"
          aria-label="Notifications"
          title="Notifications"
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-gray-900" />
        </Link>

        <div className="mx-1 h-8 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen((current) => !current)}
            aria-expanded={isProfileOpen}
            aria-label="Open profile menu"
            className="flex items-center gap-3 rounded-xl border border-transparent p-1.5 transition-all hover:border-gray-200 hover:bg-gray-100 dark:hover:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold leading-none">{user?.name || 'Guest'}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Viewer'}</p>
            </div>
            {user?.avatar?.startsWith('http') ? (
              <img
                src={user.avatar}
                alt={user.name || 'User avatar'}
                className="h-9 w-9 rounded-lg object-cover bg-gray-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <div className="border-b border-gray-100 p-4 dark:border-gray-700 md:hidden">
                <p className="font-bold text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <div className="space-y-1 p-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/profile/${user?.id}`);
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <User size={16} />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/settings');
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                >
                  <Settings size={16} />
                  Settings
                </button>
              </div>
              <div className="border-t border-gray-100 p-2 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

### `src\app\components\ModernKanbanBoard.tsx`

```tsx
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ModernKanbanColumn } from './ModernKanbanColumn';
import { ModernTask } from './ModernTaskCard';

const initialTasks: ModernTask[] = [
  {
    id: '1',
    title: 'Redesign Dashboard UI',
    description: 'Update the main dashboard with new design system',
    priority: 'high',
    assignees: [
      { name: 'Sarah', avatar: '' },
      { name: 'Mike', avatar: '' },
    ],
    dueDate: 'Jan 12',
    comments: 5,
    attachments: 3,
    tags: ['Design', 'UI/UX'],
  },
  {
    id: '2',
    title: 'Implement Authentication',
    description: 'Add OAuth2.0 and JWT token support',
    priority: 'urgent',
    assignees: [
      { name: 'John', avatar: '' },
    ],
    dueDate: 'Jan 8',
    comments: 8,
    attachments: 2,
    tags: ['Backend', 'Security'],
  },
  {
    id: '3',
    title: 'Database Migration',
    description: 'Migrate from PostgreSQL to distributed database',
    priority: 'medium',
    assignees: [
      { name: 'Emma', avatar: '' },
      { name: 'Chris', avatar: '' },
    ],
    dueDate: 'Jan 15',
    comments: 3,
    attachments: 1,
    tags: ['Backend', 'DevOps'],
  },
  {
    id: '4',
    title: 'Mobile App Testing',
    description: 'Complete QA testing for iOS and Android builds',
    priority: 'high',
    assignees: [
      { name: 'Lisa', avatar: '' },
      { name: 'Tom', avatar: '' },
      { name: 'Jake', avatar: '' },
    ],
    dueDate: 'Jan 10',
    comments: 12,
    attachments: 5,
    tags: ['QA', 'Mobile'],
  },
  {
    id: '5',
    title: 'API Documentation',
    description: 'Write comprehensive API docs with examples',
    priority: 'low',
    assignees: [
      { name: 'Alex', avatar: '' },
    ],
    dueDate: 'Jan 18',
    comments: 2,
    attachments: 0,
    tags: ['Documentation'],
  },
  {
    id: '6',
    title: 'Performance Optimization',
    description: 'Reduce page load time and improve Core Web Vitals',
    priority: 'high',
    assignees: [
      { name: 'Sarah', avatar: '' },
      { name: 'Mike', avatar: '' },
    ],
    dueDate: 'Jan 14',
    comments: 7,
    attachments: 4,
    tags: ['Frontend', 'Performance'],
  },
  {
    id: '7',
    title: 'Code Review Sprint 3',
    description: 'Review all PRs from Sprint 3 before deployment',
    priority: 'medium',
    assignees: [
      { name: 'John', avatar: '' },
      { name: 'Emma', avatar: '' },
    ],
    dueDate: 'Jan 9',
    comments: 15,
    attachments: 0,
    tags: ['Review'],
  },
  {
    id: '8',
    title: 'Deploy to Production',
    description: 'Final deployment with monitoring setup',
    priority: 'urgent',
    assignees: [
      { name: 'Chris', avatar: '' },
    ],
    dueDate: 'Jan 20',
    comments: 4,
    attachments: 2,
    tags: ['DevOps', 'Deployment'],
  },
  {
    id: '9',
    title: 'User Feedback Analysis',
    description: 'Analyze user feedback from beta testing',
    priority: 'medium',
    assignees: [
      { name: 'Lisa', avatar: '' },
    ],
    dueDate: 'Jan 16',
    comments: 6,
    attachments: 1,
    tags: ['Research'],
  },
  {
    id: '10',
    title: 'Fix Critical Bugs',
    description: 'Address high-priority bugs reported by QA',
    priority: 'urgent',
    assignees: [
      { name: 'Mike', avatar: '' },
      { name: 'John', avatar: '' },
    ],
    dueDate: 'Jan 7',
    comments: 10,
    attachments: 3,
    tags: ['Bug Fix', 'Critical'],
  },
];

type ColumnType = 'todo' | 'inProgress' | 'review' | 'done';

interface ColumnData {
  todo: ModernTask[];
  inProgress: ModernTask[];
  review: ModernTask[];
  done: ModernTask[];
}

export function ModernKanbanBoard() {
  const [columns, setColumns] = useState<ColumnData>({
    todo: initialTasks.slice(0, 3),
    inProgress: initialTasks.slice(3, 6),
    review: initialTasks.slice(6, 8),
    done: initialTasks.slice(8, 10),
  });

  const handleDrop = (taskId: string, targetColumn: ColumnType) => {
    setColumns((prevColumns) => {
      let sourceColumn: ColumnType | null = null;
      let taskToMove: ModernTask | null = null;

      // Find the task and its current column
      for (const [columnName, tasks] of Object.entries(prevColumns)) {
        const task = tasks.find((t: ModernTask) => t.id === taskId);
        if (task) {
          sourceColumn = columnName as ColumnType;
          taskToMove = task;
          break;
        }
      }

      if (!sourceColumn || !taskToMove) return prevColumns;

      // Move task to new column
      const newColumns = { ...prevColumns };
      newColumns[sourceColumn] = newColumns[sourceColumn].filter((t) => t.id !== taskId);
      newColumns[targetColumn] = [...newColumns[targetColumn], taskToMove];

      return newColumns;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        <ModernKanbanColumn
          title="To Do"
          tasks={columns.todo}
          color="bg-slate-400"
          onDrop={(taskId) => handleDrop(taskId, 'todo')}
        />
        <ModernKanbanColumn
          title="In Progress"
          tasks={columns.inProgress}
          color="bg-blue-500"
          onDrop={(taskId) => handleDrop(taskId, 'inProgress')}
        />
        <ModernKanbanColumn
          title="Review"
          tasks={columns.review}
          color="bg-amber-500"
          onDrop={(taskId) => handleDrop(taskId, 'review')}
        />
        <ModernKanbanColumn
          title="Done"
          tasks={columns.done}
          color="bg-emerald-500"
          onDrop={(taskId) => handleDrop(taskId, 'done')}
        />
      </div>
    </DndProvider>
  );
}
```

### `src\app\components\ModernKanbanColumn.tsx`

```tsx
import { useDrop } from 'react-dnd';
import { Plus, Ellipsis } from 'lucide-react';
import { ModernTaskCard, ModernTask } from './ModernTaskCard';

interface ModernKanbanColumnProps {
  title: string;
  tasks: ModernTask[];
  color: string;
  onDrop: (taskId: string) => void;
}

export function ModernKanbanColumn({ title, tasks, color, onDrop }: ModernKanbanColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'MODERN_TASK',
    drop: (item: { id: string }) => onDrop(item.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return drop(
    <div className="flex w-80 flex-shrink-0 flex-col">
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${color}`}></div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="flex h-6 min-w-[24px] items-center justify-center rounded-lg bg-gray-100 px-2 text-xs font-semibold text-gray-600">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-lg p-1.5 transition-all hover:bg-gray-100">
            <Plus className="h-4 w-4 text-gray-500" />
          </button>
          <button className="rounded-lg p-1.5 transition-all hover:bg-gray-100">
            <Ellipsis className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Column Content */}
      <div
        
        className={`flex-1 space-y-4 rounded-2xl bg-gray-50/80 p-4 transition-all ${
          isOver ? 'bg-violet-50 ring-2 ring-violet-300' : ''
        }`}
      >
        {tasks.map((task) => (
          <ModernTaskCard key={task.id} task={task} />
        ))}
        
        {tasks.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white/50">
            <p className="text-sm text-gray-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### `src\app\components\ModernSidebar.tsx`

```tsx
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  CheckSquare, 
  FolderKanban, 
  Users, 
  Calendar, 
  BarChart2, 
  Settings,
  MessageSquare,  // New
  Zap,            // New
  Clock,
  X
} from 'lucide-react';

// Accept props for mobile handling
interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function ModernSidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  // CSS classes to handle mobile slide-in vs desktop static
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
    transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full flex flex-col
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
        {/* Mobile Overlay Backdrop */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
        )}

        <aside className={sidebarClasses}>
          {/* Logo Section */}
          <div className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">ProjectFlow</span>
            </div>
            {/* Close button for mobile */}
            {onClose && (
              <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-700">
                  <X size={20} />
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Overview Section */}
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Overview</div>
            <NavItem to="/dashboard" icon={<LayoutGrid size={20} />} label="Overview" isActive={location.pathname === '/dashboard'} onClick={onClose} />
            <NavItem to="/analytics" icon={<BarChart2 size={20} />} label="Analytics" isActive={location.pathname === '/analytics'} onClick={onClose} />

            {/* Work Section */}
            <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Work</div>
            <NavItem to="/projects" icon={<FolderKanban size={20} />} label="Projects" isActive={location.pathname === '/projects'} onClick={onClose} />
            <NavItem to="/tasks" icon={<CheckSquare size={20} />} label="My Tasks" badge="12" isActive={location.pathname === '/tasks'} onClick={onClose} />
            <NavItem to="/timesheets" icon={<Clock size={20} />} label="Timesheets" isActive={location.pathname === '/timesheets'} onClick={onClose} />
            <NavItem to="/automations" icon={<Zap size={20} />} label="Automations" isActive={location.pathname === '/automations'} onClick={onClose} />

            {/* Team Section */}
            <div className="px-3 mt-6 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Team</div>
            <NavItem to="/messages/room_1" icon={<MessageSquare size={20} />} label="Team Chat" isActive={location.pathname === '/messages/room_1'} onClick={onClose} />
            <NavItem to="/team" icon={<Users size={20} />} label="Team" isActive={location.pathname === '/team'} onClick={onClose} />
            <NavItem to="/calendar" icon={<Calendar size={20} />} label="Calendar" isActive={location.pathname === '/calendar'} onClick={onClose} />
          </nav>

          {/* Footer Section (Notifications & Settings) */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-1">
             <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" isActive={location.pathname === '/settings'} onClick={onClose} />
          </div>
        </aside>
    </>
  );
}

// Helper Components 
function NavItem({ icon, label, to, isActive, badge, onClick }: any) {
  return (
    <Link 
        to={to} 
        onClick={onClick}
        className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive 
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
    >
      <span className={`${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'} mr-3`}>{icon}</span>
      {label}
      {badge && (
        <span className="ml-auto bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs font-medium">
          {badge}
        </span>
      )}
    </Link>
  );
}


```

### `src\app\components\ModernTaskCard.tsx`

```tsx
import { useDrag } from 'react-dnd';
import { Calendar, MessageSquare, Paperclip, Ellipsis } from 'lucide-react';

export interface ModernTask {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignees: Array<{ name: string; avatar: string }>;
  dueDate: string;
  comments: number;
  attachments: number;
  tags: string[];
}

interface ModernTaskCardProps {
  task: ModernTask;
}

const priorityStyles = {
  urgent: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',
  high: 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
  medium: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  low: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
};

export function ModernTaskCard({ task }: ModernTaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MODERN_TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return drag(
    <div
      className={`group cursor-move rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50 ${
        isDragging ? 'opacity-40 rotate-2 scale-105' : 'opacity-100'
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h4 className="mb-1.5 font-semibold text-gray-900 leading-snug">{task.title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
        </div>
        <button className="rounded-lg p-1.5 opacity-0 transition-all hover:bg-gray-100 group-hover:opacity-100">
          <Ellipsis className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex -space-x-2">
          {task.assignees.map((assignee, idx) => (
            <div
              key={idx}
              className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 ring-2 ring-white"
              title={assignee.name}
            ></div>
          ))}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-3">
          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority}
          </span>
          
          <div className="flex items-center gap-3 text-gray-400">
            {task.comments > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{task.comments}</span>
              </div>
            )}
            {task.attachments > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{task.attachments}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-500">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{task.dueDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

```

### `src\app\components\RequireAuth.tsx`

```tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Fixed import path based on App.tsx

export default function RequireAuth() {
  const { session, loading } = useAuth(); 
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    // 🟢 FIXED: Redirect to '/login', not '/'
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
```

### `src\app\components\TaskDetailModal.tsx`

```tsx
import { useState, useEffect } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: { name: string; avatar: string };
}

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
  onUpdate: () => void; // Refresh Kanban after edit
}

export default function TaskDetailModal({ taskId, onClose, onUpdate }: TaskDetailModalProps) {
  const { user } = useAuth();
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  if (!taskId) return null;

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    // 1. Fetch Task Info
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskData) {
      setTask(taskData);
      setDescription(taskData.description || '');
    }

    // 2. Fetch Comments
    const { data: commentData } = await supabase
      .from('comments')
      .select('*, user:users(name, avatar)')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (commentData) setComments(commentData);
    setLoading(false);
  };

  const saveDescription = async () => {
    await supabase.from('tasks').update({ description }).eq('id', taskId);
    onUpdate(); // Notify parent
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { error } = await supabase.from('comments').insert({
      task_id: taskId,
      user_id: user.id,
      content: newComment
    });

    if (!error) {
      setNewComment('');
      fetchTaskDetails(); // Refresh comments
    }
  };

  const deleteTask = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      await supabase.from('tasks').delete().eq('id', taskId);
      onUpdate();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-900/50">
          {loading ? (
             <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className={`px-2 py-0.5 rounded uppercase font-bold ${
                  task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                  task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 
                  'bg-blue-100 text-blue-600'
                }`}>
                  {task.priority}
                </span>
                <span>• In {task.status}</span>
              </div>
            </div>
          )}
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Description Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              Description
            </h3>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none dark:text-gray-200"
              placeholder="Add a more detailed description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={saveDescription} // Auto-save on click away
            />
            <p className="text-xs text-gray-400 mt-1">Changes are saved automatically when you click outside.</p>
          </section>

          {/* Comments Section */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              Activity & Comments
            </h3>
            
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No comments yet.</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                      {comment.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-r-xl rounded-bl-xl text-sm text-gray-700 dark:text-gray-200">
                        <span className="font-bold text-gray-900 dark:text-white mr-2">{comment.user?.name}</span>
                        {comment.content}
                      </div>
                      <span className="text-[10px] text-gray-400 ml-1 mt-1 block">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <form onSubmit={postComment} className="flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-900 dark:text-white"
              />
              <button disabled={!newComment.trim()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button 
            onClick={deleteTask}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} /> Delete Task
          </button>
        </div>

      </div>
    </div>
  );
}
```

### `src\app\components\TypingIndicator.tsx`

```tsx
interface TypingIndicatorProps {
  users: string[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  // Format text: "Alex is typing..." or "Alex and Sam are typing..."
  const text = users.length === 1 
    ? `${users[0]} is typing...`
    : `${users.join(', ')} are typing...`;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 px-4 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
```

### `src\app\components\ui\accordion.tsx`

```tsx
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

```

### `src\app\components\ui\alert-dialog.tsx`

```tsx
"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  );
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  );
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

```

### `src\app\components\ui\alert.tsx`

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };

```

### `src\app\components\ui\aspect-ratio.tsx`

```tsx
"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };

```

### `src\app\components\ui\avatar.tsx`

```tsx
"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "./utils";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };

```

### `src\app\components\ui\badge.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

```

### `src\app\components\ui\breadcrumb.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "./utils";

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props}
    />
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

```

### `src\app\components\ui\button.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

```

### `src\app\components\ui\calendar.tsx`

```tsx
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };

```

### `src\app\components\ui\card.tsx`

```tsx
import * as React from "react";

import { cn } from "./utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};

```

### `src\app\components\ui\carousel.tsx`

```tsx
"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

```

### `src\app\components\ui\chart.tsx`

```tsx
"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "./utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: "line" | "dot" | "dashed";
    nameKey?: string;
    labelKey?: string;
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null;
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload.fill || item.color;

          return (
            <div
              key={item.dataKey}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          },
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean;
    nameKey?: string;
  }) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === "string"
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === "string"
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string;
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};

```

### `src\app\components\ui\checkbox.tsx`

```tsx
"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "./utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };

```

### `src\app\components\ui\collapsible.tsx`

```tsx
"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

```

### `src\app\components\ui\command.tsx`

```tsx
"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className,
      )}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};

```

### `src\app\components\ui\context-menu.tsx`

```tsx
"use client";

import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

function ContextMenu({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuPortal({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return (
    <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
  );
}

function ContextMenuSub({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};

```

### `src\app\components\ui\dialog.tsx`

```tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

```

### `src\app\components\ui\drawer.tsx`

```tsx
"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "./utils";

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className,
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};

```

### `src\app\components\ui\dropdown-menu.tsx`

```tsx
"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};

```

### `src\app\components\ui\form.tsx`

```tsx
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "./utils";
import { Label } from "./label";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};

```

### `src\app\components\ui\hover-card.tsx`

```tsx
"use client";

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "./utils";

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };

```

### `src\app\components\ui\input-otp.tsx`

```tsx
"use client";

import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";

import { cn } from "./utils";

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

```

### `src\app\components\ui\input.tsx`

```tsx
import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

```

### `src\app\components\ui\label.tsx`

```tsx
"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "./utils";

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };

```

### `src\app\components\ui\menubar.tsx`

```tsx
"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

function Menubar({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className,
        )}
        {...props}
      />
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn(
        "px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className,
      )}
      {...props}
    />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};

```

### `src\app\components\ui\navigation-menu.tsx`

```tsx
import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center",
      )}
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className,
        )}
        {...props}
      />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className,
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};

```

### `src\app\components\ui\pagination.tsx`

```tsx
import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

```

### `src\app\components\ui\popover.tsx`

```tsx
"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "./utils";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };

```

### `src\app\components\ui\progress.tsx`

```tsx
"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "./utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };

```

### `src\app\components\ui\radio-group.tsx`

```tsx
"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";

import { cn } from "./utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };

```

### `src\app\components\ui\resizable.tsx`

```tsx
"use client";

import * as React from "react";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";

import { cn } from "./utils";

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className,
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

```

### `src\app\components\ui\scroll-area.tsx`

```tsx
"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "./utils";

function ScrollArea({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };

```

### `src\app\components\ui\select.tsx`

```tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

import { cn } from "./utils";

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

```

### `src\app\components\ui\separator.tsx`

```tsx
"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

import { cn } from "./utils";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };

```

### `src\app\components\ui\sheet.tsx`

```tsx
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

```

### `src\app\components\ui\sidebar.tsx`

```tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react";

import { useIsMobile } from "./use-mobile";
import { cn } from "./utils";
import { Button } from "./button";
import { Input } from "./input";
import { Separator } from "./separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Skeleton } from "./skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};

```

### `src\app\components\ui\skeleton.tsx`

```tsx
import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };

```

### `src\app\components\ui\slider.tsx`

```tsx
"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "./utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };

```

### `src\app\components\ui\sonner.tsx`

```tsx
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

```

### `src\app\components\ui\switch.tsx`

```tsx
"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-card dark:data-[state=unchecked]:bg-card-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };

```

### `src\app\components\ui\table.tsx`

```tsx
"use client";

import * as React from "react";

import { cn } from "./utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};

```

### `src\app\components\ui\tabs.tsx`

```tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

```

### `src\app\components\ui\textarea.tsx`

```tsx
import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

```

### `src\app\components\ui\toggle-group.tsx`

```tsx
"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };

```

### `src\app\components\ui\toggle.tsx`

```tsx
"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };

```

### `src\app\components\ui\tooltip.tsx`

```tsx
"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "./utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

```

### `src\app\components\ui\use-mobile.ts`

```ts
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

```

### `src\app\components\ui\utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

### `src\app\pages\Analytics.tsx`

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Loader2, CheckCircle2, Circle, AlertTriangle, ListTodo,
  TrendingUp, TrendingDown
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Derived Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'done').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  useEffect(() => {
    fetchData();

    // ⚡ REAL-TIME LISTENER
    // This makes the charts animate instantly when ANYONE changes a task
    const subscription = supabase
      .channel('analytics_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchData(); // Re-fetch data on any change (Insert, Update, Delete)
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('tasks').select('*');
    if (data) setTasks(data);
    setLoading(false);
  };

  // --- Prepare Chart Data ---

  // 1. Status Data (Donut Chart)
  const statusCounts = tasks.reduce((acc: any, task) => {
    const status = task.status || 'todo';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: 'To Do', value: statusCounts.todo || 0, color: '#94a3b8' },       // Slate 400
    { name: 'In Progress', value: statusCounts.inProgress || 0, color: '#6366f1' }, // Indigo 500
    { name: 'Review', value: statusCounts.review || 0, color: '#f59e0b' },    // Amber 500
    { name: 'Done', value: statusCounts.done || 0, color: '#10b981' },        // Emerald 500
  ].filter(item => item.value > 0); // Hide empty slices

  // 2. Priority Data (Bar Chart)
  const priorityCounts = tasks.reduce((acc: any, task) => {
    const priority = task.priority || 'low';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const priorityData = [
    { name: 'Low', count: priorityCounts.low || 0 },
    { name: 'Medium', count: priorityCounts.medium || 0 },
    { name: 'High', count: priorityCounts.high || 0 },
  ];

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time insights into your team's performance.</p>
        </div>
        <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Completion Rate</span>
            <div className="flex items-center gap-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {completionRate}%
                {completionRate >= 50 ? <TrendingUp size={24} className="text-emerald-500"/> : <TrendingDown size={24} className="text-amber-500"/>}
            </div>
        </div>
      </div>

      {/* --- KPI Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Tasks" 
          value={totalTasks} 
          icon={<ListTodo size={24} className="text-blue-600" />} 
          bg="bg-blue-50 dark:bg-blue-900/20"
        />
        <KPICard 
          title="Completed" 
          value={completedTasks} 
          icon={<CheckCircle2 size={24} className="text-emerald-600" />} 
          bg="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <KPICard 
          title="In Progress" 
          value={pendingTasks} 
          icon={<Circle size={24} className="text-indigo-600" />} 
          bg="bg-indigo-50 dark:bg-indigo-900/20"
        />
        <KPICard 
          title="High Priority" 
          value={highPriorityTasks} 
          icon={<AlertTriangle size={24} className="text-rose-600" />} 
          bg="bg-rose-50 dark:bg-rose-900/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- Chart 1: Task Status (Donut) --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6">Task Status Distribution</h3>
          <div className="flex-1 min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalTasks}</span>
                <span className="text-xs text-gray-500 uppercase font-medium">Tasks</span>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
             {statusData.map(item => (
                 <div key={item.name} className="flex items-center gap-2 text-sm">
                     <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                     <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                     <span className="text-gray-400">({item.value})</span>
                 </div>
             ))}
          </div>
        </div>

        {/* --- Chart 2: Priority Breakdown (Bar) --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 dark:text-white mb-6">Workload by Priority</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false}
                />
                <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                    {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                            entry.name === 'High' ? '#e11d48' : // Rose 600
                            entry.name === 'Medium' ? '#f59e0b' : // Amber 500
                            '#6366f1' // Indigo 500
                        } />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            High priority tasks require immediate attention.
          </p>
        </div>
      </div>
    </div>
  );
}

// Simple Card Component
function KPICard({ title, value, icon, bg }: any) {
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-xl ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    );
}
```

### `src\app\pages\Automations.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
import { 
  Zap, Plus, Slack, Mail, CheckCircle2, 
  MoreVertical, Trash2, Play, X, Loader2, Save,
  Github, Clock, AlertTriangle 
} from 'lucide-react';

// --- Types ---
type Rule = {
  id: number;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  iconType: 'slack' | 'mail' | 'task' | 'github' | 'time' | 'alert' | 'default';
  lastRun?: string;
};

export default function Automations() {
  // --- State with 3 NEW Rules Added ---
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, name: 'Auto-Archive Done Tasks', trigger: 'Status changed to "Done"', action: 'Archive after 7 days', active: true, iconType: 'task', lastRun: '2 hours ago' },
    { id: 2, name: 'Notify Slack on High Priority', trigger: 'New High Priority Issue', action: 'Send message to #general', active: true, iconType: 'slack', lastRun: 'Just now' },
    { id: 3, name: 'Welcome Email', trigger: 'New User Joined', action: 'Send "Onboarding" email', active: false, iconType: 'mail' },
    
    // --- NEW CARDS ---
    { id: 4, name: 'Sync GitHub PRs', trigger: 'Pull Request Merged', action: 'Move Task to "Deployed"', active: true, iconType: 'github', lastRun: '1 day ago' },
    { id: 5, name: 'Timesheet Reminder', trigger: 'Every Friday at 5 PM', action: 'Send Email to All Staff', active: true, iconType: 'time', lastRun: '3 days ago' },
    { id: 6, name: 'Escalate Overdue Tasks', trigger: 'Due Date Passed > 48h', action: 'Mark Critical & Notify Manager', active: false, iconType: 'alert' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [runningId, setRunningId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', trigger: '', action: '', iconType: 'default' });

  // --- Handlers ---

  const handleToggle = (id: number) => {
    setLoadingId(id);
    setTimeout(() => {
        setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
        setLoadingId(null);
    }, 600);
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this automation rule?')) {
        setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleRunNow = (id: number) => {
    setRunningId(id);
    setTimeout(() => {
        setRunningId(null);
        setRules(rules.map(r => r.id === id ? { ...r, lastRun: 'Just now' } : r));
        alert('Automation ran successfully!');
    }, 1500);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: Rule = {
        id: Date.now(),
        name: formData.name,
        trigger: formData.trigger,
        action: formData.action,
        active: true,
        iconType: formData.iconType as any,
        lastRun: 'Never'
    };
    setRules([...rules, newRule]);
    setIsModalOpen(false);
    setFormData({ name: '', trigger: '', action: '', iconType: 'default' });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
       
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
           <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                   <Zap className="text-yellow-500 fill-yellow-500" /> Automations
               </h1>
               <p className="text-gray-500 dark:text-gray-400 mt-2">Streamline your workflow with "If This Then That" rules.</p>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
           >
               <Plus size={20} /> New Rule
           </button>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           {rules.map((rule) => (
               <AutomationCard 
                 key={rule.id} 
                 rule={rule} 
                 onToggle={() => handleToggle(rule.id)}
                 onDelete={() => handleDelete(rule.id)}
                 onRun={() => handleRunNow(rule.id)}
                 isLoading={loadingId === rule.id}
                 isRunning={runningId === rule.id}
               />
           ))}
       </div>

       {/* Create Modal */}
       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Automation</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSaveRule} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rule Name</label>
                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Weekly Report" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trigger (IF)</label>
                        <input required value={formData.trigger} onChange={e => setFormData({...formData, trigger: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Task is Overdue" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action (THEN)</label>
                        <input required value={formData.action} onChange={e => setFormData({...formData, action: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Email Manager" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
                        <select value={formData.iconType} onChange={e => setFormData({...formData, iconType: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="default">Default</option>
                            <option value="slack">Slack</option>
                            <option value="mail">Email</option>
                            <option value="task">Task</option>
                            <option value="github">GitHub</option>
                            <option value="time">Clock/Time</option>
                            <option value="alert">Alert</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-4">
                        <Save size={18} /> Create Rule
                    </button>
                </form>
            </div>
         </div>
       )}
    </div>
  );
}

// --- Sub-Component: Rule Card with Dropdown ---
function AutomationCard({ rule, onToggle, onDelete, onRun, isLoading, isRunning }: any) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Click outside to close menu
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch(type) {
            case 'slack': return <Slack className="text-purple-500" />;
            case 'mail': return <Mail className="text-blue-500" />;
            case 'task': return <CheckCircle2 className="text-emerald-500" />;
            case 'github': return <Github className="text-gray-900 dark:text-white" />;
            case 'time': return <Clock className="text-orange-500" />;
            case 'alert': return <AlertTriangle className="text-red-500" />;
            default: return <Zap className="text-yellow-500" />;
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border transition-all duration-300 hover:shadow-xl relative ${rule.active ? 'border-indigo-100 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-80 grayscale-[0.5]'}`}>
            
            {/* Top Row */}
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm">
                    {getIcon(rule.iconType)}
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Toggle Switch */}
                    <button 
                        onClick={onToggle}
                        disabled={isLoading}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${rule.active ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'} ${isLoading ? 'cursor-wait opacity-70' : ''}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${rule.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <MoreVertical size={20} />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => { onRun(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                                    <Play size={14} /> Run Now
                                </button>
                                <button onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center gap-2">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 line-clamp-1" title={rule.name}>{rule.name}</h3>
            
            {/* Logic Block */}
            <div className="space-y-3 relative">
                <div className="flex items-center gap-3 text-sm p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 group cursor-default">
                    <span className="font-mono text-[10px] font-bold text-gray-400 uppercase bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">IF</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{rule.trigger}</span>
                </div>
                
                <div className="absolute left-6 top-[38px] w-0.5 h-4 bg-gray-200 dark:bg-gray-700 z-0"></div>
                
                <div className="flex items-center gap-3 text-sm p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 group cursor-default relative z-10">
                    <span className="font-mono text-[10px] font-bold text-indigo-500 uppercase bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 px-1.5 py-0.5 rounded">THEN</span>
                    <span className="text-indigo-900 dark:text-indigo-300 font-medium truncate">{rule.action}</span>
                </div>
            </div>

            {/* Footer Status */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${rule.active ? 'text-emerald-500' : 'text-gray-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${rule.active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    {rule.active ? 'Active' : 'Paused'}
                </span>
                
                {isRunning ? (
                    <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium animate-pulse">
                        <Loader2 size={12} className="animate-spin" /> Running...
                    </div>
                ) : (
                    <span className="text-xs text-gray-400 font-medium">
                        Last run: {rule.lastRun || 'Never'}
                    </span>
                )}
            </div>
        </div>
    );
}
```

### `src\app\pages\Calendar.tsx`

```tsx
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface CalendarTask {
  id: string;
  title: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, due_date, priority, status')
        .not('due_date', 'is', null);

      if (error) {
        console.warn('Could not fetch calendar tasks (verify table exists):', error.message);
        setTasks([]);
        return;
      }
      if (data) setTasks(data);
    } catch (error) {
      console.error('Error fetching calendar tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <CalendarIcon className="text-indigo-600" /> 
            {monthName} {year}
          </h1>
          <p className="text-gray-500">View and manage your upcoming deadlines.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-1 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-md transition-colors">
            <Plus size={18} /> Add Event
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : (
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-900/20"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayTasks = getTasksForDay(day);
              const isToday = 
                day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div key={day} className="min-h-[100px] border-b border-r border-gray-100 dark:border-gray-700/50 p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/20 group relative">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300'}`}>
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[10px] text-gray-400 font-medium">{dayTasks.length} tasks</span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {dayTasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`text-[10px] px-2 py-1 rounded border truncate font-medium cursor-pointer ${getPriorityColor(task.priority)}`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

### `src\app\pages\Dashboard.tsx`

```tsx
import { useEffect, useState } from 'react';
import {
  Users, FolderKanban, CheckSquare, Activity,
  ArrowUpRight, ArrowDownRight, PlusCircle, CheckCircle2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import CreateProjectModal from '../components/CreateProjectModal';

interface ActivityItem {
  id: string;
  title: string;
  status: string;
  created_at: string;
  type: 'task'; 
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUsers: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for the Create Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Define fetchData outside useEffect so we can refresh data after creating a project
  const fetchData = async () => {
    try {
      // 1. Get Project Count
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // 2. Get User Count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 3. Get Task Stats
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status');

      const total = tasks?.length || 0;
      const completed = tasks?.filter(t => t.status === 'done').length || 0;

      setStats({
        totalProjects: projectCount || 0,
        totalUsers: userCount || 0,
        totalTasks: total,
        completedTasks: completed
      });

      // 4. Get Recent Activity (Last 5 created tasks)
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentTasks) {
          const activity: ActivityItem[] = recentTasks.map(t => ({
              id: t.id,
              title: t.title,
              status: t.status,
              created_at: t.created_at,
              type: 'task'
          }));
          setRecentActivity(activity);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Projects" 
          value={loading ? "..." : stats.totalProjects} 
          icon={<FolderKanban className="text-indigo-600" size={24} />}
          trend="+2.5%" 
          trendUp={true}
        />
        <StatCard 
          title="Team Members" 
          value={loading ? "..." : stats.totalUsers} 
          icon={<Users className="text-emerald-600" size={24} />}
          trend="+12%" 
          trendUp={true}
        />
        <StatCard 
          title="Total Tasks" 
          value={loading ? "..." : stats.totalTasks} 
          icon={<CheckSquare className="text-blue-600" size={24} />}
          trend="+5" 
          trendUp={true}
        />
        <StatCard 
          title="Completion Rate" 
          value={loading ? "..." : `${stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`} 
          icon={<Activity className="text-purple-600" size={24} />}
          trend="+4%" 
          trendUp={true}
        />
      </div>

      {/* Activity & Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Real Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            
            {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>)}
                </div>
            ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No recent activity found.</div>
            ) : (
                <div className="space-y-4">
                    {recentActivity.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 text-sm group cursor-default">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                item.status === 'done' 
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' 
                                : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
                            }`}>
                                {item.status === 'done' ? <CheckCircle2 size={14}/> : <PlusCircle size={14}/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-900 dark:text-white font-medium truncate">
                                    {item.status === 'done' ? 'Completed task:' : 'New task created:'} <span className="text-gray-600 dark:text-gray-300">{item.title}</span>
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{item.status} • {new Date(item.created_at).toLocaleDateString()}</p>
                            </div>
                            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                View
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Quick Actions Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-xl mb-2">Ready to work?</h3>
                <p className="text-indigo-100 text-sm mb-6">Create a new project or invite your team members to get started.</p>
            </div>
            <div className="flex gap-3">
                <button 
                  onClick={() => setIsProjectModalOpen(true)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors"
                >
                    + New Project
                </button>
                <button className="bg-indigo-500/50 hover:bg-indigo-500/70 text-white px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors">
                    Invite Team
                </button>
            </div>
        </div>
      </div>

      {/* Include the Modal at the bottom */}
      <CreateProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)}
        onProjectCreated={() => {
           fetchData(); // Refresh the stats when a new project is made!
        }}
      />
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-50 text-red-600'}`}>
          {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}
```

### `src\app\pages\ForgotPassword.tsx`

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient'; // <--- Real DB Connection

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');
  
  // Timer for Resend
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('loading');
    
    try {
        // 1. Send Reset Request to Supabase
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // This is where users are sent after clicking the link
            // For now, we redirect to home, where they will be logged in automatically
            redirectTo: window.location.origin, 
        });

        if (error) {
            // Supabase security: It often doesn't reveal if an email exists or not
            // to prevent scraping. But if there's a real error (like rate limit), we show it.
            throw error;
        }

        // 2. Show Success Message
        setStatus('success');
        setCountdown(60); 

    } catch (err: any) {
        setError(err.message || 'Failed to send reset email.');
        setStatus('idle');
    }
  };

  const handleResend = () => {
     if (countdown === 0) {
         handleSubmit({ preventDefault: () => {} } as React.FormEvent);
     }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-center animate-in zoom-in-95 duration-300">
          <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10">
            <CheckCircle size={40} className="animate-in zoom-in duration-500 delay-150" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            We sent a password reset link to <br/>
            <span className="font-semibold text-gray-900 dark:text-white">{email}</span>
          </p>
          
          <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Didn't receive it?</span>
                  <button 
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className={`font-semibold transition-colors ${countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-700 hover:underline'}`}
                  >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Click to resend'}
                  </button>
              </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center justify-center gap-2 transition-colors">
                <ArrowLeft size={16} /> Back to Login
              </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mb-8 transition-colors group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Login
        </Link>
        
        <div className="mb-8">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Lock size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-500 dark:text-gray-400">Enter your email and we'll send you instructions to reset your password.</p>
        </div>

        {error && (
            <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 flex items-start gap-3 animate-shake">
                <div className="mt-0.5"><Mail size={16} /></div>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                  <Mail size={18} />
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white placeholder:text-gray-400" 
                placeholder="name@company.com" 
                required 
              />
            </div>
          </div>
          
          <button 
            disabled={status === 'loading'} 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
          >
             {status === 'loading' ? (
                 <>Sending Link <span className="animate-pulse">...</span></>
             ) : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### `src\app\pages\Login.tsx`

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Redirect to dashboard or team page after login
      navigate('/dashboard'); 
      
    } catch (error: any) {
      alert(error.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 mb-4">
               <LogIn size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to continue to ProjectFlow</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <a href="#" className="text-xs text-indigo-600 hover:underline">Forgot password?</a>
                  <Link to="/forgot-password" className="text-xs text-indigo-600 hover:underline">Forgot password?</Link>
              </div>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:underline font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### `src\app\pages\Messages.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Send, Hash, Search, Plus, Smile, MessageSquare,
  Menu, X, ExternalLink
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useTyping } from '../../hooks/useTyping';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import TypingIndicator from '../components/TypingIndicator';
import ChatFileButton from '../components/ChatFileButton';
import MessageBubble from '../components/MessageBubble';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  file_url?: string;
  file_type?: string;
  is_edited?: boolean;
  user?: { name: string; avatar: string };
  message_reactions?: { id: string; emoji: string; user_id: string }[];
}

interface TeamUser {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: 'room_1', name: 'general', description: 'Company-wide discussion and updates' },
  { id: 'room_dev', name: 'development', description: 'Tech stack, architecture & bug tracking' },
  { id: 'room_design', name: 'design', description: 'UI/UX specs, Figma boards & creative work' },
  { id: 'room_random', name: 'random', description: 'Coffee chats, memes & watercooler conversations' },
];

export default function Messages() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const currentRoomId = roomId || 'room_1';

  // Online Presence
  const onlineUserIds = useOnlineUsers();

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [channels, setChannels] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('projectflow_channels');
    return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
  });

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { typingUsers, broadcastTyping } = useTyping(currentRoomId);

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowInputEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Team Users for Direct Messages list
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('users').select('id, name, avatar, email, role');
      if (data && !error) setUsers(data);
    }
    fetchUsers();
  }, []);

  // Subscribe to Messages and Reactions
  useEffect(() => {
    setMessages([]);
    fetchMessages();

    const channel = supabase
      .channel(`chat_${currentRoomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${currentRoomId}` },
        (payload) => handleMessageChange(payload)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoomId]);

  // Auto-scroll on new message or typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typingUsers]);

  const handleMessageChange = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      const { data: userData } = await supabase.from('users').select('name, avatar').eq('id', payload.new.user_id).single();
      setMessages((prev) => [...prev, { ...payload.new, user: userData, message_reactions: [] }]);
    }
    if (payload.eventType === 'DELETE') {
      setMessages((prev) => prev.filter(msg => msg.id !== payload.old.id));
    }
    if (payload.eventType === 'UPDATE') {
      setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? { ...msg, ...payload.new } : msg));
    }
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, user:users(name, avatar), message_reactions(*)')
      .eq('room_id', currentRoomId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const content = newMessage.trim();
    setNewMessage('');
    setShowInputEmojiPicker(false);

    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId,
      user_id: user.id,
      content: content,
    });

    if (error) {
      toast.error('Failed to send message');
      setNewMessage(content);
    }
  };

  const handleFileUpload = async (url: string, type: string) => {
    if (!user) return;
    const { error } = await supabase.from('messages').insert({
      room_id: currentRoomId,
      user_id: user.id,
      content: type === 'image' ? 'Shared an image' : 'Shared an attachment',
      file_url: url,
      file_type: type
    });

    if (error) {
      toast.error('Failed to share file');
    } else {
      toast.success('File shared in chat');
    }
  };

  const handleEdit = async (id: string, newContent: string) => {
    await supabase.from('messages').update({ content: newContent, is_edited: true }).eq('id', id);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('messages').delete().eq('id', id);
    toast.success('Message deleted');
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('message_reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .single();

    if (existing) {
      await supabase.from('message_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('message_reactions').insert({
        message_id: messageId,
        user_id: user.id,
        emoji: emoji
      });
    }
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedName = newChannelName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!formattedName) return;

    const newChannel: Channel = {
      id: `room_${formattedName}`,
      name: formattedName,
      description: newChannelDesc.trim() || 'Custom discussion channel'
    };

    const updated = [...channels, newChannel];
    setChannels(updated);
    localStorage.setItem('projectflow_channels', JSON.stringify(updated));

    setIsAddChannelOpen(false);
    setNewChannelName('');
    setNewChannelDesc('');
    toast.success(`Channel #${formattedName} created!`);
    navigate(`/messages/${newChannel.id}`);
  };

  // Determine current conversation type (Channel vs DM)
  const isDM = currentRoomId.startsWith('dm_');
  let dmRecipient: TeamUser | undefined;
  if (isDM && user) {
    const parts = currentRoomId.replace('dm_', '').split('_');
    const recipientId = parts.find(id => id !== user.id) || parts[0];
    dmRecipient = users.find(u => u.id === recipientId);
  }

  const currentChannel = channels.find(c => c.id === currentRoomId);

  // Helper to construct DM room id
  const getDMRoomId = (otherUserId: string) => {
    if (!user) return 'room_1';
    const ids = [user.id, otherUserId].sort();
    return `dm_${ids[0]}_${ids[1]}`;
  };

  // Filtered lists for search
  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = users.filter(u => u.id !== user?.id && (
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 overflow-hidden relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- CONVERSATIONS SIDEBAR --- */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-72 md:w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <MessageSquare size={16} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-white">Conversations</h2>
              <p className="text-[11px] text-gray-500">{channels.length} channels • {users.length} members</p>
            </div>
          </div>

          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat or people..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Channels & DMs List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {/* Channels Section */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Channels</span>
              <button
                onClick={() => setIsAddChannelOpen(true)}
                className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                title="Create Channel"
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-0.5">
              {filteredChannels.map(ch => {
                const isActive = currentRoomId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => {
                      navigate(`/messages/${ch.id}`);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <Hash size={15} className={isActive ? 'text-white' : 'text-gray-400'} />
                    <span className="truncate flex-1">{ch.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="px-2 mb-1.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Direct Messages</span>
            </div>

            <div className="space-y-0.5">
              {filteredUsers.map(u => {
                const dmId = getDMRoomId(u.id);
                const isActive = currentRoomId === dmId;
                const isOnline = onlineUserIds.has(u.id);

                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      navigate(`/messages/${dmId}`);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}&background=6366f1&color=fff`}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white dark:border-gray-800 ${
                        isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className={`text-[10px] truncate ${isActive ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {u.role || 'Member'}
                      </p>
                    </div>
                  </button>
                );
              })}

              {filteredUsers.length === 0 && (
                <p className="text-[11px] text-gray-400 px-3 py-2">No members found.</p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT WORKSPACE --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Dynamic Chat Header */}
        <div className="h-16 px-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu size={18} />
            </button>

            {isDM && dmRecipient ? (
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <img
                    src={dmRecipient.avatar || `https://ui-avatars.com/api/?name=${dmRecipient.name}`}
                    alt={dmRecipient.name}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                  />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
                    onlineUserIds.has(dmRecipient.id) ? 'bg-emerald-500' : 'bg-gray-400'
                  }`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-sm text-gray-900 dark:text-white truncate">{dmRecipient.name}</h1>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {dmRecipient.role || 'Member'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    {onlineUserIds.has(dmRecipient.id) ? (
                      <span className="text-emerald-500 font-medium">Active now</span>
                    ) : (
                      <span>Offline</span>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Hash size={18} className="text-indigo-600 dark:text-indigo-400" />
                  <h1 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                    {currentChannel?.name || currentRoomId}
                  </h1>
                </div>
                <p className="text-[11px] text-gray-500 truncate max-w-md">
                  {currentChannel?.description || 'Team real-time collaboration channel'}
                </p>
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2">
            {isDM && dmRecipient && (
              <Link
                to={`/profile/${dmRecipient.id}`}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
              >
                Profile <ExternalLink size={12} />
              </Link>
            )}
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-gray-50/60 dark:bg-gray-900">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center mb-3">
                <MessageSquare size={24} />
              </div>
              <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                {isDM ? `This is the start of your direct conversation with ${dmRecipient?.name || 'them'}.` : `Welcome to #${currentChannel?.name || currentRoomId}!`}
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">Send a message or share a document to start collaborating in real time.</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.user_id === user?.id;
            const prevMsg = messages[index - 1];
            const showHeader = index === 0 || (prevMsg?.user_id !== msg.user_id);

            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-8 shrink-0 flex flex-col justify-end">
                  {showHeader && !isMe && (
                    <img 
                      src={msg.user?.avatar || `https://ui-avatars.com/api/?name=${msg.user?.name || 'User'}`} 
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm object-cover" 
                      alt="avatar" 
                    />
                  )}
                </div>

                <div className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}>
                  {showHeader && !isMe && (
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 ml-1 mb-1">
                      {msg.user?.name}
                    </span>
                  )}
                  
                  <MessageBubble 
                    message={msg} 
                    isMe={isMe} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                    onReact={handleReaction} 
                  />
                  
                  <span className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing & Input Bar */}
        <div className="p-3 md:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 relative">
          <div className="h-5 mb-1">
            <TypingIndicator users={typingUsers} />
          </div>

          {/* Input Emoji Picker Popover */}
          {showInputEmojiPicker && (
            <div 
              ref={emojiPickerRef} 
              className="absolute bottom-20 left-4 md:left-12 z-50 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            >
              <EmojiPicker
                theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                onEmojiClick={(emojiData: EmojiClickData) => {
                  setNewMessage(prev => prev + emojiData.emoji);
                }}
                width={320}
                height={380}
                lazyLoadEmojis={true}
                searchPlaceHolder="Search emoji..."
              />
            </div>
          )}

          <form onSubmit={sendMessage} className="flex gap-2 items-center max-w-5xl mx-auto">
            <ChatFileButton onUploadComplete={handleFileUpload} />

            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={() => broadcastTyping()}
                placeholder={isDM ? `Message ${dmRecipient?.name || '...'}` : `Message #${currentChannel?.name || currentRoomId}...`}
                className="w-full pl-4 pr-20 py-3 bg-gray-100 dark:bg-gray-900 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 dark:text-white transition-all placeholder-gray-400"
              />

              <div className="absolute right-2.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowInputEmojiPicker(!showInputEmojiPicker)}
                  className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-gray-200/50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Insert emoji"
                >
                  <Smile size={18} />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-sm active:scale-95"
                  title="Send"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* --- CREATE CHANNEL MODAL --- */}
      {isAddChannelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Create New Channel</h3>
              <button onClick={() => setIsAddChannelOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Channel Name *</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-gray-400 font-bold">#</span>
                  <input
                    required
                    autoFocus
                    type="text"
                    placeholder="announcements"
                    value={newChannelName}
                    onChange={e => setNewChannelName(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="What is this channel about?"
                  value={newChannelDesc}
                  onChange={e => setNewChannelDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsAddChannelOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChannelName.trim()}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

### `src\app\pages\MyTasks.tsx`

```tsx
import { useState, useEffect } from 'react';
import {
  CheckCircle2, Circle, Clock, Trash2, Plus,
  ArrowUpDown, ChevronLeft, ChevronRight, X,
  LayoutGrid, List, Loader2, ArrowRight, FolderKanban
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at?: string;
  project_id?: string;
  project?: { name: string };
  assigned_to?: string;
}

const COLUMNS: { id: Task['status']; label: string; dot: string; color: string }[] = [
  { id: 'todo', label: 'To Do', dot: 'bg-gray-400', color: 'text-gray-700 dark:text-gray-300' },
  { id: 'inProgress', label: 'In Progress', dot: 'bg-indigo-500', color: 'text-indigo-700 dark:text-indigo-400' },
  { id: 'review', label: 'Review', dot: 'bg-amber-500', color: 'text-amber-700 dark:text-amber-400' },
  { id: 'done', label: 'Done', dot: 'bg-emerald-500', color: 'text-emerald-700 dark:text-emerald-400' },
];

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-sm'
          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

const priorityScore: Record<string, number> = { high: 3, medium: 2, low: 1 };

export default function MyTasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [newTaskInput, setNewTaskInput] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  
  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, project:projects(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTasks(data as Task[]);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    const channel = supabase
      .channel('my_tasks_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  // --- TASK HANDLERS ---
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    const title = newTaskInput.trim();

    try {
      const newTask = {
        title,
        status: 'todo' as const,
        priority: 'medium' as const,
        due_date: selectedDate ? selectedDate.toISOString() : null,
        assigned_to: user?.id || null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select('*, project:projects(name)')
        .single();

      if (error) throw error;
      if (data) {
        setTasks(prev => [data as Task, ...prev]);
        toast.success('Task created successfully');
        setNewTaskInput('');
      }
    } catch (err: any) {
      toast.error('Failed to create task');
      fetchTasks();
      setNewTaskInput('');
    }
  };

  const toggleTaskComplete = async (taskId: string, isCurrentlyDone: boolean) => {
    const newStatus: Task['status'] = isCurrentlyDone ? 'todo' : 'done';
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
      toast.success(isCurrentlyDone ? 'Task marked as pending' : 'Task completed! 🎉');
    } catch (err) {
      toast.error('Failed to update task');
      fetchTasks();
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
      toast.success(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.label}`);
    } catch (err) {
      toast.error('Failed to update status');
      fetchTasks();
    }
  };

  const toggleTaskSelection = (id: string) => {
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const deleteSelected = async () => {
    if (!window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) return;
    const toDelete = [...selectedTasks];
    setSelectedTasks([]);
    setTasks(prev => prev.filter(t => !toDelete.includes(t.id)));

    try {
      const { error } = await supabase.from('tasks').delete().in('id', toDelete);
      if (error) throw error;
      toast.success('Selected tasks deleted');
    } catch (err) {
      toast.error('Failed to delete tasks');
      fetchTasks();
    }
  };

  const markSelectedComplete = async () => {
    const toComplete = [...selectedTasks];
    setSelectedTasks([]);
    setTasks(prev => prev.map(t => toComplete.includes(t.id) ? { ...t, status: 'done' } : t));

    try {
      const { error } = await supabase.from('tasks').update({ status: 'done' }).in('id', toComplete);
      if (error) throw error;
      toast.success('Selected tasks completed');
    } catch (err) {
      toast.error('Failed to update tasks');
      fetchTasks();
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900';
      case 'medium': return 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900';
    }
  };

  // Filter Tasks
  const processedTasks = tasks
    .filter(t => {
      if (filter === 'pending') return t.status !== 'done';
      if (filter === 'completed') return t.status === 'done';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return (priorityScore[b.priority] || 1) - (priorityScore[a.priority] || 1);
      }
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return 0;
    });

  // Next status progression helper
  const getNextStatus = (current: Task['status']): Task['status'] | null => {
    switch (current) {
      case 'todo': return 'inProgress';
      case 'inProgress': return 'review';
      case 'review': return 'done';
      case 'done': return null;
      default: return null;
    }
  };

return (
    <div className="flex h-full">
      {/* MAIN TASKS WORKSPACE */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col h-full relative custom-scrollbar">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Tasks</h1>
            {selectedDate ? (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5 cursor-pointer font-medium hover:underline" onClick={() => setSelectedDate(null)}>
                Filtered for {selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} <X size={13} />
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Track and complete your personal & project deliverables.</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mr-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'board' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Board View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'priority' : 'date')}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowUpDown size={13} />
              Sort: {sortBy === 'date' ? 'Due Date' : 'Priority'}
            </button>

            <FilterBtn label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterBtn label="Pending" active={filter === 'pending'} onClick={() => setFilter('pending')} />
            <FilterBtn label="Done" active={filter === 'completed'} onClick={() => setFilter('completed')} />
          </div>
        </div>

        {/* Quick Add Task Input */}
        <form onSubmit={addTask} className="mb-6 relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Plus className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          </div>
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add a new task..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-transparent focus:border-indigo-500 rounded-xl shadow-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all"
          />
        </form>

        {/* Tasks View: Loading State */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
          </div>
        ) : viewMode === 'list' ? (
          /* --- LIST VIEW --- */
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex-1 mb-16">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {processedTasks.map((task) => {
                const isDone = task.status === 'done';
                const isSelected = selectedTasks.includes(task.id);

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 transition-colors group ${
                      isSelected ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                    }`}
                    onClick={() => toggleTaskSelection(task.id)}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleTaskComplete(task.id, isDone); }}
                        className={`shrink-0 transition-transform active:scale-90 ${isDone ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600 hover:text-indigo-500'}`}
                      >
                        {isDone ? <CheckCircle2 size={22} className="fill-emerald-50 dark:fill-emerald-950/40" /> : <Circle size={22} />}
                      </button>

                      <div className="min-w-0">
                        <h3 className={`font-semibold text-sm text-gray-900 dark:text-white truncate transition-all ${isDone ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-0.5">
                          {task.project?.name ? (
                            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                              <FolderKanban size={11} /> {task.project.name}
                            </span>
                          ) : (
                            <span>Inbox</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>

                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                          <Clock size={12} />
                          <span>{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}

                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value as Task['status'])}
                        className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg px-2 py-1 outline-none border border-transparent focus:border-indigo-500"
                      >
                        {COLUMNS.map(col => (
                          <option key={col.id} value={col.id}>{col.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}

              {processedTasks.length === 0 && (
                <div className="py-16 text-center text-gray-400 text-xs">
                  No tasks matching your current filter.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- BOARD VIEW --- */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 mb-16 items-start">
            {COLUMNS.map(col => {
              const colTasks = processedTasks.filter(t => t.status === col.id);
              return (
                <div key={col.id} className="bg-gray-100/70 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700/70 p-3.5 flex flex-col min-h-[450px]">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                      <span className={`font-bold text-xs ${col.color}`}>{col.label}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {colTasks.length}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                    {colTasks.map(task => {
                      const next = getNextStatus(task.status);
                      return (
                        <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-3.5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(task.priority)}`}>
                              {task.priority}
                            </span>
                            {task.project?.name && (
                              <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 truncate max-w-[100px]">
                                {task.project.name}
                              </span>
                            )}
                          </div>

                          <h4 className="font-semibold text-xs text-gray-900 dark:text-white leading-snug mb-2">
                            {task.title}
                          </h4>

                          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/60 text-[11px]">
                            {task.due_date ? (
                              <span className="text-gray-400 flex items-center gap-1 text-[10px]">
                                <Clock size={11} />
                                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            ) : <span className="text-gray-400 text-[10px]">—</span>}

                            {next && (
                              <button
                                onClick={() => handleUpdateStatus(task.id, next)}
                                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                              >
                                Advance <ArrowRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {colTasks.length === 0 && (
                      <div className="py-8 text-center text-gray-400 text-[11px] border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* BULK ACTIONS BAR */}
        {selectedTasks.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-200 z-30">
            <span className="font-medium text-xs text-gray-300">{selectedTasks.length} selected</span>
            <div className="h-4 w-px bg-gray-700"></div>
            <button onClick={markSelectedComplete} className="text-xs font-semibold hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Mark Complete
            </button>
            <button onClick={deleteSelected} className="text-xs font-semibold hover:text-red-400 transition-colors flex items-center gap-1.5">
              <Trash2 size={14} /> Delete
            </button>
            <button onClick={() => setSelectedTasks([])} className="p-1 text-gray-400 hover:text-white rounded-full">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* MINI CALENDAR SIDEBAR */}
      <div className="w-72 border-l border-gray-200 dark:border-gray-800 p-5 hidden xl:flex flex-col bg-white dark:bg-gray-800/40">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <div className="flex gap-1">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7 w-7" />
          ))}

          {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
            const day = i + 1;
            const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isToday = isSameDay(dateObj, new Date());
            const isSelected = selectedDate && isSameDay(dateObj, selectedDate);

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateObj)}
                className={`h-7 w-7 rounded-full text-xs font-medium flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold'
                    : isToday
                      ? 'border border-indigo-600 text-indigo-600 font-bold'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Task Overview</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Total Tasks</span>
              <span className="font-bold text-gray-900 dark:text-white">{tasks.length}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Completed</span>
              <span className="font-bold text-emerald-600">{tasks.filter(t => t.status === 'done').length}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>In Progress</span>
              <span className="font-bold text-indigo-600">{tasks.filter(t => t.status === 'inProgress').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### `src\app\pages\Notifications.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Bell, Clock, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    
    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    // 1. Update UI instantly
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    
    // 2. Update DB
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const deleteNotification = async (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await supabase.from('notifications').delete().eq('id', id);
  };

  // Helper to get icon based on type
  const getIcon = (type: string) => {
      switch(type) {
          case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
          case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
          default: return <Info className="text-indigo-500" size={20} />;
      }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-500">Stay updated with your team activity.</p>
        </div>
        <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Bell size={18} />
            {notifications.filter(n => !n.is_read).length} Unread
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
            <p className="text-gray-500">Loading updates...</p>
        ) : notifications.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">All caught up!</h3>
                <p className="text-gray-500">No new notifications for you.</p>
            </div>
        ) : (
            notifications.map((n) => (
                <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                        n.is_read 
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60' 
                        : 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-800 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="flex gap-4">
                        <div className={`mt-1 p-2 rounded-full ${n.is_read ? 'bg-gray-100 dark:bg-gray-800' : 'bg-indigo-50 dark:bg-indigo-900/20'}`}>
                            {getIcon(n.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className={`font-semibold ${n.is_read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                    {n.title}
                                </h4>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    {new Date(n.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                        </div>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                        >
                            <span className="text-xs font-bold">✕</span>
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
```

### `src\app\pages\Profile.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; // To read URL parameters
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Save, CheckCircle2, Mail, Camera, ChevronDown, MapPin, X, Globe, Lock } from 'lucide-react';

export default function Profile() {
  const { user: currentUser } = useAuth();
  const { id } = useParams(); // Get ID from URL (e.g. /profile/123)
  
  // LOGIC: If ID is present in URL, view that user. Otherwise, view "Me".
  const targetUserId = id || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetUserId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Avatar Selection State
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    role: 'Member',
    avatar: '/pfp.jpg',
    location: '',
    phone: '',
    bio: '',     // <--- New Field
    website: ''  // <--- New Field
  });

  // Image Fallback Handler
  const handleImageError = (e: any) => {
    e.target.src = `https://ui-avatars.com/api/?name=${formData.name}&background=6366f1&color=fff`;
  };

  const avatars = [
    { src: '/male.jpg', label: 'Male' },
    { src: '/female.jpg', label: 'Female' },
    { src: '/pfp.jpg', label: 'Default' },
  ];

  const roles = [
    "Member", "Developer", "Senior Developer", "Designer", 
    "Product Manager", "Project Manager", "Admin", "Intern"
  ];

  // 1. Fetch Profile Data
  useEffect(() => {
    if (targetUserId) {
      const fetchProfile = async () => {
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', targetUserId)
            .single();

          if (data) {
            setFormData({
              name: data.name || '',
              email: data.email || '',
              role: data.role || 'Member',
              avatar: data.avatar || '/pfp.jpg',
              location: data.location || '',
              phone: data.phone || '',
              bio: data.bio || '',
              website: data.website || ''
            });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [targetUserId]);

  // Close avatar menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Save Changes (Only if Own Profile)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnProfile || !currentUser) return; // Security Check

    setSaving(true);
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          role: formData.role,
          avatar: formData.avatar,
          location: formData.location,
          phone: formData.phone,
          bio: formData.bio,
          website: formData.website
        })
        .eq('id', currentUser.id);

      if (error) throw error;
      
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
  }

  return (
    <div className="relative min-h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      
      {/* PROFESSIONAL BACKGROUND (Abstract Shapes) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-500/5 blur-3xl"></div>
          <div className="absolute top-[10%] right-[0%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-3xl"></div>
      </div>

      <div className="relative p-6 md:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
               {isOwnProfile ? 'My Profile' : `${formData.name}'s Profile`}
             </h1>
             <p className="text-gray-500 dark:text-gray-400 mt-1">
               {isOwnProfile ? 'Manage your identity and team presence.' : 'View team member details.'}
             </p>
          </div>
          
          {!isOwnProfile && (
             <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                <Lock size={14} /> View Only Mode
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: PROFILE CARD (3D Effect) --- */}
          <div className="lg:col-span-4 space-y-6">
             {/* The Card */}
             <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 perspective-1000">
                 
                 {/* Card Background Gradient */}
                 <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 z-0"></div>
                 
                 {/* Avatar */}
                 <div className="relative z-10 mx-auto w-32 h-32 mb-4 group-hover:scale-105 transition-transform duration-500">
                     <img 
                       src={formData.avatar} 
                       onError={handleImageError} // <--- FIX: Handles broken images
                       alt="Profile" 
                       className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg bg-white" 
                     />
                     <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
                 </div>

                 <div className="relative z-10 text-center">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{formData.name}</h2>
                     <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-6">{formData.role}</p>
                     
                     <div className="space-y-4 text-left bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                         {formData.bio && (
                             <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-4">"{formData.bio}"</p>
                         )}
                         <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                             <Mail size={16} className="text-gray-400 shrink-0" />
                             <span className="truncate">{formData.email}</span>
                         </div>
                         {formData.location && (
                             <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                 <MapPin size={16} className="text-gray-400 shrink-0" />
                                 <span>{formData.location}</span>
                             </div>
                         )}
                         {formData.website && (
                             <div className="flex items-center gap-3 text-sm text-indigo-600 dark:text-indigo-400">
                                 <Globe size={16} className="shrink-0" />
                                 <a href={formData.website} target="_blank" rel="noreferrer" className="truncate hover:underline">{formData.website}</a>
                             </div>
                         )}
                     </div>
                 </div>
             </div>
          </div>

          {/* --- RIGHT COLUMN: EDIT FORM --- */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isOwnProfile ? 'Edit Details' : 'Professional Details'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {isOwnProfile ? 'Update your personal information' : 'View Only Mode'}
                    </p>
                </div>
                {isOwnProfile && (
                 <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-70"
                   >
                     {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                     Save
                 </button>
                )}
              </div>
              
              <form onSubmit={handleSave} className="p-8 space-y-8">
                
                {/* 1. Avatar Selection (Only visible if Own Profile) */}
                {isOwnProfile && (
                    <div className="flex items-start gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
                        <div className="relative" ref={avatarRef}>
                            <div 
                               onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                               className="relative w-20 h-20 rounded-2xl overflow-hidden cursor-pointer group ring-4 ring-transparent hover:ring-indigo-100 dark:hover:ring-indigo-900 transition-all"
                            >
                                <img src={formData.avatar} onError={handleImageError} className="w-full h-full object-cover bg-gray-100" alt="Current" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="text-white" size={20} />
                                </div>
                            </div>

                            {isAvatarMenuOpen && (
                                <div className="absolute top-full left-0 mt-3 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 w-64 animate-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Select Avatar</span>
                                        <button onClick={(e) => { e.preventDefault(); setIsAvatarMenuOpen(false); }} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {avatars.map((av) => (
                                            <button 
                                                key={av.src}
                                                type="button"
                                                onClick={() => { setFormData({ ...formData, avatar: av.src }); setIsAvatarMenuOpen(false); }}
                                                className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${formData.avatar === av.src ? 'border-indigo-600' : 'border-transparent hover:border-gray-300'}`}
                                            >
                                                <img src={av.src} alt={av.label} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">Profile Photo</h4>
                            <p className="text-sm text-gray-500 mb-2">Click to choose from our professional presets.</p>
                        </div>
                    </div>
                )}

                {/* 2. Main Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input 
                      disabled={!isOwnProfile}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Job Role</label>
                    <div className="relative">
                        <select 
                          disabled={!isOwnProfile}
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {roles.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-3 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Short Bio</label>
                    <textarea 
                      disabled={!isOwnProfile}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={2}
                      placeholder="Tell us a little about yourself..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                     <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input 
                            disabled={!isOwnProfile}
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="e.g. New York, USA"
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Website / Portfolio</label>
                     <div className="relative">
                        <Globe className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input 
                            disabled={!isOwnProfile}
                            value={formData.website}
                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="https://..."
                        />
                     </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <input 
                      disabled
                      value={formData.email}
                      className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Feedback Message */}
                {successMsg && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                      <CheckCircle2 size={20} />
                      <span className="font-medium">{successMsg}</span>
                  </div>
                )}

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### `src\app\pages\ProjectDetail.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FolderKanban, Calendar, Plus,
  Loader2, Clock, Trash2, Edit3, ChevronRight, LayoutGrid, List,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  due_date?: string;
  created_at?: string;
  owner_id?: string;
  progress?: number;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'inProgress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at?: string;
  project_id?: string;
  assigned_to?: string;
  user?: { id: string; name: string; avatar: string };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const COLUMNS: { id: TaskItem['status']; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'todo', label: 'To Do', color: 'text-gray-700 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800/60', dot: 'bg-gray-400' },
  { id: 'inProgress', label: 'In Progress', color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50/70 dark:bg-indigo-950/30', dot: 'bg-indigo-500' },
  { id: 'review', label: 'Review', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50/70 dark:bg-amber-950/30', dot: 'bg-amber-500' },
  { id: 'done', label: 'Done', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30', dot: 'bg-emerald-500' },
];

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  // New Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskItem['status']>('todo');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  // Edit Project Form State
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  const [editDueDate, setEditDueDate] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectData();
      fetchTeamMembers();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Project Info
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) {
        toast.error('Project not found');
        navigate('/projects');
        return;
      }

      setProject(projectData);
      setEditName(projectData.name || '');
      setEditDescription(projectData.description || '');
      setEditStatus(projectData.status || 'active');
      setEditDueDate(projectData.due_date ? projectData.due_date.split('T')[0] : '');

      // 2. Fetch Project Tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*, user:users(id, name, avatar)')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.warn('Could not query tasks by project_id, falling back to all tasks:', tasksError.message);
        setTasks([]);
      } else if (tasksData) {
        setTasks(tasksData);
      }
    } catch (err: any) {
      console.error('Error fetching project:', err);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('id, name, email, avatar, role');
      if (data && !error) setTeamMembers(data);
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  // Progress Calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Task Status Update Handler
  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      toast.success(`Task moved to ${COLUMNS.find(c => c.id === newStatus)?.label}`);
    } catch (err: any) {
      toast.error('Failed to update task status');
      fetchProjectData();
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
      fetchProjectData();
    }
  };

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !id) return;
    setSavingTask(true);

    try {
      const newTaskPayload: any = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        status: newTaskStatus,
        priority: newTaskPriority,
        project_id: id,
        due_date: newTaskDueDate || null,
        assigned_to: newTaskAssignee || currentUser?.id || null,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTaskPayload)
        .select('*, user:users(id, name, avatar)')
        .single();

      if (error) throw error;

      if (data) {
        setTasks(prev => [data, ...prev]);
      } else {
        fetchProjectData();
      }

      toast.success('Task created successfully!');
      setIsTaskModalOpen(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskAssignee('');
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast.error(err.message || 'Failed to create task');
    } finally {
      setSavingTask(false);
    }
  };

  // Update Project Handler
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !editName.trim()) return;
    setSavingProject(true);

    try {
      const updates = {
        name: editName.trim(),
        description: editDescription.trim(),
        status: editStatus,
        due_date: editDueDate || undefined,
        progress: progressPercent
      };

      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', project.id);

      if (error) throw error;

      setProject(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Project updated successfully');
      setIsEditProjectOpen(false);
    } catch (err: any) {
      toast.error('Failed to update project');
    } finally {
      setSavingProject(false);
    }
  };

  // Delete Project Handler
  const handleDeleteProject = async () => {
    if (!project) return;
    if (!confirm(`Are you sure you want to delete project "${project.name}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) throw error;
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err: any) {
      toast.error('Failed to delete project');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      case 'planning':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
    }
  };

  const getNextStatus = (current: TaskItem['status']): TaskItem['status'] | null => {
    switch (current) {
      case 'todo': return 'inProgress';
      case 'inProgress': return 'review';
      case 'review': return 'done';
      case 'done': return null;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-indigo-600" size={36} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 mb-4">Project not found</p>
        <Link to="/projects" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/projects" className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Projects
          </Link>
          <ChevronRight size={14} className="opacity-40" />
          <span className="font-semibold text-gray-900 dark:text-white truncate max-w-xs">{project.name}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditProjectOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors shadow-sm"
          >
            <Edit3 size={15} /> Edit
          </button>
          <button
            onClick={handleDeleteProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors shadow-sm"
          >
            <Trash2 size={15} /> Delete
          </button>
          <button
            onClick={() => {
              setNewTaskStatus('todo');
              setNewTaskStatus('todo');
              setIsTaskModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={16} /> Add Task
          </button>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                <FolderKanban size={24} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                {project.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-3xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          {/* Key Metrics */}
          <div className="flex flex-wrap items-center gap-6 lg:border-l lg:border-gray-200 dark:lg:border-gray-700 lg:pl-6">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Progress</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">{progressPercent}%</span>
                <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tasks Done</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {completedTasks} <span className="text-xs font-normal text-gray-400">/ {totalTasks}</span>
              </p>
            </div>

            {project.due_date && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Target Date</p>
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">
                  <Calendar size={14} className="text-indigo-500" />
                  {new Date(project.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Switcher & Toolbar */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-900/60 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'board'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={14} /> Board
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <List size={14} /> List
          </button>
        </div>

        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Showing <span className="font-bold text-gray-900 dark:text-white">{tasks.length}</span> project tasks
        </div>
      </div>

      {/* --- KANBAN BOARD VIEW --- */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);

            return (
              <div 
                key={col.id} 
                className="bg-gray-50/80 dark:bg-gray-800/40 rounded-2xl border border-gray-200/80 dark:border-gray-700/60 p-4 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <h3 className={`font-bold text-sm ${col.color}`}>{col.label}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setNewTaskStatus(col.id);
                      setNewTaskStatus(col.id);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    title={`Add task to ${col.label}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Column Tasks List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colTasks.map(task => {
                    const nextStatus = getNextStatus(task.status);

                    return (
                      <div
                        key={task.id}
                        className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                            title="Delete task"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white leading-snug mb-1.5">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                          {task.due_date ? (
                            <span className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                              <Clock size={12} />
                              {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400">No deadline</span>
                          )}

                          {nextStatus && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, nextStatus)}
                              className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline"
                              title={`Advance to ${COLUMNS.find(c => c.id === nextStatus)?.label}`}
                            >
                              Advance <ArrowRight size={11} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      No tasks in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- LIST VIEW --- */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs font-semibold border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3.5">Task</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Due Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{task.title}</div>
                    {task.description && <div className="text-xs text-gray-500 line-clamp-1">{task.description}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as TaskItem['status'])}
                      className="text-xs font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2.5 py-1 text-gray-800 dark:text-gray-200 outline-none"
                    >
                      {COLUMNS.map(col => (
                        <option key={col.id} value={col.id}>{col.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-300">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No tasks created yet. Click "+ Add Task" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- ADD TASK MODAL --- */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add Task to {project.name}</h3>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Task Title *</label>
                <input
                  required
                  autoFocus
                  type="text"
                  placeholder="e.g. Implement Navigation Drawer"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Task details and acceptance criteria..."
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Initial Status</label>
                  <select
                    value={newTaskStatus}
                    onChange={e => setNewTaskStatus(e.target.value as TaskItem['status'])}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={e => setNewTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask || !newTaskTitle.trim()}
                  className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {savingTask && <Loader2 size={15} className="animate-spin" />}
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT PROJECT MODAL --- */}
      {isEditProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Edit Project</h3>
              <button onClick={() => setIsEditProjectOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleUpdateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Project Name *</label>
                <input
                  required
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="planning">Planning</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditProjectOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject || !editName.trim()}
                  className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {savingProject && <Loader2 size={15} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


```

### `src\app\pages\Projects.tsx`

```tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, MoreHorizontal, Plus, Calendar, Loader2,
  Search, ExternalLink, Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import CreateProjectModal from '../components/CreateProjectModal';
import { toast } from 'sonner';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  due_date?: string;
  progress?: number;
  created_at?: string;
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setActiveMenuId(null);
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted');
    } catch (err: any) {
      toast.error('Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'planning': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = selectedStatus === 'All' || p.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage, monitor, and collaborate on ongoing projects.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Toolbar: Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
          />
        </div>
        <div className="w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
        <div className="flex items-center gap-1 overflow-x-auto px-2 py-1">
          {['All', 'Active', 'Planning', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === status
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex justify-center p-16">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <FolderKanban size={24} />
                  </div>

                  {/* 3-Dots Menu */}
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === project.id ? null : project.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {activeMenuId === project.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-30 overflow-hidden animate-in zoom-in-95 duration-150"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}`);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                        >
                          <ExternalLink size={14} /> Open Project
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                          className="w-full text-left px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {project.name}
                </h3>

                {project.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {project.due_date && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} /> {new Date(project.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar & Footer */}
              <div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-medium mb-1.5 text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/80">
                  <div className="flex -space-x-1.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-gray-800">
                      P
                    </div>
                    <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-gray-800">
                      F
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    View Board →
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-16 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <FolderKanban className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">No projects found</h3>
              <p className="text-xs text-gray-500 mt-1">Try a different search or create your first project.</p>
            </div>
          )}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={() => fetchProjects()}
      />
    </div>
  );
}
```

### `src\app\pages\Settings.tsx`

```tsx
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, CreditCard, Save, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Account Settings</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <TabButton icon={<User size={18} />} label="Profile" active />
        <TabButton icon={<Bell size={18} />} label="Notifications" />
        <TabButton icon={<Lock size={18} />} label="Security" />
        <TabButton icon={<CreditCard size={18} />} label="Billing" />
      </div>

      <div className="space-y-6">
        {/* Profile Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start gap-8">
            {/* Avatar Change */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-md">
                AM
              </div>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Change Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <InputField label="First Name" defaultValue="Alex" />
                <InputField label="Last Name" defaultValue="Morgan" />
              </div>
              <InputField label="Email Address" defaultValue="alex.morgan@company.com" />
              <InputField label="Job Title" defaultValue="Product Lead" />
              
              <div className="pt-4 flex justify-end gap-3">
                <button className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Session / Logout Section */}
        <div className="bg-white rounded-xl border border-red-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Session Management</h3>
          <p className="text-sm text-gray-500 mb-4">
            Log out of your account on this device. You will need to sign in again to access your dashboard.
          </p>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 border border-red-200 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// Helpers
function TabButton({ icon, label, active }: any) {
  return (
    <button className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
      {icon}
      {label}
    </button>
  );
}

function InputField({ label, defaultValue }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="text" defaultValue={defaultValue} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm transition-all" />
    </div>
  );
}
```

### `src\app\pages\Signup.tsx`

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('./pfp.jpg'); // Default

  // Avatars available in your public folder
  const avatars = [
    { id: 'male', src: './male.jpg', label: 'Male' },
    { id: 'female', src: './female.jpg', label: 'Female' },
    { id: 'default', src: './pfp.jpg', label: 'Default' },
  ];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Pass the Name and Avatar to the Trigger via 'data'
          data: {
            full_name: name,
            avatar_url: selectedAvatar,
          },
        },
      });

      if (error) throw error;
      
      alert('Signup successful! Please check your email to verify.');
      navigate('/login');
      
    } catch (error: any) {
      alert(error.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Join the team today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            
            {/* 1. Avatar Selection Grid */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                Choose your Avatar
              </label>
              <div className="flex justify-center gap-4">
                {avatars.map((av) => (
                  <div 
                    key={av.id}
                    onClick={() => setSelectedAvatar(av.src)}
                    className={`relative cursor-pointer group transition-all duration-200 ${
                      selectedAvatar === av.src ? 'scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={av.src} 
                      alt={av.label} 
                      className={`w-16 h-16 rounded-full object-cover border-2 ${
                        selectedAvatar === av.src 
                        ? 'border-indigo-600 shadow-lg shadow-indigo-500/20' 
                        : 'border-transparent'
                      }`} 
                    />
                    {selectedAvatar === av.src && (
                      <div className="absolute -top-1 -right-1 bg-indigo-600 text-white rounded-full p-0.5 animate-in zoom-in">
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Standard Fields */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input 
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input 
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### `src\app\pages\Team.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, UserPlus, Filter, MoreHorizontal, Mail, MessageSquare, 
    Loader2, Briefcase, Clock, Zap, X, MapPin, Globe, Check, Copy, ExternalLink 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';
import AddMemberModal from '../components/AddMemberModal';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  location?: string;
  bio?: string;
  website?: string;
  stats?: {
    workingHours: string;
    productivity: number;
  };
}

export default function Team() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const onlineUserIds = useOnlineUsers();
  
  // State
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null); // For 3-dots menu
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null); // For Profile Popup

  // Refs for clicking outside
  const filterRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- HELPER FUNCTIONS ---

  const getRoleBadge = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('developer') || r.includes('engineer')) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
    if (r.includes('designer') || r.includes('creative')) return 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-200 dark:border-pink-500/20';
    if (r.includes('manager') || r.includes('lead')) return 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  };

  const handleImageError = (e: any) => {
    e.target.src = `https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`;
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw error;
      if (data) {
        const formattedUsers: UserData[] = data.map((u: any) => ({
          ...u,
          name: u.name || 'Unknown',
          role: u.role || 'Member',
          avatar: u.avatar || '',
          stats: { 
            workingHours: `${Math.floor(Math.random() * 40) + 10}h`, 
            productivity: Math.floor(Math.random() * 30) + 70 
          }
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveMenuId(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- ACTIONS ---

  const startDM = (otherUserId: string) => {
    if (!currentUser) return;
    const ids = [currentUser.id, otherUserId].sort();
    navigate(`/messages/dm_${ids[0]}_${ids[1]}`);
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setActiveMenuId(null);
    alert("Email copied to clipboard!");
  };

  // --- FILTER LOGIC ---

  const uniqueRoles = ['All', ...Array.from(new Set(users.map(u => u.role)))];

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || 
                          u.role?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = selectedRole === 'All' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-8 h-full overflow-y-auto animate-in fade-in duration-500 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Team Members</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your team and track performance.</p>
        </div>
        <button 
            onClick={() => setIsAddModalOpen(true)} 
            className="group flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
        >
            <UserPlus size={18} className="group-hover:scale-110 transition-transform" /> 
            <span>Add Member</span>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 z-20 relative">
          <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by name, role, or email..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
          </div>
          <div className="w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>
          
          {/* Working Filter Button */}
          <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-6 h-full py-3 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl flex items-center gap-2 transition-colors ${isFilterOpen ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                  <Filter size={18} /> 
                  <span>{selectedRole === 'All' ? 'Filters' : selectedRole}</span>
              </button>

              {isFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-30 animate-in zoom-in-95 duration-200">
                      <div className="p-2">
                          <p className="text-xs font-bold text-gray-400 uppercase px-2 py-1.5">Filter by Role</p>
                          {uniqueRoles.map(role => (
                              <button
                                key={role}
                                onClick={() => { setSelectedRole(role); setIsFilterOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${selectedRole === role ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                              >
                                  {role}
                                  {selectedRole === role && <Check size={14} />}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* GRID CONTENT */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-8">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  onClick={() => setSelectedUser(user)} // 3. Open Popup on Click
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-visible"
                >
                    {/* Top Decor & 3-Dots Menu */}
                    <div className="absolute top-4 right-4 z-20">
                        <div className="relative">
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setActiveMenuId(activeMenuId === user.id ? null : user.id); 
                                }}
                                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <MoreHorizontal size={20} />
                            </button>

                            {/* 2. Enhanced 3-Dots Dropdown */}
                            {activeMenuId === user.id && (
                                <div ref={menuRef} className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                                    <button onClick={(e) => { e.stopPropagation(); startDM(user.id); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                        <MessageSquare size={14} /> Send Message
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); navigate(`/profile/${user.id}`); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                        <ExternalLink size={14} /> View Full Page
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); copyEmail(user.email); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                                        <Copy size={14} /> Copy Email
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Identity */}
                    <div className="flex items-start gap-5 mb-6">
                        <div className="relative">
                             <img 
                                src={user.avatar} 
                                onError={handleImageError} 
                                alt={user.name} 
                                className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-md"
                             />
                             {onlineUserIds.has(user.id) && (
                                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                             )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {user.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.role)}`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                <Clock size={14} />
                                <span className="text-xs font-medium">Hours</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-200">
                                {user.stats?.workingHours}
                            </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                <Zap size={14} />
                                <span className="text-xs font-medium">Efficiency</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {user.stats?.productivity}%
                            </span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                            <Briefcase size={16} /> 
                            <span className="truncate max-w-[120px]">ProjectFlow Team</span>
                        </div>
                        
                        <button className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            Quick View
                        </button>
                    </div>
                </div>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Search className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No members found</h3>
                <p className="text-gray-500 max-w-sm mt-1">
                    Try adjusting your filters or search terms.
                </p>
              </div>
            )}
        </div>
      )}

      {/* --- 4. PROFILE POPUP MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setSelectedUser(null)}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-200 dark:border-gray-700">
                
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10 transition-colors backdrop-blur-md"
                >
                    <X size={18} />
                </button>

                {/* Cover Image */}
                <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="px-8 pb-8 -mt-16 text-center relative">
                    {/* Avatar */}
                    <div className="relative inline-block">
                        <img 
                             src={selectedUser.avatar} 
                             onError={handleImageError} 
                             alt={selectedUser.name} 
                             className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl object-cover bg-white" 
                        />
                        {onlineUserIds.has(selectedUser.id) && (
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-gray-800 rounded-full" title="Online"></div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">{selectedUser.name}</h2>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">{selectedUser.role}</p>

                    {selectedUser.bio && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 italic">"{selectedUser.bio}"</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <button 
                            onClick={() => { setSelectedUser(null); startDM(selectedUser.id); }}
                            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all"
                        >
                            <MessageSquare size={18} /> Message
                        </button>
                        <button 
                            onClick={() => { setSelectedUser(null); navigate(`/profile/${selectedUser.id}`); }}
                            className="py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                        >
                             View Profile
                        </button>
                    </div>

                    <div className="mt-8 space-y-4 text-left">
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                            <Mail className="text-gray-400" size={18} />
                            <span className="truncate">{selectedUser.email}</span>
                        </div>
                        {selectedUser.location && (
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                <MapPin className="text-gray-400" size={18} />
                                <span>{selectedUser.location}</span>
                            </div>
                        )}
                        {selectedUser.website && (
                             <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                <Globe className="text-gray-400" size={18} />
                                <a href={selectedUser.website} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">{selectedUser.website}</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Add Modal */}
      <AddMemberModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onMemberAdded={fetchUsers} 
      />

    </div>
  );
}
```

### `src\app\pages\Timesheets.tsx`

```tsx
// REPLACE your imports with this:
import { useState, useEffect, useRef } from 'react'; // Added useRef
import { 
  Play, Pause, Clock, Calendar as CalendarIcon, MoreVertical, 
  Plus, CheckCircle2, X, Save, Timer, Trash2, Edit2 // Added Trash2, Edit2
} from 'lucide-react';

// --- Types ---
type TimeEntry = {
  id: string;
  date: string;
  project: string;
  task: string;
  durationSeconds: number;
  status: 'Approved' | 'Pending';
};

export default function Timesheets() {
  // --- State ---
  const [entries, setEntries] = useState<TimeEntry[]>([
    { id: '1', date: new Date().toLocaleDateString(), project: 'Website Redesign', task: 'Homepage Hero Section', durationSeconds: 16200, status: 'Approved' }, // 4h 30m
    { id: '2', date: new Date().toLocaleDateString(), project: 'Mobile App', task: 'Auth Flow', durationSeconds: 8100, status: 'Approved' }, // 2h 15m
  ]);
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSessionSeconds, setCurrentSessionSeconds] = useState(0);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'stop' | 'manual'>('stop');
  const [formData, setFormData] = useState({ project: 'Internal', task: '', hours: '0', minutes: '0' });
  // --- Dropdown Menu Logic (New) ---
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
        setEntries(entries.filter(e => e.id !== id));
        setActiveMenuId(null);
    }
  };

  const handleEdit = (id: string) => {
    // For now, we'll just alert. You can later connect this to your isModalOpen logic.
    alert(`Edit functionality for ID: ${id}`);
    setActiveMenuId(null);
  };

  // --- Timer Logic ---
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentSessionSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // --- Helpers ---
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    // Show seconds only if actively timing, otherwise H:M is usually enough for timesheets
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDurationText = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getTotalSeconds = () => {
    return entries.reduce((acc, curr) => acc + curr.durationSeconds, 0) + (isTimerRunning ? currentSessionSeconds : 0);
  };

  // --- Handlers ---
  const handleStartStop = () => {
    if (isTimerRunning) {
      // STOPPING: Pause and Open Modal
      setIsTimerRunning(false);
      setModalMode('stop');
      setFormData({ ...formData, hours: '0', minutes: '0' }); // Reset manual inputs
      setIsModalOpen(true);
    } else {
      // STARTING
      setIsTimerRunning(true);
    }
  };

  const handleManualEntry = () => {
    setModalMode('manual');
    setIsTimerRunning(false);
    setFormData({ project: 'Internal', task: '', hours: '1', minutes: '0' });
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    let duration = 0;
    if (modalMode === 'stop') {
      duration = currentSessionSeconds;
    } else {
      duration = (parseInt(formData.hours) * 3600) + (parseInt(formData.minutes) * 60);
    }

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      project: formData.project,
      task: formData.task || 'Untitled Task',
      durationSeconds: duration,
      status: 'Pending'
    };

    setEntries([newEntry, ...entries]);
    
    // Cleanup
    setCurrentSessionSeconds(0);
    setIsModalOpen(false);
    setFormData({ project: 'Internal', task: '', hours: '0', minutes: '0' });
  };

  const handleDiscard = () => {
    setIsModalOpen(false);
    setCurrentSessionSeconds(0); // Discard the tracked time
  };

  // Calculate Progress for "40h Goal"
  const totalSecs = getTotalSeconds();
  const progressPercent = Math.min((totalSecs / (40 * 3600)) * 100, 100);

  return (
    <div className="p-8 max-w-6xl mx-auto relative min-h-full">
       
       {/* --- Header & Timer Widget --- */}
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
           <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Timesheets</h1>
               <p className="text-gray-500 dark:text-gray-400 mt-1">Track your hours and manage logs.</p>
           </div>
           
           <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
               <div className="px-4 border-r border-gray-100 dark:border-gray-700">
                   <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase mb-0.5">Total This Week</p>
                   <div className="flex items-baseline gap-2">
                     <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{formatDurationText(totalSecs)}</p>
                     <span className="text-xs text-gray-400">/ 40h</span>
                   </div>
                   {/* Mini Progress Bar */}
                   <div className="w-24 h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-1">
                      <div className="h-1 bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                   </div>
               </div>
               
               {/* Live Timer Display */}
               {isTimerRunning && (
                 <div className="px-2 animate-pulse">
                    <p className="text-xs text-emerald-500 font-bold uppercase mb-0.5">Recording</p>
                    <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatTime(currentSessionSeconds)}</p>
                 </div>
               )}

               <button 
                   onClick={handleStartStop}
                   className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all shadow-md active:scale-95 ${
                     isTimerRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'
                   }`}
               >
                   {isTimerRunning ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white" />}
                   {isTimerRunning ? 'Stop' : 'Start Timer'}
               </button>
           </div>
       </div>

       {/* --- Main Table Area --- */}
       <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
           
           {/* Table Toolbar */}
           <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
               <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                   <CalendarIcon size={18} />
                   <span className="font-medium">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - This Week</span>
               </div>
               <button 
                 onClick={handleManualEntry}
                 className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition-colors"
               >
                   <Plus size={16} /> Log Manual Entry
               </button>
           </div>

           {/* Entries Table */}
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                 <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium text-sm border-b border-gray-200 dark:border-gray-700">
                     <tr>
                         <th className="px-6 py-4">Date</th>
                         <th className="px-6 py-4">Project</th>
                         <th className="px-6 py-4 w-1/3">Description</th>
                         <th className="px-6 py-4">Duration</th>
                         <th className="px-6 py-4">Status</th>
                         <th className="px-6 py-4"></th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                     {entries.length === 0 ? (
                       <tr>
                         <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                            <Clock size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No time entries yet. Start the timer or log manually.</p>
                         </td>
                       </tr>
                     ) : (
                       entries.map((entry) => (
                         <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                             <td className="px-6 py-4 text-gray-900 dark:text-white font-medium whitespace-nowrap">{entry.date}</td>
                             <td className="px-6 py-4">
                                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                     <div className={`w-1.5 h-1.5 rounded-full ${entry.project.includes('Internal') ? 'bg-gray-400' : 'bg-indigo-500'}`}></div>
                                     {entry.project}
                                 </span>
                             </td>
                             <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">{entry.task}</td>
                             <td className="px-6 py-4 font-mono font-medium text-gray-900 dark:text-white">{formatDurationText(entry.durationSeconds)}</td>
                             <td className="px-6 py-4">
                                 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                     entry.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                                 }`}>
                                     {entry.status === 'Approved' ? <CheckCircle2 size={12} /> : <Timer size={12} />}
                                     {entry.status}
                                 </span>
                             </td>
                             {/* REPLACED TD BLOCK */}
                             <td className="px-6 py-4 text-right relative">
                                 <button 
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         setActiveMenuId(activeMenuId === entry.id ? null : entry.id);
                                     }}
                                     className={`p-2 rounded-lg transition-colors ${activeMenuId === entry.id ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                                 >
                                     <MoreVertical size={18} />
                                 </button>

                                 {/* Dropdown Menu Popup */}
                                 {activeMenuId === entry.id && (
                                     <div ref={menuRef} className="absolute right-8 top-8 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                         <button onClick={() => handleEdit(entry.id)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
                                             <Edit2 size={14} /> Edit
                                         </button>
                                         <div className="h-px bg-gray-100 dark:bg-gray-700 my-0"></div>
                                         <button onClick={() => handleDelete(entry.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                             <Trash2 size={14} /> Delete
                                         </button>
                                     </div>
                                 )}
                             </td>
                         </tr>
                       ))
                     )}
                 </tbody>
             </table>
           </div>
       </div>

       {/* --- SAVE ENTRY MODAL --- */}
       {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {modalMode === 'stop' ? 'Save Time Entry' : 'Log Manual Time'}
                    </h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSaveEntry} className="space-y-4">
                    {/* Time Display (Read-only if stopping timer) */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex flex-col items-center justify-center mb-4 border border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Duration</span>
                        {modalMode === 'stop' ? (
                          <span className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{formatTime(currentSessionSeconds)}</span>
                        ) : (
                          <div className="flex items-center gap-2">
                             <div className="flex flex-col items-center">
                               <input 
                                 type="number" 
                                 min="0"
                                 value={formData.hours}
                                 onChange={e => setFormData({...formData, hours: e.target.value})}
                                 className="w-16 text-center text-2xl font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1"
                               />
                               <span className="text-[10px] text-gray-400 mt-1">HOURS</span>
                             </div>
                             <span className="text-2xl font-bold text-gray-300">:</span>
                             <div className="flex flex-col items-center">
                               <input 
                                 type="number" 
                                 min="0" 
                                 max="59"
                                 value={formData.minutes}
                                 onChange={e => setFormData({...formData, minutes: e.target.value})}
                                 className="w-16 text-center text-2xl font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1"
                               />
                               <span className="text-[10px] text-gray-400 mt-1">MINS</span>
                             </div>
                          </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project</label>
                        <select 
                          value={formData.project} 
                          onChange={e => setFormData({...formData, project: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                        >
                            <option>Internal</option>
                            <option>Website Redesign</option>
                            <option>Mobile App</option>
                            <option>API Integration</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                        <textarea 
                          rows={3}
                          value={formData.task}
                          onChange={e => setFormData({...formData, task: e.target.value})}
                          placeholder="What were you working on?"
                          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                          required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        {modalMode === 'stop' && (
                          <button type="button" onClick={handleDiscard} className="flex-1 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-xl font-medium transition-colors">
                            Discard
                          </button>
                        )}
                        <button type="submit" className="flex-[2] px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2">
                           <Save size={18} /> Save Entry
                        </button>
                    </div>
                </form>
            </div>
         </div>
       )}
    </div>
  );
}
```

### `src\app\pages\settings\AppearanceSettings.tsx`

```tsx
import { Moon, Sun, Monitor, Check, Type, Zap } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useState } from 'react';

export default function AppearanceSettings() {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  
  // Local state for the new features (You can move these to Context later if you want them global)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize how ProjectFlow looks and feels across your devices.
        </p>
      </div>

      {/* 1. Theme Selection */}
      <section className="space-y-4">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Interface Theme
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <ThemeCard active={theme === 'light'} onClick={() => setTheme('light')} label="Light Mode" icon={<Sun size={18} />}>
            <div className="absolute inset-0 bg-gray-100 flex p-3 gap-2">
               <div className="w-1/4 h-full bg-white rounded-lg border border-gray-200 shadow-sm"></div>
               <div className="flex-1 flex flex-col gap-2">
                  <div className="h-8 w-full bg-white rounded-lg border border-gray-200 shadow-sm"></div>
                  <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-2 space-y-2">
                     <div className="h-2 w-1/2 bg-gray-100 rounded"></div>
                     <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                  </div>
               </div>
            </div>
          </ThemeCard>

          <ThemeCard active={theme === 'dark'} onClick={() => setTheme('dark')} label="Dark Mode" icon={<Moon size={18} />}>
            <div className="absolute inset-0 bg-[#0B1120] flex p-3 gap-2">
               <div className="w-1/4 h-full bg-[#1e293b] rounded-lg border border-gray-700 shadow-sm"></div>
               <div className="flex-1 flex flex-col gap-2">
                  <div className="h-8 w-full bg-[#1e293b] rounded-lg border border-gray-700 shadow-sm"></div>
                  <div className="flex-1 bg-[#1e293b] rounded-lg border border-gray-700 shadow-sm p-2 space-y-2">
                     <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
                     <div className="h-2 w-3/4 bg-gray-700 rounded"></div>
                  </div>
               </div>
            </div>
          </ThemeCard>

          <ThemeCard active={theme === 'system'} onClick={() => setTheme('system')} label="System Default" icon={<Monitor size={18} />}>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-[#0B1120] flex items-center justify-center">
                <div className="relative w-full h-full p-3 gap-2 flex opacity-60">
                   <div className="w-1/4 h-full bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"></div>
                   <div className="flex-1 flex flex-col gap-2">
                      <div className="h-8 w-full bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"></div>
                      <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30"></div>
                   </div>
                </div>
            </div>
          </ThemeCard>
        </div>
      </section>

      {/* 2. Accent Color */}
      <section className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Accent Color
        </label>
        
        <div className="flex flex-wrap gap-4">
            {(['indigo', 'emerald', 'blue', 'purple', 'rose', 'orange'] as const).map((color) => (
                <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        accentColor === color ? 'scale-110 ring-4 ring-offset-4 ring-gray-200 dark:ring-gray-700 dark:ring-offset-gray-900' : 'hover:scale-105'
                    }`}
                >
                    <div className={`w-full h-full rounded-full shadow-md ${getColorClass(color)}`}></div>
                    {accentColor === color && <Check size={20} className="absolute text-white drop-shadow-md" />}
                </button>
            ))}
        </div>
      </section>

      {/* 3. Typography & Motion */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          
          {/* Font Size */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                 <Type size={18} className="text-gray-400" />
                 <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Typography Size</h3>
             </div>
             <div className="flex p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                 {['sm', 'md', 'lg'].map((size) => (
                     <button
                        key={size}
                        onClick={() => setFontSize(size as 'sm' | 'md' | 'lg')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                            fontSize === size 
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                     >
                         {size === 'sm' ? 'Compact' : size === 'md' ? 'Default' : 'Large'}
                     </button>
                 ))}
             </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                 <Zap size={18} className="text-gray-400" />
                 <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Accessibility</h3>
             </div>
             
             <button 
                onClick={() => setReducedMotion(!reducedMotion)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
             >
                 <div className="text-left">
                     <p className="font-semibold text-gray-900 dark:text-white text-sm">Reduce Motion</p>
                     <p className="text-xs text-gray-500 mt-1">Minimize heavy interface animations.</p>
                 </div>
                 <div className={`w-12 h-6 rounded-full transition-colors relative ${reducedMotion ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                     <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${reducedMotion ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </div>
             </button>
          </div>
      </section>

    </div>
  );
}

// Helpers
function getColorClass(color: string) {
    switch(color) {
        case 'indigo': return 'bg-[#4f46e5]';
        case 'emerald': return 'bg-[#10b981]';
        case 'blue': return 'bg-[#3b82f6]';
        case 'purple': return 'bg-[#9333ea]';
        case 'rose': return 'bg-[#f43f5e]';
        case 'orange': return 'bg-[#f97316]';
        default: return 'bg-[#4f46e5]';
    }
}

function ThemeCard({ active, onClick, label, icon, children }: any) {
  return (
    <button onClick={onClick} className="relative group flex flex-col gap-3 text-left transition-all duration-300 outline-none">
      {/* Notice we are using 'border-primary' and 'ring-primary' here now! */}
      <div className={`relative w-full h-32 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-sm ${active ? 'border-primary ring-4 ring-primary/10 scale-[1.02]' : 'border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600 group-hover:-translate-y-1'}`}>
        {children}
        {active && (
            <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full shadow-lg z-10 animate-in zoom-in">
                <Check size={14} strokeWidth={3} />
            </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-1">
        <div className={`p-1.5 rounded-lg ${active ? 'bg-primary/10 text-primary' : 'text-gray-400'}`}>
            {icon}
        </div>
        <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`}>
            {label}
        </span>
      </div>
    </button>
  );
}
```

### `src\app\pages\settings\BillingSettings.tsx`

```tsx
import { useState } from 'react';
import {
  CreditCard, CheckCircle2, Download,
  Loader2, Users, HardDrive
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function BillingSettings() {
  const { user } = useAuth();
  
  // --- State for Interactivity ---
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  
  // Mock Data mimicking a real app state
  const currentPlan = {
    name: "Pro Team",
    price: billingCycle === 'monthly' ? 29 : 290,
    interval: billingCycle === 'monthly' ? '/mo' : '/yr',
    nextBilling: billingCycle === 'monthly' ? 'Feb 12, 2026' : 'Jan 12, 2027',
    features: ['Unlimited Projects', '5 Team Members', '1TB Storage', 'Priority Support']
  };

  // --- Handlers ---
  const handleDownloadInvoice = (id: string) => {
    // Simulate a download delay
    const btn = document.getElementById(`btn-${id}`);
    if(btn) btn.innerHTML = '...';
    
    setTimeout(() => {
        alert(`Downloading Invoice ${id} for ${user?.name || 'User'}...`);
        if(btn) btn.innerHTML = ''; // Reset (in a real app, you'd use state)
    }, 800);
  };

  const handleUpdatePlan = () => {
    setIsUpdating(true);
    setTimeout(() => {
        setIsUpdating(false);
        alert('Plan updated successfully!');
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Billing & Subscription</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your plan, payment details, and invoices.</p>
      </div>

      {/* --- PLAN CARD --- */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-1 shadow-xl overflow-hidden text-white relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                
                {/* Plan Info */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                            Current Plan
                        </span>
                        {billingCycle === 'yearly' && (
                            <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold animate-pulse">
                                Year Applied (-20%)
                            </span>
                        )}
                    </div>
                    <h2 className="text-3xl font-bold mb-1">{currentPlan.name}</h2>
                    <p className="text-indigo-200 text-sm mb-6">Renews on {currentPlan.nextBilling}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                        {currentPlan.features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                <CheckCircle2 size={16} className="text-emerald-400" /> {feat}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing & Actions */}
                <div className="bg-white/5 rounded-xl p-6 min-w-[200px] border border-white/10 text-center">
                    <p className="text-3xl font-bold">${currentPlan.price}<span className="text-sm text-gray-400 font-normal">{currentPlan.interval}</span></p>
                    
                    {/* Toggle Cycle */}
                    <div className="flex items-center justify-center gap-3 my-4 text-xs font-medium">
                        <button 
                            onClick={() => setBillingCycle('monthly')}
                            className={`transition-colors ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}
                        >Monthly</button>
                        <div className="w-8 h-4 bg-gray-700 rounded-full relative cursor-pointer" onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${billingCycle === 'yearly' ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                        <button 
                             onClick={() => setBillingCycle('yearly')}
                             className={`transition-colors ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}
                        >Yearly</button>
                    </div>

                    <button 
                        onClick={handleUpdatePlan}
                        disabled={isUpdating}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2"
                    >
                        {isUpdating ? <Loader2 size={16} className="animate-spin" /> : 'Change Plan'}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* --- USAGE STATS (The "Relatable" Part) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Users size={20} /></div>
                 <div>
                     <h4 className="font-bold text-gray-900 dark:text-white">Seats Used</h4>
                     <p className="text-xs text-gray-500">You have 1 seat remaining.</p>
                 </div>
             </div>
             <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2">
                 <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
             </div>
             <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                 <span>4 Users</span>
                 <span>5 Limit</span>
             </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><HardDrive size={20} /></div>
                 <div>
                     <h4 className="font-bold text-gray-900 dark:text-white">Storage</h4>
                     <p className="text-xs text-gray-500">Plenty of space left.</p>
                 </div>
             </div>
             <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mb-2">
                 <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
             </div>
             <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                 <span>450 GB</span>
                 <span>1 TB</span>
             </div>
          </div>
      </div>

      {/* --- PAYMENT METHOD --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Method</h3>
        
        {!showCardForm ? (
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-16 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
                        <CreditCard size={24} className="text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Visa ending in 4242</p>
                        <p className="text-xs text-gray-500">Expires 12/2028</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowCardForm(true)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                    Edit
                </button>
            </div>
        ) : (
            <form className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Expiry</label>
                        <input type="text" placeholder="MM/YY" className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">CVC</label>
                        <input type="text" placeholder="123" className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setShowCardForm(false)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400">Cancel</button>
                    <button type="button" onClick={() => { setShowCardForm(false); alert('Card updated!'); }} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Save Card</button>
                </div>
            </form>
        )}
      </div>

      {/* --- INVOICES --- */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invoice History</h3>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Download All</button>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
            <thead className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                <th className="pb-3 font-medium pl-2">Invoice</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium text-right">Status</th>
                <th className="pb-3 font-medium"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {[1, 2, 3].map((i) => (
                <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 pl-2 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                            <FileTextIcon /> INV-2024-00{i}
                        </div>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400">Jan {12 - i}, 2026</td>
                    <td className="py-3 text-gray-900 dark:text-white font-mono">$29.00</td>
                    <td className="py-3 text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                            Paid
                        </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                    <button 
                        id={`btn-INV-00${i}`}
                        onClick={() => handleDownloadInvoice(`INV-00${i}`)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-all" 
                        title="Download PDF"
                    >
                        <Download size={16} />
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function FileTextIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
    )
}
```

### `src\app\pages\settings\NotificationsSettings.tsx`

```tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, Save } from 'lucide-react';

// Define the shape of our settings
interface NotificationPreferences {
  email_newsletter: boolean;
  email_comments: boolean;
  email_invites: boolean;
  push_mentions: boolean;
  push_reminders: boolean;
  [key: string]: boolean; // Allow dynamic keys for flexibility
}

const DEFAULT_SETTINGS: NotificationPreferences = {
  email_newsletter: true,
  email_comments: true,
  email_invites: false,
  push_mentions: true,
  push_reminders: false,
};

export default function NotificationsSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationPreferences>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch Settings on Load
  useEffect(() => {
    async function fetchSettings() {
      if (!user?.id) return;

      try {
        const { data } = await supabase
          .from('users')
          .select('notification_settings')
          .eq('id', user.id)
          .single();

        if (data?.notification_settings) {
          setSettings(data.notification_settings);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  // 2. Handle Toggle & Auto-Save
  const handleToggle = async (key: string) => {
    if (!user?.id) return;

    // Optimistic Update (Change UI immediately)
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setSaving(true);

    try {
      // Save to Supabase
      const { error } = await supabase
        .from('users')
        .update({ notification_settings: newSettings })
        .eq('id', user.id);

      if (error) throw error;
      
      // Simulate a small delay just to show the "Saving..." state briefly
      setTimeout(() => setSaving(false), 500);

    } catch (err) {
      console.error('Error saving settings:', err);
      // Revert if failed
      setSettings(settings); 
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      
      {/* Saving Indicator */}
      <div className="h-6 flex items-center justify-end">
        {saving && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 animate-pulse">
            <Save size={12} /> Saving changes...
          </span>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Email Notifications</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose what we send to your inbox.</p>
        
        <div className="space-y-4">
          <ToggleItem 
            title="Weekly Newsletter" 
            desc="Get a summary of your team's performance every Monday." 
            checked={settings.email_newsletter}
            onChange={() => handleToggle('email_newsletter')}
          />
          <ToggleItem 
            title="New Comments" 
            desc="Receive an email when someone comments on your task." 
            checked={settings.email_comments}
            onChange={() => handleToggle('email_comments')}
          />
          <ToggleItem 
            title="Project Invites" 
            desc="Get notified when you are added to a new project." 
            checked={settings.email_invites}
            onChange={() => handleToggle('email_invites')}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Push Notifications</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Real-time alerts on your desktop/mobile.</p>
        
        <div className="space-y-4">
           <ToggleItem 
            title="Mentions" 
            desc="Notify when @mentioned in a comment." 
            checked={settings.push_mentions}
            onChange={() => handleToggle('push_mentions')}
          />
           <ToggleItem 
            title="Task Reminders" 
            desc="Get a reminder 1 hour before a task is due." 
            checked={settings.push_reminders}
            onChange={() => handleToggle('push_reminders')}
          />
        </div>
      </div>
    </div>
  );
}

// Updated ToggleItem to be "Controlled" (Managed by parent)
function ToggleItem({ title, desc, checked, onChange }: { title: string, desc: string, checked: boolean, onChange: () => void }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
```

### `src\app\pages\settings\ProfileSettings.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabaseClient'; 
import { Save, Loader2, CheckCircle2, MapPin, Mail, Phone, Briefcase, ChevronDown } from 'lucide-react';

export default function ProfileSettings() {
  const { user } = useAuth(); 
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    role: user?.role || 'Member', 
    location: user?.location || '', 
    email: user?.email || '',
    phone: user?.phone || '', 
    avatar: user?.avatar || '/pfp.jpg'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  // Predefined Options
  const avatars = [
    { src: '/male.jpg', label: 'Male' },
    { src: '/female.jpg', label: 'Female' },
    { src: '/pfp.jpg', label: 'Default' },
  ];

  const roles = [
    "Member",
    "Developer", 
    "Senior Developer",
    "Designer", 
    "Product Manager", 
    "Project Manager", 
    "Admin",
    "Intern"
  ];

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Close avatar picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) return;
      
      const { error } = await supabase
        .from('users')
        .update({
            name: formData.name,
            avatar: formData.avatar,
            role: formData.role,
            location: formData.location, 
            phone: formData.phone
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsLoading(false);
      setSuccess(true);
      
      setTimeout(() => window.location.reload(), 1500);

    } catch (error) {
      console.error("Error updating profile:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
           <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Update your personal details and public preview.</p>
        </div>
        
        <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
                px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg
                ${success 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30 hover:shadow-indigo-500/40'
                }
                disabled:opacity-70 disabled:cursor-not-allowed
            `}
        >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : success ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {success ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: LIVE PREVIEW --- */}
        <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Live Preview</h3>
            
            <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-gray-700 sticky top-6">
                <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="px-6 pb-8 relative">
                    <div className="relative -mt-12 mb-4 inline-block">
                        <img 
                            src={formData.avatar} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-gray-800 shadow-md bg-white" 
                        />
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
                    </div>

                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                            {formData.name || 'Your Name'}
                        </h2>
                        <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-4">
                            {formData.role || 'Member'}
                        </p>

                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                             <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-400"><Mail size={16} /></div>
                                <span className="truncate">{formData.email}</span>
                             </div>
                             
                             {formData.phone && (
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-400"><Phone size={16} /></div>
                                    <span>{formData.phone}</span>
                                </div>
                             )}

                             {formData.location && (
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-400"><MapPin size={16} /></div>
                                    <span>{formData.location}</span>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN: EDIT FORM --- */}
        <div className="lg:col-span-8">
             <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white">Personal Information</h3>
                    <span className="text-xs text-gray-500">All fields auto-save to preview</span>
                </div>
                
                <div className="p-8 space-y-8">
                    
                    {/* 1. Avatar Picker */}
                    <div ref={avatarMenuRef} className="relative">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile Image</label>
                        
                        <div 
                           onClick={() => setIsAvatarPickerOpen(!isAvatarPickerOpen)}
                           className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                        >
                             <img src={formData.avatar} className="w-12 h-12 rounded-lg object-cover bg-gray-200" alt="Current" />
                             <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Selected Avatar</p>
                                <p className="text-xs text-gray-500 group-hover:text-indigo-500 transition-colors">Click to change...</p>
                             </div>
                             <ChevronDown size={16} className={`text-gray-400 transition-transform ${isAvatarPickerOpen ? 'rotate-180' : ''}`} />
                        </div>

                        {/* Avatar Selection Panel */}
                        {isAvatarPickerOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10 animate-in zoom-in-95 duration-200">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Choose an Avatar</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {avatars.map((av) => (
                                        <button 
                                            key={av.src}
                                            onClick={() => { setFormData({...formData, avatar: av.src}); setIsAvatarPickerOpen(false); }}
                                            className={`relative group rounded-xl overflow-hidden border-2 transition-all ${formData.avatar === av.src ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}
                                        >
                                            <img src={av.src} alt={av.label} className="w-full h-20 object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-white text-xs font-bold">{av.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup 
                            label="Full Name" 
                            icon={<span className="text-lg font-bold">Aa</span>}
                            value={formData.name} 
                            onChange={(v: string) => setFormData({...formData, name: v})}
                            placeholder="e.g. Sarah Connor"
                        />
                         
                         {/* 2. Job Role Select */}
                         <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Job Title / Role</label>
                            <div className="relative group">
                                <div className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Briefcase size={18} />
                                </div>
                                <select 
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white appearance-none cursor-pointer"
                                >
                                    {roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                         <InputGroup 
                            label="Location" 
                            icon={<MapPin size={18} />} 
                            value={formData.location} 
                            onChange={(v: string) => setFormData({...formData, location: v})}
                            placeholder="e.g. London, UK"
                        />
                         <InputGroup 
                            label="Phone Number" 
                            icon={<Phone size={18} />} 
                            value={formData.phone} 
                            onChange={(v: string) => setFormData({...formData, phone: v})}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
}

// Reusable Input Component
function InputGroup({ label, icon, value, onChange, placeholder }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
            <div className="relative group">
                <div className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                    {icon}
                </div>
                <input 
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-white"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
```

### `src\app\pages\settings\SecuritySettings.tsx`

```tsx
import { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Laptop, 
  Eye, 
  EyeOff, 
  Loader2, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function SecuritySettings() {
  // --- PASSWORD STATE ---
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: 'success' | 'error' | '', text: string }>({ type: '', text: '' });

  // --- 2FA STATE ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  // --- VALIDATION HELPERS ---
  const validations = {
    length: passwords.new.length >= 8,
    upper: /[A-Z]/.test(passwords.new),
    number: /[0-9]/.test(passwords.new),
    special: /[^A-Za-z0-9]/.test(passwords.new),
    match: passwords.new.length > 0 && passwords.new === passwords.confirm
  };

  const isFormValid = Object.values(validations).every(Boolean) && passwords.current.length > 0;

  // --- HANDLERS ---
  const handleUpdatePassword = () => {
    if (!isFormValid) return;
    setPassLoading(true);
    setPassMessage({ type: '', text: '' });

    // Simulate API Call
    setTimeout(() => {
      setPassLoading(false);
      setPassMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ current: '', new: '', confirm: '' }); // Reset form
      
      // Clear message after 3 seconds
      setTimeout(() => setPassMessage({ type: '', text: '' }), 3000);
    }, 1500);
  };

  const toggle2FA = () => {
    setTwoFALoading(true);
    setTimeout(() => {
      setIs2FAEnabled(!is2FAEnabled);
      setTwoFALoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. CHANGE PASSWORD SECTION */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
            <KeyRound size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Inputs */}
          <div className="space-y-4">
             <PasswordInput 
                label="Current Password" 
                value={passwords.current}
                onChange={(e: any) => setPasswords({...passwords, current: e.target.value})}
                show={showPass.current}
                onToggle={() => setShowPass({...showPass, current: !showPass.current})}
                placeholder="Enter current password"
             />
             <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>
             <PasswordInput 
                label="New Password" 
                value={passwords.new}
                onChange={(e: any) => setPasswords({...passwords, new: e.target.value})}
                show={showPass.new}
                onToggle={() => setShowPass({...showPass, new: !showPass.new})}
                placeholder="Enter new password"
             />
             <PasswordInput 
                label="Confirm New Password" 
                value={passwords.confirm}
                onChange={(e: any) => setPasswords({...passwords, confirm: e.target.value})}
                show={false} // Always hidden for confirm
                noToggle
                placeholder="Confirm new password"
             />

             {/* Action Button & Message */}
             <div className="pt-2">
                <button 
                  onClick={handleUpdatePassword}
                  disabled={passLoading || !isFormValid}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {passLoading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                  Update Password
                </button>
                
                {passMessage.text && (
                  <p className={`mt-3 text-sm flex items-center gap-2 ${passMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {passMessage.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                    {passMessage.text}
                  </p>
                )}
             </div>
          </div>
          
          {/* Requirements Checklist */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700 h-fit">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Password Requirements</h4>
            <div className="space-y-3">
              <RequirementItem met={validations.length} label="Minimum 8 characters long" />
              <RequirementItem met={validations.upper} label="At least one uppercase letter" />
              <RequirementItem met={validations.number} label="At least one number" />
              <RequirementItem met={validations.special} label="At least one special character" />
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
              <RequirementItem met={validations.match && passwords.confirm.length > 0} label="Passwords match" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWO-FACTOR AUTHENTICATION */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-4">
                <div className={`p-3 rounded-full h-fit ${is2FAEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-lg">
                        Add an extra layer of security to your account by requiring a code from your mobile device.
                    </p>
                </div>
            </div>
            
            <button 
                onClick={toggle2FA}
                disabled={twoFALoading}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    is2FAEnabled ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${is2FAEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
        
        {is2FAEnabled && (
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-lg flex items-start gap-3">
                <Smartphone className="text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" size={18} />
                <div>
                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">2FA is active</p>
                    <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-0.5">Your account is currently protected. You will be asked for a code when signing in from a new device.</p>
                </div>
            </div>
        )}
      </div>

      {/* 3. LOGIN SESSIONS (New Logical Addition) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Login Sessions</h3>
         <div className="space-y-1">
             <SessionItem 
                device="MacBook Pro" 
                location="Jabalpur, India" 
                time="Active Now" 
                icon={<Laptop size={18} />} 
                isCurrent 
             />
             <SessionItem 
                device="iPhone 14 Pro" 
                location="Jabalpur, India" 
                time="2 hours ago" 
                icon={<Smartphone size={18} />} 
             />
         </div>
      </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

function PasswordInput({ label, value, onChange, show, onToggle, noToggle, placeholder }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div className="relative">
                <input 
                    type={show ? "text" : "password"} 
                    value={value}
                    onChange={onChange}
                    className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-gray-900 dark:text-white transition-all text-sm"
                    placeholder={placeholder}
                />
                {!noToggle && (
                    <button 
                        onClick={onToggle}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
}

function RequirementItem({ met, label }: { met: boolean, label: string }) {
    return (
        <div className={`flex items-center gap-2 text-xs transition-colors duration-200 ${met ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${met ? 'bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'border-gray-300 dark:border-gray-600'}`}>
                {met && <Check size={10} />}
            </div>
            {label}
        </div>
    );
}

function SessionItem({ device, location, time, icon, isCurrent }: any) {
    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg">
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {device}
                        {isCurrent && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase">Current</span>}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{location} • {time}</p>
                </div>
            </div>
            <button className="text-xs font-medium text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                Revoke
            </button>
        </div>
    );
}
```

### `src\app\pages\settings\SettingsLayout.tsx`

```tsx
import { useState } from 'react';
import { User, Bell, Shield, CreditCard, Palette } from 'lucide-react';

// Import your existing settings components
import ProfileSettings from './ProfileSettings';
import NotificationsSettings from './NotificationsSettings';
import SecuritySettings from './SecuritySettings';
import BillingSettings from './BillingSettings';
import AppearanceSettings from './AppearanceSettings';

export default function SettingsLayout() {
  const [activeTab, setActiveTab] = useState('profile');

  // Define the tabs and link them to IDs
  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={18} /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <div className="p-8 h-full overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Settings Sidebar */}
            <div className="w-full md:w-64 shrink-0 space-y-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                            activeTab === tab.id 
                            ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area - Switches based on activeTab */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm w-full">
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'notifications' && <NotificationsSettings />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'billing' && <BillingSettings />}
                {activeTab === 'appearance' && <AppearanceSettings />}
            </div>
        </div>
    </div>
  );
}
```

### `src\context\AuthContext.tsx`

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
  location?: string;
  phone?: string;
  bannerUrl?: string;
}

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '', session.user.user_metadata);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email ?? '', session.user.user_metadata);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, defaultEmail = '', metadata: Record<string, any> = {}) => {
    try {
      // Use .maybeSingle() to prevent HTTP 406 when no row exists
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setUser(data);
      } else {
        // Fallback to auth metadata until the database row is populated
        setUser({
          id: userId,
          name: metadata.full_name || metadata.name || defaultEmail.split('@')[0] || 'User',
          email: defaultEmail,
          avatar: metadata.avatar_url || '',
          role: 'Member'
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, signOut, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
```

### `src\context\ThemeContext.tsx`

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// 1. Define Types
type Theme = 'dark' | 'light' | 'system';
type AccentColor = 'indigo' | 'emerald' | 'blue' | 'purple' | 'rose' | 'orange';
type FontSize = 'compact' | 'default' | 'large';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  reducedMotion: boolean;
  setReducedMotion: (reduce: boolean) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  accentColor: 'indigo',
  setAccentColor: () => null,
  fontSize: 'default',
  setFontSize: () => null,
  reducedMotion: false,
  setReducedMotion: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Hex values for our accent colors
const colorMap: Record<AccentColor, string> = {
  indigo: '#4f46e5',
  emerald: '#10b981',
  blue: '#3b82f6',
  purple: '#9333ea',
  rose: '#f43f5e',
  orange: '#f97316',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  
  // Initialize States from localStorage
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('vite-ui-theme') as Theme) || 'system'
  );
  const [accentColor, setAccentColorState] = useState<AccentColor>(
    () => (localStorage.getItem('vite-ui-accent') as AccentColor) || 'indigo'
  );
  const [fontSize, setFontSizeState] = useState<FontSize>(
    () => (localStorage.getItem('vite-ui-font') as FontSize) || 'default'
  );
  const [reducedMotion, setReducedMotionState] = useState<boolean>(
    () => localStorage.getItem('vite-ui-motion') === 'true'
  );

  // 1. Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // 2. Apply Accent Color
  useEffect(() => {
    window.document.documentElement.style.setProperty('--theme-primary', colorMap[accentColor]);
  }, [accentColor]);

  // 3. Apply Font Size (Scales Tailwind's 'rem' globally)
  useEffect(() => {
    const root = window.document.documentElement;
    if (fontSize === 'compact') root.style.fontSize = '14px';
    else if (fontSize === 'large') root.style.fontSize = '18px';
    else root.style.fontSize = '16px'; // Default
  }, [fontSize]);

  // 4. Apply Reduced Motion
  useEffect(() => {
    const root = window.document.documentElement;
    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [reducedMotion]);

  // Value provider with localStorage saving
  const value = {
    theme,
    setTheme: (val: Theme) => { localStorage.setItem('vite-ui-theme', val); setThemeState(val); },
    accentColor,
    setAccentColor: (val: AccentColor) => { localStorage.setItem('vite-ui-accent', val); setAccentColorState(val); },
    fontSize,
    setFontSize: (val: FontSize) => { localStorage.setItem('vite-ui-font', val); setFontSizeState(val); },
    reducedMotion,
    setReducedMotion: (val: boolean) => { localStorage.setItem('vite-ui-motion', String(val)); setReducedMotionState(val); },
  };

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
```

### `src\hooks\useOnlineUsers.ts`

```ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useOnlineUsers() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Join a global 'online-users' channel
    const channel = supabase.channel('global_presence');

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const onlineIds = new Set<string>();
        
        // Loop through all presence state to find user IDs
        for (const id in newState) {
           const presenceEntries = newState[id] as any[]; // Array of sessions for this user ID
           presenceEntries.forEach(entry => {
             if (entry.user_id) onlineIds.add(entry.user_id);
           });
        }
        setOnlineUsers(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // 2. Broadcast "I am here!"
          await channel.track({ 
            user_id: user.id, 
            online_at: new Date().toISOString() 
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return onlineUsers;
}
```

### `src\hooks\useTyping.ts`

```ts
import { useState, useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useTyping(channelName: string) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (!user) return;

    // 1. Join the channel specifically for 'presence' (online status)
    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing: string[] = [];

        // Loop through all users and sessions in the channel
        // Presence state is: { userId: [{ presence_ref: string, ...customData }] }
        for (const id in state) {
          const userSessions = state[id] as unknown as Array<{ isTyping?: boolean; user_id?: string; name?: string; presence_ref?: string }>;
          for (const userSession of userSessions) {
            // If they are "typing" and it's NOT me
            if (userSession.isTyping && userSession.user_id !== user.id && !typing.includes(userSession.name || '')) {
              typing.push(userSession.name || ''); // Add their name to the list
            }
          }
        }
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Initial status: I am NOT typing
          await channel.track({ user_id: user.id, name: user.email?.split('@')[0], isTyping: false });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, user]);

  // 2. Function to call when YOU type
  const broadcastTyping = async () => {
    if (!channelRef.current || !user) return;

    // Tell everyone: "I am typing!"
    await channelRef.current.track({ 
      user_id: user.id, 
      name: user.email?.split('@')[0], 
      isTyping: true 
    });

    // Clear old timer
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Stop typing after 2 seconds of silence
    typingTimeoutRef.current = setTimeout(async () => {
      await channelRef.current?.track({ 
        user_id: user.id, 
        name: user.email?.split('@')[0], 
        isTyping: false 
      });
    }, 2000);
  };

  return { typingUsers, broadcastTyping };
}
```

### `src\lib\supabaseClient.ts`

```ts
/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Access environment variables (Vite uses import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env file");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### `src\styles\fonts.css`

```css
/* Import Plus Jakarta Sans (Modern, Clean, Professional) */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
```

### `src\styles\index.css`

```css
@import './fonts.css';
@import './tailwind.css';
@import './theme.css';

/* In Tailwind v4 + CSS Variables, we don't strictly need to define a 
  custom variant if we are relying on the variables to swap values.
  
  The theme.css file handles the variable swapping on .dark class.
*/
```

### `src\styles\tailwind.css`

```css
@import "tailwindcss";

/* 1. Tell Tailwind to create primary color classes (bg-primary, text-primary, etc.) */
@theme {
  --color-primary: var(--theme-primary);
}

/* 2. Set the default fallback color (Indigo) */
:root {
  --theme-primary: #4f46e5; 
}
```

### `src\styles\theme.css`

```css
@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 16px;
  --background: #ffffff;
  --foreground: oklch(0.145 0 0);
  --card: #ffffff;
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: #030213;
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 0.0058 264.53);
  --secondary-foreground: #030213;
  --muted: #ececf0;
  --muted-foreground: #717182;
  --accent: #e9ebef;
  --accent-foreground: #030213;
  --destructive: #d4183d;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --input: transparent;
  --input-background: #f3f3f5;
  --switch-background: #cbced4;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  
  /* Sidebar Light Defaults */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: #030213;
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}


@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-input-background: var(--input-background);
  --color-switch-background: var(--switch-background);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
  }

  html {
    font-size: var(--font-size);
  }

  h1 {
    font-size: var(--text-2xl);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  h3 {
    font-size: var(--text-lg);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  h4 {
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  label, button {
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
  }

  input {
    font-size: var(--text-base);
    font-weight: var(--font-weight-normal);
    line-height: 1.5;
  }
}
```


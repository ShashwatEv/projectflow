# ProjectFlow Engineering & UI Guidelines

## Architecture & State
* Keep Supabase queries, Realtime subscriptions, and localStorage keys scoped by active user/team context (`WorkspaceContext`, `AuthContext`).
* Gate database writes on verified account status (`useVerificationGate` / `OnboardingSandboxContext`) so unverified sessions remain isolated in Safe Sandbox Mode.
* Use `sonner` (`toast.success`, `toast.error`, `toast.info`) and accessible modal dialogs instead of browser `alert()` or `window.prompt()` calls.

## Styling & Components
* Build responsive layouts with Tailwind CSS utility classes, supporting both light mode and `#0d1117` / `#161b22` dark surfaces.
* Use `useAccentTheme()` for dynamic user accent colors and `AvatarWithFrame` for user avatars across headers, task cards, chat, and team directories.
* Keep interactive controls keyboard-accessible with `aria-label`, `role="dialog"`, and `Escape` dismissal on modals.

## Code Quality
* Keep TypeScript strict (`noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`) and isolate Deno Edge Function types under `supabase/functions/tsconfig.json`.
* Add Vitest unit tests under `__tests__` for new context providers, routing guards, and workflow utilities.

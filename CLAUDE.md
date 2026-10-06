# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build (also type-checks); `npx tsc --noEmit` for a faster type check
- `npm run lint` — ESLint. Two pre-existing `react-hooks/set-state-in-effect` errors come from shadcn template code (`chart-area-interactive.tsx`, `hooks/use-mobile.ts`)
- No test runner is configured.
- Add UI components with `npx shadcn@latest add <name>` (style `base-nova`, built on `@base-ui/react`, not Radix — APIs differ, e.g. `render={...}` props instead of `asChild`).

## Architecture

Next.js App Router + TypeScript + Tailwind + shadcn/ui + lucide-react, source under `src/` (alias `@/*`). UI text is Vietnamese (`<html lang="vi">`); keep new strings in Vietnamese.

- `/` redirects to `/dashboard` ([src/app/page.tsx](src/app/page.tsx)).
- `/login` — [login-form.tsx](src/components/login-form.tsx) (shadcn login-04 layout) signs in with Firebase email/password and Google popup, plus register mode and password reset. Firebase error codes are mapped to Vietnamese in `translateError`.
- `/dashboard` — shadcn dashboard-01 content (section cards, area chart, drag-and-drop data table fed by `src/app/dashboard/data.json`) inside the sidebar-07 shell ([app-sidebar.tsx](src/components/app-sidebar.tsx): team switcher, nav, projects, user menu). Sidebar menu data is sample data defined inline in `app-sidebar.tsx`.
- `/tasks` — feature module in `src/features/tasks/` (`components/`, `services/`, `types.ts`, `constants.ts`). `services/tasks-service.ts` does Firestore CRUD on the `tasks` collection (`getTasks`, `getTask`, `createTask`, `updateTask`, `deleteTask`). Pages are thin: `src/app/tasks/page.tsx` wraps `<TasksPage />` in `AppShell` ([app-shell.tsx](src/components/app-shell.tsx): AuthGuard + sidebar + header, shared with `/dashboard`). Sidebar links live in `nav-links.tsx`.
- `nav-documents.tsx` and `nav-secondary.tsx` are leftovers from dashboard-01 and are unused.

### Auth flow

Firebase is initialised in [src/lib/firebase.ts](src/lib/firebase.ts) from `NEXT_PUBLIC_FIREBASE_*` vars in `.env.local` (gitignored). `AuthProvider` ([auth-provider.tsx](src/components/auth-provider.tsx)) wraps the app in `layout.tsx` and exposes `useAuth()` (`user`, `loading`). `/dashboard` is wrapped in `AuthGuard`, which redirects to `/login` — this is **client-side only**; there is no server middleware or session cookie. The sidebar user menu uses the real Firebase user and `signOut`.

## Gotchas

- shadcn registry output has shipped `import { cn } from "cn"` (a stray npm package); `cn` must come from `@/lib/utils` (clsx + tailwind-merge). If `shadcn add` reintroduces it, rewrite the import. Back up files before re-running `shadcn add` with `-o`, and re-check page files it overwrites (e.g. sidebar-07 replaces `src/app/dashboard/page.tsx`).
- `data-table.tsx` compares `status === "Done"` and uses the English values in `data.json` and select `value`s as logic keys; only labels are translated (`statusLabels`). Don't translate the values.

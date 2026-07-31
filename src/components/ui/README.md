# `components/ui/`

Generated shadcn/ui primitives — per `components.json` (style: `new-york`,
base color: `slate`), don't hand-edit these once the CLI has generated
more of them; regenerate instead so they stay consistent with upstream.

**Currently hand-written as a starting point** (`button.tsx`, `card.tsx`,
`input.tsx`, `label.tsx`) so the route-group layouts and auth forms in
`src/app/` have real components to import rather than dangling ones. These
match the standard shadcn "new-york" output closely enough to be
drop-in-replaced once the CLI is run for real:

```bash
npx shadcn@latest add button card input label
```

Add more primitives the same way as features need them — a form primitive
(`form.tsx`, wired to `react-hook-form` + Zod), `dialog.tsx`,
`dropdown-menu.tsx`, `avatar.tsx`, `badge.tsx`, `select.tsx`, `toast.tsx`
/`sonner.tsx` are the likely next ones based on the booking flow and admin
tables sketched out in `ARCHITECTURE.md`.

# `components/forms/`

Reusable form fields bound to the Zod schemas in `src/lib/validators/`
(per `ARCHITECTURE.md`). Empty for now — intentionally, rather than
hand-rolled with a fragile ad-hoc pattern: the standard approach here is
`react-hook-form` + `@hookform/resolvers/zod` + shadcn's `form.tsx`
primitive (which isn't generated yet — see `components/ui/README.md`).

Once `npx shadcn@latest add form` has been run, the pattern for a new form
component in this folder is:

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validators/user.schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

export function LoginForm() {
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  // ...
}
```

The two forms most immediately needed are a login form and a register
form for `app/(auth)/login/page.tsx` and `app/(auth)/register/page.tsx`
— those pages currently render a plain, unstyled `<form>` as a
placeholder so the routes exist and compile; swap them for real
components here once the `form.tsx` primitive is in place.

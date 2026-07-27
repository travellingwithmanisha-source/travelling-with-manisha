# `public/`

Static assets served as-is from the site root (`/`).

- `images/` — marketing/content imagery that isn't user-uploaded (hero
  backgrounds, illustrations, static destination photography). Anything
  user-uploaded (homestay photos, avatars) goes through Cloudinary instead
  — see `src/lib/cloudinary.ts` — never committed here.
- `icons/` — favicons and PWA/manifest icons.

Both folders currently hold only a `.gitkeep` placeholder plus one sample
icon so the repo has something real to reference from `app/layout.tsx`
metadata. Replace `icons/icon.svg` with real brand icons before launch.

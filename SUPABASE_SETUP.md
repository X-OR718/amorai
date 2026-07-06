# Amorai — Supabase auth + persistence · setup

Auth + cloud persistence added **on top of** your existing app. Your design,
age gate, curated SFW/NSFW photo system, and 25 images are unchanged.

## What changed
| File | Status |
|------|--------|
| `supabase/schema.sql` | **new** — tables + RLS + signup trigger + storage bucket |
| `api/_supabase.js` | **new** — server Supabase client (CommonJS) |
| `api/chat.js` | **modified** — saves messages when a user is signed in |
| `api/generate-image.js` | **new, OPTIONAL** — fal.ai endpoint, not wired to the UI |
| `package.json` | **modified** — adds `@supabase/supabase-js` |
| `index.html` | **modified** — Supabase client, auth modal, cloud load/save |
| `.env.local.example`, `.gitignore` | **new** |

## Step 1 — Database
Supabase → SQL Editor → paste all of `supabase/schema.sql` → Run.
(Idempotent — safe to re-run.)

## Step 2 — Auth settings
Authentication → Providers → Email: enabled. For instant testing, turn **off**
"Confirm email" (users can then log in immediately after signup).

## Step 3 — Env vars (Vercel → Settings → Environment Variables)
```
OPENROUTER_API_KEY   = <your existing key>
SUPABASE_URL         = https://yikwrpizngqqbfemxnzad.supabase.co
SUPABASE_SECRET_KEY  = sb_secret_...        # SERVER ONLY
# FAL_KEY            = <id>:<secret>        # only if you wire up generate-image.js
```
The publishable key is already in `index.html` (safe — that's its purpose).

## Step 4 — Deploy
`git push` — Vercel auto-installs `@supabase/supabase-js` and redeploys.

## How it behaves
- **Guests**: everything works as before (localStorage). No account required.
- **Signed in** (landing link or Settings → Account): messages, photos, and
  settings (mood/language/voice) save to Supabase and restore on any device.
- **Photos**: your curated SFW/NSFW images now persist — a shown photo is logged
  to `chats` (so it reappears on reload) and to the `photos` gallery table.
- **fal.ai**: `api/generate-image.js` is included but intentionally not wired to
  your photo buttons (fal's free model is content-filtered and wouldn't match
  Sofia's look). Wire it to a new action if/when you want AI-generated photos.

## Notes
- Backend stayed **CommonJS** to match your repo — no `"type":"module"`, no
  `vercel.json` (kept your zero-config deploy).
- The `SUPABASE_SECRET_KEY` bypasses RLS; it's only used server-side. Rotate the
  one shared earlier in chat.

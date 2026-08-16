# AiTronics Emoji Tech Quiz

A mobile-first, direct-answer tech quiz for orientation/Helpdesk events.

🎮 **Player experience:** scan a QR code at the Helpdesk → enter name →
decode 10 emoji + clue questions → type the answer (no multiple choice) →
20-second timer per question, +15 for a fast correct answer, +10 otherwise
→ climb the live leaderboard.

🏆 **Helpdesk side:** `/qr` shows a printable QR poster, `/leaderboard`
shows a live-updating leaderboard (auto-refreshes every 3s) meant to be
left open on a laptop/TV.

## This is a plain static site — no build step

This app is a single self-contained `index.html` (plain HTML/CSS/JS, no
React, no bundler). There is intentionally **no `package.json`** in this
repo — that was causing Vercel to auto-detect it as a Vite project and try
to run a build that had nothing to build, which is what broke the
deployment before. Keep it that way: just `index.html` + `vercel.json`.

## Run locally

No install needed. From this folder:

```
npx serve .
```

Then open `http://localhost:3000/`, `/qr`, and `/leaderboard`.

(Or just double-click `index.html` to open it directly in a browser —
everything except the routes will work, since `/qr` and `/leaderboard`
need a real server to route correctly.)

## Deploy to Vercel

1. Push `index.html`, `vercel.json`, `supabase.sql`, and this `README.md`
   to your repo (no `package.json`).
2. In the Vercel dashboard, when importing the project, set **Framework
   Preset** to **Other** — this skips any build step entirely.
3. Deploy. Then go to **Project Settings → Deployment Protection** and
   make sure it's **off** (at least for Production), otherwise visitors
   who aren't logged into your Vercel team will hit a login wall instead
   of the quiz — that's what caused the earlier "blank page."
4. Use your **Production** URL (the clean `your-project.vercel.app` one)
   for the QR code and leaderboard screen — not a preview/hash URL.

## Make the leaderboard shared between phones (optional)

By default, scores are stored per-device in `localStorage` — fine for a
single Helpdesk laptop being the source of truth, but scores from
different phones won't merge automatically.

To share scores across every device:

1. Create a free [Supabase](https://supabase.com) project.
2. Open the SQL editor and run `supabase.sql`.
3. In Supabase, go to Project Settings → API and copy the **Project URL**
   and **anon public key**.
4. Open `index.html` and fill in the two constants near the top of the
   `<script>` block:
   ```js
   var SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
   var SUPABASE_ANON_KEY = "your-anon-key";
   ```
5. Redeploy. The anon key is meant for browser use — row-level security
   policies in `supabase.sql` limit what it can do (read all scores,
   insert new ones within sane bounds only).

## Customizing questions

Edit the `Q` array near the top of the `<script>` block in `index.html`.
Each question is `[emoji, clue, answer]`, with optional accepted
alternate answers in the `ALIASES` object. 8–12 questions with
unambiguous answers works best.

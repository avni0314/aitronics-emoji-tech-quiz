# AiTronics Emoji Tech Quiz

A mobile-first, direct-answer tech quiz with:
- QR entry page at `/qr`
- Quiz at `/`
- Live leaderboard at `/leaderboard`
- 20-second question timer
- 15-point speed bonus
- No Google Forms and no multiple-choice options
- Supabase-backed shared leaderboard, with localStorage demo fallback

## Run locally

```bash
npm install
npm run dev
```

Then open:
- `http://localhost:5173/` — player quiz
- `http://localhost:5173/qr` — QR poster
- `http://localhost:5173/leaderboard` — live leaderboard

## Make the leaderboard shared between phones

1. Create a free Supabase project.
2. Open the SQL editor and run `supabase.sql`.
3. Copy `.env.example` to `.env`.
4. Put your Supabase project URL and anon key into `.env`.
5. Run `npm run build` and deploy to Vercel/Netlify.
6. Open `https://YOUR-DOMAIN/qr` and print the QR.
7. Keep `https://YOUR-DOMAIN/leaderboard` open on the Helpdesk laptop/screen.

The anon key is intended for browser use. The database policies limit submissions to sensible score/name ranges.

## Customizing questions

Edit the `QUESTIONS` array in `src/main.jsx`.

Each question has:
- `emoji`
- `clue`
- `answer`
- optional aliases in the `aliases` object

For your event, I recommend 8–12 questions and keeping the answers unambiguous.

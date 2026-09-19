# Kop Karuthu

Website for Kop Karuthu, a Tamil Liverpool FC fan podcast. It is built with Next.js 16 (Cache Components), Tailwind v4, GSAP + ScrollTrigger, Lenis, Motion, OGL and cobe.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the keys
npm run dev
```

| Variable | What it powers |
| --- | --- |
| `YOUTUBE_API_KEY` | Episodes, channel stats and live/upcoming watchalong detection. Server-only. |
| `YOUTUBE_HANDLE` | Channel handle. Defaults to `kopkaruthu`. |
| `FOOTBALL_DATA_API_KEY` | Premier League table position ([football-data.org](https://www.football-data.org)). |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for OG/metadata. |

Sections whose key is missing show a friendly fallback instead of breaking.

## Data sources

Only YouTube and the table position need your keys; everything else works without one:

| Data | Source |
| --- | --- |
| Next match, last-5 form (all competitions) | ESPN public API |
| Last Premier League starting XI and formation | ESPN match summary |
| Squad, full names, Premier League stats | Official Fantasy Premier League API |
| Player photos | premierleague.com 500×500 cutouts, falling back to Wikipedia |
| Episodes, stats, live status | YouTube Data API (your key) |

## Editing content

- **Images:** `lib/images.ts` is the one registry for every image. Change a `src` to swap an image; local files in `/public/images` work too. To use your own squad photos, add them under `squadOverrides`, keyed by the player's Premier League photo code.
- **Copy, socials, host bios, timeline:** `content/site.ts`. Items marked `PLACEHOLDER` are waiting on real details.
- **Legends (stats, trophies, moments):** `content/legends.ts`.

## Pages

- `/`: home
- `/episodes`: full catalogue with search
- `/live`: watchalong stage
- `/squad`: roster and legends
- `/about`: who we are

## Caching and API quotas

- **YouTube:** reads the uploads playlist (1 quota unit per call) instead of search (100 units per call).
- **football-data.org:** results are cached for 30 minutes.
- **ESPN / FPL:** schedules refresh every 15 minutes, the squad and stats hourly, and photos daily.
- **Failed calls:** these are cached for only about a minute, so they retry soon.

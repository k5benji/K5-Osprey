# Osprey

AI-based software for defense-grade security. Osprey is a conversational AI OS
interface built for the military and other high-assurance environments — it
helps teams handle data breaches, maintain extreme privacy, and advance the
safety and operational-security developments that mission-critical work
depends on. It surfaces exposure, guides containment of active risks, viruses,
and other malware, and walks operators through remediation. Built with
[Astro](https://astro.build) and deployed on Cloudflare Pages, with the API
running as Cloudflare Pages Functions backed by a D1 (SQLite) database.

Built by Kastle Five Systems.

## What it does

- **Conversational AI OS interface** — operate and query the system in plain
  language instead of hunting through menus and settings.
- **Extreme privacy** — built for environments where data minimization,
  compartmentalization, and operational security are non-negotiable.
- **Data-breach handling** — assess exposure, contain the blast radius, and work
  through a clear response rather than a wall of alerts.
- **Threat response** — guide containment of active risks, viruses, and other
  malware, with the highest-impact actions first.
- **Safety & OPSEC developments** — support the ongoing safety and
  security-hardening work that mission-critical operations require.
- **Web-aware answers** — an optional search mode pulls in live sources and
  cites them alongside each answer.

> Note: Osprey is an AI interface and advisory layer. It does not replace a
> dedicated endpoint-protection engine, accredited defense systems, or formal
> incident response; it helps operators understand, prioritize, and act on
> risks. Deployment in classified or regulated environments is the operator's
> responsibility and subject to the applicable authorization and accreditation.

## Stack

- **Frontend** — Astro pages in `src/pages`, components in `src/layouts`.
- **API** — Cloudflare Pages Functions in `functions/` (file-based routing;
  `functions/api/oracle.js` → `POST /api/oracle`). Files and folders prefixed
  with `_` (e.g. `functions/_auth.js`) are shared helpers, not routes.
- **Database** — Cloudflare D1. Schema lives in `migrations/` and is applied in
  order.
- **Auth** — Google and GitHub OAuth; sessions are stored in the `sessions`
  table and carried in an `HttpOnly` `session` cookie.

## Project layout

```text
functions/        Cloudflare Pages Functions (the API)
  _auth.js        shared helpers: sessions, cookies, response shaping
  api/            REST endpoints (oracle chat, auth, profile, …)
migrations/       D1 schema migrations, applied in numeric order
src/
  pages/          Astro routes (index chat UI, profile)
  layouts/        shared page shell
test/             Vitest unit tests for the function helpers
```

## Commands

All commands run from the project root.

| Command              | Action                                   |
| :------------------- | :--------------------------------------- |
| `npm install`        | Install dependencies                     |
| `npm run dev`        | Start the dev server at `localhost:4321` |
| `npm run build`      | Build the production site to `./dist/`   |
| `npm run preview`    | Preview the production build locally      |
| `npm test`           | Run the unit tests once                  |
| `npm run test:watch` | Run the unit tests in watch mode         |

## Tests

Unit tests live in `test/` and run with [Vitest](https://vitest.dev). They
cover the pure and DB-backed helpers in `functions/_auth.js`.

## License

Osprey is open source under the [Apache License 2.0](LICENSE) — free to use,
modify, and distribute, with an explicit patent grant. See [NOTICE](NOTICE) for
attribution. Copyright 2026 Kastle Five Systems.

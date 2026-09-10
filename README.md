# Osprey

An AI-native OS interface with privacy built in. Osprey is a conversational
front end that watches over your system — helping you understand and contain
data-breach exposure, active risks, viruses, and other malware, and guiding you
through healing the problems it finds. Built with
[Astro](https://astro.build) and deployed on Cloudflare Pages, with the API
running as Cloudflare Pages Functions backed by a D1 (SQLite) database.

Built by Kastle Five Systems.

## What it does

- **Conversational OS interface** — talk to Osprey in plain language instead of
  hunting through menus and settings.
- **Privacy tools** — surface what is exposed, what is leaking, and what to lock
  down, with concrete, step-by-step guidance.
- **Breach & threat response** — help assess data-breach exposure and walk
  through containing current risks, viruses, and other malware.
- **Heal, don't just alert** — the goal is remediation: clear next actions that
  resolve the issue, not another dashboard of warnings.
- **Web-aware answers** — an optional search mode pulls in live sources and
  cites them alongside each answer.

> Note: Osprey is an interface and assistant layer. It does not replace a
> dedicated endpoint-protection engine; it helps you understand, prioritize, and
> act on risks.

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

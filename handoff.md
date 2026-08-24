# ArchiveFuse — Handoff

## Current checkpoint
- Contract + Next.js frontend implementation pushed to `ometere123/archivefuse`.
- Architecture is contract + frontend only; no separately hosted backend/database/indexer/mock mode.
- Contract includes immutable records, VecDB candidate recall, bounded consensus entity resolution, deterministic cluster settlement and versioned correction provenance.
- Frontend includes collection shelves, registrar, record detail, candidate recall, comparison light table, case receipt, entity dossier, correction workflow/receipt, source viewer, lineage and timeline.
- StudioNet address: **not deployed / not yet proven**.
- Vercel URL: **not deployed / not yet proven**.

## Verification truth
Before push, the locally executable source/preflight suite was green. CI is configured to install GenLayer tooling, run preflight, pytest Direct Mode/source tests, Python compile, `genvm-lint`, TypeScript, ESLint and Next production build. Do not convert a pending/failing CI run into a claimed pass.

## Next exact action
Inspect GitHub Actions. Fix any clean-environment failures. When green, deploy the frozen source to StudioNet using a safe local development CLI account, record the real address/tx/source commit in `DEPLOYMENT.json`, run schema/lifecycle scripts, then configure and deploy the frontend to Vercel.

# AGENTS.md — ArchiveFuse

ArchiveFuse is a GenLayer contract + Next.js frontend product. Read `memory.md`, `prd.md`, `architecture.md`, `trd.md`, `ui/ux.md`, `project-plan.md`, then `handoff.md` before major work.

## Non-negotiables
- StudioNet chain 61999; `genlayer-js` 1.1.8.
- Contract is the authoritative application state.
- No separately hosted backend, application database, custom indexer, or mock-data production mode.
- Injected wallet only for browser writes; never persist or expose a private key.
- A FINALIZED transaction is not success until GenVM leader execution is explicitly `SUCCESS`.
- VecDB retrieves candidates; it never decides identity or authorizes a merge.
- Original record payloads are immutable.
- Consensus is bounded, source-grounded and fail-closed.
- UI must remain the museum registrar/card-catalogue reading-room design, not a generic AI dashboard.

## Operating loop
After every meaningful work unit: run relevant checks, update `handoff.md` with reality, and update durable docs if architecture or behavior changed. Never record work, tests or deployments that did not actually happen.

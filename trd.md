# ArchiveFuse — Technical Requirements

## Baseline
StudioNet chain `61999`, endpoint `https://studio.genlayer.com/api`, explorer `https://explorer-studio.genlayer.com`, `genlayer-js@1.1.8`, Next.js 16.3.2 / React 19.2.4 / TypeScript.

## Contract
Use native 384-dimension `genlayer_embeddings.VecDB` with `all-MiniLM-L6-v2`. KNN is bounded and filtered by archive/entity type. Nondeterministic judgment independently fetches public evidence, verifies submitted SHA-256 bindings, bounds source size/text, treats fetched text and record/candidate fields as hostile evidence rather than instructions, returns bounded structured decisions, and requires validator agreement on decision-critical semantics. Deterministic code owns access control, versions, duplicate-pending guards, staleness, cluster mutation, active-cluster accounting, bounds and lifecycle.

`SAME_ENTITY` requires at least two shared identity-anchor categories from both leader and validator. `DETACH_MEMBER` requires the same multi-anchor standard for affirmative contradiction. Vector distance is retrieval metadata only.

Optional resolution evidence is valid only as a URL+digest pair. Proposal-time resolution candidate context is stored with the case. Correction proposals freeze bounded peer-record IDs; adjudication uses those frozen IDs rather than rerunning KNN and silently changing the question. Same-active-cluster pairs must use the correction path. Stale cases/corrections have deterministic terminalization methods that do not execute semantic judgment.

Public list views use non-mutating storage reads. Superseded clusters have zero active member count and current membership is always determined by `record_cluster`.

## Frontend
Direct browser reads use an ephemeral read account only because the SDK requires one. User writes use `window.ethereum` after explicit connect. Handle `accountsChanged`, `chainChanged` and `disconnect`. Gate the write again immediately before signing. Wait for `FINALIZED`, reread the transaction, inspect leader GenVM execution, then reread authoritative contract state.

Every collection loader must walk bounded contract pagination rather than silently stopping at the first 50 results. Resolution and correction discovery use those complete live loaders. The registrar exposes archive creation, record accession, and steward-only curator grant/revoke. Registered third-party source previews are script-disabled and no-referrer.

## Infrastructure
No application backend, API server, database, server signer, custom indexer or production mock-data fallback. Deployment footprint is one StudioNet contract and one Vercel frontend.

## Verification
Preflight, source regressions, GenLayer Direct Mode adversarial lifecycle tests, contract compile/lint, TypeScript, ESLint, production build, schema verification and real StudioNet lifecycle when credentials/network permit. A generated lockfile and `npm ci` clean install are required before release so frontend CI is reproducible.

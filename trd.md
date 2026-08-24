# ArchiveFuse — Technical Requirements

## Baseline
StudioNet chain `61999`, endpoint `https://studio.genlayer.com/api`, explorer `https://explorer-studio.genlayer.com`, `genlayer-js@1.1.8`, Next.js 16.3.2 / React 19.2.4 / TypeScript.

## Contract
Use native 384-dimension `genlayer_embeddings.VecDB` with `all-MiniLM-L6-v2`. KNN is bounded and filtered by archive/entity type. Nondeterministic judgment must independently fetch public evidence, verify submitted SHA-256 bindings, treat fetched text as hostile evidence rather than instructions, return bounded structured decisions, and use validator agreement on decision-critical semantics. Deterministic code owns access control, versions, staleness, cluster mutation, bounds and lifecycle.

## Frontend
Direct browser reads use an ephemeral read account only because the SDK requires one. User writes use `window.ethereum` after explicit connect. Handle accountsChanged, chainChanged and disconnect. Gate the write again immediately before signing. Wait for `FINALIZED`, reread the transaction, inspect leader GenVM execution, then reread authoritative contract state.

## Infrastructure
No application backend, API server, database, server signer, custom indexer or production mock-data fallback. Deployment footprint is one StudioNet contract and one Vercel frontend.

## Verification
Preflight, source regressions, GenLayer Direct Mode, contract compile/lint, TypeScript, ESLint, production build, schema verification and real StudioNet lifecycle when credentials/network permit.

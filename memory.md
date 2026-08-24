# ArchiveFuse — Project Memory

## Durable truth
ArchiveFuse is a contract + frontend product for provenance-preserving entity resolution in public historical archives. The contract is the source of truth; there is no separately hosted backend, application database, indexer or mock-data production path.

Frozen defaults: StudioNet 61999; `genlayer-js` 1.1.8; injected-wallet browser writes; FINALIZED then GenVM-success verification; VecDB MiniLM 384d retrieval only.

Contract invariants: source record payloads are immutable; person cutoff enforced; SAME_ENTITY requires same entity type plus at least two shared identity-anchor categories; semantic similarity cannot merge; authoritative evidence is HTTPS + SHA-256 bound; optional resolution evidence requires URL+digest together; unavailable/empty/oversized/mismatched evidence fails closed; current cluster membership is separate from original record; correction can detach current membership without erasing prior receipts.

Lifecycle decisions: only one pending resolution per unordered record pair and one pending correction per cluster-record membership. Records already in the same active cluster use the correction flow rather than a second contradictory resolution. Resolution candidate context is frozen on the case. Correction peer IDs are frozen at proposal and reused at adjudication. Cases/corrections whose base canonical state changed can be deterministically terminalized as STALE without semantic judgment.

Cluster accounting: archive `cluster_count` is active canonical clusters. Global `stats.cluster_count` is historical cluster objects created; `active_cluster_count` is current global canonical clusters. Superseded clusters report zero active member count.

Frontend truth: all list loaders walk contract pagination; failed live reads never fall back to fixtures. Registrar exposes archive creation, record accession and curator grant/revoke. Registered third-party source previews are sandboxed without scripts/referrer.

UI identity: museum registrar's card catalogue / reading room with parchment, oxblood and teal.

## Status
Source hardening plus the canonical-label detach fix are locally verified. The pinned `genlayer-test==0.29.2` Direct Mode suite passes 51/51, `genvm-lint` passes with informational newer-runner notices, and the generated lockfile clean-install/typecheck/lint/build gates pass. `DEPLOYMENT.json` remains `NOT_DEPLOYED` until a real StudioNet address and transaction are obtained. Never invent them.

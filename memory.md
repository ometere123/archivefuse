# ArchiveFuse — Project Memory

## Durable truth
ArchiveFuse is a contract + frontend product for provenance-preserving entity resolution in public historical archives. The contract is the source of truth; there is no separately hosted backend, application database, indexer or mock-data production path.

Frozen defaults: StudioNet 61999; `genlayer-js` 1.1.8; injected-wallet browser writes; FINALIZED then GenVM-success verification; VecDB MiniLM 384d retrieval only.

Contract invariants: source record payloads are immutable; person cutoff enforced; SAME_ENTITY requires same entity type plus multiple shared identity-anchor categories; semantic similarity cannot merge; evidence is HTTPS + SHA-256 bound; missing/mismatched evidence fails closed; current cluster membership is separate from original record; correction can detach current membership without erasing prior receipts.

UI identity: museum registrar's card catalogue / reading room with parchment, oxblood and teal.

## Status
Implementation is present in repository. Local source/preflight tests were green before push; GitHub CI is the authoritative clean-environment check. `DEPLOYMENT.json` remains `NOT_DEPLOYED` until a real StudioNet address and transaction are obtained. Never invent them.

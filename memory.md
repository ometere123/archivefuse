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
Source hardening plus the canonical-label detach fix are verified. The pinned `genlayer-test==0.29.2` Direct Mode suite passes 51/51, `genvm-lint` passes with informational newer-runner notices, the generated lockfile clean-install/typecheck/lint/build gates pass, and GitHub Actions run `32767247446` is green. StudioNet deployment is real at `0x35070251e889dC4d688Fd52313cd420b25cD4e2a` from source commit `61f98e50c4f4cc8aa952c26fc3182226f4933762`; deployment transaction `0x084b1fdac390cd1fb4cd2761c552658a06572d9a8ca87769a5980fe1eea92359` finalized with GenVM SUCCESS/MAJORITY_AGREE. Deployed source equality is proven byte-for-byte at 53,004 bytes with SHA-256 `f82dfeb2a181ed8f4691bdbeb02c48886f248cf0aa95ad264c2183887e607ac3`. Live archive 1 has four records; VecDB preview surfaced record 4 without membership mutation; resolution cases 1 and 2 fail-closed as `INSUFFICIENT_EVIDENCE`; curator grant/revoke was verified. No positive SAME_ENTITY, live correction, cluster append/merge, or hosted wallet write is claimed. Full evidence is in `evidence/studionet.json`.

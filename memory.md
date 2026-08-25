# ArchiveFuse — Project Memory

## Durable truth
ArchiveFuse is a contract + frontend product for provenance-preserving entity resolution in public historical archives. The contract is the source of truth; there is no separately hosted backend, application database, indexer or mock-data production path.

Frozen defaults: StudioNet 61999; `genlayer-js` 1.1.8; injected-wallet browser writes; FINALIZED then GenVM-success verification; VecDB MiniLM 384d retrieval only.

Contract invariants: source record payloads are immutable; person cutoff enforced; SAME_ENTITY requires same entity type plus at least two shared identity-anchor categories; semantic similarity cannot merge; authoritative evidence is HTTPS + SHA-256 bound; optional resolution evidence requires URL+digest together; unavailable/empty/oversized/mismatched evidence fails closed; current cluster membership is separate from original record; correction can detach current membership without erasing prior receipts.

Lifecycle decisions: only one pending resolution per unordered record pair and one pending correction per cluster-record membership. Records already in the same active cluster use the correction flow rather than a second contradictory resolution. Resolution candidate context is frozen on the case. Correction peer IDs are frozen at proposal and reused at adjudication. Cases/corrections whose base canonical state changed can be deterministically terminalized as STALE without semantic judgment.

Cluster accounting: archive `cluster_count` is active canonical clusters. Global `stats.cluster_count` is historical cluster objects created; `active_cluster_count` is current global canonical clusters. Superseded clusters report zero active member count.

Frontend truth: all list loaders walk contract pagination; failed live reads never fall back to fixtures. Registrar exposes archive creation, record accession and curator grant/revoke. Registered third-party source previews are sandboxed without scripts/referrer.

UI identity: museum registrar's card catalogue / reading room with parchment, oxblood and teal.

## Final hardening pass

The contract source changed in `8fe09e0bc07967d4a3c46d1a7990fe7df9b73a25` to fix active-membership projection across detach/reattach and merge-back. Direct Mode is now 55/55, including repeated correction cycles and duplicate-free merge-back. The source is LF-pinned with `.gitattributes`; the corrected Git blob and working tree are both 53,335 bytes with SHA-256 `c2366984a5cb34578f4233b2e77876e623877bcdda5d0a215eff5f5fb884b589`. The old deployed payload/blob discrepancy was measured precisely and preserved in the evidence manifest.

The corrected source is deployed at `0xBd71A829AbdECa647514752A86167c3BDFF1BAf1` from commit `8fe09e0bc07967d4a3c46d1a7990fe7df9b73a25`, transaction `0xf7bbf97dd2c056b485952ce1f211ab3e272832900617ef75170329743a2af55a`. The old address and recovery deployment remain historical. Current live proof includes a fresh immutable-charter archive, two records, a positive adjudication and active cluster; append/merge, correction and hosted wallet write remain unproven.

## Status
Source hardening plus the canonical-label detach fix are verified. The pinned `genlayer-test==0.29.2` Direct Mode suite is 55/55, `genvm-lint` passes with informational newer-runner notices, and the corrected source is deployed at `0xBd71A829AbdECa647514752A86167c3BDFF1BAf1` with 26/26 schema. The corrected source and deployed payload are 53,335 LF bytes with SHA-256 `c2366984a5cb34578f4233b2e77876e623877bcdda5d0a215eff5f5fb884b589`. Its current archive 1 case finalized as SAME_ENTITY with anchors NAME_ALIAS, DATE, PLACE and ROLE_OCCUPATION; cluster 1 contains records 1 and 2 and is active. Earlier deployments and fail-closed cases remain preserved. No live correction, append/merge or hosted wallet write is claimed. Full evidence is in `evidence/studionet.json`.

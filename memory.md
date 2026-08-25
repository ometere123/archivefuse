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

The current StudioNet address still contains the previous source because this pass has not redeployed it. The Windows environment has no installed `genlayer` CLI and WSL is blocked by `E_ACCESSDENIED`; fresh deployment, live corrected append/merge/correction proof and a matching Vercel contract update remain blocked until an authorized supported CLI/account is available. The old address and positive archive-3 evidence remain historical and are not relabeled as proof of this corrected source.

## Status
Source hardening plus the canonical-label detach fix are verified. The pinned `genlayer-test==0.29.2` Direct Mode suite passes 52/52, `genvm-lint` passes with informational newer-runner notices, and GitHub Actions run `32789925156` is green for source release `55db727ed6ed34d19c4faabc60d06633723ed42b`. The original StudioNet deployment became unavailable and the unchanged verified source was recovered at `0xB676A1bF06811A093448F7ad39D8Fa65B075fC39`; deployment transaction `0xddd3e000ec610efbaa98f81ed74c2032162a68cb3ff88db919c94f880d605405` finalized with GenVM SUCCESS/MAJORITY_AGREE. Deployed source equality remains proven byte-for-byte at 53,004 bytes with SHA-256 `f82dfeb2a181ed8f4691bdbeb02c48886f248cf0aa95ad264c2183887e607ac3`. Archive 3 corrected archive 2’s decoded-text digest mistake by using exact raw-byte hashes. Its positive case 2 finalized as SAME_ENTITY with anchors NAME_ALIAS, DATE, PLACE and ROLE_OCCUPATION; cluster 1 contains records 5 and 6 and is active. Direct preview_candidates returned no payload during recovery, so frozen proposal candidate context is recorded without overclaiming direct preview. No live correction, append/merge or hosted wallet write is claimed. Full evidence is in `evidence/studionet.json`.

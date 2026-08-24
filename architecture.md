# ArchiveFuse — Architecture

## Thesis
ArchiveFuse resolves whether public historical records refer to the same entity without deleting provenance. VecDB retrieves plausible records; independent GenLayer validators judge public, digest-bound evidence; deterministic contract code applies the only allowed canonical state transition.

## Deployment boundary
```text
Browser / Next.js on Vercel
  -> direct genlayer-js reads
  -> injected-wallet writes
GenLayer StudioNet / ArchiveFuse contract
  -> canonical archives, records, cases, active clusters, corrections
  -> contract-owned VecDB
  -> validator consensus + web access
```
There is no application backend, database mirror, custom indexer or hidden Next.js API authority.

## Core state
`Archive`, immutable `Record`, `ResolutionCase`, `EntityCluster`, `CorrectionCase`, `VectorPointer`, plus separate current `record_cluster` membership. Archive `cluster_count` means active canonical clusters; `stats.cluster_count` is the historical number of cluster objects created and `stats.active_cluster_count` is current global canonical entities.

## Resolution flow
Register bounded public metadata + SHA-256 source binding -> VecDB candidate preview -> freeze pairwise case and proposal-time candidate context -> validators independently fetch source evidence -> structured relation -> deterministic anchor/staleness checks -> optional cluster create/append/merge -> immutable receipt.

Optional additional resolution evidence must supply URL and SHA-256 digest together or neither. Only one pending case may exist for an unordered record pair. Records already in the same active cluster cannot be re-resolved into a contradictory receipt; membership challenges use the correction flow. If cluster state changes after proposal, anyone may deterministically terminalize the obsolete case as `STALE` without running semantic judgment.

## Correction flow
Challenge an active cluster member with new digest-bound public evidence -> freeze bounded proposal-time peer record IDs -> validators independently re-fetch the target, correction evidence and those frozen peer sources -> `KEEP_MEMBER`, `DETACH_MEMBER`, or `INSUFFICIENT_EVIDENCE` -> deterministic multi-anchor/staleness checks -> current membership/version may change while every prior receipt remains.

Only one pending correction may exist for a cluster-record membership. If cluster state changes after proposal, the obsolete correction can be deterministically closed as `STALE`. VecDB is used to prioritize bounded peers; active cluster membership is the deterministic fallback so a legitimate correction cannot become impossible merely because unrelated vectors crowd the KNN window.

## Evidence boundary
All authoritative public sources are HTTPS + SHA-256 bound. Validators independently fetch them. Non-200, empty, oversized, unavailable or digest-mismatched source bodies fail closed. Fetched text, record metadata and candidate context are explicitly treated as hostile evidence, never instructions. Only bounded text reaches the semantic prompt.

## Invariants
Original records never mutate or delete. Same-entity requires same entity type and at least two shared anchor categories. A record has at most one current cluster. Similarity is retrieval only. Person records must respect archive cutoff. Cluster membership is bounded. Superseded clusters report zero active members. Missing or digest-mismatched evidence fails closed. Public list views never create storage as a side effect.

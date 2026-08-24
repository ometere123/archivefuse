# ArchiveFuse — Architecture

## Thesis
ArchiveFuse resolves whether public historical records refer to the same entity without deleting provenance. VecDB retrieves plausible records; independent GenLayer validators judge public, digest-bound evidence; deterministic contract code applies the only allowed state transition.

## Deployment boundary
```text
Browser / Next.js on Vercel
  -> direct genlayer-js reads
  -> injected-wallet writes
GenLayer StudioNet / ArchiveFuse contract
  -> canonical archives, records, cases, clusters, corrections
  -> contract-owned VecDB
  -> validator consensus + web access
```
There is no application backend, database mirror, custom indexer or hidden Next.js API authority.

## Core state
`Archive`, immutable `Record`, `ResolutionCase`, `EntityCluster`, `CorrectionCase`, `VectorPointer`, plus separate current `record_cluster` membership.

## Resolution flow
Register bounded public metadata + SHA-256 source binding -> VecDB candidate preview -> freeze pairwise case -> validators independently fetch source evidence -> structured relation -> deterministic anchor/staleness checks -> optional cluster create/append/merge -> immutable receipt.

## Correction flow
Challenge an active cluster member with new digest-bound public evidence -> validators compare target with active peer evidence -> `KEEP_MEMBER`, `DETACH_MEMBER`, or `INSUFFICIENT_EVIDENCE` -> deterministic multi-anchor/staleness checks -> current membership/version may change while prior receipts remain.

## Invariants
Original records never mutate or delete. Same-entity requires same entity type and at least two shared anchor categories. A record has at most one current cluster. Similarity is retrieval only. Person records must respect archive cutoff. Cluster membership is bounded. Missing or digest-mismatched evidence fails closed.

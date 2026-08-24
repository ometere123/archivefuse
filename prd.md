# ArchiveFuse — Product Requirements

**Product:** consensus entity resolution for public historical archives.

## Goal
Let archivists register public historical source records, discover semantically related candidates, resolve identity under GenLayer consensus, inspect canonical provenance clusters, and correct a mistaken prior merge without erasing historical receipts.

## Users
Archivists/stewards create archives and manage curator access; authorized curators register material; researchers compare records and propose cases/corrections; public readers browse without a wallet; GenLayer validators independently judge bounded public evidence.

## MVP
- PERSON, PLACE and ORGANIZATION records.
- Archive charter and historical cutoff.
- Steward-controlled curator grant/revoke.
- Immutable accession records with public source URL + SHA-256 digest.
- Contract-owned VecDB candidate retrieval.
- Pairwise outcomes: `SAME_ENTITY`, `RELATED_ENTITY`, `DISTINCT_ENTITY`, `INSUFFICIENT_EVIDENCE`.
- Canonical active entity clusters and lineage.
- Versioned membership corrections.
- Deterministic `STALE` closure when canonical state changed after proposal.
- Live-only frontend with explicit unavailable/empty states and complete contract pagination.

## Resolution rules
Similarity may surface a candidate but never settles identity. `SAME_ENTITY` requires independent validator agreement and at least two shared identity-anchor categories. Optional extra evidence must be frozen as an HTTPS URL + SHA-256 digest pair. Only one pending resolution may exist for an unordered record pair. If records already share an active canonical cluster, the user must challenge membership through the correction flow rather than creating a contradictory resolution receipt.

## Correction rules
A correction freezes its bounded proposal-time peer record IDs. Validators later judge the target against those same digest-bound peer sources and the new correction evidence. `DETACH_MEMBER` requires affirmative contradiction across at least two shared anchor categories. Detachment changes current membership/version but does not mutate the original accession record or erase the old merge receipt.

## Acceptance
A hosted frontend must execute the critical path against a real StudioNet deployment before deployment claims are made. Final receipts must be reconstructable from contract views. Similarity must never be presented as identity confidence or mutate state. Missing, oversized, empty or digest-mismatched evidence and malformed consensus fail closed. Public list views must not mutate storage. Source previews in the browser must treat registered third-party pages as untrusted content.

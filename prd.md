# ArchiveFuse — Product Requirements

**Product:** consensus entity resolution for public historical archives.

## Goal
Let archivists register public historical source records, discover semantically related candidates, resolve identity under GenLayer consensus, inspect canonical provenance clusters, and correct a mistaken prior merge without erasing historical receipts.

## Users
Archivists/curators register and manage material; researchers compare records and propose cases; public readers browse without a wallet; GenLayer validators independently judge bounded public evidence.

## MVP
- PERSON, PLACE and ORGANIZATION records.
- Archive charter and historical cutoff.
- Immutable accession records with public source URL + SHA-256 digest.
- Contract-owned VecDB candidate retrieval.
- Pairwise outcomes: `SAME_ENTITY`, `RELATED_ENTITY`, `DISTINCT_ENTITY`, `INSUFFICIENT_EVIDENCE`.
- Canonical entity clusters and lineage.
- Versioned membership corrections.
- Live-only frontend with explicit unavailable/empty states.

## Acceptance
A hosted frontend must execute the critical path against a real StudioNet deployment before deployment claims are made. Final receipts must be reconstructable from contract views. Similarity must never be presented as identity confidence or mutate state. Missing evidence and malformed consensus fail closed.

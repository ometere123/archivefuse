# ArchiveFuse

**Consensus entity resolution for public historical archives.**

ArchiveFuse is a full GenLayer product with exactly two maintained deployment layers: a GenLayer Intelligent Contract and a Next.js frontend. The contract owns archives, immutable accession records, semantic memory, candidate resolution cases, canonical entity clusters, correction provenance and final receipts. There is no application backend or database mirror.

## Why this exists
Historical identity is messy: spelling varies, married names change, census years disagree, place names evolve and catalogue systems duplicate the same person under different headings. Exact matching loses relationships; automatic fuzzy matching can silently collapse distinct people.

ArchiveFuse deliberately splits the problem:

1. **VecDB recalls** semantically related records inside the same archive/entity type.
2. **Validators judge** whether the public, SHA-256-bound source evidence supports `SAME_ENTITY`, `RELATED_ENTITY`, `DISTINCT_ENTITY` or `INSUFFICIENT_EVIDENCE`.
3. **Deterministic code settles** cluster membership only after strict relation/anchor/version checks.
4. **Corrections remain provenance**, so later evidence can detach a mistaken member without erasing the old resolution receipt.

Vector distance is never presented as confidence and can never authorize a merge by itself.

## Architecture

```text
Next.js frontend (Vercel)
  │ direct genlayer-js reads
  │ injected-wallet writes
  ▼
GenLayer StudioNet · 61999
  └─ ArchiveFuse
      ├─ immutable records
      ├─ VecDB / all-MiniLM-L6-v2
      ├─ source SHA-256 bindings
      ├─ independent consensus
      ├─ canonical entity clusters
      └─ versioned correction receipts
```

No Supabase. No Firebase. No SQL/Redis. No API server. No custom indexer. No mock-data application mode.

## Contract highlights

- immutable `Record` payloads; current membership lives in a separate mapping;
- archive steward + curator authorization;
- historical person cutoff policy;
- bounded 384-dimensional contract-owned VecDB;
- deterministic same-archive/same-type candidate filter;
- source/evidence HTTPS + SHA-256 binding;
- custom `run_nondet_unsafe` validator independently re-fetches/reasons;
- `SAME_ENTITY` requires at least two shared identity-anchor categories;
- stale resolution protection against cluster membership/version change;
- deterministic cluster create/append/merge, max 64 members;
- explicit correction path: `KEEP_MEMBER | DETACH_MEMBER | INSUFFICIENT_EVIDENCE`;
- detach requires at least two shared contradiction-anchor categories;
- append-only old receipts and active-member filtering;
- no payment/token surface.

## Frontend
The interface is a museum registrar's reading room rather than a generic AI dashboard:

- `/` — collection shelves
- `/register` — archive and accession registration
- `/records/[id]` — accession card + semantic candidate recall
- `/resolve/[a]/[b]` — two-card identity light table
- `/cases/[id]` — immutable resolution receipt
- `/entities/[clusterId]` — canonical entity dossier
- `/clusters/[id]/lineage` — resolution/correction provenance
- `/corrections/new` — challenge current membership
- `/corrections/[id]` — correction receipt
- `/sources/[id]` — registered public source lightbox
- `/timeline` — live archive chronology

Reads do not require a wallet. Writes use an explicitly connected injected wallet, track account/chain/disconnect changes, require StudioNet, wait for `FINALIZED`, inspect GenVM execution, and re-read contract state before showing success.

## Development

```bash
npm install
python -m pip install -r requirements-dev.txt
cp .env.example .env.local
npm run dev
```

Until a contract is deployed, leave `NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT` unset: the UI will show an honest unavailable/empty configuration state, not fake archival records.

### Verify

```bash
python scripts/preflight.py
python -m pytest tests/direct -q
python -m py_compile contracts/archivefuse.py
genvm-lint check contracts/archivefuse.py --json
npm run typecheck
npm run lint
npm run build
```

Direct Mode uses `genlayer-test==0.29.2` and the repository CI pins the GenVM universal SDK artifact to v0.2.16 with a SHA-256 check.

## StudioNet deployment

The current GenLayer CLI supports StudioNet directly:

```bash
genlayer network studionet
genlayer account show --rpc https://studio.genlayer.com/api
genlayer deploy --contract contracts/archivefuse.py --rpc https://studio.genlayer.com/api
```

Prefer an existing unlocked **development** account. If a new account is needed, create it through the CLI's supported encrypted-keystore flow and unlock it through the supported OS-keychain command. Do not hard-code a password/private key into scripts or repository files.

After deployment:

```bash
export NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT=0x...
npm run verify:schema
npm run verify:studionet
```

Then set the same public variables on Vercel:

- `NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT`
- `NEXT_PUBLIC_GENLAYER_ENDPOINT=https://studio.genlayer.com/api`

## Deployment status
See [`DEPLOYMENT.json`](./DEPLOYMENT.json) and [`handoff.md`](./handoff.md). They intentionally contain no fabricated address or transaction proof.

## Security / privacy boundary
ArchiveFuse is for public historical material. Contract state and vectors are public. Embeddings are not encryption. The MVP deliberately rejects PERSON records later than the archive's configured historical cutoff.

## License
Apache-2.0

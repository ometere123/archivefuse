# ArchiveFuse

**Consensus entity resolution for public historical archives.**

ArchiveFuse is a full GenLayer product with exactly two maintained deployment layers: a GenLayer Intelligent Contract and a Next.js frontend. The contract owns archives, immutable accession records, semantic memory, candidate resolution cases, canonical entity clusters, correction provenance and final receipts. There is no application backend or database mirror.

## Why this exists
Historical identity is messy: spelling varies, married names change, census years disagree, place names evolve and catalogue systems duplicate the same person under different headings. Exact matching loses relationships; automatic fuzzy matching can silently collapse distinct people.

ArchiveFuse deliberately splits the problem:

1. **VecDB recalls** semantically related records inside the same archive/entity type.
2. **Validators judge** whether public, SHA-256-bound evidence supports `SAME_ENTITY`, `RELATED_ENTITY`, `DISTINCT_ENTITY` or `INSUFFICIENT_EVIDENCE`.
3. **Deterministic code settles** cluster membership only after strict relation/anchor/version checks.
4. **Corrections remain provenance**, so later evidence can detach mistaken membership without erasing an earlier receipt.

Vector distance is retrieval metadata, never identity confidence, and can never authorize a merge by itself.

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
      ├─ independent validator consensus
      ├─ canonical active entity clusters
      └─ versioned correction receipts
```

No Supabase. No Firebase. No SQL/Redis. No API server. No custom indexer. No mock-data application mode.

## Contract highlights

- immutable `Record` payloads; current membership lives in a separate mapping;
- archive steward + curator authorization;
- historical person cutoff policy;
- bounded 384-dimensional contract-owned VecDB;
- same-archive/same-type candidate filtering;
- source/evidence HTTPS + SHA-256 binding and source-size bounds;
- optional resolution evidence requires URL + digest together;
- custom `run_nondet_unsafe` validators independently re-fetch and re-reason;
- `SAME_ENTITY` requires at least two shared identity-anchor categories;
- duplicate pending pair/correction guards;
- same-active-cluster challenges are forced into the correction flow;
- deterministic `STALE` terminalization when canonical state changed after proposal;
- deterministic cluster create/append/merge, max 64 active members;
- active-cluster accounting separate from historical cluster objects;
- correction proposals freeze proposal-time peer record IDs;
- `DETACH_MEMBER` requires at least two shared contradiction-anchor categories;
- original records and prior receipts remain addressable after correction;
- no payment/token surface.

## Frontend
The interface is a museum registrar's reading room rather than a generic AI dashboard:

- `/` — collection shelves
- `/register` — archive creation, record accession and steward curator access
- `/records/[id]` — accession card + semantic candidate recall
- `/resolve/[a]/[b]` — two-card identity light table
- `/cases/[id]` — immutable resolution receipt
- `/entities/[clusterId]` — canonical entity dossier
- `/clusters/[id]/lineage` — resolution/correction provenance
- `/corrections/new` — challenge current membership
- `/corrections/[id]` — correction receipt
- `/sources/[id]` — script-disabled registered-source lightbox
- `/timeline` — live archive chronology

Reads do not require a wallet. Writes use an explicitly connected injected wallet, track account/chain/disconnect changes, require StudioNet, wait for `FINALIZED`, inspect actual GenVM execution, then re-read authoritative contract state before displaying success. Live list loaders walk contract pagination rather than silently truncating state at the first 50 items.

## Development

```bash
npm install
python -m pip install -r requirements-dev.txt
cp .env.example .env.local
npm run dev
```

Until a contract is deployed, leave `NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT` unset: the UI shows an honest configuration/unavailable state, not fake archival records.

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

The Direct Mode suite contains adversarial lifecycle coverage for authorization, semantic-retrieval boundaries, digest failure, duplicate/stale cases, cluster merges and versioned corrections. It must actually run under `genlayer-test` before release; source presence alone is not a pass.

Before release, keep `package-lock.json` committed and use `npm ci` in CI. The current candidate has proven a clean `npm ci`, Direct Mode 52/52, `genvm-lint`, typecheck, ESLint, production build and green GitHub Actions run `32789925156` for source release `55db727ed6ed34d19c4faabc60d06633723ed42b`.

## StudioNet deployment

A helper exists at `scripts/deploy-studionet.sh`, but the installed GenLayer CLI's current `--help` output is authoritative. Use a safe local **development** account and the officially supported account/unlock workflow in that environment. Never hard-code or commit a password, private key, mnemonic or keystore secret.

After a real deployment, configure:

```bash
export NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT=0x...
npm run verify:schema
npm run verify:studionet
```

Then set these public values on Vercel:

- `NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT`
- `NEXT_PUBLIC_GENLAYER_ENDPOINT=https://studio.genlayer.com/api`

A deployment transaction being submitted or even `FINALIZED` is not enough: inspect the actual GenVM execution result and re-read the deployed contract/schema/state.

## Deployment status
See [`DEPLOYMENT.json`](./DEPLOYMENT.json) and [`handoff.md`](./handoff.md) for the real contract address, source commit and deployment transaction.

The original StudioNet deployment `0x35070251e889dC4d688Fd52313cd420b25cD4e2a` later became unavailable (`Contract not deployed` / `invalid_contract absent_runner_comment`). The exact unchanged source was redeployed at `0xB676A1bF06811A093448F7ad39D8Fa65B075fC39` in transaction `0xddd3e000ec610efbaa98f81ed74c2032162a68cb3ff88db919c94f880d605405`, with source commit `61f98e50c4f4cc8aa952c26fc3182226f4933762`. The hosted frontend is live at https://archivefuse.vercel.app/ and must be configured with the current address.

## Evidence and live proof

The machine-readable evidence package is [`evidence/studionet.json`](./evidence/studionet.json). The deployed contract source was retrieved with the GenLayer toolchain and compared byte-for-byte with `contracts/archivefuse.py`: both are 53,004 bytes with SHA-256 `f82dfeb2a181ed8f4691bdbeb02c48886f248cf0aa95ad264c2183887e607ac3`.

The complete schema verifier reports 26 actual and 26 expected methods, with no missing or unexpected methods. The live proof verifier confirms archive state, four immutable records, digest bindings, VecDB retrieval without membership mutation, two terminal fail-closed resolution cases, and curator grant/revoke state. No positive `SAME_ENTITY` cluster was claimed: StudioNet validators independently reported that the bound public sources could not be established. No live correction, cluster append/merge, or hosted injected-wallet write was claimed. The existing Direct Mode suite remains the proof for `DETACH_MEMBER` and canonical-label refresh.

Archive 2 was created with the immutable commit-pinned charter but initially used hashes computed from decoded PowerShell text; its positive case therefore failed closed. Archive 3 corrected this by binding the exact stable raw HTTP bytes: Gutenberg 33385 is 913,559 bytes with SHA-256 `20e308f88e199e0ee090bf1bb68d0f9cf959a249b5aa269396a05f1e8c740dae`, and Gutenberg 35418 is 419,142 bytes with SHA-256 `0a1c50383db4e01dbd8ee4c2d66647accb3a4313600894251053f6cd08c65503`. Both were fetched twice with identical bytes. Case 2 finalized with GenVM `SUCCESS` as `SAME_ENTITY`, storing `NAME_ALIAS`, `DATE`, `PLACE` and `ROLE_OCCUPATION`, and deterministically created cluster 1 with records 5 and 6. The old deployment’s fail-closed history and archive 2 remain preserved in the manifest. Direct `preview_candidates` RPC did not return a payload during recovery; the proposal’s frozen candidate context did record record 6, and this is distinguished from a direct preview proof. No live correction detach, cluster append/merge, or hosted-wallet write is claimed.

The original StudioNet deployment later became unavailable and was recovered at the current address with the identical verified contract source. The recovery deployment and archive 3 positive proof are recorded in [`evidence/studionet.json`](./evidence/studionet.json).

## Security / privacy boundary
ArchiveFuse is for public historical material. Contract state and vectors are public. Embeddings are not encryption. The MVP rejects PERSON records later than the archive's configured historical cutoff. Registered browser source previews are sandboxed as untrusted content; consensus independently fetches and verifies source bytes.

## License
Apache-2.0

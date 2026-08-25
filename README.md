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
- same-archive/same-type candidate filtering (within a deterministic global KNN scan bound; the current GenVM VecDB API has no server-side archive/type filter or offset);
- source/evidence HTTPS + SHA-256 binding and source-size bounds;
- optional resolution evidence requires URL + digest together;
- custom `run_nondet_unsafe` validators independently re-fetch and re-reason;
- `SAME_ENTITY` requires at least two shared identity-anchor categories;
- duplicate pending pair/correction guards;
- same-active-cluster challenges are forced into the correction flow;
- deterministic `STALE` terminalization when canonical state changed after proposal;
- deterministic cluster create/append/merge, max 64 active members; active membership is a unique projection of historical IDs, so detach/reattach and merge-back cannot duplicate active records;
- active-cluster accounting separate from historical cluster objects;
- correction proposals freeze proposal-time peer record IDs;
- `DETACH_MEMBER` requires at least two shared contradiction-anchor categories;
- original records and prior receipts remain addressable after correction;
- no payment/token surface.

Resolution proposals are intentionally permissionless: any address may submit a bounded, digest-bound case and any address may adjudicate or terminalize stale work. Duplicate pending-pair and pending-correction guards prevent concurrent conflicting receipts, while the threat model treats temporary proposal locking as an open-network spam trade-off rather than silently granting one operator authority. No payment, token or backend queue is used.

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

The Direct Mode suite contains adversarial lifecycle coverage for authorization, semantic-retrieval boundaries, digest failure, duplicate/stale cases, cluster merges, detach/reattach cycles and versioned corrections. It must actually run under `genlayer-test` before release; source presence alone is not a pass.

Before release, keep `package-lock.json` committed and use `npm ci` in CI. The current release proves a clean `npm ci`, Direct Mode 55/55, `genvm-lint`, typecheck, ESLint, production build and green GitHub Actions run `32874852407` on final main commit `c1040a04d9c9a26320c2343bc4975aa5594aeca1`.

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

The original StudioNet deployment `0x35070251e889dC4d688Fd52313cd420b25cD4e2a` later became unavailable. A recovery deployment at `0xB676A1bF06811A093448F7ad39D8Fa65B075fC39` is preserved historically. The current corrected deployment is `0xBd71A829AbdECa647514752A86167c3BDFF1BAf1`, transaction `0xf7bbf97dd2c056b485952ce1f211ab3e272832900617ef75170329743a2af55a`, source commit `8fe09e0bc07967d4a3c46d1a7990fe7df9b73a25`. The hosted frontend is live at https://archivefuse.vercel.app/ and now displays the corrected address; a hosted wallet write remains unproven.

## Evidence and live proof

The machine-readable evidence package is [`evidence/studionet.json`](./evidence/studionet.json). Source reproducibility reports the exact representation being compared: Git blobs are LF-normalized by `.gitattributes`, and the verifier separately records deployed payload, working-tree and deployed-source-commit blob byte lengths and SHA-256 values. “Byte-for-byte equal” is asserted only when the compared byte buffers are literally equal.

The complete schema verifier reports 26 actual and 26 expected methods, with no missing or unexpected methods. The current deployment has a fresh immutable-charter archive, two digest-bound Gutenberg records, a frozen VecDB candidate context, and a finalized positive `SAME_ENTITY` case. Validators stored `NAME_ALIAS`, `DATE`, `PLACE` and `ROLE_OCCUPATION`; cluster 1 contains records 1 and 2 and has canonical label `Lewis Carroll (Charles Lutwidge Dodgson)`. Earlier fail-closed cases and deployments remain preserved. Live correction, cluster append/merge and hosted injected-wallet write remain unclaimed; Direct Mode proves `DETACH_MEMBER` and canonical-label refresh.

Archive 2 was created with the immutable commit-pinned charter but initially used hashes computed from decoded PowerShell text; its positive case therefore failed closed. Archive 3 corrected this by binding the exact stable raw HTTP bytes: Gutenberg 33385 is 913,559 bytes with SHA-256 `20e308f88e199e0ee090bf1bb68d0f9cf959a249b5aa269396a05f1e8c740dae`, and Gutenberg 35418 is 419,142 bytes with SHA-256 `0a1c50383db4e01dbd8ee4c2d66647accb3a4313600894251053f6cd08c65503`. Both were fetched twice with identical bytes. Case 2 finalized with GenVM `SUCCESS` as `SAME_ENTITY`, storing `NAME_ALIAS`, `DATE`, `PLACE` and `ROLE_OCCUPATION`, and deterministically created cluster 1 with records 5 and 6. The old deployment’s fail-closed history and archive 2 remain preserved in the manifest. Direct `preview_candidates` RPC did not return a payload during recovery; the proposal’s frozen candidate context did record record 6, and this is distinguished from a direct preview proof. No live correction detach, cluster append/merge, or hosted-wallet write is claimed.

The original deployment loss, recovery deployment, corrected deployment, immutable-charter proof and positive case are recorded in [`evidence/studionet.json`](./evidence/studionet.json). The corrected deployment payload, working tree and Git blob are all 53,335 LF bytes with SHA-256 `c2366984a5cb34578f4233b2e77876e623877bcdda5d0a215eff5f5fb884b589`.

## Security boundaries and known limits

ArchiveFuse validates non-empty HTTPS URLs with a host-shaped authority, but GenVM web access does not expose a dependable universal network-policy primitive; validators still fail closed on fetch failure, oversize bodies, empty text and digest mismatch. Evidence extraction is bounded at 7,000 normalized characters using deterministic head/tail sampling, so sources should place decisive evidence near the beginning or end. VecDB currently exposes a global bounded `knn(query, k)` operation rather than filtered/offset search; ArchiveFuse filters archive and entity type after the bounded scan and never treats distance as identity proof. This limitation is explicit rather than hidden.

## Security / privacy boundary
ArchiveFuse is for public historical material. Contract state and vectors are public. Embeddings are not encryption. The MVP rejects PERSON records later than the archive's configured historical cutoff. Registered browser source previews are sandboxed as untrusted content; consensus independently fetches and verifies source bytes.

## License
Apache-2.0

# ArchiveFuse — Handoff

## Current checkpoint
- Complete contract + Next.js frontend implementation is on `ometere123/archivefuse/main`.
- Architecture is fixed: contract + Vercel frontend only; no separately hosted backend/database/indexer/mock mode.
- Contract owns immutable records, VecDB candidate recall, bounded consensus resolution, deterministic active-cluster settlement and versioned correction provenance.
- Frontend includes collection shelves, registrar, curator access, record detail, candidate recall, comparison light table, case receipt, entity dossier, correction workflow/receipt, source viewer, lineage and timeline.
- StudioNet address: `0x35070251e889dC4d688Fd52313cd420b25cD4e2a`.
- Deployment transaction: `0x084b1fdac390cd1fb4cd2761c552658a06572d9a8ca87769a5980fe1eea92359`.
- Deployed source commit: `61f98e50c4f4cc8aa952c26fc3182226f4933762`.
- Vercel URL: **NOT DEPLOYED / NOT PROVEN**.

## Hardening completed on 2026-08-24
The post-build audit found and fixed product/runtime integrity issues rather than only polishing UI:

1. Live loaders now walk every contract page instead of truncating authoritative state at 50 IDs.
2. Optional resolution evidence requires URL + SHA-256 digest together.
3. Same-active-cluster pairs cannot create contradictory resolution receipts; use corrections.
4. Duplicate pending resolution pairs and duplicate pending membership corrections are blocked.
5. Stale resolution/correction work can be terminalized deterministically as `STALE` without semantic judgment.
6. Correction proposals freeze bounded peer record IDs and adjudication uses that exact proposal-time peer set.
7. Correction context has an active-cluster fallback after semantic prioritization so KNN crowding cannot make correction impossible.
8. Public list views no longer use storage-inserting accessors.
9. Validator source fetches fail closed on non-200, empty, oversized, unavailable or SHA-256-mismatched content.
10. Cluster merge accounting now distinguishes historical cluster objects from active canonical clusters; superseded clusters report zero active members.
11. Registrar now exposes steward-only curator grant/revoke.
12. Registered source iframes are script-disabled and no-referrer.
13. Frontend schema requires the hardened stale-terminalization methods.
14. Direct Mode coverage was expanded from 4 tests to 18 adversarial lifecycle tests.
15. Source/preflight regressions now assert the hardened invariants.

## Runtime verification completed locally on 2026-08-24
The canonical-label detach issue is fixed in `contracts/archivefuse.py` with `_refresh_canonical_label`, called after a successful `DETACH_MEMBER`. The Direct Mode correction regression proves the original resolution receipt, correction receipt, immutable detached record, surviving member, and active-member canonical label.

- `genvm-lint check contracts/archivefuse.py --json`: PASS; 26 methods (17 views, 9 writes), informational newer-runner notices only.
- `npm ci --no-audit --no-fund`: PASS; 373 packages installed from the generated lockfile.
- `npm run verify`: PASS; preflight 22/22, Direct Mode 51/51, typecheck, ESLint and Next production build.
- `npm run test:source`: PASS; 33 tests.
- Direct Mode uses the pinned `genlayer-test==0.29.2` and SDK `v0.2.16`. A Windows fd-0 temp-file cleanup defect in that pinned harness required the scoped `tests/direct/conftest.py` compatibility shim; no contract behavior was bypassed.
- ESLint reports one existing warning in `postcss.config.mjs` (`import/no-anonymous-default-export`), with zero errors.
- The Next build reports a non-blocking warning that a user-level `package-lock.json` outside this repository is ignored; the repository lockfile is present and `npm ci` passed.
- GitHub Actions run `32766871934` exposed and reproduced a clean-run-only missing dependency: `google.protobuf` was not declared. `protobuf==7.35.1` is now explicit in `requirements-dev.txt`; hosted run `32767247446` is green with Direct Mode 51/51 and all frontend gates.

The deployment receipt finalized with `MAJORITY_AGREE` and leader GenVM `SUCCESS`. Live archive 1 has two digest-bound public records. `preview_candidates(1, 8)` surfaced record 2 at distance `0.5040914` while cluster membership remained unchanged. Resolution case 1 finalized fail-closed as `INSUFFICIENT_EVIDENCE` (no cluster mutation). Curator grant transaction `0x87c40853e5be57324103af090661abcbb2a0945c8be2a0f7a5e1dcbe564a2947` returned true through the live genlayer-js read; revoke transaction `0xdd2002d3d77c1aa7dfdd6e71c2376a0e3cf38f0f6825a5470014d3ab8a5f1fe4` returned false.

## Verification truth
What remains unproven:
- No Vercel deployment or hosted-wallet write exists; the Vercel CLI could not create its user config in this environment (`operation not permitted`).
- The live resolution was intentionally fail-closed; no positive SAME_ENTITY consensus or live correction detach was claimed.

## Release handoff
The source fix, runtime verification, CI confirmation, StudioNet deployment, schema verification and live fail-closed lifecycle proof are complete on the deployed source commit above. The repository is Vercel-ready through `.env.example`; the only remaining external step is Vercel authorization/configuration, followed by a hosted injected-wallet write proof.

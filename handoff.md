# ArchiveFuse — Handoff

## Current checkpoint
- Complete contract + Next.js frontend implementation is on `ometere123/archivefuse/main`.
- Architecture is fixed: contract + Vercel frontend only; no separately hosted backend/database/indexer/mock mode.
- Contract owns immutable records, VecDB candidate recall, bounded consensus resolution, deterministic active-cluster settlement and versioned correction provenance.
- Frontend includes collection shelves, registrar, curator access, record detail, candidate recall, comparison light table, case receipt, entity dossier, correction workflow/receipt, source viewer, lineage and timeline.
- StudioNet address: **NOT DEPLOYED / NOT PROVEN**.
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
- GitHub Actions run `32766871934` exposed and reproduced a clean-run-only missing dependency: `google.protobuf` was not declared. `protobuf==7.35.1` is now explicit in `requirements-dev.txt`; local Direct Mode remains 51/51 after the dependency fix. The workflow must be rerun for hosted confirmation.

StudioNet and Vercel remain unproven until external account/network authorization is available.

## Verification truth
What remains unproven:
- No real StudioNet deployment/lifecycle transaction exists yet.
- No Vercel deployment exists yet.

## Next exact action
A local coding agent with network/toolchain access should take the final `main` SHA and perform **the remaining source fix + runtime proof/deployment**, not redesign the project:

1. Pull the exact final audited `main` SHA and read `AGENTS.md`, this file, `architecture.md`, `trd.md`, `prd.md` and `DEPLOYMENT.json`.
2. Fix the canonical-label-on-detach edge case described above and add its Direct Mode regression.
3. Install Node/Python dependencies. Generate and commit `package-lock.json`, then change CI to `npm ci` if clean install succeeds.
4. Run preflight/source tests, the full GenLayer Direct Mode suite, `genvm-lint`, TypeScript, ESLint and Next production build. Fix only demonstrated runtime/build defects; add regression coverage.
5. Push fixes to `main`, rerun all verification, and record exact counts.
6. Inspect the installed GenLayer CLI/account workflow. Use a safe development account, never expose secrets.
7. Deploy the frozen verified source to StudioNet and verify FINALIZED + actual GenVM execution success.
8. Verify deployed schema and exercise real archive → records → candidate retrieval → resolution lifecycle, plus a fail-closed outcome and correction path where feasible.
9. Update `DEPLOYMENT.json`, README and this handoff with only real public address/transaction/source-commit evidence.
10. Configure the live contract address on Vercel, deploy the frontend, and exercise one hosted injected-wallet write.
11. Push final deployment evidence/configuration and report final remote SHA.

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

## Verification truth
What is proven in this environment:
- Source was reviewed against the full repository and GenLayer reference patterns.
- The hardened contract was Python syntax/AST checked before replacement.
- No production backend/mock-state path was found.

What is **not** proven here:
- The current hardened contract has not run under `genlayer-test` Direct Mode in this sandbox.
- `genvm-lint` has not run here.
- npm dependencies are not installed here, so current typecheck/ESLint/Next production build are not yet proven.
- There is no `package-lock.json` yet, so frontend CI is not release-reproducible.
- No real StudioNet deployment/lifecycle transaction exists yet.
- No Vercel deployment exists yet.

Reason: this sandbox does not have `genlayer`, `genvm-lint` or `genlayer-test`, and cannot install the required external toolchains/dependencies from the network. Do not convert those environmental limits into claimed passes.

## Next exact action
A local coding agent with network/toolchain access should take the final `main` SHA and perform **runtime proof/deployment only**, not redesign the project:

1. Pull the exact final audited `main` SHA and read `AGENTS.md`, this file, `architecture.md`, `trd.md`, `prd.md` and `DEPLOYMENT.json`.
2. Install Node/Python dependencies. Generate and commit `package-lock.json`, then change CI to `npm ci` if clean install succeeds.
3. Run preflight/source tests, the full 18-test GenLayer Direct Mode suite, `genvm-lint`, TypeScript, ESLint and Next production build. Fix only demonstrated runtime/build defects; add regression coverage.
4. Push fixes to `main`, rerun all verification, and record exact counts.
5. Inspect the installed GenLayer CLI/account workflow. Use a safe development account, never expose secrets.
6. Deploy the frozen verified source to StudioNet and verify FINALIZED + actual GenVM execution success.
7. Verify deployed schema and exercise real archive → records → candidate retrieval → resolution lifecycle, plus a fail-closed outcome and correction path where feasible.
8. Update `DEPLOYMENT.json`, README and this handoff with only real public address/transaction/source-commit evidence.
9. Configure the live contract address on Vercel, deploy the frontend, and exercise one hosted injected-wallet write.
10. Push final deployment evidence/configuration and report final remote SHA.

# ArchiveFuse — Handoff

## Current checkpoint
- Complete contract + Next.js frontend implementation is on `ometere123/archivefuse/main`.
- Architecture is fixed: contract + Vercel frontend only; no separately hosted backend/database/indexer/mock mode.
- Contract owns immutable records, VecDB candidate recall, bounded consensus resolution, deterministic active-cluster settlement and versioned correction provenance.
- Frontend includes collection shelves, registrar, curator access, record detail, candidate recall, comparison light table, case receipt, entity dossier, correction workflow/receipt, source viewer, lineage and timeline.
- Original StudioNet address: `0x35070251e889dC4d688Fd52313cd420b25cD4e2a` (later unavailable).
- Current StudioNet address: `0xB676A1bF06811A093448F7ad39D8Fa65B075fC39`.
- Deployment transaction: `0xddd3e000ec610efbaa98f81ed74c2032162a68cb3ff88db919c94f880d605405`.
- Deployed source commit: `61f98e50c4f4cc8aa952c26fc3182226f4933762`.
- Vercel URL: https://archivefuse.vercel.app/ (HTTP 200 verified).

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
- `npm run verify`: PASS before this proof-only pass; preflight 22/22, Direct Mode 52/52, typecheck, ESLint and Next production build.
- `npm run test:source`: PASS; 34 tests.
- Direct Mode uses the pinned `genlayer-test==0.29.2` and SDK `v0.2.16`. A Windows fd-0 temp-file cleanup defect in that pinned harness required the scoped `tests/direct/conftest.py` compatibility shim; no contract behavior was bypassed.
- ESLint passes with zero warnings and zero errors; the anonymous PostCSS export warning was fixed.
- The Next build reports a non-blocking warning that a user-level `package-lock.json` outside this repository is ignored; the repository lockfile is present and `npm ci` passed.
- GitHub Actions run `32766871934` exposed and reproduced a clean-run-only missing dependency: `google.protobuf` was not declared. `protobuf==7.35.1` is now explicit in `requirements-dev.txt`; hosted run `32767247446` is green with Direct Mode 51/51 and all frontend gates.

The deployment receipt finalized with `MAJORITY_AGREE` and leader GenVM `SUCCESS`. Deployed source equality is proven at 53,004 bytes with SHA-256 `f82dfeb2a181ed8f4691bdbeb02c48886f248cf0aa95ad264c2183887e607ac3`. Live archive 1 now has four digest-bound public records. `preview_candidates(3, 8)` surfaced record 4 at distance `0.03472933` while cluster membership remained unchanged. Resolution cases 1 and 2 finalized fail-closed as `INSUFFICIENT_EVIDENCE` (no cluster mutation). Curator grant transaction `0x87c40853e5be57324103af090661abcbb2a0945c8be2a0f7a5e1dcbe564a2947` returned true through the live genlayer-js read; revoke transaction `0xdd2002d3d77c1aa7dfdd6e71c2376a0e3cf38f0f6825a5470014d3ab8a5f1fe4` returned false. Full machine-readable proof is in `evidence/studionet.json` and `npm run verify:studionet`.

## Recovery and positive live proof
The old address failed repeated schema/code/state checks with `Contract not deployed` and `invalid_contract absent_runner_comment`. The unchanged source was redeployed at `0xB676A1bF06811A093448F7ad39D8Fa65B075fC39` in `0xddd3e000ec610efbaa98f81ed74c2032162a68cb3ff88db919c94f880d605405`; it finalized with GenVM SUCCESS/MAJORITY_AGREE, schema 26/26, and byte equality remained 53,004 bytes / SHA-256 `f82dfeb2a181ed8f4691bdbeb02c48886f248cf0aa95ad264c2183887e607ac3`.

Archive 3 uses the immutable charter and exact raw-byte Gutenberg digests. Archive transaction `0x5ac38d893ee284bcdac3f8fb5562e202afe97a8f67a72bd3de4b312d125a56e2`, record transactions `0x1efc15be277101ec6b6a54e4a06afedc669007b6aa14212f502cf62fa1393c28` and `0xbb698e7c6c7c5bdde845093987926997dc224b87c5f2dd7202b07954cc8ec586`, proposal `0xb57463560f81a878573bc7a761ba4a38dc0c958b03c612bc90708918ed714405`, and adjudication `0x4a93b55fa628a4c517718dac6920dc5d8e19b559cf6939f7d161f7fd7ddfb8d5` all finalized with GenVM SUCCESS. Case 2 is SAME_ENTITY with four anchor categories and cluster 1 containing records 5 and 6; canonical label is `Lewis Carroll (Charles Lutwidge Dodgson)` and active cluster count is 1.

The raw-byte lesson is material: decoded text hashes differed from the exact HTTP bodies even though decoded fetches appeared stable. Archive 2 is preserved as historical fail-closed evidence; archive 3 is the corrected proof archive. Direct `preview_candidates` returned no payload during the recovery runtime, but the proposal’s frozen candidate context recorded record 6 at distance `0.07660948`; this is not described as a direct preview proof. No live correction proposal/detach, append/merge or hosted injected-wallet write is claimed.

## Verification truth
What remains unproven:
- The hosted frontend is live at https://archivefuse.vercel.app/. A hosted injected-wallet write was not exercised by this agent.
- Live correction proposal/detach, cluster append/merge, and direct `preview_candidates` payload proof remain unproven. The correction detach and canonical-label refresh remain proven in Direct Mode.
- Archive 2’s historical decoded-text-hash failure and earlier invalid-contract runtime errors remain preserved in the evidence manifest.

## Release handoff
The source fix, runtime verification, CI confirmation, original deployment, same-source StudioNet recovery deployment, schema verification and Vercel frontend deployment are complete on the deployed source commit above. The old address failed schema/code/state checks with `Contract not deployed` and `invalid_contract absent_runner_comment`; this is recorded as StudioNet state loss. A hosted injected-wallet write remains unexercised by this agent.

## Final hardening pass
The contract now projects unique active membership from retained historical IDs. A detached record can reattach to its prior cluster without a duplicate historical entry; merge-back deduplicates target history, recomputes active counts, advances version/lineage and refreshes the canonical label. Direct Mode regressions cover detach→reattach, detach→join another cluster→merge-back and repeated correction cycles. The local suite is now 55/55.

The source reproducibility discrepancy was confirmed rather than hand-waved: the old deployed/repository working-tree payload was 53,004 CRLF bytes, while the Git blob at source commit `61f98e50c4f4cc8aa952c26fc3182226f4933762` was 52,248 LF bytes. The corrected source is LF-normalized and `.gitattributes` pins `contracts/archivefuse.py` to LF. `scripts/exercise-studionet.mjs` now reports deployed payload, working-tree and source-commit Git-blob hashes separately and only asserts literal equality for the actual compared buffers.

This pass changes contract source, so the prior address `0xB676A1bF06811A093448F7ad39D8Fa65B075fC39` is not claimed to contain the fix. The installed Windows environment currently has no `genlayer` CLI executable and WSL is unavailable (`E_ACCESSDENIED`), so fresh deployment is an external blocker. Do not update `DEPLOYMENT.json` to the corrected source or claim live corrected lifecycle proof until a supported CLI/account deploys and verifies it.

VecDB remains explicitly bounded: current GenVM exposes global `knn(query,k)` without archive/type filter or offset, so the contract filters after `MAX_KNN_SCAN=24`; unrelated vectors can crowd that bounded retrieval window. Similarity remains retrieval-only. Evidence prompts now use deterministic bounded head/tail sampling within 7,000 normalized characters. URL validation remains HTTPS/host-shaped rather than a claimed universal SSRF firewall. Permissionless proposals and duplicate pending guards remain an intentional open-network spam trade-off.

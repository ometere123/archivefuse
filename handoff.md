# ArchiveFuse — Handoff

## Current checkpoint
- Complete contract + Next.js frontend implementation is on `ometere123/archivefuse/main`.
- Architecture is fixed: contract + Vercel frontend only; no separately hosted backend/database/indexer/mock mode.
- Contract owns immutable records, VecDB candidate recall, bounded consensus resolution, deterministic active-cluster settlement and versioned correction provenance.
- Frontend includes collection shelves, registrar, curator access, record detail, candidate recall, comparison light table, case receipt, entity dossier, correction workflow/receipt, source viewer, lineage and timeline.
- Original StudioNet address: `0x35070251e889dC4d688Fd52313cd420b25cD4e2a` (later unavailable).
- Historical recovery address: `0xB676A1bF06811A093448F7ad39D8Fa65B075fC39`.
- Current StudioNet address: `0xBd71A829AbdECa647514752A86167c3BDFF1BAf1`.
- Deployment transaction: `0xf7bbf97dd2c056b485952ce1f211ab3e272832900617ef75170329743a2af55a`.
- Deployed source commit: `8fe09e0bc07967d4a3c46d1a7990fe7df9b73a25`.
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

The current deployment receipt finalized with `MAJORITY_AGREE` and GenVM `SUCCESS`; schema is 26/26. Deployed source equality is proven at 53,335 LF bytes with SHA-256 `c2366984a5cb34578f4233b2e77876e623877bcdda5d0a215eff5f5fb884b589`. The current proof archive is ID 1. Records 1 and 2 are unclustered before adjudication; their proposal and adjudication finalized with GenVM `SUCCESS`, producing `SAME_ENTITY`, four anchor categories, and active cluster 1 with members 1 and 2. Full machine-readable proof is in `evidence/studionet.json` and `npm run verify:studionet`.

## Recovery and positive live proof
The old address failed repeated schema/code/state checks with `Contract not deployed` and `invalid_contract absent_runner_comment`. The recovery address remains historical. The corrected source was deployed at `0xBd71A829AbdECa647514752A86167c3BDFF1BAf1` in `0xf7bbf97dd2c056b485952ce1f211ab3e272832900617ef75170329743a2af55a`; it finalized with GenVM SUCCESS/MAJORITY_AGREE, schema 26/26, and exact LF byte equality.

Archive 3 uses the immutable charter and exact raw-byte Gutenberg digests. Archive transaction `0x5ac38d893ee284bcdac3f8fb5562e202afe97a8f67a72bd3de4b312d125a56e2`, record transactions `0x1efc15be277101ec6b6a54e4a06afedc669007b6aa14212f502cf62fa1393c28` and `0xbb698e7c6c7c5bdde845093987926997dc224b87c5f2dd7202b07954cc8ec586`, proposal `0xb57463560f81a878573bc7a761ba4a38dc0c958b03c612bc90708918ed714405`, and adjudication `0x4a93b55fa628a4c517718dac6920dc5d8e19b559cf6939f7d161f7fd7ddfb8d5` all finalized with GenVM SUCCESS. Case 2 is SAME_ENTITY with four anchor categories and cluster 1 containing records 5 and 6; canonical label is `Lewis Carroll (Charles Lutwidge Dodgson)` and active cluster count is 1.

The raw-byte lesson is material: decoded text hashes differed from the exact HTTP bodies even though decoded fetches appeared stable. Archive 2 is preserved as historical fail-closed evidence; archive 3 is the corrected proof archive. Direct `preview_candidates` returned no payload during the recovery runtime, but the proposal’s frozen candidate context recorded record 6 at distance `0.07660948`; this is not described as a direct preview proof. No live correction proposal/detach, append/merge or hosted injected-wallet write is claimed.

## Verification truth
What remains unproven:
- The hosted frontend is live at https://archivefuse.vercel.app/. A hosted injected-wallet write was not exercised by this agent.
- Live correction proposal/detach, cluster append/merge, and direct `preview_candidates` payload proof remain unproven. The correction detach and canonical-label refresh remain proven in Direct Mode.
- Archive 2’s historical decoded-text-hash failure and earlier invalid-contract runtime errors remain preserved in the evidence manifest.

## Release handoff
The source fix, runtime verification, CI confirmation, corrected StudioNet deployment, schema verification and Vercel frontend deployment are complete on the deployed source commit above. The original address loss and recovery history are retained. A hosted injected-wallet write remains unexercised by this agent.

## Final hardening pass
The contract now projects unique active membership from retained historical IDs. A detached record can reattach to its prior cluster without a duplicate historical entry; merge-back deduplicates target history, recomputes active counts, advances version/lineage and refreshes the canonical label. Direct Mode regressions cover detach→reattach, detach→join another cluster→merge-back and repeated correction cycles. The local suite is now 55/55.

The source reproducibility discrepancy was confirmed rather than hand-waved: the old deployed/repository working-tree payload was 53,004 CRLF bytes, while the Git blob at source commit `61f98e50c4f4cc8aa952c26fc3182226f4933762` was 52,248 LF bytes. The corrected source is LF-normalized and `.gitattributes` pins `contracts/archivefuse.py` to LF. `scripts/exercise-studionet.mjs` now reports deployed payload, working-tree and source-commit Git-blob hashes separately and only asserts literal equality for the actual compared buffers.

The corrected source is deployed at `0xBd71A829AbdECa647514752A86167c3BDFF1BAf1`; the prior recovery address is not relabeled. The corrected live proof is limited to archive creation, two registrations, proposal, adjudication and resulting cluster state. Live correction, append/merge and hosted wallet write remain unproven.

VecDB remains explicitly bounded: current GenVM exposes global `knn(query,k)` without archive/type filter or offset, so the contract filters after `MAX_KNN_SCAN=24`; unrelated vectors can crowd that bounded retrieval window. Similarity remains retrieval-only. Evidence prompts now use deterministic bounded head/tail sampling within 7,000 normalized characters. URL validation remains HTTPS/host-shaped rather than a claimed universal SSRF firewall. Permissionless proposals and duplicate pending guards remain an intentional open-network spam trade-off.

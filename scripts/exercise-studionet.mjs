import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const manifestPath = args[args.indexOf("--manifest") + 1] || "evidence/studionet.json";
const manifest = JSON.parse(readFileSync(resolve(manifestPath), "utf8"));
const address = process.env.NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT || manifest.contractAddress;
const endpoint = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT || "https://studio.genlayer.com/api";
const client = createClient({ chain: studionet, endpoint, account: createAccount() });
const failures = [];
const checks = [];
const check = (name, condition, detail = "") => { checks.push({ name, ok: Boolean(condition), detail }); if (!condition) failures.push(`${name}${detail ? `: ${detail}` : ""}`); };

check("contract address", address === manifest.contractAddress, `${address} != ${manifest.contractAddress}`);
check("chain", manifest.network === "StudioNet" && manifest.chainId === 61999);
const deployedSource = await client.getContractCode(address);
const repositorySource = readFileSync(resolve("contracts/archivefuse.py"));
const deployedBytes = Buffer.from(deployedSource);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const sourceProof = { deployedBytes: deployedBytes.length, repositoryBytes: repositorySource.length, deployedSha256: sha256(deployedBytes), repositorySha256: sha256(repositorySource), equal: Buffer.compare(deployedBytes, repositorySource) === 0 };
check("deployed source equality", sourceProof.equal, JSON.stringify(sourceProof));

async function verifyTransaction(hash) {
  if (!hash || !/^0x[0-9a-fA-F]{64}$/.test(hash)) { check("transaction hash format", false, String(hash)); return { hash }; }
  const tx = await client.getTransaction({ hash });
  const status = String(tx.statusName ?? tx.status ?? "");
  const leader = tx.consensus_data?.leader_receipt?.[0];
  const execution = leader?.execution_result ?? null;
  const result = { hash, to: tx.to_address ?? tx.recipient ?? tx.to ?? null, status, execution, resultName: tx.result_name ?? null };
  check(`transaction ${hash} finalized`, status === "FINALIZED", status);
  check(`transaction ${hash} GenVM success`, execution === "SUCCESS", String(execution));
  if (result.to) check(`transaction ${hash} contract target`, String(result.to).toLowerCase() === address.toLowerCase(), String(result.to));
  return result;
}

const verifiedTransactions = [];
for (const item of manifest.transactions || []) if (item.hash) verifiedTransactions.push({ ...item, ...(await verifyTransaction(item.hash)) });

const stats = await client.readContract({ address, functionName: "stats", args: [] });
const archive = await client.readContract({ address, functionName: "get_archive", args: [1n] });
const expectedArchive = manifest.archive.state;
check("archive exists", archive.id === expectedArchive.id);
check("archive steward", archive.steward.toLowerCase() === expectedArchive.steward.toLowerCase());
check("archive cutoff", archive.cutoff_year === expectedArchive.cutoff_year);
check("archive charter binding", archive.charter_url === expectedArchive.charter_url && archive.charter_digest === expectedArchive.charter_digest);

const records = [];
for (const expected of manifest.records || []) {
  const actual = await client.readContract({ address, functionName: "get_record", args: [BigInt(expected.id)] });
  records.push(actual);
  for (const field of ["archive_id", "entity_type", "entity_type_code", "title", "summary", "source_url", "source_digest", "names_json", "dates_json", "places_json", "roles_json", "latest_year"]) check(`record ${expected.id} ${field}`, actual[field] === expected.state[field], `${actual[field]} != ${expected.state[field]}`);
  check(`record ${expected.id} unclustered`, actual.cluster_id === 0);
}

const vec = manifest.vecdbProof;
const candidates = await client.readContract({ address, functionName: "preview_candidates", args: [BigInt(vec.recordId), BigInt(vec.requestedK)] });
check("VecDB expected candidate", candidates.some((x) => x.record_id === vec.candidate.record_id && x.title === vec.candidate.title && x.distance === vec.candidate.distance));
check("VecDB retrieval leaves membership unchanged", vec.retrievalMutatedMembership === false && records.find((x) => x.id === vec.recordId)?.cluster_id === 0);

const resolutionStates = [];
for (const expected of manifest.resolutions || []) {
  const actual = await client.readContract({ address, functionName: "get_case", args: [BigInt(expected.caseId)] });
  resolutionStates.push(actual);
  check(`case ${expected.caseId} pair`, actual.record_a === expected.state.record_a && actual.record_b === expected.state.record_b);
  check(`case ${expected.caseId} relation`, actual.relation === expected.state.relation);
  check(`case ${expected.caseId} terminal`, actual.status !== 1 && Boolean(actual.resolved_at));
  check(`case ${expected.caseId} anchors`, actual.anchor_codes_json === expected.state.anchor_codes_json);
  if (actual.relation === "INSUFFICIENT_EVIDENCE") check(`case ${expected.caseId} no cluster`, actual.resulting_cluster === 0);
  if (actual.relation === "SAME_ENTITY") {
    check(`case ${expected.caseId} positive cluster`, actual.resulting_cluster > 0);
    const cluster = await client.readContract({ address, functionName: "get_cluster", args: [BigInt(actual.resulting_cluster)] });
    const members = await client.readContract({ address, functionName: "list_cluster_members", args: [BigInt(actual.resulting_cluster), 0n, 50n] });
    check(`case ${expected.caseId} cluster members`, members.includes(actual.record_a) && members.includes(actual.record_b));
    check(`case ${expected.caseId} cluster count`, cluster.member_count === members.length);
  }
}

const curator = manifest.curatorProof;
const curatorState = await client.readContract({ address, functionName: "is_curator", args: [BigInt(curator.archiveId), curator.curator] });
check("curator revoked", curatorState === curator.stateAfterRevoke);

const output = { ok: failures.length === 0, address, sourceProof, stats, archive, records, candidates, resolutionStates, curatorState, verifiedTransactions, checks, failures, manifest: manifestPath };
console.log(JSON.stringify(output, null, 2));
if (failures.length) process.exit(1);

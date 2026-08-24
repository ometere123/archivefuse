import { TransactionStatus } from "genlayer-js/types";
import type { CalldataEncodable, GenLayerClient, TransactionHash } from "genlayer-js/types";
import type { Archive, ArchiveRecord, Candidate, ContractStats, CorrectionCase, EntityCluster, ResolutionCase } from "@/lib/contract-types";
import { CONTRACT_ADDRESS, REQUIRED_METHODS } from "./config";
import { createReadClient } from "./read-client";
import { inspectGenVMExecution } from "./execution";
import { available, isRecord, notFound, performRead, unavailable, type ReadResult } from "./read-result";

type Client = GenLayerClient<typeof import("./config").chain>;

const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isString = (v: unknown): v is string => typeof v === "string";

function isArchive(v: unknown): v is Archive { return isRecord(v) && isNumber(v.id) && isString(v.name) && isString(v.steward) && isNumber(v.record_count) && isNumber(v.cluster_count); }
function isArchiveRecord(v: unknown): v is ArchiveRecord { return isRecord(v) && isNumber(v.id) && isNumber(v.archive_id) && isString(v.title) && isString(v.entity_type) && isString(v.source_url); }
function isCase(v: unknown): v is ResolutionCase { return isRecord(v) && isNumber(v.id) && isNumber(v.record_a) && isNumber(v.record_b) && isString(v.relation); }
function isCorrection(v: unknown): v is CorrectionCase { return isRecord(v) && isNumber(v.id) && isNumber(v.cluster_id) && isNumber(v.record_id) && isString(v.decision); }
function isCluster(v: unknown): v is EntityCluster { return isRecord(v) && isNumber(v.id) && isNumber(v.version) && isNumber(v.member_count) && isString(v.canonical_label); }
function isStats(v: unknown): v is ContractStats { return isRecord(v) && isNumber(v.archive_count) && isNumber(v.record_count) && isNumber(v.cluster_count) && isNumber(v.active_cluster_count) && isString(v.embedding_model); }
function isNumberArray(v: unknown): v is number[] { return Array.isArray(v) && v.every(isNumber); }
function isCandidates(v: unknown): v is Candidate[] { return Array.isArray(v) && v.every((x) => isRecord(x) && isNumber(x.record_id) && isString(x.distance) && isString(x.title)); }

export async function verifyContractSchema() {
  if (!CONTRACT_ADDRESS) return { configured: false, ok: false, missing: [...REQUIRED_METHODS] };
  try {
    const schema = await createReadClient().getContractSchema(CONTRACT_ADDRESS) as { methods?: Record<string, unknown> };
    const methods = schema?.methods ?? {};
    const missing = REQUIRED_METHODS.filter((name) => !methods[name]);
    return { configured: true, ok: missing.length === 0, missing };
  } catch { return { configured: true, ok: false, missing: [...REQUIRED_METHODS] }; }
}

async function one<T>(fn: string, args: CalldataEncodable[], guard: (v: unknown) => v is T): Promise<ReadResult<T>> {
  if (!CONTRACT_ADDRESS) return unavailable("ArchiveFuse has not been configured with a deployed contract address.");
  return performRead(() => createReadClient().readContract({ address: CONTRACT_ADDRESS, functionName: fn, args }), guard, `${fn} returned malformed live data.`);
}

export const getArchive = (id: number) => one("get_archive", [BigInt(id)], isArchive);
export const getRecord = (id: number) => one("get_record", [BigInt(id)], isArchiveRecord);
export const getCase = (id: number) => one("get_case", [BigInt(id)], isCase);
export const getCorrection = (id: number) => one("get_correction", [BigInt(id)], isCorrection);
export const getCluster = (id: number) => one("get_cluster", [BigInt(id)], isCluster);
export const getStats = () => one("stats", [], isStats);
export const listArchiveIds = (offset = 0, limit = 50) => one("list_archive_ids", [BigInt(offset), BigInt(limit)], isNumberArray);
export const listRecordIds = (archiveId: number, offset = 0, limit = 50) => one("list_record_ids", [BigInt(archiveId), BigInt(offset), BigInt(limit)], isNumberArray);
export const listCaseIds = (archiveId: number, offset = 0, limit = 50) => one("list_case_ids", [BigInt(archiveId), BigInt(offset), BigInt(limit)], isNumberArray);
export const listClusterMembers = (clusterId: number, offset = 0, limit = 50) => one("list_cluster_members", [BigInt(clusterId), BigInt(offset), BigInt(limit)], isNumberArray);
export const listClusterCaseIds = (clusterId: number, offset = 0, limit = 50) => one("list_cluster_case_ids", [BigInt(clusterId), BigInt(offset), BigInt(limit)], isNumberArray);
export const listCorrectionIds = (archiveId: number, offset = 0, limit = 50) => one("list_correction_ids", [BigInt(archiveId), BigInt(offset), BigInt(limit)], isNumberArray);
export const listClusterCorrectionIds = (clusterId: number, offset = 0, limit = 50) => one("list_cluster_correction_ids", [BigInt(clusterId), BigInt(offset), BigInt(limit)], isNumberArray);
function isCorrectionContext(v: unknown): v is Array<Record<string, unknown>> { return Array.isArray(v) && v.every((x) => isRecord(x) && isNumber(x.record_id) && isString(x.title) && isString(x.distance)); }
export const previewCorrectionContext = (clusterId: number, recordId: number) => one("preview_correction_context", [BigInt(clusterId), BigInt(recordId)], isCorrectionContext);
export const previewCandidates = (recordId: number, k = 8) => one("preview_candidates", [BigInt(recordId), BigInt(k)], isCandidates);

export async function getRecordMaybe(id: number): Promise<ReadResult<ArchiveRecord>> {
  const result = await getRecord(id);
  if (result.kind === "UNAVAILABLE" && /unknown record/i.test(result.message)) return notFound();
  return result;
}

export async function writeContract(client: Client, functionName: string, args: CalldataEncodable[]) {
  if (!CONTRACT_ADDRESS) throw new Error("No deployed ArchiveFuse contract address is configured.");
  return await client.writeContract({ address: CONTRACT_ADDRESS, functionName, args, value: BigInt(0), consensusMaxRotations: 3 }) as TransactionHash;
}

export type FinalizedExecution = { status: string; executionResult: "SUCCESS" | "ROLLBACK" | "ERROR" | "UNKNOWN"; executionError?: string };

export async function waitFinalized(client: Client, hash: TransactionHash): Promise<FinalizedExecution> {
  const receipt = await client.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 5000, retries: 90 });
  const tx = await client.getTransaction({ hash });
  return { status: String(receipt.statusName ?? receipt.status ?? "FINALIZED"), ...inspectGenVMExecution(tx) };
}

export function assertSuccess(outcome: FinalizedExecution, hash: string) {
  if (outcome.executionResult !== "SUCCESS") throw new Error(`GenLayer execution ${outcome.executionResult}: ${outcome.executionError ?? "no error text"}. Transaction ${hash}`);
}

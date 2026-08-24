import type { Archive, ArchiveRecord, CorrectionCase, EntityCluster, ResolutionCase } from "./contract-types";
import type { ReadResult } from "./genlayer/read-result";
import {
  getArchive, getCase, getCluster, getCorrection, getRecord,
  listArchiveIds, listCaseIds, listClusterCaseIds, listClusterCorrectionIds,
  listClusterMembers, listCorrectionIds, listRecordIds,
} from "./genlayer/data-source";

const PAGE_SIZE = 50;
const MAX_PAGES = 2_000;

function requireValue<T>(result: ReadResult<T>, label: string): T {
  if (result.kind === "AVAILABLE") return result.value;
  if (result.kind === "UNAVAILABLE") throw new Error(result.message);
  throw new Error(`${label} was not found in live contract state.`);
}

/**
 * Walk every contract page rather than silently truncating authoritative state at
 * the contract's per-call limit. The safety cap prevents a malformed RPC/contract
 * response from causing an infinite browser loop; exceeding it fails closed.
 */
async function loadAllIds(
  label: string,
  page: (offset: number, limit: number) => Promise<ReadResult<number[]>>,
): Promise<number[]> {
  const ids: number[] = [];
  let offset = 0;

  for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber += 1) {
    const batch = requireValue(await page(offset, PAGE_SIZE), label);
    if (batch.length === 0) return ids;
    ids.push(...batch);
    offset += batch.length;
    if (batch.length < PAGE_SIZE) return ids;
  }

  throw new Error(`${label} exceeded the live pagination safety limit.`);
}

export async function loadArchives(): Promise<Archive[]> {
  const ids = await loadAllIds("Archive list", listArchiveIds);
  return Promise.all(ids.map(async (id) => requireValue(await getArchive(id), `Archive ${id}`)));
}

export async function loadArchiveRecords(archiveId: number): Promise<ArchiveRecord[]> {
  const ids = await loadAllIds(
    `Record list for archive ${archiveId}`,
    (offset, limit) => listRecordIds(archiveId, offset, limit),
  );
  return Promise.all(ids.map(async (id) => requireValue(await getRecord(id), `Record ${id}`)));
}

export async function loadArchiveCases(archiveId: number): Promise<ResolutionCase[]> {
  const ids = await loadAllIds(
    `Case list for archive ${archiveId}`,
    (offset, limit) => listCaseIds(archiveId, offset, limit),
  );
  return Promise.all(ids.map(async (id) => requireValue(await getCase(id), `Case ${id}`)));
}

export async function loadArchiveCorrections(archiveId: number): Promise<CorrectionCase[]> {
  const ids = await loadAllIds(
    `Correction list for archive ${archiveId}`,
    (offset, limit) => listCorrectionIds(archiveId, offset, limit),
  );
  return Promise.all(ids.map(async (id) => requireValue(await getCorrection(id), `Correction ${id}`)));
}

export async function loadClusterMembers(clusterId: number): Promise<ArchiveRecord[]> {
  const ids = await loadAllIds(
    `Member list for cluster ${clusterId}`,
    (offset, limit) => listClusterMembers(clusterId, offset, limit),
  );
  return Promise.all(ids.map(async (id) => requireValue(await getRecord(id), `Record ${id}`)));
}

export async function loadClusterCases(clusterId: number): Promise<ResolutionCase[]> {
  const ids = await loadAllIds(
    `Case list for cluster ${clusterId}`,
    (offset, limit) => listClusterCaseIds(clusterId, offset, limit),
  );
  return Promise.all(ids.map(async (id) => requireValue(await getCase(id), `Case ${id}`)));
}

export async function loadClusterCorrections(clusterId: number): Promise<CorrectionCase[]> {
  const ids = await loadAllIds(
    `Correction list for cluster ${clusterId}`,
    (offset, limit) => listClusterCorrectionIds(clusterId, offset, limit),
  );
  return Promise.all(ids.map(async (id) => requireValue(await getCorrection(id), `Correction ${id}`)));
}

export async function loadCluster(clusterId: number): Promise<EntityCluster> {
  return requireValue(await getCluster(clusterId), `Cluster ${clusterId}`);
}

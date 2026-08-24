import type { Archive, ArchiveRecord, CorrectionCase, EntityCluster, ResolutionCase } from "./contract-types";
import type { ReadResult } from "./genlayer/read-result";
import {
  getArchive, getCase, getCluster, getCorrection, getRecord,
  listArchiveIds, listCaseIds, listClusterCaseIds, listClusterCorrectionIds,
  listClusterMembers, listCorrectionIds, listRecordIds,
} from "./genlayer/data-source";

function requireValue<T>(result: ReadResult<T>, label: string): T {
  if (result.kind === "AVAILABLE") return result.value;
  if (result.kind === "UNAVAILABLE") throw new Error(result.message);
  throw new Error(`${label} was not found in live contract state.`);
}

export async function loadArchives(): Promise<Archive[]> {
  const ids = requireValue(await listArchiveIds(0, 50), "Archive list");
  return Promise.all(ids.map(async (id) => requireValue(await getArchive(id), `Archive ${id}`)));
}

export async function loadArchiveRecords(archiveId: number): Promise<ArchiveRecord[]> {
  const ids = requireValue(await listRecordIds(archiveId, 0, 50), `Record list for archive ${archiveId}`);
  return Promise.all(ids.map(async (id) => requireValue(await getRecord(id), `Record ${id}`)));
}

export async function loadArchiveCases(archiveId: number): Promise<ResolutionCase[]> {
  const ids = requireValue(await listCaseIds(archiveId, 0, 50), `Case list for archive ${archiveId}`);
  return Promise.all(ids.map(async (id) => requireValue(await getCase(id), `Case ${id}`)));
}

export async function loadArchiveCorrections(archiveId: number): Promise<CorrectionCase[]> {
  const ids = requireValue(await listCorrectionIds(archiveId, 0, 50), `Correction list for archive ${archiveId}`);
  return Promise.all(ids.map(async (id) => requireValue(await getCorrection(id), `Correction ${id}`)));
}

export async function loadClusterMembers(clusterId: number): Promise<ArchiveRecord[]> {
  const ids = requireValue(await listClusterMembers(clusterId, 0, 50), `Member list for cluster ${clusterId}`);
  return Promise.all(ids.map(async (id) => requireValue(await getRecord(id), `Record ${id}`)));
}

export async function loadClusterCases(clusterId: number): Promise<ResolutionCase[]> {
  const ids = requireValue(await listClusterCaseIds(clusterId, 0, 50), `Case list for cluster ${clusterId}`);
  return Promise.all(ids.map(async (id) => requireValue(await getCase(id), `Case ${id}`)));
}

export async function loadClusterCorrections(clusterId: number): Promise<CorrectionCase[]> {
  const ids = requireValue(await listClusterCorrectionIds(clusterId, 0, 50), `Correction list for cluster ${clusterId}`);
  return Promise.all(ids.map(async (id) => requireValue(await getCorrection(id), `Correction ${id}`)));
}

export async function loadCluster(clusterId: number): Promise<EntityCluster> {
  return requireValue(await getCluster(clusterId), `Cluster ${clusterId}`);
}

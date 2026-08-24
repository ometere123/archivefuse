export type EntityType = "PERSON" | "PLACE" | "ORGANIZATION";
export type Relation = "SAME_ENTITY" | "RELATED_ENTITY" | "DISTINCT_ENTITY" | "INSUFFICIENT_EVIDENCE" | "";
export type CorrectionDecision = "KEEP_MEMBER" | "DETACH_MEMBER" | "INSUFFICIENT_EVIDENCE" | "";

export type Archive = {
  id: number; steward: string; name: string; charter_url: string; charter_digest: string;
  cutoff_year: number; created_at: string; record_count: number; case_count: number; cluster_count: number;
};

export type ArchiveRecord = {
  id: number; archive_id: number; registrar: string; entity_type: EntityType; entity_type_code: number;
  title: string; summary: string; source_url: string; source_digest: string;
  names_json: string; dates_json: string; places_json: string; roles_json: string;
  latest_year: number; registered_at: string; cluster_id: number;
};

export type ResolutionCase = {
  id: number; archive_id: number; proposer: string; record_a: number; record_b: number;
  evidence_url: string; evidence_digest: string; status: number; relation: Relation;
  anchor_codes_json: string; rationale: string; evidence_summary: string; candidate_context_json: string;
  base_cluster_a: number; base_cluster_a_version: number; base_cluster_b: number; base_cluster_b_version: number;
  submitted_at: string; resolved_at: string; resulting_cluster: number;
};

export type CorrectionCase = {
  id: number; archive_id: number; proposer: string; cluster_id: number; record_id: number;
  evidence_url: string; evidence_digest: string; status: number; decision: CorrectionDecision;
  contradiction_codes_json: string; rationale: string; evidence_summary: string; context_record_ids_json: string;
  base_cluster_version: number; submitted_at: string; resolved_at: string;
};

export type EntityCluster = {
  id: number; archive_id: number; entity_type: EntityType; entity_type_code: number;
  canonical_label: string; version: number; member_count: number; superseded_by: number;
  created_at: string; last_case_id: number; last_correction_id: number;
};

export type Candidate = {
  record_id: number; distance: string; title: string; latest_year: number; year_gap: number; date_flag: string; cluster_id: number;
};

export type ContractStats = {
  archive_count: number; record_count: number; case_count: number; correction_count: number; cluster_count: number;
  max_candidates: number; max_cluster_members: number; embedding_model: string; vector_dimensions: number;
};

export function parseJsonList(raw: string): string[] {
  try { const value = JSON.parse(raw); return Array.isArray(value) ? value.map(String) : []; } catch { return []; }
}

export function parseNumberList(raw: string): number[] {
  try { const value = JSON.parse(raw); return Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : []; } catch { return []; }
}

export function caseStatus(status: number) {
  return ({1:"PENDING",2:"SAME ENTITY",3:"RELATED",4:"DISTINCT",5:"INSUFFICIENT"} as Record<number,string>)[status] ?? `STATUS ${status}`;
}

export function correctionStatus(status: number) {
  return ({1:"PENDING",2:"KEPT",3:"DETACHED",4:"INSUFFICIENT"} as Record<number,string>)[status] ?? `STATUS ${status}`;
}

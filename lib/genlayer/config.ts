import { studionet } from "genlayer-js/chains";

export const chain = studionet;
export const CHAIN_NAME = "studionet" as const;
export const CHAIN_ID = 61999;
export const GENLAYER_ENDPOINT = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT as `0x${string}` | undefined;
export const EXPLORER_BASE = "https://explorer-studio.genlayer.com";
export const explorerTxUrl = (hash: string) => `${EXPLORER_BASE}/tx/${hash}`;
export const explorerAddressUrl = (address: string) => `${EXPLORER_BASE}/address/${address}`;

export const REQUIRED_METHODS = [
  "create_archive", "set_curator", "register_record", "preview_candidates",
  "propose_resolution", "adjudicate_resolution", "invalidate_stale_resolution",
  "get_archive", "get_record", "get_case", "get_cluster", "is_curator", "get_record_cluster",
  "list_archive_ids", "list_record_ids", "list_case_ids", "list_cluster_members",
  "list_cluster_case_ids", "preview_correction_context", "propose_correction",
  "adjudicate_correction", "invalidate_stale_correction", "get_correction",
  "list_correction_ids", "list_cluster_correction_ids", "stats",
] as const;

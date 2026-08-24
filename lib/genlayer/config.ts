import { studionet } from "genlayer-js/chains";
import requiredMethods from "./required-methods.json";

export const chain = studionet;
export const CHAIN_NAME = "studionet" as const;
export const CHAIN_ID = 61999;
export const GENLAYER_ENDPOINT = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ARCHIVEFUSE_CONTRACT as `0x${string}` | undefined;
export const EXPLORER_BASE = "https://explorer-studio.genlayer.com";
export const explorerTxUrl = (hash: string) => `${EXPLORER_BASE}/tx/${hash}`;
export const explorerAddressUrl = (address: string) => `${EXPLORER_BASE}/address/${address}`;

export const REQUIRED_METHODS = requiredMethods as readonly string[];

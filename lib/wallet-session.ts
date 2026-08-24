export type WalletMode = "none" | "injected";
export type NetworkVerdict = "disconnected" | "expected" | "wrong" | "unknown";
export type WalletState = { mode: WalletMode; address?: `0x${string}`; chainId?: number; error?: string };

export const DISCONNECTED: WalletState = { mode: "none" };

export function parseChainId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = value.startsWith("0x") ? Number.parseInt(value.slice(2), 16) : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export function chainIdHex(chainId: number) { return `0x${chainId.toString(16)}`; }

export function nextWalletState(current: WalletState, event:
  | { type: "connected"; address: `0x${string}`; chainId?: number }
  | { type: "accounts-changed"; accounts: unknown }
  | { type: "chain-changed"; chainId: unknown }
  | { type: "provider-disconnected"; message?: string }
  | { type: "connection-refused"; message: string }
  | { type: "forget" }
): WalletState {
  if (event.type === "connected") return { mode: "injected", address: event.address, chainId: event.chainId };
  if (event.type === "accounts-changed") {
    const accounts = Array.isArray(event.accounts) ? event.accounts : [];
    const address = typeof accounts[0] === "string" ? accounts[0] as `0x${string}` : undefined;
    return address ? { ...current, mode: "injected", address, error: undefined } : DISCONNECTED;
  }
  if (event.type === "chain-changed") return { ...current, chainId: parseChainId(event.chainId), error: undefined };
  if (event.type === "provider-disconnected") return { mode: "none", error: event.message };
  if (event.type === "connection-refused") return { mode: "none", error: event.message };
  return DISCONNECTED;
}

export function networkVerdict(wallet: WalletState, expected: number): NetworkVerdict {
  if (wallet.mode !== "injected") return "disconnected";
  if (wallet.chainId === undefined) return "unknown";
  return wallet.chainId === expected ? "expected" : "wrong";
}

export function networkLabel(verdict: NetworkVerdict, expectedName: string, actual?: number) {
  if (verdict === "expected") return expectedName;
  if (verdict === "wrong") return actual ? `chain ${actual}` : "wrong network";
  if (verdict === "unknown") return "unknown network";
  return "not connected";
}

export function writeGate(wallet: WalletState, expected: number, expectedName: string) {
  if (wallet.mode !== "injected" || !wallet.address) return { canWrite: false, message: "Connect an injected wallet before writing." };
  if (wallet.chainId !== expected) return { canWrite: false, message: `Switch the wallet to ${expectedName} (chain ${expected}).` };
  return { canWrite: true as const };
}

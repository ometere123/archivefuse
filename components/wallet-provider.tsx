"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createInjectedClient } from "@/lib/genlayer/client";
import { chain, CHAIN_NAME } from "@/lib/genlayer/config";
import { chainIdHex, DISCONNECTED, nextWalletState, networkLabel, networkVerdict, parseChainId, writeGate, type NetworkVerdict, type WalletState } from "@/lib/wallet-session";

type WalletContextValue = {
  address?: `0x${string}`; hasInjected: boolean; connecting: boolean; error?: string;
  network: NetworkVerdict; networkName: string; canWrite: boolean; writeBlockedReason?: string;
  connect: () => Promise<void>; switchNetwork: () => Promise<void>; disconnect: () => void;
  getWriteClient: () => Promise<Awaited<ReturnType<typeof createInjectedClient>>>;
};
const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(DISCONNECTED);
  const [hasInjected, setHasInjected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  useEffect(() => { queueMicrotask(() => setHasInjected(Boolean(window.ethereum))); }, []);
  useEffect(() => {
    const provider = window.ethereum;
    if (wallet.mode !== "injected" || !provider?.on) return;
    const onAccounts = (...args: unknown[]) => setWallet((w) => nextWalletState(w, { type: "accounts-changed", accounts: args[0] }));
    const onChain = (...args: unknown[]) => setWallet((w) => nextWalletState(w, { type: "chain-changed", chainId: args[0] }));
    const onDisconnect = (...args: unknown[]) => { const detail = args[0]; const message = detail && typeof detail === "object" && "message" in detail ? String((detail as { message: unknown }).message) : undefined; setWallet((w) => nextWalletState(w, { type: "provider-disconnected", message })); };
    provider.on("accountsChanged", onAccounts); provider.on("chainChanged", onChain); provider.on("disconnect", onDisconnect);
    return () => { provider.removeListener?.("accountsChanged", onAccounts); provider.removeListener?.("chainChanged", onChain); provider.removeListener?.("disconnect", onDisconnect); };
  }, [wallet.mode]);
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try { await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: chainIdHex(chain.id) }] }); }
    catch (error) { setWallet((w) => ({ ...w, error: `Wallet could not switch to StudioNet: ${error instanceof Error ? error.message : String(error)}` })); }
  }, []);
  const connect = useCallback(async () => {
    if (!window.ethereum) { setWallet({ mode: "none", error: "No injected wallet was found in this browser." }); return; }
    setHasInjected(true); setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as `0x${string}`[];
      if (!accounts?.[0]) throw new Error("The wallet returned no account.");
      const chainId = parseChainId(await window.ethereum.request({ method: "eth_chainId" }));
      setWallet(nextWalletState(DISCONNECTED, { type: "connected", address: accounts[0], chainId }));
      if (chainId !== chain.id) await switchNetwork();
    } catch (error) { setWallet((w) => nextWalletState(w, { type: "connection-refused", message: error instanceof Error ? error.message : String(error) })); }
    finally { setConnecting(false); }
  }, [switchNetwork]);
  const disconnect = useCallback(() => setWallet((w) => nextWalletState(w, { type: "forget" })), []);
  const getWriteClient = useCallback(async () => { const gate = writeGate(wallet, chain.id, CHAIN_NAME); if (!gate.canWrite || !wallet.address) throw new Error(gate.message ?? "Wallet is not ready to write."); return createInjectedClient(wallet.address); }, [wallet]);
  const value = useMemo(() => { const network = networkVerdict(wallet, chain.id); const gate = writeGate(wallet, chain.id, CHAIN_NAME); return { address: wallet.address, hasInjected, connecting, error: wallet.error, network, networkName: networkLabel(network, CHAIN_NAME, wallet.chainId), canWrite: gate.canWrite, writeBlockedReason: gate.message, connect, switchNetwork, disconnect, getWriteClient }; }, [wallet, hasInjected, connecting, connect, switchNetwork, disconnect, getWriteClient]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
export function useWallet() { const value = useContext(WalletContext); if (!value) throw new Error("useWallet must be used inside WalletProvider"); return value; }

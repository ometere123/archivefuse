"use client";
import { useCallback, useState } from "react";
import type { CalldataEncodable } from "genlayer-js/types";
import { useWallet } from "@/components/wallet-provider";
import { assertSuccess, waitFinalized, writeContract } from "@/lib/genlayer/contract";
import type { TxStage } from "@/components/transaction-rail";

export function useContractWrite() {
  const wallet = useWallet();
  const [stage, setStage] = useState<TxStage>("IDLE");
  const [hash, setHash] = useState<string>();
  const [message, setMessage] = useState<string>();
  const run = useCallback(async (functionName: string, args: CalldataEncodable[], after?: () => Promise<void>) => {
    setHash(undefined); setMessage(undefined); setStage("SIGNING");
    try {
      const client = await wallet.getWriteClient();
      const tx = await writeContract(client, functionName, args);
      setHash(String(tx)); setStage("SUBMITTED");
      setStage("FINALIZING");
      const outcome = await waitFinalized(client, tx);
      assertSuccess(outcome, String(tx));
      if (after) await after();
      setStage("SUCCESS"); setMessage("The write executed successfully and live contract state was re-read.");
      return tx;
    } catch (error) {
      setStage("FAILURE"); setMessage(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }, [wallet]);
  const reset = useCallback(() => { setStage("IDLE"); setHash(undefined); setMessage(undefined); }, []);
  return { ...wallet, stage, hash, message, run, reset };
}

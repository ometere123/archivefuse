import { explorerTxUrl } from "@/lib/genlayer/config";

export type TxStage = "IDLE" | "SIGNING" | "SUBMITTED" | "FINALIZING" | "SUCCESS" | "FAILURE";
export function TransactionRail({ stage, hash, message }: { stage: TxStage; hash?: string; message?: string }) {
  if (stage === "IDLE") return null;
  const steps = ["SIGNING", "SUBMITTED", "FINALIZING", "SUCCESS"];
  return (
    <aside className={`transaction-rail tx-${stage.toLowerCase()}`} aria-live="polite">
      <div className="tx-heading"><span>CHAIN RECEIPT</span><strong>{stage}</strong></div>
      <ol>{steps.map((s, index) => <li key={s} className={steps.indexOf(stage) >= index && stage !== "FAILURE" ? "done" : ""}>{s === "SIGNING" ? "Wallet signature" : s === "SUBMITTED" ? "Transaction submitted" : s === "FINALIZING" ? "Consensus + finality" : "GenVM success + re-read"}</li>)}</ol>
      {hash ? <a href={explorerTxUrl(hash)} target="_blank" rel="noreferrer">{hash.slice(0, 14)}… on explorer ↗</a> : null}
      {message ? <p>{message}</p> : null}
    </aside>
  );
}

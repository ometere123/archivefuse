import Link from "next/link";

export function Unavailable({ message }: { message: string }) {
  return <div className="folio-state"><span className="folio-index">UNAVAILABLE</span><h2>Live archive could not be read</h2><p>{message}</p></div>;
}
export function EmptyState({ title, body, actionHref, actionLabel }: { title: string; body: string; actionHref?: string; actionLabel?: string }) {
  return <div className="folio-state"><span className="folio-index">EMPTY SHELF</span><h2>{title}</h2><p>{body}</p>{actionHref && actionLabel ? <Link className="text-action" href={actionHref}>{actionLabel} →</Link> : null}</div>;
}
export function LoadingState({ label = "Reading the public ledger" }: { label?: string }) {
  return <div className="folio-state loading"><span className="folio-index">LIVE READ</span><h2>{label}</h2><p>The interface is waiting for the deployed contract, not substituting local records.</p></div>;
}

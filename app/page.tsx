"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getStats } from "@/lib/genlayer/data-source";
import { loadArchives } from "@/lib/live-loaders";
import { useLive } from "@/lib/use-live";
import { EmptyState, LoadingState, Unavailable } from "@/components/states";

export default function Home() {
  const archives = useLive(loadArchives, []);
  const stats = useLive(async () => { const r = await getStats(); if (r.kind !== "AVAILABLE") throw new Error(r.kind === "UNAVAILABLE" ? r.message : "Contract statistics were not found"); return r.value; }, []);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => (archives.data ?? []).filter(a => a.name.toLowerCase().includes(query.toLowerCase())), [archives.data, query]);
  if (archives.loading) return <main className="page"><LoadingState label="Opening the collection shelves" /></main>;
  if (archives.error) return <main className="page"><Unavailable message={archives.error} /></main>;
  return <main className="page collection-page">
    <section className="reading-room-heading">
      <div><span className="eyebrow">PUBLIC READING ROOM · STUDIONET</span><h1>Collection shelves</h1><p>Historical records stay intact. Candidate identities are recalled semantically, then resolved by independent validators against public source evidence.</p></div>
      <div className="ledger-stats" aria-label="Live contract totals"><span><strong>{stats.data?.archive_count ?? "—"}</strong>archives</span><span><strong>{stats.data?.record_count ?? "—"}</strong>records</span><span><strong>{stats.data?.active_cluster_count ?? "—"}</strong>active entities</span><span><strong>{stats.data?.correction_count ?? "—"}</strong>corrections</span></div>
    </section>
    <div className="catalog-search"><label htmlFor="catalog-q">Card catalogue search</label><input id="catalog-q" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Filter archive names…"/><Link className="press-button" href="/register">Register material</Link></div>
    {!filtered.length ? <EmptyState title="No live archive is on this shelf yet" body="This view does not invent sample collections. Connect a curator wallet and register the first archive directly on StudioNet." actionHref="/register" actionLabel="Register the first archive" /> : <section className="shelf-grid">{filtered.map((a)=><article className="archive-box" key={a.id}><div className="box-spine"><span>BOX {String(a.id).padStart(3,"0")}</span><small>{a.cutoff_year} cutoff</small></div><div className="box-face"><span className="accession-number">AF/ARCHIVE/{String(a.id).padStart(4,"0")}</span><h2>{a.name}</h2><dl><div><dt>Records</dt><dd>{a.record_count}</dd></div><div><dt>Cases</dt><dd>{a.case_count}</dd></div><div><dt>Active entities</dt><dd>{a.cluster_count}</dd></div></dl><p className="digest-line">{a.charter_digest}</p><div className="box-actions"><Link href={`/timeline?archive=${a.id}`}>Browse chronology</Link>{a.record_count ? <Link href={`/timeline?archive=${a.id}`}>Find accessions</Link> : <Link href={`/register?archive=${a.id}`}>Add record</Link>}</div></div></article>)}</section>}
    <section className="method-note"><span className="note-mark">METHOD</span><div><h2>Similarity opens a file. It never closes the case.</h2><p>ArchiveFuse embeds registered record summaries into contract-owned VecDB. A nearest-neighbour hit only proposes what a curator should compare. `SAME_ENTITY` requires independent validator agreement plus multiple identity-anchor categories before deterministic cluster settlement can happen.</p></div></section>
  </main>;
}

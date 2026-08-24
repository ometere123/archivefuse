"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getRecord, previewCandidates } from "@/lib/genlayer/data-source";
import { parseJsonList } from "@/lib/contract-types";
import { useLive } from "@/lib/use-live";
import { EmptyState, LoadingState, Unavailable } from "@/components/states";

export default function RecordPage(){
  const id=Number(useParams<{id:string}>().id); const [showCandidates,setShowCandidates]=useState(false);
  const record=useLive(async()=>{const r=await getRecord(id); if(r.kind!=="AVAILABLE") throw new Error(r.kind==="NOT_FOUND"?"Record not found":r.message); return r.value;},[id]);
  const candidates=useLive(async()=>{if(!showCandidates)return []; const r=await previewCandidates(id,8); if(r.kind!=="AVAILABLE") throw new Error(r.kind === "UNAVAILABLE" ? r.message : "Record not found"); return r.value;},[id,showCandidates]);
  if(record.loading)return <main className="page"><LoadingState label="Pulling accession card from the live ledger"/></main>;
  if(record.error||!record.data)return <main className="page"><Unavailable message={record.error??"Record unavailable"}/></main>;
  const r=record.data; const fields=[ ["Names / aliases",parseJsonList(r.names_json)], ["Dates",parseJsonList(r.dates_json)], ["Places",parseJsonList(r.places_json)], ["Roles / occupations",parseJsonList(r.roles_json)] ] as const;
  return <main className="page record-page">
    <div className="record-breadcrumb"><Link href="/">Collections</Link><span>/</span><span>AF-{String(r.id).padStart(5,"0")}</span></div>
    <article className="catalog-card-large"><div className="card-tab">ACCESSION AF-{String(r.id).padStart(5,"0")}</div><header><div><span className="eyebrow">{r.entity_type} · ARCHIVE {r.archive_id}</span><h1>{r.title}</h1></div><div className="year-stamp">{r.latest_year||"N.D."}</div></header><p className="lead-summary">{r.summary}</p><div className="catalog-columns">{fields.map(([label,values])=><section key={label}><h2>{label}</h2>{values.length?<ul className="typed-list">{values.map((v,i)=><li key={`${v}-${i}`}>{v}</li>)}</ul>:<p className="muted">No value registered.</p>}</section>)}</div><div className="source-register"><div><span>PUBLIC SOURCE</span><a href={r.source_url} target="_blank" rel="noreferrer">{r.source_url}</a></div><code>{r.source_digest}</code><Link href={`/sources/${r.id}`}>Open source lightbox →</Link></div><footer><span>Registrar {r.registrar.slice(0,10)}…</span><span>{r.registered_at||"timestamp unavailable"}</span><span>{r.cluster_id?<Link href={`/entities/${r.cluster_id}`}>Entity cluster {r.cluster_id}</Link>:"Not yet clustered"}</span></footer></article>
    <section className="candidate-drawer"><header><div><span className="eyebrow">SEMANTIC RECALL</span><h2>Candidate records</h2><p>VecDB retrieves related records inside this archive and entity type. Distance is shown as distance—not confidence.</p></div><button className="press-button" onClick={()=>setShowCandidates(true)}>Find candidates</button></header>{showCandidates && candidates.loading?<LoadingState label="Searching contract-owned semantic memory"/>:candidates.error?<Unavailable message={candidates.error}/>:showCandidates && !candidates.data?.length?<EmptyState title="No eligible candidates" body="No same-archive, same-type record was returned by the bounded semantic search."/>:showCandidates?<div className="candidate-table"><div className="candidate-row heading"><span>Record</span><span>Vector distance</span><span>Year gap</span><span>Current file</span><span/></div>{candidates.data?.map(c=><div className="candidate-row" key={c.record_id}><Link href={`/records/${c.record_id}`}>{c.title}<small>AF-{String(c.record_id).padStart(5,"0")}</small></Link><code>{c.distance}</code><span>{c.year_gap}{c.date_flag?<em>{c.date_flag}</em>:null}</span><span>{c.cluster_id?`Cluster ${c.cluster_id}`:"Unclustered"}</span><Link className="compare-link" href={`/resolve/${r.id}/${c.record_id}`}>Compare →</Link></div>)}</div>:null}</section>
  </main>;
}

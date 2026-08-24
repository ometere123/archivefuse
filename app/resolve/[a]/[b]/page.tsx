"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
import {useParams} from "next/navigation";
import {AccessionCard} from "@/components/accession-card";
import {TransactionRail} from "@/components/transaction-rail";
import {LoadingState,Unavailable} from "@/components/states";
import {getCase,getRecord,listCaseIds} from "@/lib/genlayer/data-source";
import {useLive} from "@/lib/use-live";
import {useContractWrite} from "@/lib/use-write";
import type {ResolutionCase} from "@/lib/contract-types";

export default function ResolvePage(){
 const p=useParams<{a:string;b:string}>();const aId=Number(p.a),bId=Number(p.b);const tx=useContractWrite();const [caseId,setCaseId]=useState<number>();const [caseRow,setCaseRow]=useState<ResolutionCase>();
 const pair=useLive(async()=>{const[a,b]=await Promise.all([getRecord(aId),getRecord(bId)]);if(a.kind!=="AVAILABLE"||b.kind!=="AVAILABLE")throw new Error("Both live records are required");if(a.value.archive_id!==b.value.archive_id)throw new Error("Records belong to different archives");return{a:a.value,b:b.value,archiveId:a.value.archive_id}},[aId,bId]);
 async function discover(){if(!pair.data)return;const ids=await listCaseIds(pair.data.archiveId,0,50);if(ids.kind!=="AVAILABLE")return;for(const id of [...ids.value].reverse()){const c=await getCase(id);if(c.kind==="AVAILABLE"&&((c.value.record_a===aId&&c.value.record_b===bId)||(c.value.record_a===bId&&c.value.record_b===aId))){setCaseId(id);setCaseRow(c.value);return;}}}
 async function propose(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!pair.data)return;const f=new FormData(e.currentTarget);try{await tx.run("propose_resolution",[BigInt(pair.data.archiveId),BigInt(aId),BigInt(bId),String(f.get("evidenceUrl")||""),String(f.get("digest")||"")],discover);}catch{}}
 async function adjudicate(){if(!caseId)return;try{await tx.run("adjudicate_resolution",[BigInt(caseId)],async()=>{const c=await getCase(caseId);if(c.kind==="AVAILABLE")setCaseRow(c.value);});}catch{}}
 if(pair.loading)return <main className="page"><LoadingState label="Placing accession cards on the comparison table"/></main>;if(pair.error||!pair.data)return <main className="page"><Unavailable message={pair.error??"Pair unavailable"}/></main>;
 return <main className="page resolve-page"><header className="folio-heading"><span className="eyebrow">IDENTITY RESOLUTION LIGHT TABLE</span><h1>Compare public records</h1><p>Similarity brought these cards together. It does not decide what they mean. Validators independently fetch the digest-bound sources before any cluster can change.</p></header><section className="comparison-table"><AccessionCard record={pair.data.a}/><div className="identity-axis"><span>A</span><i/><strong>?</strong><i/><span>B</span></div><AccessionCard record={pair.data.b}/></section>
 {!caseId?<form className="evidence-ticket" onSubmit={propose}><div><span className="ticket-no">RESOLUTION TICKET</span><h2>Freeze the comparison case</h2><p>Additional evidence is optional. If supplied, both URL and SHA-256 digest are frozen with the case.</p></div><label>Additional public evidence URL<input name="evidenceUrl" type="url" placeholder="https://…"/></label><label>Evidence SHA-256<input name="digest" placeholder="Required only when URL is supplied"/></label><WriteGate tx={tx}/><button className="seal-button" disabled={!tx.canWrite}>Propose resolution</button></form>:<section className="decision-desk"><span className="ticket-no">CASE {String(caseId).padStart(5,"0")}</span><h2>{caseRow?.relation||"Pending semantic adjudication"}</h2>{caseRow?.relation?<><p>{caseRow.rationale}</p><Link className="press-button" href={`/cases/${caseId}`}>Open immutable receipt</Link></>:<><p>The case is frozen. Adjudication will retrieve bounded VecDB context and run independent source-grounded validator judgment.</p><button className="seal-button" disabled={!tx.canWrite} onClick={adjudicate}>Run consensus adjudication</button></>}</section>}
 <TransactionRail stage={tx.stage} hash={tx.hash} message={tx.message}/></main>
}
function WriteGate({tx}:{tx:ReturnType<typeof useContractWrite>}){return !tx.canWrite?<div className="write-gate"><strong>Signature gate</strong><span>{tx.writeBlockedReason}</span>{tx.network==="wrong"?<button type="button" onClick={tx.switchNetwork}>Switch to StudioNet</button>:!tx.address?<button type="button" onClick={tx.connect}>Connect wallet</button>:null}</div>:<div className="write-gate ready"><strong>Ready</strong><span>Injected wallet · StudioNet 61999</span></div>}

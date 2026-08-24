"use client";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionRail } from "@/components/transaction-rail";
import { useContractWrite } from "@/lib/use-write";

const digestHelp = "64 hex characters, optionally prefixed sha256:";
const arr = (value: string) => JSON.stringify(value.split("\n").map(v=>v.trim()).filter(Boolean));
type Mode = "archive" | "record" | "curator";

function RegisterPageInner() {
  const params = useSearchParams();
  const [mode,setMode]=useState<Mode>(params.get("archive") ? "record" : "archive");
  const tx=useContractWrite();
  const [archiveId,setArchiveId]=useState(params.get("archive") ?? "1");
  const [formError,setFormError]=useState<string>();
  async function createArchive(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setFormError(undefined); const f=new FormData(e.currentTarget);
    try { await tx.run("create_archive",[String(f.get("name")),String(f.get("charterUrl")),String(f.get("digest")),BigInt(String(f.get("cutoff")))]); } catch {}
  }
  async function registerRecord(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setFormError(undefined); const f=new FormData(e.currentTarget);
    try { await tx.run("register_record",[BigInt(archiveId),BigInt(String(f.get("type"))),String(f.get("title")),String(f.get("summary")),String(f.get("sourceUrl")),String(f.get("digest")),arr(String(f.get("names"))),arr(String(f.get("dates"))),arr(String(f.get("places"))),arr(String(f.get("roles"))),BigInt(String(f.get("latestYear")||"0"))]); } catch {}
  }
  async function setCurator(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setFormError(undefined); const f=new FormData(e.currentTarget); const address=String(f.get("curator")||"").trim();
    if(!/^0x[0-9a-fA-F]{40}$/.test(address)){setFormError("Enter a complete 20-byte EVM address for the curator.");return;}
    try { await tx.run("set_curator",[BigInt(String(f.get("archiveId"))),address,String(f.get("action"))==="grant"]); } catch {}
  }
  return <main className="page registrar-page">
    <header className="folio-heading"><span className="eyebrow">REGISTRAR DESK</span><h1>Register public material</h1><p>Every accepted form becomes live StudioNet state. There is no draft database behind this desk.</p></header>
    <div className="tab-ruler"><button className={mode==="archive"?"active":""} onClick={()=>{setMode("archive");setFormError(undefined)}}>01 · New archive</button><button className={mode==="record"?"active":""} onClick={()=>{setMode("record");setFormError(undefined)}}>02 · Accession record</button><button className={mode==="curator"?"active":""} onClick={()=>{setMode("curator");setFormError(undefined)}}>03 · Curator access</button></div>
    {mode==="archive" ? <form className="registrar-form" onSubmit={createArchive}>
      <div className="form-number">FORM AF-01</div><label>Archive name<input name="name" required maxLength={120}/></label><label>Public charter URL<input name="charterUrl" type="url" required placeholder="https://…"/></label><label>Charter SHA-256 digest<input name="digest" required placeholder={digestHelp}/></label><div className="form-note">Use a version-pinned or otherwise immutable charter URL. If the bytes later change, future adjudications will fail the SHA-256 integrity check.</div><label>Historical person cutoff year<input name="cutoff" type="number" min="1" max="2100" defaultValue="1950" required/></label><div className="form-note">Person records dated later than this cutoff are rejected by the contract. This keeps the MVP on historical/public-domain identity resolution rather than living-person profiling.</div><WriteGate tx={tx}/><button className="seal-button" disabled={!tx.canWrite || tx.stage==="FINALIZING"}>Seal archive on StudioNet</button>
    </form> : mode==="record" ? <form className="registrar-form wide" onSubmit={registerRecord}>
      <div className="form-number">FORM AF-02</div><div className="field-pair"><label>Archive ID<input value={archiveId} onChange={e=>setArchiveId(e.target.value)} type="number" min="1" required/></label><label>Entity type<select name="type" defaultValue="1"><option value="1">Person</option><option value="2">Place</option><option value="3">Organization</option></select></label></div><label>Accession title<input name="title" required maxLength={180}/></label><label>Bounded archival summary<textarea name="summary" required maxLength={1800} rows={6}/></label><div className="field-pair"><label>Public source URL<input name="sourceUrl" type="url" required placeholder="https://…"/></label><label>Source SHA-256 digest<input name="digest" required placeholder={digestHelp}/></label></div><div className="field-pair"><label>Names / aliases <small>one per line</small><textarea name="names" rows={5}/></label><label>Dates <small>one per line</small><textarea name="dates" rows={5}/></label></div><div className="field-pair"><label>Places <small>one per line</small><textarea name="places" rows={5}/></label><label>Roles / occupations <small>one per line</small><textarea name="roles" rows={5}/></label></div><label>Latest year represented<input name="latestYear" type="number" min="0" max="2100" defaultValue="0" required/><small>Person records must use a non-zero year at or before the archive cutoff.</small></label><WriteGate tx={tx}/><button className="seal-button" disabled={!tx.canWrite || tx.stage==="FINALIZING"}>Accession record on StudioNet</button>
    </form> : <form className="registrar-form" onSubmit={setCurator}>
      <div className="form-number">FORM AF-03</div><label>Archive ID<input name="archiveId" type="number" min="1" defaultValue={archiveId} required/></label><label>Curator address<input name="curator" required placeholder="0x…" autoComplete="off"/></label><label>Access action<select name="action" defaultValue="grant"><option value="grant">Grant curator access</option><option value="revoke">Revoke curator access</option></select></label><div className="form-note">Only the archive steward can change curator access. Curators may register records; stewardship itself is not transferred by this form.</div><WriteGate tx={tx}/><button className="seal-button" disabled={!tx.canWrite || tx.stage==="FINALIZING"}>Update curator rights</button>
    </form>}
    {formError?<p className="form-note" role="alert">{formError}</p>:null}<TransactionRail stage={tx.stage} hash={tx.hash} message={tx.message}/>
  </main>;
}
function WriteGate({tx}:{tx:ReturnType<typeof useContractWrite>}) { return !tx.canWrite ? <div className="write-gate"><strong>Signature gate</strong><span>{tx.writeBlockedReason}</span>{tx.network==="wrong"?<button type="button" onClick={tx.switchNetwork}>Switch to StudioNet</button>:!tx.address?<button type="button" onClick={tx.connect}>Connect injected wallet</button>:null}</div>:<div className="write-gate ready"><strong>Ready to sign</strong><span>{tx.address?.slice(0,8)}… · StudioNet 61999</span></div>; }

export default function RegisterPage(){return <Suspense fallback={<main className="page"><div className="folio-state">Opening registrar desk…</div></main>}><RegisterPageInner/></Suspense>}

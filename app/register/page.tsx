"use client";
import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionRail } from "@/components/transaction-rail";
import { useContractWrite } from "@/lib/use-write";

const digestHelp = "64 hex characters, optionally prefixed sha256:";
const arr = (value: string) => JSON.stringify(value.split("\n").map(v=>v.trim()).filter(Boolean));

export default function RegisterPage() {
  const params = useSearchParams();
  const [mode,setMode]=useState<"archive"|"record">(params.get("archive") ? "record" : "archive");
  const tx=useContractWrite();
  const [archiveId,setArchiveId]=useState(params.get("archive") ?? "1");
  async function createArchive(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    try { await tx.run("create_archive",[String(f.get("name")),String(f.get("charterUrl")),String(f.get("digest")),BigInt(String(f.get("cutoff")))]); } catch {}
  }
  async function registerRecord(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    try { await tx.run("register_record",[BigInt(archiveId),BigInt(String(f.get("type"))),String(f.get("title")),String(f.get("summary")),String(f.get("sourceUrl")),String(f.get("digest")),arr(String(f.get("names"))),arr(String(f.get("dates"))),arr(String(f.get("places"))),arr(String(f.get("roles"))),BigInt(String(f.get("latestYear")||"0"))]); } catch {}
  }
  return <main className="page registrar-page">
    <header className="folio-heading"><span className="eyebrow">REGISTRAR DESK</span><h1>Register public material</h1><p>Every accepted form becomes live StudioNet state. There is no draft database behind this desk.</p></header>
    <div className="tab-ruler"><button className={mode==="archive"?"active":""} onClick={()=>setMode("archive")}>01 · New archive</button><button className={mode==="record"?"active":""} onClick={()=>setMode("record")}>02 · Accession record</button></div>
    {mode==="archive" ? <form className="registrar-form" onSubmit={createArchive}>
      <div className="form-number">FORM AF-01</div><label>Archive name<input name="name" required maxLength={120}/></label><label>Public charter URL<input name="charterUrl" type="url" required placeholder="https://…"/></label><label>Charter SHA-256 digest<input name="digest" required placeholder={digestHelp}/></label><label>Historical person cutoff year<input name="cutoff" type="number" min="1" max="2100" defaultValue="1950" required/></label><div className="form-note">Person records dated later than this cutoff are rejected by the contract. This keeps the MVP on historical/public-domain identity resolution rather than living-person profiling.</div><WriteGate tx={tx}/><button className="seal-button" disabled={!tx.canWrite || tx.stage==="FINALIZING"}>Seal archive on StudioNet</button>
    </form> : <form className="registrar-form wide" onSubmit={registerRecord}>
      <div className="form-number">FORM AF-02</div><div className="field-pair"><label>Archive ID<input value={archiveId} onChange={e=>setArchiveId(e.target.value)} type="number" min="1" required/></label><label>Entity type<select name="type" defaultValue="1"><option value="1">Person</option><option value="2">Place</option><option value="3">Organization</option></select></label></div><label>Accession title<input name="title" required maxLength={180}/></label><label>Bounded archival summary<textarea name="summary" required maxLength={1800} rows={6}/></label><div className="field-pair"><label>Public source URL<input name="sourceUrl" type="url" required placeholder="https://…"/></label><label>Source SHA-256 digest<input name="digest" required placeholder={digestHelp}/></label></div><div className="field-pair"><label>Names / aliases <small>one per line</small><textarea name="names" rows={5}/></label><label>Dates <small>one per line</small><textarea name="dates" rows={5}/></label></div><div className="field-pair"><label>Places <small>one per line</small><textarea name="places" rows={5}/></label><label>Roles / occupations <small>one per line</small><textarea name="roles" rows={5}/></label></div><label>Latest year represented<input name="latestYear" type="number" min="0" max="2100" defaultValue="0" required/><small>Person records must use a non-zero year at or before the archive cutoff.</small></label><WriteGate tx={tx}/><button className="seal-button" disabled={!tx.canWrite || tx.stage==="FINALIZING"}>Accession record on StudioNet</button>
    </form>}
    <TransactionRail stage={tx.stage} hash={tx.hash} message={tx.message}/>
  </main>;
}
function WriteGate({tx}:{tx:ReturnType<typeof useContractWrite>}) { return !tx.canWrite ? <div className="write-gate"><strong>Signature gate</strong><span>{tx.writeBlockedReason}</span>{tx.network==="wrong"?<button type="button" onClick={tx.switchNetwork}>Switch to StudioNet</button>:!tx.address?<button type="button" onClick={tx.connect}>Connect injected wallet</button>:null}</div>:<div className="write-gate ready"><strong>Ready to sign</strong><span>{tx.address?.slice(0,8)}… · StudioNet 61999</span></div>; }

import Link from "next/link";
import type { ArchiveRecord } from "@/lib/contract-types";
import { parseJsonList } from "@/lib/contract-types";

export function AccessionCard({ record, compact = false }: { record: ArchiveRecord; compact?: boolean }) {
  const aliases = parseJsonList(record.names_json);
  const places = parseJsonList(record.places_json);
  return (
    <article className={`accession-card ${compact ? "compact" : ""}`}>
      <div className="card-tab">AF-{String(record.id).padStart(5, "0")}</div>
      <div className="card-rule"><span>{record.entity_type}</span><span>{record.latest_year || "undated"}</span></div>
      <h3><Link href={`/records/${record.id}`}>{record.title}</Link></h3>
      <p className="record-summary">{record.summary}</p>
      <dl className="card-fields">
        <div><dt>Names</dt><dd>{aliases.length ? aliases.slice(0, 3).join(" · ") : "—"}</dd></div>
        <div><dt>Places</dt><dd>{places.length ? places.slice(0, 3).join(" · ") : "—"}</dd></div>
        <div><dt>Entity file</dt><dd>{record.cluster_id ? <Link href={`/entities/${record.cluster_id}`}>Cluster {record.cluster_id}</Link> : "Unclustered"}</dd></div>
      </dl>
      <div className="digest-line">{record.source_digest}</div>
    </article>
  );
}

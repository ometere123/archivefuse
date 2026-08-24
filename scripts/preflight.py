from __future__ import annotations
import ast,json,pathlib,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
contract=ROOT/'contracts'/'archivefuse.py'; text=contract.read_text(encoding='utf-8'); checks=[]
def check(name,ok,detail=''): checks.append((name,bool(ok),detail))
try: tree=ast.parse(text); check('contract_ast',True)
except SyntaxError as exc: tree=None; check('contract_ast',False,str(exc))
required={'create_archive','set_curator','register_record','preview_candidates','propose_resolution','adjudicate_resolution','invalidate_stale_resolution','preview_correction_context','propose_correction','adjudicate_correction','invalidate_stale_correction','get_archive','get_record','get_case','get_correction','get_cluster','get_record_cluster','is_curator','list_archive_ids','list_record_ids','list_case_ids','list_correction_ids','list_cluster_members','list_cluster_case_ids','list_cluster_correction_ids','stats'}
methods=set(); class_node=None
if tree:
  for n in tree.body:
    if isinstance(n,ast.ClassDef) and n.name=='ArchiveFuse': class_node=n; methods={m.name for m in n.body if isinstance(m,ast.FunctionDef)}
check('required_contract_surface',required<=methods,','.join(sorted(required-methods)))
check('vecdb','genlayer_embeddings.VecDB' in text and 'MAX_KNN_SCAN = 24' in text and 'all-MiniLM-L6-v2' in text)
check('independent_consensus','run_nondet_unsafe' in text and text.count('def validator_fn')>=2)
check('digest_binding','hashlib.sha256(body).hexdigest()' in text and '[DIGEST_MISMATCH]' in text)
check('source_bounds','MAX_SOURCE_BYTES' in text and 'SOURCE_TOO_LARGE' in text)
check('immutable_record','update_record' not in methods and 'delete_record' not in methods)
check('correction_path',{'propose_correction','adjudicate_correction','invalidate_stale_correction'}<=methods)
check('stale_resolution_path','invalidate_stale_resolution' in methods and 'CASE_STALE' in text)
check('paired_optional_evidence','optional evidence URL and digest must be supplied together' in text)
check('frozen_correction_context','_frozen_correction_context' in text and 'context_record_ids_json' in text)
check('duplicate_pending_guards','pending_pairs:' in text and 'pending_corrections:' in text and 'pending resolution already exists' in text and 'pending correction already exists' in text)
check('same_cluster_uses_correction','already share an active cluster; use the correction flow' in text)
check('active_cluster_accounting','active_cluster_count' in text and 'source.member_count=u16(0)' in text.replace(' ',''))
check('no_money','.payable' not in text and 'emit_transfer' not in text and 'gl.message.value' not in text)
if class_node:
  mutating_views=[]
  for m in class_node.body:
    if isinstance(m,ast.FunctionDef) and m.name.startswith('list_'):
      src=ast.get_source_segment(text,m) or ''
      if 'get_or_insert_default' in src: mutating_views.append(m.name)
  check('non_mutating_list_views',not mutating_views,','.join(mutating_views))
forbidden=['supabase','firebase','postgresql','mongodb','redis://','express()','fastapi(','fixture_data','mock-data.ts','mock_data.ts']; viol=[]
for p in ROOT.rglob('*'):
  if not p.is_file() or p.suffix not in {'.py','.ts','.tsx','.js','.mjs','.json','.yml','.yaml'} or '.github' in p.parts or p==pathlib.Path(__file__).resolve(): continue
  rel=p.relative_to(ROOT)
  if rel.parts and rel.parts[0] in ('tests','scripts'): continue
  if '.pytest_cache' in p.parts or '__pycache__' in p.parts: continue
  content=p.read_text(encoding='utf-8',errors='ignore').lower()
  for word in forbidden:
    if word in content: viol.append(f'{rel}:{word}')
check('no_backend_or_mock_runtime',not viol,'; '.join(viol[:10])); check('no_next_api_backend',not (ROOT/'app'/'api').exists())
loader=(ROOT/'lib'/'live-loaders.ts').read_text(encoding='utf-8'); check('live_read_fail_closed','throw new Error(result.message)' in loader and '?? []' not in loader); check('live_pagination','loadAllIds' in loader and 'offset += batch.length' in loader)
config=(ROOT/'lib'/'genlayer'/'config.ts').read_text(encoding='utf-8'); check('frontend_hardened_schema','invalidate_stale_resolution' in config and 'invalidate_stale_correction' in config)
routes=['app/page.tsx','app/register/page.tsx','app/timeline/page.tsx','app/records/[id]/page.tsx','app/entities/[clusterId]/page.tsx','app/resolve/[a]/[b]/page.tsx','app/sources/[id]/page.tsx','app/clusters/[id]/lineage/page.tsx','app/cases/[id]/page.tsx','app/corrections/new/page.tsx','app/corrections/[id]/page.tsx']
missing=[r for r in routes if not (ROOT/r).exists()]; check('required_frontend_routes',not missing,','.join(missing))
print(json.dumps({'passed':sum(ok for _,ok,_ in checks),'total':len(checks),'checks':[{'name':n,'ok':ok,'detail':d} for n,ok,d in checks]},indent=2)); sys.exit(0 if all(ok for _,ok,_ in checks) else 1)

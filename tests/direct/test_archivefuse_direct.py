"""GenLayer Direct Mode coverage for the production ArchiveFuse contract."""
import hashlib,json,re,pytest
from importlib.metadata import PackageNotFoundError,version
try: version('genlayer-test')
except PackageNotFoundError: pytest.skip('genlayer-test is not installed',allow_module_level=True)

SDK_VERSION='v0.2.16'
OTHER=bytes.fromhex('22'*20)
THIRD=bytes.fromhex('33'*20)
CHARTER_URL='https://archive.example/charter.txt'
CHARTER=b'Public historical archive charter. Resolve identity conservatively from public evidence.'

def digest(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def deploy(d): return d('contracts/archivefuse.py',sdk_version=SDK_VERSION)
def web(vm,url,body): vm.mock_web(re.escape(url),{'status':200,'body':body.decode()})
def archive(c,vm,name='City Archive'):
    web(vm,CHARTER_URL,CHARTER)
    return c.create_archive(name,CHARTER_URL,digest(CHARTER),1950)
def record(c,vm,aid,title,url,body,year=1910,entity_type=1):
    web(vm,url,body)
    return c.register_record(aid,entity_type,title,body.decode(),url,digest(body),json.dumps([title]),json.dumps([str(year)]) if year else '[]',json.dumps(['Market Street']),json.dumps(['Clerk']),year)
def mock_relation(vm,value,anchors):
    vm.mock_llm(r'ArchiveFuse, a conservative historical entity-resolution adjudicator',json.dumps({'relation':value,'anchor_codes':anchors,'rationale':'Public evidence supports the result.','evidence_summary':'Sources independently compared.'}))
def mock_correction(vm,value,codes):
    vm.mock_llm(r'ArchiveFuse reviewing a challenge',json.dumps({'decision':value,'contradiction_codes':codes,'rationale':'Correction evidence supports the result.','evidence_summary':'Frozen peer evidence independently compared.'}))
def pair(c,vm,aid,left,right,value='SAME_ENTITY',anchors=('PLACE','ROLE_OCCUPATION')):
    cid=c.propose_resolution(aid,left,right,'','')
    mock_relation(vm,value,list(anchors))
    return cid,c.adjudicate_resolution(cid)
def seed_two(c,vm):
    aid=archive(c,vm)
    a=record(c,vm,aid,'Ada Cole','https://archive.example/a.txt',b'Ada Cole clerk Market Street 1910')
    b=record(c,vm,aid,'Ada Cole Smith','https://archive.example/b.txt',b'Ada Cole Smith clerk Market Street 1911',1911)
    return aid,a,b

def test_archive_record_and_cutoff(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid=archive(c,direct_vm); body=b'Ada Cole, Market Street, clerk, 1910.'; rid=record(c,direct_vm,aid,'Ada Cole','https://archive.example/a.txt',body)
    assert c.get_record(rid)['cluster_id']==0 and c.get_archive(aid)['record_count']==1
    with direct_vm.expect_revert('historical cutoff'): record(c,direct_vm,aid,'Later Person','https://archive.example/l.txt',b'Later record',1980)

def test_curator_authorization_grant_and_revoke(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid=archive(c,direct_vm); addr='0x'+('22'*20)
    with direct_vm.prank(OTHER),direct_vm.expect_revert('steward or curator only'):
        record(c,direct_vm,aid,'Denied','https://archive.example/denied.txt',b'Denied historical record')
    c.set_curator(aid,addr,True); assert c.is_curator(aid,addr) is True
    with direct_vm.prank(OTHER): record(c,direct_vm,aid,'Accepted','https://archive.example/accepted.txt',b'Accepted historical record')
    c.set_curator(aid,addr,False); assert c.is_curator(aid,addr) is False
    with direct_vm.prank(OTHER),direct_vm.expect_revert('steward or curator only'):
        record(c,direct_vm,aid,'Denied Again','https://archive.example/denied2.txt',b'Denied again')

def test_only_steward_can_change_curators(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid=archive(c,direct_vm)
    with direct_vm.prank(OTHER),direct_vm.expect_revert('steward only'):
        c.set_curator(aid,'0x'+('33'*20),True)

def test_vecdb_retrieval_cannot_merge(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); rows=c.preview_candidates(a,8)
    assert any(x['record_id']==b for x in rows); assert c.get_record(a)['cluster_id']==0 and c.get_record(b)['cluster_id']==0

def test_pair_preflight_rejects_self_cross_type_and_unpaired_optional_evidence(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm)
    with direct_vm.expect_revert('cannot be compared with itself'): c.propose_resolution(aid,a,a,'','')
    place=record(c,direct_vm,aid,'Market Street','https://archive.example/place.txt',b'Market Street historical place',0,2)
    with direct_vm.expect_revert('same entity type'): c.propose_resolution(aid,a,place,'','')
    with direct_vm.expect_revert('supplied together'): c.propose_resolution(aid,a,b,'https://archive.example/extra.txt','')
    with direct_vm.expect_revert('supplied together'): c.propose_resolution(aid,a,b,'',digest(b'extra'))

def test_duplicate_pending_pair_is_rejected_until_terminal(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); first=c.propose_resolution(aid,a,b,'','')
    with direct_vm.expect_revert('pending resolution already exists'): c.propose_resolution(aid,b,a,'','')
    mock_relation(direct_vm,'DISTINCT_ENTITY',[]); assert c.adjudicate_resolution(first)=='DISTINCT_ENTITY'
    again=c.propose_resolution(aid,b,a,'',''); assert again>first

def test_same_entity_requires_consensus_and_multiple_anchors(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); case=c.propose_resolution(aid,a,b,'',''); mock_relation(direct_vm,'SAME_ENTITY',['PLACE','ROLE_OCCUPATION'])
    assert c.adjudicate_resolution(case)=='SAME_ENTITY'; cid=c.get_case(case)['resulting_cluster']; assert cid>0 and c.get_record(a)['cluster_id']==cid and c.get_record(b)['cluster_id']==cid

def test_one_anchor_fails_closed(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); case=c.propose_resolution(aid,a,b,'',''); mock_relation(direct_vm,'SAME_ENTITY',['NAME_ALIAS'])
    assert c.adjudicate_resolution(case)=='INSUFFICIENT_EVIDENCE'; assert c.get_record(a)['cluster_id']==0

def test_distinct_receipt_never_mutates_membership(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); case,outcome=pair(c,direct_vm,aid,a,b,'DISTINCT_ENTITY',())
    assert outcome=='DISTINCT_ENTITY' and c.get_case(case)['resulting_cluster']==0 and c.get_record(a)['cluster_id']==c.get_record(b)['cluster_id']==0

def test_digest_mismatch_fails_closed_to_insufficient(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); url='https://archive.example/extra.txt'; web(direct_vm,url,b'actual evidence')
    case=c.propose_resolution(aid,a,b,url,digest(b'different evidence'))
    assert c.adjudicate_resolution(case)=='INSUFFICIENT_EVIDENCE' and c.get_record(a)['cluster_id']==0

def test_same_active_cluster_pair_must_use_correction_flow(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); pair(c,direct_vm,aid,a,b)
    with direct_vm.expect_revert('already share an active cluster'): c.propose_resolution(aid,a,b,'','')

def test_stale_resolution_can_be_terminalized_without_semantic_judgment(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); pending=c.propose_resolution(aid,a,b,'','')
    d=record(c,direct_vm,aid,'Ada C.','https://archive.example/d.txt',b'Ada C clerk Market Street 1910')
    pair(c,direct_vm,aid,a,d)
    with direct_vm.expect_revert('stale case'): c.adjudicate_resolution(pending)
    assert c.invalidate_stale_resolution(pending)=='STALE'; row=c.get_case(pending); assert row['status']==6 and row['relation']=='STALE'
    again=c.propose_resolution(aid,a,b,'',''); assert again>pending

def test_cluster_merge_updates_active_counts_and_superseded_membership(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid=archive(c,direct_vm)
    a=record(c,direct_vm,aid,'Ada A','https://archive.example/a.txt',b'Ada A clerk Market Street 1910')
    b=record(c,direct_vm,aid,'Ada B','https://archive.example/b.txt',b'Ada B clerk Market Street 1910')
    d=record(c,direct_vm,aid,'Ada D','https://archive.example/d.txt',b'Ada D clerk Market Street 1910')
    e=record(c,direct_vm,aid,'Ada E','https://archive.example/e.txt',b'Ada E clerk Market Street 1910')
    first,_=pair(c,direct_vm,aid,a,b); second,_=pair(c,direct_vm,aid,d,e); ca=c.get_case(first)['resulting_cluster']; cb=c.get_case(second)['resulting_cluster']; assert ca!=cb
    merge,_=pair(c,direct_vm,aid,b,d); active=c.get_case(merge)['resulting_cluster']; old=cb if active==ca else ca
    assert c.get_cluster(old)['superseded_by']==active and c.get_cluster(old)['member_count']==0 and c.list_cluster_members(old,0,50)==[]
    assert c.get_archive(aid)['cluster_count']==1; stats=c.stats(); assert stats['cluster_count']==2 and stats['active_cluster_count']==1

def test_empty_collection_views_are_read_only_and_return_empty(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid=archive(c,direct_vm)
    assert c.list_record_ids(aid,0,50)==[] and c.list_case_ids(aid,0,50)==[] and c.list_correction_ids(aid,0,50)==[]
    with direct_vm.expect_revert('pagination'): c.list_record_ids(aid,0,51)

def test_correction_detach_preserves_record_and_versioned_receipt(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); case,_=pair(c,direct_vm,aid,a,b); cluster=c.get_case(case)['resulting_cluster']; original=c.get_record(a)
    url='https://archive.example/correction.txt'; body=b'Independent register proves the target was a different person at a different place and role.'; web(direct_vm,url,body)
    correction=c.propose_correction(cluster,a,url,digest(body)); row=c.get_correction(correction); frozen=json.loads(row['context_record_ids_json']); assert b in frozen; assert c.get_cluster(cluster)['canonical_label']==original['title']
    mock_correction(direct_vm,'DETACH_MEMBER',['PLACE','ROLE_OCCUPATION']); assert c.adjudicate_correction(correction)=='DETACH_MEMBER'
    assert c.get_record(a)['cluster_id']==0 and c.get_record(a)['title']==original['title']; assert c.get_record(b)['cluster_id']==cluster
    assert c.get_cluster(cluster)['canonical_label']==c.get_record(b)['title']
    receipt=c.get_correction(correction); assert receipt['status']==3 and receipt['decision']=='DETACH_MEMBER' and c.get_cluster(cluster)['member_count']==1
    assert c.get_case(case)['relation']=='SAME_ENTITY' and c.get_case(case)['resulting_cluster']==cluster

def test_duplicate_pending_correction_is_rejected(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); case,_=pair(c,direct_vm,aid,a,b); cluster=c.get_case(case)['resulting_cluster']; url='https://archive.example/correction.txt'; body=b'Correction evidence'; web(direct_vm,url,body)
    c.propose_correction(cluster,a,url,digest(body))
    with direct_vm.expect_revert('pending correction already exists'): c.propose_correction(cluster,a,url,digest(body))

def test_correction_one_anchor_cannot_detach(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); case,_=pair(c,direct_vm,aid,a,b); cluster=c.get_case(case)['resulting_cluster']; url='https://archive.example/correction.txt'; body=b'Correction evidence'; web(direct_vm,url,body)
    correction=c.propose_correction(cluster,a,url,digest(body)); mock_correction(direct_vm,'DETACH_MEMBER',['PLACE'])
    assert c.adjudicate_correction(correction)=='INSUFFICIENT_EVIDENCE' and c.get_record(a)['cluster_id']==cluster

def test_stale_correction_can_be_terminalized(direct_vm,direct_deploy):
    c=deploy(direct_deploy); aid,a,b=seed_two(c,direct_vm); case,_=pair(c,direct_vm,aid,a,b); cluster=c.get_case(case)['resulting_cluster']; url='https://archive.example/correction.txt'; body=b'Correction evidence'; web(direct_vm,url,body)
    pending=c.propose_correction(cluster,a,url,digest(body))
    d=record(c,direct_vm,aid,'Ada D','https://archive.example/d.txt',b'Ada D clerk Market Street 1910'); pair(c,direct_vm,aid,b,d)
    with direct_vm.expect_revert('stale correction'): c.adjudicate_correction(pending)
    assert c.invalidate_stale_correction(pending)=='STALE'; row=c.get_correction(pending); assert row['status']==5 and row['decision']=='STALE'

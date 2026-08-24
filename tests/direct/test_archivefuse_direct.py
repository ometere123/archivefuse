"""GenLayer Direct Mode coverage for the production ArchiveFuse contract."""
import hashlib,json,re,pytest
from importlib.metadata import PackageNotFoundError,version
try: version('genlayer-test')
except PackageNotFoundError: pytest.skip('genlayer-test is not installed',allow_module_level=True)
SDK_VERSION='v0.2.16'; OTHER=bytes.fromhex('22'*20); CHARTER_URL='https://archive.example/charter.txt'; CHARTER=b'Public historical archive charter. Resolve identity conservatively from public evidence.'
def digest(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def deploy(d): return d('contracts/archivefuse.py',sdk_version=SDK_VERSION)
def web(vm,url,body): vm.mock_web(re.escape(url),{'status':200,'body':body.decode()})
def archive(c,vm): web(vm,CHARTER_URL,CHARTER); return c.create_archive('City Archive',CHARTER_URL,digest(CHARTER),1950)
def record(c,vm,aid,title,url,body,year=1910): web(vm,url,body); return c.register_record(aid,1,title,body.decode(),url,digest(body),json.dumps([title]),json.dumps([str(year)]),json.dumps(['Market Street']),json.dumps(['Clerk']),year)
def relation(vm,value,anchors): vm.mock_llm(r'ArchiveFuse, a conservative historical entity-resolution adjudicator',json.dumps({'relation':value,'anchor_codes':anchors,'rationale':'Public evidence supports the result.','evidence_summary':'Sources independently compared.'}))
def test_archive_record_and_cutoff(direct_vm,direct_deploy):
 c=deploy(direct_deploy); aid=archive(c,direct_vm); body=b'Ada Cole, Market Street, clerk, 1910.'; rid=record(c,direct_vm,aid,'Ada Cole','https://archive.example/a.txt',body); assert c.get_record(rid)['cluster_id']==0 and c.get_archive(aid)['record_count']==1
 with direct_vm.expect_revert('historical cutoff'): record(c,direct_vm,aid,'Later Person','https://archive.example/l.txt',b'Later record',1980)
def test_vecdb_retrieval_cannot_merge(direct_vm,direct_deploy):
 c=deploy(direct_deploy); aid=archive(c,direct_vm); a=record(c,direct_vm,aid,'Ada Cole','https://archive.example/a.txt',b'Ada Cole clerk Market Street 1910'); b=record(c,direct_vm,aid,'Ada Cole Smith','https://archive.example/b.txt',b'Ada Cole Smith clerk Market Street 1911',1911); rows=c.preview_candidates(a,8); assert any(x['record_id']==b for x in rows); assert c.get_record(a)['cluster_id']==0 and c.get_record(b)['cluster_id']==0
def test_same_entity_requires_consensus_and_multiple_anchors(direct_vm,direct_deploy):
 c=deploy(direct_deploy); aid=archive(c,direct_vm); a=record(c,direct_vm,aid,'Ada Cole','https://archive.example/a.txt',b'Ada Cole clerk Market Street 1910'); b=record(c,direct_vm,aid,'Ada Cole Smith','https://archive.example/b.txt',b'Ada Cole Smith clerk Market Street 1911',1911); case=c.propose_resolution(aid,a,b,'',''); relation(direct_vm,'SAME_ENTITY',['PLACE','ROLE_OCCUPATION']); assert c.adjudicate_resolution(case)=='SAME_ENTITY'; cid=c.get_case(case)['resulting_cluster']; assert cid>0 and c.get_record(a)['cluster_id']==cid and c.get_record(b)['cluster_id']==cid
def test_one_anchor_fails_closed(direct_vm,direct_deploy):
 c=deploy(direct_deploy); aid=archive(c,direct_vm); a=record(c,direct_vm,aid,'Ada Cole','https://archive.example/a.txt',b'Ada Cole clerk Market Street 1910'); b=record(c,direct_vm,aid,'Ada Cole Smith','https://archive.example/b.txt',b'Ada Cole Smith clerk Market Street 1911',1911); case=c.propose_resolution(aid,a,b,'',''); relation(direct_vm,'SAME_ENTITY',['NAME_ALIAS']); assert c.adjudicate_resolution(case)=='INSUFFICIENT_EVIDENCE'; assert c.get_record(a)['cluster_id']==0

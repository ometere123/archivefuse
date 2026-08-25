from pathlib import Path
import ast,json,re
ROOT=Path(__file__).resolve().parents[2]; SOURCE=ROOT/'contracts'/'archivefuse.py'; TEXT=SOURCE.read_text(encoding='utf-8'); TREE=ast.parse(TEXT)
REQUIRED=set(json.loads((ROOT/'lib'/'genlayer'/'required-methods.json').read_text(encoding='utf-8')))
def methods():
    for node in TREE.body:
        if isinstance(node,ast.ClassDef) and node.name=='ArchiveFuse': return {n.name for n in node.body if isinstance(n,ast.FunctionDef)}
    raise AssertionError('ArchiveFuse class not found')
def method_source(name):
    for node in TREE.body:
        if isinstance(node,ast.ClassDef) and node.name=='ArchiveFuse':
            for item in node.body:
                if isinstance(item,ast.FunctionDef) and item.name==name:
                    return ast.get_source_segment(TEXT,item) or ''
    raise AssertionError(name)
def test_contract_parses_and_has_hardened_public_surface(): assert REQUIRED<=methods() and len(REQUIRED)==26
def test_no_backend_or_fixture_language_in_contract():
    low=TEXT.lower()
    for x in ('supabase','firebase','postgres','mock_data','fixture_data'): assert x not in low
def test_vecdb_is_present_and_bounded():
    for x in ('VecDB','MAX_CANDIDATES = 8','MAX_KNN_SCAN = 24','all-MiniLM-L6-v2','distance'): assert x in TEXT
def test_similarity_does_not_directly_merge():
    preview=method_source('preview_candidates'); assert '_merge_clusters' not in preview and '_create_cluster' not in preview and 'run_nondet_unsafe' in TEXT
def test_same_entity_requires_multiple_anchor_categories():
    assert 'REL_SAME' in method_source('_judge') and 'len(shared)>=2' in method_source('_judge').replace(' ','')
    assert 'SAME_ENTITY lacks independent anchors' in method_source('adjudicate_resolution')
def test_original_record_payload_has_no_mutation_method():
    assert not any(n.startswith('update_record') or n.startswith('delete_record') for n in methods())
    block=re.search(r'class Record:\n(?P<body>.*?)(?:\n\n@allow_storage|\n\nclass )',TEXT,re.S); assert block and 'cluster_id' not in block.group('body')
def test_optional_resolution_evidence_is_digest_paired():
    helper=method_source('_optional_evidence'); propose=method_source('propose_resolution')
    assert 'must be supplied together' in helper and '_optional_evidence' in propose
def test_duplicate_pending_pair_and_same_cluster_are_blocked():
    src=method_source('propose_resolution')
    assert 'pending resolution already exists' in src and 'already share an active cluster' in src
def test_stale_resolution_has_deterministic_terminal_path():
    src=method_source('invalidate_stale_resolution')
    assert 'CASE_STALE' in src and 'REL_STALE' in src and '_clear_pending_pair' in src
def test_public_sources_are_digest_bound_and_bounded():
    assert 'hashlib.sha256(body).hexdigest()' in TEXT and '[DIGEST_MISMATCH]' in TEXT and 'MAX_SOURCE_BYTES' in TEXT and 'SOURCE_TOO_LARGE' in TEXT
    assert '_evidence_excerpt(body)' in TEXT and 'bounded middle omitted' in TEXT
    assert 'must be a public https URL' in method_source('_public_url')
def test_versioned_correction_path_preserves_history():
    assert 'class CorrectionCase' in TEXT and 'DETACH_MEMBER' in TEXT and 'self.record_cluster[correction.record_id]=u256(0)' in TEXT.replace(' ','') and 'CorrectionAdjudicated' in TEXT
def test_correction_context_is_frozen_at_proposal():
    judge=method_source('_judge_correction'); frozen=method_source('_frozen_correction_context')
    assert '_frozen_correction_context' in judge and 'context_record_ids_json' in frozen and '_correction_context(correction.cluster_id' not in judge
def test_duplicate_pending_correction_and_stale_terminal_path():
    assert 'pending correction already exists' in method_source('propose_correction')
    stale=method_source('invalidate_stale_correction'); assert 'CORRECTION_STALE' in stale and '_clear_pending_correction' in stale
def test_detach_requires_multiple_contradiction_categories():
    assert 'len(shared)>=2' in method_source('_judge_correction').replace(' ','') and 'detach lacks independent contradiction anchors' in method_source('adjudicate_correction')
def test_views_do_not_insert_storage_defaults():
    for name in ('list_record_ids','list_case_ids','list_cluster_members','list_cluster_case_ids','list_correction_ids','list_cluster_correction_ids'):
        assert 'get_or_insert_default' not in method_source(name), name
def test_cluster_merge_zeroes_superseded_membership_and_tracks_active_count():
    merge=method_source('_merge_clusters')
    assert 'source.member_count=u16(0)' in merge.replace(' ','') and 'active_cluster_count' in merge and 'archive.cluster_count-=ONE' in merge.replace(' ','')
    append=method_source('_append_cluster')
    assert '_active_member_ids' in append and 'historical' in append and 'ClusterExpanded' in append
    assert '_active_member_ids' in method_source('list_cluster_members')
def test_no_money_movement_surface(): assert '.payable' not in TEXT and 'emit_transfer' not in TEXT and 'gl.message.value' not in TEXT

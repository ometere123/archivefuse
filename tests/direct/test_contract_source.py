from pathlib import Path
import ast, re
ROOT=Path(__file__).resolve().parents[2]; SOURCE=ROOT/'contracts'/'archivefuse.py'; TEXT=SOURCE.read_text(encoding='utf-8'); TREE=ast.parse(TEXT)
REQUIRED={'create_archive','set_curator','register_record','preview_candidates','propose_resolution','adjudicate_resolution','get_archive','get_record','get_case','get_cluster','get_record_cluster','list_archive_ids','list_record_ids','list_case_ids','list_cluster_members','list_cluster_case_ids','stats','is_curator','preview_correction_context','propose_correction','adjudicate_correction','get_correction','list_correction_ids','list_cluster_correction_ids'}
def methods():
    for node in TREE.body:
        if isinstance(node,ast.ClassDef) and node.name=='ArchiveFuse': return {n.name for n in node.body if isinstance(n,ast.FunctionDef)}
    raise AssertionError('ArchiveFuse class not found')
def test_contract_parses_and_has_public_surface(): assert REQUIRED<=methods()
def test_no_backend_or_fixture_language_in_contract():
    low=TEXT.lower()
    for x in ('supabase','firebase','postgres','mock_data','fixture_data'): assert x not in low
def test_vecdb_is_present_and_bounded():
    for x in ('VecDB','MAX_CANDIDATES = 8','MAX_KNN_SCAN = 24','all-MiniLM-L6-v2','distance'): assert x in TEXT
def test_similarity_does_not_directly_merge():
    preview=TEXT[TEXT.index('def preview_candidates'):TEXT.index('def propose_resolution')]
    assert '_merge_clusters' not in preview and '_create_cluster' not in preview and 'run_nondet_unsafe' in TEXT
def test_same_entity_requires_multiple_anchor_categories():
    assert 'relation == REL_SAME and len(anchors) < 2' in TEXT and 'len(left_codes) >= 2' in TEXT and 'len(shared) >= 2' in TEXT
def test_original_record_payload_has_no_mutation_method():
    assert not any(n.startswith('update_record') or n.startswith('delete_record') for n in methods())
    block=re.search(r'class Record:\n(?P<body>.*?)(?:\n\n@allow_storage|\n\nclass )',TEXT,re.S); assert block and 'cluster_id' not in block.group('body')
def test_stale_cluster_guard_exists(): assert 'stale case; cluster membership changed' in TEXT and 'stale case; cluster version changed' in TEXT
def test_no_money_movement_surface(): assert '.payable' not in TEXT and 'emit_transfer' not in TEXT and 'gl.message.value' not in TEXT
def test_public_sources_are_digest_bound():
    assert 'def _digest' in TEXT and 'sha256:' in TEXT and 'hashlib.sha256(body).hexdigest()' in TEXT and '[DIGEST_MISMATCH]' in TEXT
def test_versioned_correction_path_preserves_history():
    assert 'class CorrectionCase' in TEXT and 'DETACH_MEMBER' in TEXT and 'self.record_cluster[correction.record_id] = u256(0)' in TEXT and 'CorrectionAdjudicated' in TEXT
def test_detach_requires_multiple_contradiction_categories(): assert 'decision == CORR_DETACH and len(codes) < 2' in TEXT and 'len(shared) >= 2' in TEXT

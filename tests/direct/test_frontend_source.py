from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def read(p): return (ROOT/p).read_text(encoding='utf-8')
def test_live_loaders_fail_closed_and_paginate():
    t=read('lib/live-loaders.ts')
    assert 'requireValue' in t and 'throw new Error(result.message)' in t and '?? []' not in t
    assert 'loadAllIds' in t and 'PAGE_SIZE = 50' in t and 'offset += batch.length' in t and 'batch.length < PAGE_SIZE' in t
def test_wallet_never_auto_requests_accounts():
    t=read('components/wallet-provider.tsx'); first=t.split('useEffect',1)[1].split('useEffect',1)[0]
    assert 'eth_requestAccounts' not in first; assert 'eth_requestAccounts' in t and 'accountsChanged' in t and 'chainChanged' in t and 'disconnect' in t
def test_write_waits_for_finalized_and_checks_genvm():
    c=read('lib/genlayer/contract.ts'); w=read('lib/use-write.ts')
    assert 'TransactionStatus.FINALIZED' in c and 'client.getTransaction' in c and 'inspectGenVMExecution' in c and 'assertSuccess' in w and 'setStage("SUCCESS")' in w
def test_no_backend_or_mock_branch():
    runtime='\n'.join(p.read_text(encoding='utf-8',errors='ignore') for base in ('app','components','lib') for p in (ROOT/base).rglob('*') if p.is_file() and p.suffix in {'.ts','.tsx','.js','.mjs'}).lower()
    for x in ('supabase','firebase','postgres','mongodb','redis://','mock-data','mock_data','fixture_data','"/api/'): assert x not in runtime
    assert not (ROOT/'app'/'api').exists()
def test_archive_specific_design():
    css=read('app/globals.css').lower(); ux=read('ui/ux.md').lower()
    assert '#ede2d0' in css and '#6c2e2e' in css and '#2e6766' in css and 'libre baskerville' in css and '#7c3aed' not in css and 'museum registrar' in ux
def test_resolution_uses_full_live_history_and_digest_pairing():
    t=read('app/resolve/[a]/[b]/page.tsx')
    assert 'loadArchiveCases' in t and 'listCaseIds' not in t
    assert 'Boolean(evidenceUrl)!==Boolean(digest)' in t.replace(' ','')
    assert 'invalidate_stale_resolution' in t and 'already share canonical membership' in t
def test_correction_uses_full_live_history_and_stale_closure():
    t=read('app/corrections/new/page.tsx')
    assert 'loadClusterCorrections' in t and 'listClusterCorrectionIds' not in t
    assert 'invalidate_stale_correction' in t and 'proposal-time peer' in t.lower()
def test_hardened_schema_is_required_by_frontend():
    t=read('lib/genlayer/config.ts')
    assert 'invalidate_stale_resolution' in t and 'invalidate_stale_correction' in t
def test_home_displays_active_not_historical_cluster_count():
    t=read('app/page.tsx')
    assert 'active_cluster_count' in t and '>active entities<' in t
def test_registrar_exposes_curator_grant_and_revoke():
    t=read('app/register/page.tsx')
    assert 'Curator access' in t and 'set_curator' in t and 'Grant curator access' in t and 'Revoke curator access' in t
def test_source_lightbox_treats_registered_page_as_untrusted():
    t=read('app/sources/[id]/page.tsx')
    assert 'sandbox=""' in t and 'referrerPolicy="no-referrer"' in t and 'allow-scripts' not in t and 'noopener noreferrer' in t

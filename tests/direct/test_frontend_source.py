from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
def read(p): return (ROOT/p).read_text(encoding='utf-8')
def test_live_loaders_fail_closed():
    t=read('lib/live-loaders.ts'); assert 'requireValue' in t and 'throw new Error(result.message)' in t and '?? []' not in t
def test_wallet_never_auto_requests_accounts():
    t=read('components/wallet-provider.tsx'); first=t.split('useEffect',1)[1].split('useEffect',1)[0]; assert 'eth_requestAccounts' not in first; assert 'eth_requestAccounts' in t and 'accountsChanged' in t and 'chainChanged' in t and 'disconnect' in t
def test_write_waits_for_finalized_and_checks_genvm():
    c=read('lib/genlayer/contract.ts'); w=read('lib/use-write.ts'); assert 'TransactionStatus.FINALIZED' in c and 'client.getTransaction' in c and 'inspectGenVMExecution' in c and 'assertSuccess' in w and 'setStage("SUCCESS")' in w
def test_no_backend_or_mock_branch():
    runtime='\n'.join(p.read_text(encoding='utf-8',errors='ignore') for base in ('app','components','lib') for p in (ROOT/base).rglob('*') if p.is_file() and p.suffix in {'.ts','.tsx','.js','.mjs'}).lower()
    for x in ('supabase','firebase','postgres','mongodb','redis://','mock-data','mock_data','fixture_data','"/api/'): assert x not in runtime
    assert not (ROOT/'app'/'api').exists()
def test_archive_specific_design():
    css=read('app/globals.css').lower(); ux=read('ui/ux.md').lower(); assert '#ede2d0' in css and '#6c2e2e' in css and '#2e6766' in css and 'libre baskerville' in css and '#7c3aed' not in css and 'museum registrar' in ux

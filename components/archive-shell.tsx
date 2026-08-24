"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "./wallet-provider";
import { CONTRACT_ADDRESS, explorerAddressUrl } from "@/lib/genlayer/config";

const nav = [["/", "Collections"],["/register", "Register"],["/timeline", "Timeline"]] as const;
function short(value?: string) { return value ? `${value.slice(0, 6)}…${value.slice(-4)}` : ""; }

export function ArchiveShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const wallet = useWallet();
  return (
    <div className="archive-shell">
      <header className="masthead">
        <div className="brand-block"><Link href="/" className="brand">ArchiveFuse</Link><span className="brand-sub">consensus entity resolution</span></div>
        <nav className="main-nav" aria-label="Primary">{nav.map(([href, label]) => <Link key={href} className={pathname === href ? "active" : ""} href={href}>{label}</Link>)}</nav>
        <div className="session-tools">
          <div className={`network-stamp network-${wallet.network}`}><span className="dot" />{wallet.networkName}</div>
          {wallet.address ? <button className="wallet-button" onClick={wallet.disconnect}>{short(wallet.address)}</button> : <button className="wallet-button" onClick={wallet.connect} disabled={!wallet.hasInjected || wallet.connecting}>{wallet.connecting ? "Connecting…" : wallet.hasInjected ? "Connect wallet" : "No wallet"}</button>}
        </div>
      </header>
      <div className="provenance-strip"><span>Live source</span>{CONTRACT_ADDRESS ? <a href={explorerAddressUrl(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer">StudioNet · {short(CONTRACT_ADDRESS)}</a> : <strong>Contract address not configured</strong>}{wallet.error ? <em>{wallet.error}</em> : null}</div>
      {children}
      <footer className="footer-note"><span>Original records remain immutable.</span><span>Vector similarity retrieves candidates; validators decide identity.</span></footer>
    </div>
  );
}

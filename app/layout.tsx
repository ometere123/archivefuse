import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/components/wallet-provider";
import { ArchiveShell } from "@/components/archive-shell";

export const metadata: Metadata = {
  title: "ArchiveFuse — Consensus Entity Resolution",
  description: "A provenance-preserving public historical archive built on GenLayer StudioNet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><WalletProvider><ArchiveShell>{children}</ArchiveShell></WalletProvider></body></html>;
}

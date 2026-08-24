# ArchiveFuse — UI/UX

## Design thesis
**Archetype: museum registrar's card catalogue and reading room.** Search/browse surfaces look like accession cards and archival boxes. Resolution is a two-card light table. Entity pages are provenance dossiers. Corrections and resolutions render as printable archival receipts.

## Visual system
Parchment `#EDE2D0`, oxblood `#6C2E2E`, teal `#2E6766`, brown `#2A211B`, faded archival metadata `#A9957D`. Libre Baskerville for titles/evidence, Work Sans for controls, IBM Plex Mono for accession IDs/digests. Hairline rules, index-card proportions, 3px-or-less geometry, restrained paper texture. Borders do more work than shadows.

## Do not use
Purple/blue gradient heroes, glowing AI orbs, glassmorphism, bento filler, generic SaaS KPI cards, meaningless charts, robot/sparkle motifs, 3D tokens, giant rounded rectangles, or wallet-connect as the visual identity.

## Required routes
`/` collection shelves; `/register`; `/records/[id]`; `/resolve/[a]/[b]`; `/cases/[id]`; `/entities/[clusterId]`; `/clusters/[id]/lineage`; `/corrections/new`; `/corrections/[id]`; `/sources/[id]`; `/timeline`.

## State language
Reads remain usable without a wallet. Live provenance is always visible. A missing contract or failed read is unavailable—not fabricated empty data. Empty live state is a real empty shelf. Writes show awaiting signature -> submitted hash -> consensus/finality -> GenVM success + authoritative reread, with rollback/error distinct. Semantic candidates display raw vector distance as related context, never confidence.

## Mobile
Preserve the archival artifact and primary action. Stack evidence and comparison panes into readable full-width folios rather than shrinking desktop columns.

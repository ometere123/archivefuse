#!/usr/bin/env bash
set -euo pipefail
command -v genlayer >/dev/null || { echo "genlayer CLI is not installed" >&2; exit 1; }
genlayer network studionet
# The CLI uses its active account. Prefer an already-unlocked local development account.
# If none exists, create one through the CLI's supported account workflow and unlock it
# through the supported mechanism. Never put a password, private key or mnemonic here.
genlayer account show --rpc https://studio.genlayer.com/api
genlayer deploy --contract contracts/archivefuse.py --rpc https://studio.genlayer.com/api

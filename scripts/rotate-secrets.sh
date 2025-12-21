#!/usr/bin/env bash
# Rotate a secret in GitHub Actions (via `gh`) or HashiCorp Vault (via `vault`).
# Usage examples:
#  ./scripts/rotate-secrets.sh --name PROXY_JWT_SECRET --generate --repo owner/repo
#  ./scripts/rotate-secrets.sh --name ANTHROPIC_API_KEY --value "sk-..." --vault-path secret/data/ai

set -euo pipefail

print_usage() {
  cat <<EOF
Usage: $0 --name NAME [--value VAL | --generate] [--repo owner/repo] [--vault-path PATH]

Options:
  --name NAME        Secret name to rotate (required)
  --value VAL        Secret value to set (mutually exclusive with --generate)
  --generate         Generate a secure random 32-byte hex value and use it as the secret
  --repo owner/repo  GitHub repository to update (defaults to GITHUB_REPOSITORY env)
  --vault-path PATH  If provided, writes the secret into Vault at this path instead of GitHub
  --help             Show this message
EOF
}

NAME=""
VALUE=""
GENERATE=0
REPO="${GITHUB_REPOSITORY-}"
VAULT_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) NAME="$2"; shift 2 ;;
    --value) VALUE="$2"; shift 2 ;;
    --generate) GENERATE=1; shift 1 ;;
    --repo) REPO="$2"; shift 2 ;;
    --vault-path) VAULT_PATH="$2"; shift 2 ;;
    --help) print_usage; exit 0 ;;
    *) echo "Unknown arg: $1"; print_usage; exit 2 ;;
  esac
done

if [[ -z "$NAME" ]]; then
  echo "Error: --name is required" >&2
  print_usage
  exit 2
fi

if [[ $GENERATE -eq 1 && -n "$VALUE" ]]; then
  echo "Error: --value and --generate are mutually exclusive" >&2
  exit 2
fi

if [[ $GENERATE -eq 1 ]]; then
  VALUE=$(openssl rand -hex 32)
fi

if [[ -z "$VALUE" && -z "$VAULT_PATH" ]]; then
  echo "Error: must provide --value or --generate, or use --vault-path with Vault data format" >&2
  print_usage
  exit 2
fi

if [[ "${DEBUG-0}" == "1" ]]; then
  set -x
fi

if [[ -n "$VAULT_PATH" ]]; then
  if ! command -v vault >/dev/null 2>&1; then
    echo "vault CLI not found; install and authenticate first" >&2
    exit 2
  fi
  # Write to Vault - this assumes KV v2; adjust as needed.
  # We write under data/ path if provided as such, and place the secret under the key equal to NAME.
  echo "Writing secret to Vault path: $VAULT_PATH"
  vault kv put "$VAULT_PATH" "$NAME"="$VALUE"
  echo "Vault rotation complete for $NAME"
  exit 0
fi

# Otherwise, prefer GitHub (gh) if available
if command -v gh >/dev/null 2>&1; then
  if [[ -z "$REPO" ]]; then
    echo "GITHUB repository not provided via --repo; attempting to use GITHUB_REPOSITORY env" >&2
    if [[ -z "$GITHUB_REPOSITORY" ]]; then
      echo "Error: set GITHUB_REPOSITORY env or pass --repo" >&2
      exit 2
    fi
    REPO="$GITHUB_REPOSITORY"
  fi

  echo "Rotating secret $NAME in GitHub repo $REPO"
  # gh secret set will prompt or accept from stdin; use --body to supply value
  echo -n "$VALUE" | gh secret set "$NAME" --repo "$REPO" --body -
  echo "GitHub secret $NAME updated in $REPO"
  exit 0
fi

echo "No supported secret backend found (gh or vault). Install and authenticate first." >&2
exit 2

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js 20.x before running this script." >&2
  exit 1
fi

if [ ! -f package.json ]; then
  echo "package.json not found. Run this script from the repository root." >&2
  exit 1
fi

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run build

echo "Deployment build complete. Serve the dist/ directory with your web server."

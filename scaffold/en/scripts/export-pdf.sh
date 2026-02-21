#!/usr/bin/env bash
# export-pdf.sh — Convert Markdown to PDF (md-to-pdf / npx)
#
# Prerequisites: Node.js (npx)
# On first run, Chromium is downloaded automatically (~100MB, once only).
#
# Usage:
#   ./scripts/export-pdf.sh <document-name> [status]
#   ./scripts/export-pdf.sh --all
#
# Examples:
#   ./scripts/export-pdf.sh requirements review
#   ./scripts/export-pdf.sh requirements approved
#   ./scripts/export-pdf.sh --all

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REFERENCES_DIR="$REPO_ROOT/references"
SNAPSHOTS_DIR="$REPO_ROOT/snapshots"
TODAY=$(date +%Y-%m-%d)

mkdir -p "$SNAPSHOTS_DIR"

if ! command -v npx &>/dev/null; then
  echo "Error: Node.js (npx) is not installed."
  echo "Install: https://nodejs.org/"
  exit 1
fi

convert_doc() {
  local doc_name="$1"
  local status="${2:-}"
  local md_file="$REFERENCES_DIR/${doc_name}.md"
  local suffix="${status:+.${status}}"
  local pdf_file="$SNAPSHOTS_DIR/${doc_name}_${TODAY}${suffix}.pdf"

  if [ ! -f "$md_file" ]; then
    echo "Error: ${md_file} not found."
    return 1
  fi

  echo "Converting: ${doc_name}.md → snapshots/$(basename "$pdf_file")"

  cat "$md_file" | npx --yes md-to-pdf \
    --pdf-options '{"format":"A4","margin":{"top":"2cm","right":"2.5cm","bottom":"2cm","left":"2.5cm"}}' \
    --basedir "$REFERENCES_DIR" \
    > "$pdf_file"

  echo "✅ Saved: $pdf_file"
}

if [ "${1:-}" = "--all" ]; then
  for md_file in "$REFERENCES_DIR"/*.md; do
    [ -f "$md_file" ] || continue
    doc_name="$(basename "$md_file" .md)"
    convert_doc "$doc_name"
  done
else
  [ -z "${1:-}" ] && { echo "Usage: $0 <document-name> [status] or $0 --all"; exit 1; }
  convert_doc "$1" "${2:-}"
fi

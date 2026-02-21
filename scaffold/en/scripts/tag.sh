#!/usr/bin/env bash
# tag.sh — Document version tag management
#
# Usage:
#   ./scripts/tag.sh review <document-name>    Request review tag + generate PDF
#   ./scripts/tag.sh approved <document-name>  Mark as approved tag + generate PDF
#   ./scripts/tag.sh list                       List all tags
#
# Examples:
#   ./scripts/tag.sh review requirements
#   ./scripts/tag.sh approved requirements

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACTION="${1:-}"
DOC_NAME="${2:-}"
TODAY=$(date +%Y-%m-%d)

usage() {
  echo "Usage: $0 <review|approved|rejected|list> [document-name]"
  exit 1
}

if [ "$ACTION" = "list" ]; then
  echo "=== spec-repo tags ==="
  git tag --sort=-creatordate | grep -E '^\d{4}-\d{2}-\d{2}\.' | head -30 || echo "(no tags)"
  exit 0
fi

[ -z "$ACTION" ] && usage
[ -z "$DOC_NAME" ] && usage

case "$ACTION" in
  review|approved|rejected)
    ;;
  *)
    echo "Error: action must be one of: review, approved, rejected"
    usage
    ;;
esac

TAG="${TODAY}.${ACTION}.${DOC_NAME}"

# Avoid duplicate tags on the same day
if git tag | grep -q "^${TAG}$" 2>/dev/null; then
  COUNT=2
  while git tag | grep -q "^${TAG}-v${COUNT}$" 2>/dev/null; do
    COUNT=$((COUNT + 1))
  done
  TAG="${TAG}-v${COUNT}"
fi

# Commit staged changes if any
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  git add references/ 2>/dev/null || true
  git commit -m "docs(${DOC_NAME}): ${ACTION}" 2>/dev/null || true
fi

git tag -a "$TAG" -m "${DOC_NAME} — ${ACTION} (${TODAY})"

echo "✅ Tag created: ${TAG}"

# Auto-generate PDF snapshot on review / approved
if [ "$ACTION" = "review" ] || [ "$ACTION" = "approved" ]; then
  echo ""
  echo "📄 Generating PDF snapshot..."
  set +e
  bash "$SCRIPT_DIR/export-pdf.sh" "$DOC_NAME" "$ACTION"
  EXPORT_STATUS=$?
  set -e
  if [ $EXPORT_STATUS -ne 0 ]; then
    echo "⚠️  PDF generation failed. Run manually:"
    echo "   ./scripts/export-pdf.sh ${DOC_NAME} ${ACTION}"
  fi
fi

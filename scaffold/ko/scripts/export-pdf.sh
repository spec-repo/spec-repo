#!/usr/bin/env bash
# export-pdf.sh — 마크다운 → PDF 변환 (md-to-pdf / npx)
#
# 사전 요건: Node.js (npx)
# 첫 실행 시 Chromium을 자동 다운로드합니다 (약 100MB, 한 번만).
#
# 사용법:
#   ./scripts/export-pdf.sh <문서명> [상태]
#   ./scripts/export-pdf.sh --all
#
# 예시:
#   ./scripts/export-pdf.sh 요구사항정의서 review
#   ./scripts/export-pdf.sh 요구사항정의서 approved
#   ./scripts/export-pdf.sh --all

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REFERENCES_DIR="$REPO_ROOT/references"
SNAPSHOTS_DIR="$REPO_ROOT/snapshots"
TODAY=$(date +%Y-%m-%d)

mkdir -p "$SNAPSHOTS_DIR"

if ! command -v npx &>/dev/null; then
  echo "오류: Node.js(npx)가 설치되어 있지 않습니다."
  echo "설치: https://nodejs.org/"
  exit 1
fi

convert_doc() {
  local doc_name="$1"
  local status="${2:-}"
  local md_file="$REFERENCES_DIR/${doc_name}.md"
  local suffix="${status:+.${status}}"
  local pdf_file="$SNAPSHOTS_DIR/${doc_name}_${TODAY}${suffix}.pdf"

  if [ ! -f "$md_file" ]; then
    echo "오류: ${md_file} 파일을 찾을 수 없습니다."
    return 1
  fi

  echo "변환 중: ${doc_name}.md → snapshots/$(basename "$pdf_file")"

  cat "$md_file" | npx --yes md-to-pdf \
    --pdf-options '{"format":"A4","margin":{"top":"2cm","right":"2.5cm","bottom":"2cm","left":"2.5cm"}}' \
    --stylesheet "$SCRIPT_DIR/pdf-style.css" \
    --launch-options '{"args":["--no-sandbox","--disable-setuid-sandbox"]}' \
    --basedir "$REFERENCES_DIR" \
    > "$pdf_file"

  echo "✅ 저장됨: $pdf_file"
}

if [ "${1:-}" = "--all" ]; then
  for md_file in "$REFERENCES_DIR"/*.md; do
    [ -f "$md_file" ] || continue
    doc_name="$(basename "$md_file" .md)"
    convert_doc "$doc_name"
  done
else
  [ -z "${1:-}" ] && { echo "사용법: $0 <문서명> [상태] 또는 $0 --all"; exit 1; }
  convert_doc "$1" "${2:-}"
fi

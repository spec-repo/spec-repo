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
#   ./scripts/export-pdf.sh 아키텍처설계서 review
#   ./scripts/export-pdf.sh 테스트시나리오 approved
#   ./scripts/export-pdf.sh --all

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SNAPSHOTS_DIR="$REPO_ROOT/snapshots"
TODAY=$(date +%Y-%m-%d)

# 스테이지 폴더 목록 (문서 탐색 순서)
STAGE_DIRS=(
  "references/01-requirements"
  "references/02-design"
  "references/03-test"
  "references/04-ops"
  "references/05-mgmt"
)

mkdir -p "$SNAPSHOTS_DIR"

if ! command -v npx &>/dev/null; then
  echo "오류: Node.js(npx)가 설치되어 있지 않습니다."
  echo "설치: https://nodejs.org/"
  exit 1
fi

# 문서명으로 md 파일 경로 탐색
find_doc() {
  local doc_name="$1"
  for stage_dir in "${STAGE_DIRS[@]}"; do
    local candidate="$REPO_ROOT/$stage_dir/${doc_name}.md"
    if [ -f "$candidate" ]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

convert_doc() {
  local doc_name="$1"
  local status="${2:-}"
  local md_file
  md_file="$(find_doc "$doc_name")" || {
    echo "오류: ${doc_name}.md 파일을 찾을 수 없습니다. (탐색 범위: ${STAGE_DIRS[*]})"
    return 1
  }
  local doc_dir
  doc_dir="$(dirname "$md_file")"
  local suffix="${status:+.${status}}"
  local pdf_file="$SNAPSHOTS_DIR/${doc_name}_${TODAY}${suffix}.pdf"

  echo "변환 중: ${doc_name}.md → snapshots/$(basename "$pdf_file")"

  # Mermaid 코드블록 → PNG 전처리
  local src_md="$md_file"
  if command -v python3 &>/dev/null && [ -f "$SCRIPT_DIR/preprocess-mermaid.py" ]; then
    local preprocessed
    preprocessed=$(python3 "$SCRIPT_DIR/preprocess-mermaid.py" --input "$md_file" 2>/dev/null)
    if [ -n "$preprocessed" ] && [ -f "$preprocessed" ]; then
      src_md="$preprocessed"
    fi
  fi

  cat "$src_md" | npx --yes md-to-pdf \
    --pdf-options '{"format":"A4","margin":{"top":"2cm","right":"2.5cm","bottom":"2cm","left":"2.5cm"}}' \
    --stylesheet "$SCRIPT_DIR/pdf-style.css" \
    --launch-options '{"args":["--no-sandbox","--disable-setuid-sandbox"]}' \
    --basedir "$doc_dir" \
    > "$pdf_file"

  echo "✅ 저장됨: $pdf_file"
}

if [ "${1:-}" = "--all" ]; then
  for stage_dir in "${STAGE_DIRS[@]}"; do
    stage_path="$REPO_ROOT/$stage_dir"
    [ -d "$stage_path" ] || continue
    for md_file in "$stage_path"/*.md; do
      [ -f "$md_file" ] || continue
      doc_name="$(basename "$md_file" .md)"
      convert_doc "$doc_name"
    done
  done
else
  [ -z "${1:-}" ] && { echo "사용법: $0 <문서명> [상태] 또는 $0 --all"; exit 1; }
  convert_doc "$1" "${2:-}"
fi

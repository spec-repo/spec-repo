#!/usr/bin/env bash
# export-hwpx.sh — 마크다운 → 아래아 한글(.hwpx) 변환
#
# 사전 요건:
#   - pypandoc-hwpx : pip install pypandoc-hwpx
#   - pandoc        : apt install pandoc
#   - Node.js       : Mermaid 전처리 시 자동 설치 (mmdc)
#
# 사용법:
#   ./scripts/export-hwpx.sh <문서명> [버전] [--template <template.hwpx>]
#
# 예시:
#   ./scripts/export-hwpx.sh 아키텍처설계서
#   ./scripts/export-hwpx.sh 아키텍처설계서 1.0.0
#   ./scripts/export-hwpx.sh 아키텍처설계서 1.0.0 --template references/02-design/_template.hwpx

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SNAPSHOTS_DIR="$REPO_ROOT/snapshots"
TODAY=$(date +%Y-%m-%d)

# 스테이지 폴더 목록
STAGE_DIRS=(
  "references/01-requirements"
  "references/02-design"
  "references/03-test"
  "references/04-ops"
  "references/05-mgmt"
)

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

if ! command -v pypandoc-hwpx &>/dev/null; then
  echo "오류: pypandoc-hwpx가 설치되어 있지 않습니다."
  echo "설치: pip install pypandoc-hwpx  (또는: uv pip install pypandoc-hwpx)"
  exit 1
fi

DOC_NAME="${1:-}"
VERSION="${2:-}"
TEMPLATE_ARG=""

# 인수 파싱
shift 2 2>/dev/null || shift $# 2>/dev/null || true
while [ "$#" -gt 0 ]; do
  case "$1" in
    --template)
      TEMPLATE_ARG="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

[ -z "$DOC_NAME" ] && { echo "사용법: $0 <문서명> [버전] [--template <template.hwpx>]"; exit 1; }

md_file=$(find_doc "$DOC_NAME") || {
  echo "오류: ${DOC_NAME}.md 파일을 찾을 수 없습니다."
  exit 1
}

# 스냅샷 디렉토리 결정 (단계별)
stage_sub=""
for stage_dir in "${STAGE_DIRS[@]}"; do
  if [[ "$md_file" == *"/$stage_dir/"* ]]; then
    stage_sub=$(basename "$stage_dir")
    break
  fi
done
mkdir -p "$SNAPSHOTS_DIR/${stage_sub:-misc}"

# 출력 파일명
ver_suffix="${VERSION:+_v${VERSION}}"
hwpx_file="$SNAPSHOTS_DIR/${stage_sub:-misc}/${DOC_NAME}${ver_suffix}_${TODAY}.hwpx"

echo "변환 중: ${DOC_NAME}.md → snapshots/$(basename "$hwpx_file")"

# Mermaid 코드블록 → PNG 전처리
src_md="$md_file"
if command -v python3 &>/dev/null && [ -f "$SCRIPT_DIR/preprocess-mermaid.py" ]; then
  preprocessed=$(python3 "$SCRIPT_DIR/preprocess-mermaid.py" --input "$md_file" 2>/dev/null)
  if [ -n "$preprocessed" ] && [ -f "$preprocessed" ]; then
    src_md="$preprocessed"
  fi
fi

# 커스텀 템플릿 자동 탐색 (명시하지 않은 경우)
if [ -z "$TEMPLATE_ARG" ]; then
  doc_dir="$(dirname "$md_file")"
  if [ -f "$doc_dir/_template.hwpx" ]; then
    TEMPLATE_ARG="$doc_dir/_template.hwpx"
    echo "  → 커스텀 템플릿 적용: $TEMPLATE_ARG"
  fi
fi

# pypandoc-hwpx 실행
if [ -n "$TEMPLATE_ARG" ]; then
  pypandoc-hwpx "$src_md" --reference-doc "$TEMPLATE_ARG" -o "$hwpx_file"
else
  pypandoc-hwpx "$src_md" -o "$hwpx_file"
fi

echo "✅ 저장됨: $hwpx_file"

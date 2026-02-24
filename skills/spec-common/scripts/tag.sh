#!/usr/bin/env bash
# tag.sh — 문서 버전 태그 관리
#
# 사용법:
#   ./scripts/tag.sh draft <문서명> [버전]     초안 생성 태그
#   ./scripts/tag.sh import <문서명> [버전]    외부 파일 임포트 태그
#   ./scripts/tag.sh review <문서명> [버전]    검토 요청 태그 + PDF 생성
#   ./scripts/tag.sh approved <문서명> [버전]  고객 승인 태그 + PDF 생성
#   ./scripts/tag.sh list                      태그 목록 조회
#
# 태그 형식: YYYY-MM-DD.{action}.{문서명}[.v{버전}]
#
# 예시:
#   ./scripts/tag.sh draft 요구사항정의서 0.1.0
#   ./scripts/tag.sh import 요구사항정의서 1.0.0
#   ./scripts/tag.sh review 아키텍처설계서 0.2.0
#   ./scripts/tag.sh approved 요구사항정의서 1.0.0

set -e

SCRIPT_DIR="$(CDPATH="" cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACTION="${1:-}"
DOC_NAME="${2:-}"
VERSION="${3:-}"
TODAY=$(date +%Y-%m-%d)

usage() {
  echo "사용법: $0 <draft|import|review|approved|list> [문서명] [버전]"
  echo "  버전 예시: $0 draft 요구사항정의서 1.0.0"
  exit 1
}

if [ "$ACTION" = "list" ]; then
  echo "=== spec-repo 태그 목록 ==="
  git tag --sort=-creatordate | grep -E '^\d{4}-\d{2}-\d{2}\.' | head -30 || echo "(태그 없음)"
  exit 0
fi

[ -z "$ACTION" ] && usage
[ -z "$DOC_NAME" ] && usage

case "$ACTION" in
  draft|import|review|approved|rejected)
    ;;
  *)
    echo "오류: action은 draft, import, review, approved, rejected 중 하나여야 합니다."
    usage
    ;;
esac

if [ -n "$VERSION" ]; then
  TAG="${TODAY}.${ACTION}.${DOC_NAME}.v${VERSION}"
else
  TAG="${TODAY}.${ACTION}.${DOC_NAME}"
fi

# 태그 중복 확인
if git tag | grep -q "^${TAG}$" 2>/dev/null; then
  COUNT=2
  while git tag | grep -q "^${TAG}-v${COUNT}$" 2>/dev/null; do
    COUNT=$((COUNT + 1))
  done
  TAG="${TAG}-v${COUNT}"
fi

# 변경사항이 있으면 커밋
if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
  git add references/ 2>/dev/null || true
  git commit -m "docs(${DOC_NAME}): ${ACTION}" 2>/dev/null || true
fi

git tag -a "$TAG" -m "${DOC_NAME} — ${ACTION} (${TODAY})"

echo "✅ 태그 생성: ${TAG}"

# review / approved 시 PDF 스냅샷 자동 생성
if [ "$ACTION" = "review" ] || [ "$ACTION" = "approved" ]; then
  echo ""
  echo "📄 PDF 스냅샷 생성 중..."
  set +e
  bash "$SCRIPT_DIR/export-pdf.sh" "$DOC_NAME" "$ACTION"
  EXPORT_STATUS=$?
  set -e
  if [ $EXPORT_STATUS -ne 0 ]; then
    echo "⚠️  PDF 생성 실패. 수동으로 실행하세요:"
    echo "   ./scripts/export-pdf.sh ${DOC_NAME} ${ACTION}"
  fi
fi

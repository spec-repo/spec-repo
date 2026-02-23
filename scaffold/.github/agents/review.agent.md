---
description: 문서 검토 완료 또는 고객 승인 태그를 생성하고 PDF 스냅샷을 만듭니다
---

$ARGUMENTS 를 파싱하여 태그 상태와 문서명을 결정한다.

**사용법**:
- `/review <문서명>` → 검토 요청 태그 생성
- `/review approved <문서명>` → 고객 승인 완료 태그 생성

예) `/review 요구사항정의서`, `/review approved 요구사항정의서`

---

다음을 실행한다:

1. `$ARGUMENTS` 에서 상태와 문서명을 파악한다
   - 첫 단어가 `approved` 이면 상태 = `approved`, 나머지 = 문서명
   - 아니면 상태 = `review`, 전체 = 문서명

2. 아래 스크립트를 실행한다:
   ```bash
   ./scripts/tag.sh <상태> <문서명>
   ```

3. 실행 결과를 보여준다
   - 생성된 Git 태그명
   - 생성된 PDF 경로 (`snapshots/` 하위)
   - 다음 단계 안내 (`review` 완료 시 고객 검토 후 `/review approved <문서명>` 실행)

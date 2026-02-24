---
name: sp-common
description: "spec-repo 공통 유틸리티 스킬. tag.sh(문서 버전 태깅), export-pdf.sh(MD→PDF 변환), extract-pdf.sh(PDF 텍스트 추출) 스크립트를 제공하며, 다른 spec-* 스킬이 내부적으로 활용한다."
---

# spec-common — 공통 유틸리티

이 스킬은 직접 호출하지 않는다. `spec-req`, `spec-design-arch`, `spec-rfp` 등 다른 spec-* 스킬이 내부적으로 사용하는 공통 스크립트 모음이다.

## 제공 스크립트

### `./scripts/tag.sh` — 문서 버전 태깅

```bash
# 초안 생성
./scripts/tag.sh draft <문서명> [버전]

# 외부 파일 임포트
./scripts/tag.sh import <문서명> [버전]

# 검토 요청 (PDF 자동 생성)
./scripts/tag.sh review <문서명> [버전]

# 고객 승인 (PDF 자동 생성)
./scripts/tag.sh approved <문서명> [버전]

# 태그 목록 조회
./scripts/tag.sh list
```

태그 형식: `YYYY-MM-DD.{action}.{문서명}[.v{버전}]`
예: `2026-02-24.draft.요구사항정의서.v0.1.0`

### `./scripts/export-pdf.sh` — MD → PDF 변환

사전 요건: Node.js (npx). 첫 실행 시 Chromium 자동 다운로드(약 100MB, 한 번만).

```bash
# 단일 문서 변환
./scripts/export-pdf.sh <문서명> [상태]

# 전체 문서 변환
./scripts/export-pdf.sh --all
```

출력: `snapshots/{문서명}_{날짜}[.{상태}].pdf`

### `./scripts/extract-pdf.sh` — PDF 텍스트 추출

```bash
./scripts/extract-pdf.sh <PDF경로> [출력경로]
```

`pdftotext`(poppler) 또는 `pdf-parse`(Node.js fallback) 순으로 시도.

## 스킬 간 의존 관계

```
spec-rfp        → extract-pdf.sh (PDF 임포트 시)
spec-req        → tag.sh, export-pdf.sh
spec-design-arch → tag.sh, export-pdf.sh
spec-design-api  → tag.sh, export-pdf.sh
spec-design-db   → tag.sh, export-pdf.sh
```

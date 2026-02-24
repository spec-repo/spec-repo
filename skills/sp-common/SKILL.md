---
name: sp-common
description: "spec-repo 공통 유틸리티 스킬. tag.sh(문서 버전 태깅), export-pdf.sh(MD→PDF), export-docx.sh(MD→docx), export-hwpx.sh(MD→한글), preprocess-mermaid.py(Mermaid→PNG), extract-pdf.sh(PDF 텍스트 추출), extract-docx.py(docx→MD), extract-hwpx.py(hwpx→MD) 스크립트를 제공하며, spec-import/spec-export 스킬이 내부적으로 활용한다."
---

# sp-common — 공통 유틸리티

이 스킬은 직접 호출하지 않는다. `spec-import`, `spec-export` 스킬이 내부적으로 사용하는 공통 스크립트 모음이다.

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

### `./scripts/export-docx.sh` — MD → Word(.docx) 변환

Mermaid 전처리 포함. `_template.docx`가 있으면 자동 적용.

```bash
./scripts/export-docx.sh <문서명> [버전]
```

사전 요건: `sudo apt install pandoc`

### `./scripts/export-hwpx.sh` — MD → 아래아 한글(.hwpx) 변환

Mermaid 전처리 포함. `_template.hwpx`가 있으면 자동 적용.

```bash
./scripts/export-hwpx.sh <문서명> [버전]
```

사전 요건: `pip install pypandoc-hwpx` + `sudo apt install pandoc`

### `./scripts/preprocess-mermaid.py` — Mermaid 코드블록 → PNG 전처리

` ```mermaid ``` ` 블록을 `mmdc`로 PNG 변환 후 `![](path.png)`으로 교체한 임시 MD 파일 경로를 stdout 출력. export-pdf/docx/hwpx.sh가 내부적으로 호출한다.

### `./scripts/extract-pdf.sh` — PDF 텍스트 추출

```bash
./scripts/extract-pdf.sh <PDF경로> [출력경로]
```

`pdftotext`(poppler) 또는 `pdf-parse`(Node.js fallback) 순으로 시도.

### `./scripts/extract-docx.py` — Word(.docx) → MD 변환

```bash
python3 scripts/extract-docx.py <docx-file> [output.md]
```

`python-docx` 1차 시도, 실패 시 `mammoth` fallback. 출력 경로 생략 시 stdout.

사전 요건: `uv run --with python-docx ...` 또는 `uv run --with mammoth ...`

### `./scripts/extract-hwpx.py` — 한글(.hwpx/.hwp) → MD 변환

```bash
python3 scripts/extract-hwpx.py <hwpx-file> [output.md]
```

`pyhwp2md` CLI 사용. 이미지 미지원 (텍스트만 추출).

사전 요건: `pip install pyhwp2md`

## 스킬 간 의존 관계

```
spec-import → extract-pdf.sh, extract-docx.py, extract-hwpx.py
spec-export → tag.sh, export-pdf.sh, export-docx.sh, export-hwpx.sh
```

---
name: spec-export
description: "마스터 문서를 납품용 포맷으로 내보낸다. Excel형 마스터는 xlsx로, 서술형 마스터는 pdf/docx/hwpx로 변환한다. 사용법: /spec-export <문서명> [--format pdf|docx|hwpx|xlsx]"
metadata:
  author: spec-repo
  version: "1.0"
---

$ARGUMENTS 에 지정된 문서명을 처리한다. 인자가 없으면 사용법을 안내한다.

**사용법**:
- `/spec-export <문서명> [--format pdf|docx|hwpx|xlsx] [--version X.Y.Z]`
- `/spec-export --all [--format pdf]`

---

## 마스터 타입별 내보내기 규칙

| 마스터 타입 | 판단 기준 | 지원 포맷 |
|-----------|---------|---------|
| Excel형 | index.md의 `doc_type: requirements` 또는 JSON 마스터 존재 | xlsx만 |
| 서술형 | index.md + section-XX.md 구조 | pdf, docx, hwpx |

**포맷 미지정 시 기본값**:
- Excel형 → xlsx
- 서술형 → pdf

---

## 1단계: 마스터 위치 탐색

`references/` 하위를 탐색해 `{문서명}/index.md` 를 찾는다.

```
references/
├── 01-requirements/{문서명}/index.md
├── 02-design/{문서명}/index.md
└── ...
```

찾지 못하면 사용자에게 알리고 `/spec-import`로 먼저 등록하도록 안내.

---

## 2단계: 마스터 타입 확인

`index.md` front matter를 Read해 `doc_type`을 확인한다.

---

## 3단계: 포맷별 변환

### xlsx 내보내기 (Excel형 마스터)

```bash
uv run --with openpyxl python3 skills/spec-import/scripts/json-to-excel.py \
  --input references/{폴더}/{문서명}/{문서명}.json \
  --out snapshots/{폴더}/{문서명}_v{version}_{YYYYMMDD}.xlsx
```

`--version` 인자가 있으면 명시한 버전으로 파일명 결정.

### PDF 내보내기 (서술형 마스터)

Mermaid 다이어그램 자동 변환 포함.

```bash
./scripts/export-pdf.sh {문서명}
./scripts/export-pdf.sh {문서명} review     # 태그 연동
./scripts/export-pdf.sh {문서명} approved   # 태그 연동
```

출력: `snapshots/{stage_sub}/{문서명}_{YYYYMMDD}[.{상태}].pdf`

### Word(.docx) 내보내기

Mermaid 다이어그램 자동 변환 포함. `_template.docx` 자동 적용.

```bash
./scripts/export-docx.sh {문서명}
./scripts/export-docx.sh {문서명} {version}
```

사전 요건: `sudo apt install pandoc`

출력: `snapshots/{stage_sub}/{문서명}[_v{version}]_{YYYYMMDD}.docx`

### 한글(.hwpx) 내보내기

Mermaid 다이어그램 자동 변환 포함. `_template.hwpx` 자동 적용.

```bash
./scripts/export-hwpx.sh {문서명}
./scripts/export-hwpx.sh {문서명} {version}
```

사전 요건: `pip install pypandoc-hwpx` + `sudo apt install pandoc`

출력: `snapshots/{stage_sub}/{문서명}[_v{version}]_{YYYYMMDD}.hwpx`

---

## 4단계: 태그 생성 (선택)

review 또는 approved 상태로 내보낼 때:

```bash
./scripts/tag.sh review {문서명} {version}
./scripts/tag.sh approved {문서명} {version}
```

version은 index.md front matter의 `version` 값을 사용.

---

## `/spec-export --all` — 전체 내보내기

`references/` 하위 모든 index.md를 탐색해 각 마스터를 기본 포맷으로 내보낸다.

```bash
./scripts/export-pdf.sh --all
```

Excel형 마스터도 포함하려면 각 JSON 파일별로 `json-to-excel.py`를 실행한다.

---

## 결과 보고

완료 후 다음을 출력한다:
- 생성된 파일 경로
- 파일 크기
- 다음 단계 안내 (태그 생성, 고객 전달 등)

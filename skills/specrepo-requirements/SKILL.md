---
name: specrepo-requirements
description: "요구사항정의서 Excel 분석·임포트·내보내기. xlsx → JSON(진실의 원천) 변환, JSON → xlsx 재생성, 현황 확인을 지원한다."
metadata:
  author: spec-repo
  version: "2.0"
---

$ARGUMENTS 에 지정된 서브커맨드와 파일을 처리한다. 인자가 없으면 사용법을 안내한다.

**사용법**:
- `/specrepo-requirements <excel-file>` — Excel 파일 분석 (read-only)
- `/specrepo-requirements import <excel-file>` — JSON으로 임포트 + git commit
- `/specrepo-requirements export [--version X.Y.Z]` — JSON → xlsx 재생성
- `/specrepo-requirements status` — 현황 확인

---

## 스킬 구성

```
skills/specrepo-requirements/
├── data/requirements-template.xlsx   # 표준 템플릿 (기능/비기능 시트)
└── scripts/
    ├── sheet_styles.py               # Excel 스타일 공통 모듈 (import용)
    ├── create-template.py            # 템플릿 xlsx 재생성
    ├── parse-excel.py                # xlsx 파싱 → JSON/요약 출력 (분석용)
    ├── excel-to-json.py              # xlsx → references/requirements.json
    └── json-to-excel.py              # references/requirements.json → xlsx
```

**프로젝트 내 파일 구조** (import 후):
```
references/
└── requirements.json        # 진실의 원천 (git 추적)
snapshots/requirements/
└── requirements_vX.Y.Z_YYYYMMDD.xlsx  # 내보내기 스냅샷 (.gitignore 권장)
```

**requirements.json 핵심 구조**:
```json
{
  "_meta": { "version": "0.7.8", "history": [...] },
  "_columns": { "functional": {...}, "nonfunctional": {...} },
  "functional": [
    { "id": "SFR-001", "rfp_name": "...", "rfp_desc": "...",
      "sub_requirements": [{ "sub_id": "SFR-001-01", ... }] }
  ],
  "nonfunctional": [...]
}
```

---

## 분석: Excel 파일 파악

**PDF가 아닌 xlsx 파일은 직접 Read() 하지 않는다.**

```bash
# 전체 요약 (에이전트용)
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/parse-excel.py <파일경로> --summary

# 특정 시트만
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/parse-excel.py <파일경로> --sheet 기능_요구사항

# 전체 JSON (정밀 분석 시)
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/parse-excel.py <파일경로>
```

파싱 결과에서 확인할 것:
- 시트 목록 및 컬럼 구조
- 요구사항 ID 패턴 (SFR-XXX, PER-XXX 등)
- 총 행 수 (요구사항 규모 파악)
- 빈 값이 많은 컬럼 (미작성 항목 파악)

고객 파일 vs 표준 템플릿 비교:
```bash
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/parse-excel.py \
  skills/specrepo-requirements/data/requirements-template.xlsx --summary
```

---

## import: Excel → JSON 임포트

xlsx를 파싱해 `references/requirements.json`(진실의 원천)을 갱신하고 git commit한다.

```bash
# 기본 (upsert: ID 기준 덮어쓰기, 기존에만 있는 ID 유지)
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/excel-to-json.py <excel-file>

# 전체 교체
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/excel-to-json.py <excel-file> --merge replace

# 신규 ID만 추가
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/excel-to-json.py <excel-file> --merge append

# 출력 경로 지정
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/excel-to-json.py <excel-file> --out references/requirements.json
```

**merge 전략**:
| 전략 | 동작 |
|------|------|
| `upsert` (기본) | 신규 ID는 추가, 기존 ID는 덮어씀, 기존에만 있는 ID는 유지 |
| `replace` | 시트 전체 교체 (기존 데이터 삭제) |
| `append` | 신규 ID만 추가, 기존 ID는 건드리지 않음 |

**버전 파싱**: 파일명에 `_0.7.8`, `_v0.7.8`, `_0.7.8v` 패턴이 있으면 자동 추출.

import 후 git commit:
```bash
git add references/requirements.json
git commit -m "feat: 요구사항 임포트 v{version} ({source})"
```

---

## export: JSON → Excel 내보내기

`references/requirements.json`으로 xlsx를 재생성한다.

```bash
# 기본 (JSON의 version + 오늘 날짜로 파일명 자동 결정)
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/json-to-excel.py

# 입력/출력 경로 지정
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/json-to-excel.py \
  --input references/requirements.json \
  --out snapshots/requirements/export.xlsx

# 버전 오버라이드
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/json-to-excel.py --version 1.0.0
```

출력 파일 기본 경로: `snapshots/requirements/requirements_v{version}_{YYYYMMDD}.xlsx`

> `snapshots/requirements/` 는 `.gitignore`에 추가 권장.

---

## status: 현황 확인

`references/requirements.json`을 읽어 현황을 보고한다.

```bash
# JSON 읽기
cat references/requirements.json | python3 -c "
import json, sys
d = json.load(sys.stdin)
m = d.get('_meta', {})
print(f'버전: {m.get(\"version\", \"미설정\")}')
print(f'기능 요구사항: {len(d.get(\"functional\", []))}개')
print(f'비기능 요구사항: {len(d.get(\"nonfunctional\", []))}개')
h = m.get('history', [])
if h: print(f'마지막 임포트: {h[-1][\"imported_at\"]} ({h[-1][\"source\"]})')
"
```

또는 에이전트가 직접 `references/requirements.json`을 Read해서 `_meta.history`와 요구사항 수를 보고한다.

---

## 요구사항 분석 및 구조화 (분석 모드)

import/export 없이 Excel 내용을 분석만 할 때:

### 요구사항 목록 정리
- 기능 요구사항: `references/requirements-functional.md` 생성
- 비기능 요구사항: `references/requirements-nonfunctional.md` 생성

```markdown
# 기능 요구사항 목록

| ID | 요구사항 명 | 대분류 | 중분류 | 우선순위 | 상태 |
|----|-----------|--------|--------|---------|------|
| SFR-001 | ... | ... | ... | 상 | 신규 |
```

### 미작성 항목 파악
- 상세요구사항이 비어있는 ID 목록
- 완료일이 없는 항목
- 담당자 미지정 항목

### 이슈 리포트
ID 중복, 형식 불일치, 필수값 누락 등을 리포트한다.

---

## 템플릿 재생성

표준 템플릿을 새로 만들거나 초기화할 때:
```bash
uv run --with openpyxl python3 skills/specrepo-requirements/scripts/create-template.py
```
→ `skills/specrepo-requirements/data/requirements-template.xlsx` 생성

---
name: sp-req
description: "요구사항정의서 관리. RFP에서 초안 도출(draft), Excel 임포트(import), xlsx 내보내기(export), MD 재생성(md), 현황 확인(status)을 지원한다."
metadata:
  author: spec-repo
  version: "3.0"
---

$ARGUMENTS 에 지정된 서브커맨드를 실행한다. 인자가 없으면 사용법을 안내한다.

**사용법**:
- `/sp-req draft` — RFP → requirements.json 초안 + requirements.md 생성
- `/sp-req import <excel-file>` — Excel → JSON 갱신 + MD 재생성
- `/sp-req export [--version X.Y.Z]` — JSON → xlsx 내보내기
- `/sp-req md` — requirements.md 재생성 (JSON은 변경 없음)
- `/sp-req status` — 현황 확인

---

## 파일 구조

```
skills/sp-req/
├── data/requirements-template.xlsx   # 표준 템플릿
└── scripts/
    ├── sheet_styles.py               # Excel 스타일 공통 모듈
    ├── create-template.py            # 템플릿 xlsx 재생성
    ├── parse-excel.py                # xlsx 파싱 → JSON/요약 (분석용)
    ├── excel-to-json.py              # xlsx → 01-requirements/requirements.json
    ├── json-to-excel.py              # requirements.json → xlsx
    └── json-to-md.py                 # requirements.json → 01-requirements/requirements.md
```

**프로젝트 내 파일 구조**:
```
references/01-requirements/
├── requirements.json    ← 진실의 원천 (git 추적, 직접 편집 금지)
└── requirements.md      ← JSON에서 자동 생성 (git 추적, 직접 편집 금지)
snapshots/requirements/  ← xlsx 스냅샷 (.gitignore 권장)
```

---

## draft: RFP → 요구사항 초안 생성

`00-rfp/` 의 분석 결과를 읽어 `requirements.json` 초안을 작성하고 `requirements.md`를 생성한다.

### 1단계: RFP 콘텐츠 파악

아래 순서로 읽을 파일을 탐색한다:
1. `00-rfp/*/index.md` — intake가 생성한 구조화 인덱스
2. `00-rfp/*/section-*.md` — 섹션별 원문
3. `00-rfp/*.txt` — PDF에서 직접 추출한 텍스트 (fallback)

### 2단계: 요구사항 도출

RFP 내용에서 기능/비기능 요구사항을 추출한다.

**ID 규칙**:
- 기존 `requirements.json`이 있으면 그 패턴을 따른다
- 없으면 기능: `SFR-001`, 비기능: 아래 카테고리 접두사 사용

| 접두사 | 구분 |
|--------|------|
| PER | 성능 (Performance) |
| SEC | 보안 (Security) |
| REL | 신뢰성 (Reliability) |
| INT | 인터페이스 (Interface) |
| CON | 제약사항 (Constraint) |
| QUA | 품질 (Quality) |

**초안 채워야 할 필드**:
- `id`, `rfp_name`, `rfp_desc` — RFP에서 파악 가능한 내용으로 채움
- `sub_requirements[].sub_id`, `customer_requirement` — RFP 원문에서 직접 추출
- `priority` — 긴급성·빈도·임팩트 기준으로 상/중/하 판단
- `status` → `"신규"`, `apply_type` → `"수용"` (기본값)
- `detail_requirement`, `implementation` 등 — 빈 문자열로 두고 나중에 채움

### 3단계: requirements.json 저장 + MD 생성

JSON을 작성한 후 반드시 MD도 생성한다:

```bash
python3 skills/sp-req/scripts/json-to-md.py
```

### 4단계: git commit + draft 태그

```bash
git add 01-requirements/requirements.json 01-requirements/requirements.md
git commit -m "feat: 요구사항 초안 도출 (기능 N개, 비기능 M개)"
./scripts/tag.sh draft 요구사항정의서 {_meta.version}   # requirements.json의 _meta.version 값
```

---

## import: Excel → JSON 갱신

xlsx 파일을 파싱해 `requirements.json`을 갱신하고 `requirements.md`를 재생성한다.

```bash
# 기본 (upsert)
uv run --with openpyxl python3 skills/sp-req/scripts/excel-to-json.py <excel-file>

# 전체 교체
uv run --with openpyxl python3 skills/sp-req/scripts/excel-to-json.py <excel-file> --merge replace

# 신규 ID만 추가
uv run --with openpyxl python3 skills/sp-req/scripts/excel-to-json.py <excel-file> --merge append
```

**import 후 반드시 MD 재생성**:
```bash
python3 skills/sp-req/scripts/json-to-md.py
```

**merge 전략**:
| 전략 | 동작 |
|------|------|
| `upsert` (기본) | ID 기준 덮어씀, 기존에만 있는 ID 유지 |
| `replace` | 시트 전체 교체 |
| `append` | 신규 ID만 추가 |

**버전 파싱**: 파일명에 `_0.7.8`, `_v0.7.8`, `_0.7.8v` 패턴이 있으면 자동 추출.

### git commit + import 태그

```bash
git add 01-requirements/requirements.json 01-requirements/requirements.md
git commit -m "feat: 요구사항 임포트 v{version} ({source})"
./scripts/tag.sh import 요구사항정의서 {version}
```

**지원 형식**:  만 지원.

**비지원 형식 수신 시**:
| 수신 형식 | 처리 |
|---------|------|
|  | "이 문서는 xlsx 형식으로 관리됩니다" 안내 + 템플릿 제공 |
|  | 직접 변환 불가, xlsx로 저장 후 재시도 안내 |
| ,  | 지원 불가 명시, 수동 복사 후 xlsx로 저장 안내 |

---

## export: JSON → Excel 내보내기

`requirements.json`으로 xlsx를 재생성한다.

```bash
# 기본 (JSON version + 오늘 날짜로 파일명 자동 결정)
uv run --with openpyxl python3 skills/sp-req/scripts/json-to-excel.py

# 버전 오버라이드
uv run --with openpyxl python3 skills/sp-req/scripts/json-to-excel.py --version 1.0.0

# 경로 직접 지정
uv run --with openpyxl python3 skills/sp-req/scripts/json-to-excel.py \
  --input 01-requirements/requirements.json \
  --out snapshots/requirements/export.xlsx
```

출력 파일 기본 경로: `snapshots/requirements/requirements_v{version}_{YYYYMMDD}.xlsx`

---

## md: requirements.md 재생성

JSON을 변경하지 않고 MD만 재생성할 때 사용한다.

```bash
python3 skills/sp-req/scripts/json-to-md.py
```

---

## status: 현황 확인

`01-requirements/requirements.json`을 Read해서 다음을 보고한다:

- 버전 (`_meta.version`)
- 기능/비기능 요구사항 수
- 마지막 임포트 일시 및 소스 (`_meta.history[-1]`)
- 미작성 필드가 많은 항목 (detail_requirement 빈 항목 등)
- 우선순위별 분포 (상/중/하 각 몇 개)

---

## 분석 전용: Excel 구조 파악

import 전에 Excel 구조를 먼저 파악할 때:

```bash
# 전체 요약
uv run --with openpyxl python3 skills/sp-req/scripts/parse-excel.py <파일경로> --summary

# 특정 시트만
uv run --with openpyxl python3 skills/sp-req/scripts/parse-excel.py <파일경로> --sheet 기능_요구사항
```

---

## 템플릿 재생성

표준 템플릿 초기화:
```bash
uv run --with openpyxl python3 skills/sp-req/scripts/create-template.py
```
→ `skills/sp-req/data/requirements-template.xlsx` 생성

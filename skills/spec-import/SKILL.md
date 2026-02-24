---
name: spec-import
description: "SI 프로젝트 문서를 spec-repo에 등록·관리한다. md/pdf/docx/hwpx/xlsx 파일을 마스터 형태(MD 또는 JSON)로 변환하고, 재수신 시 템플릿 비교로 업데이트/버전관리를 수행한다. 초안 AI 생성(draft), 현황 확인(status)도 지원한다."
metadata:
  author: spec-repo
  version: "1.0"
---

$ARGUMENTS 에 지정된 서브커맨드를 실행한다. 인자가 없으면 사용법을 안내한다.

**사용법**:
- `/spec-import <파일경로>` — 파일을 마스터로 변환·등록
- `/spec-import draft <문서유형>` — 기존 references에서 AI 초안 생성
- `/spec-import status` — 등록된 문서 전체 현황

---

## 지원 입력 포맷

| 포맷 | 변환 방법 |
|------|---------|
| `.md` | 직접 사용 |
| `.pdf` | `scripts/extract-pdf.sh` → txt → md |
| `.docx` | `scripts/extract-docx.py` (python-docx/mammoth) → md |
| `.hwpx`, `.hwp` | `scripts/extract-hwpx.py` (pyhwp2md) → md |
| `.xlsx` | `scripts/excel-to-json.py` → JSON + `scripts/json-to-md.py` → index.md |

---

## 파일 구조

```
skills/spec-import/
├── data/
│   ├── requirements-template.xlsx    # 요구사항정의서 표준 템플릿
│   ├── 아키텍처설계서-template.md
│   ├── API명세서-template.md
│   └── DB설계서-template.md
└── scripts/
    ├── sheet_styles.py               # Excel 스타일 공통 모듈
    ├── parse-excel.py                # xlsx 구조 분석용
    ├── excel-to-json.py              # xlsx → JSON 마스터
    ├── json-to-excel.py              # JSON → xlsx (spec-export에서 사용)
    ├── json-to-md.py                 # JSON → index.md + section 파일
    └── create-template.py            # 표준 템플릿 xlsx 재생성
```

**프로젝트 내 마스터 문서 위치**:
```
references/
├── 00-rfp/              ← 원본 참고 파일
├── 01-requirements/     ← 요구사항 관련 문서
│   └── {문서명}/
│       ├── {문서명}.json    ← Excel형 마스터 (JSON)
│       ├── index.md         ← 자동 생성 인덱스 + front matter
│       └── section-01.md ... ← 대용량 분리 (선택)
├── 02-design/           ← 설계 문서
│   └── {문서명}/
│       ├── index.md
│       └── section-01.md ...
├── 03-test/
├── 04-ops/
└── 05-mgmt/
```

---

## 마스터 문서 분류

| 타입 | 입력 포맷 | 마스터 형태 | 내보내기 |
|------|---------|-----------|--------|
| Excel형 | xlsx | JSON + index.md | xlsx만 |
| 서술형 | pdf/docx/hwpx/md | index.md + section-XX.md | pdf/docx/hwpx |

---

## 마스터 front matter (모든 index.md 상단)

```yaml
---
title: 문서명
doc_type: requirements|architecture|api|db|test|ops|mgmt|rfp|other
version: "0.1.0"
status: draft|review|approved
source_format: xlsx|pdf|docx|hwpx|md
updated: YYYY-MM-DD
---
```

---

## `/spec-import <파일경로>` — 파일 등록

### 1단계: 파일 형식 확인

지원 포맷(md/pdf/docx/hwpx/xlsx)이 아닌 경우 지원 불가 안내 후 종료.

### 2단계: 문서 유형 판별

1. 파일명에서 SI 문서 유형을 추론한다:

| 키워드 (대소문자 무시) | 추론 유형 | 폴더 |
|------|---------|------|
| 요구사항, requirements, req | requirements | 01-requirements |
| 아키텍처, architecture, arch, 시스템설계 | architecture | 02-design |
| API, api명세, swagger | api | 02-design |
| DB, 데이터베이스, database | db | 02-design |
| 테스트, test | test | 03-test |
| 운영, ops, operation | ops | 04-ops |
| 관리, 사업관리, mgmt | mgmt | 05-mgmt |
| RFP, 제안요청서, 견적 | rfp | 00-rfp |

2. 추론이 불확실하면 사용자에게 문서 유형을 질문한다.
3. 기존 references/ 폴더를 탐색해 같은 이름 문서가 있는지 확인한다.

### 3단계: 파일 변환

#### md 파일
바로 3단계(저장)로 이동.

#### pdf 파일
```bash
./scripts/extract-pdf.sh <파일경로> /tmp/extracted.txt
```
추출된 txt를 읽어 md로 정리.

#### docx 파일
```bash
uv run --with python-docx --with mammoth python3 skills/spec-import/scripts/../../../skills/sp-common/scripts/extract-docx.py <파일경로> /tmp/extracted.md
```
또는 프로젝트 루트의 scripts/ 배포 위치:
```bash
python3 scripts/extract-docx.py <파일경로> /tmp/extracted.md
```

#### hwpx/hwp 파일
```bash
python3 scripts/extract-hwpx.py <파일경로> /tmp/extracted.md
```
사전 요건: `pip install pyhwp2md`
이미지는 추출되지 않으므로 사용자에게 안내한다.

#### xlsx 파일
문서 유형이 요구사항(requirements)인 경우:
```bash
uv run --with openpyxl python3 skills/spec-import/scripts/excel-to-json.py <파일경로>
python3 skills/spec-import/scripts/json-to-md.py
```

그 외 Excel형 문서:
- 구조를 분석해 JSON 스키마를 구성하고 마스터 JSON을 생성한다.
- `parse-excel.py`로 구조 파악 후 직접 JSON 작성.

### 4단계: 재임포트 처리 (동일 문서명 재수신)

기존 마스터가 있을 경우:

| 상황 | 판단 기준 | 처리 |
|------|---------|------|
| 내용만 변경 | 섹션 제목 구조 80% 이상 일치 | 마스터 업데이트 (버전 patch 증가) |
| 템플릿 일부 변경 | 섹션 구조 50~79% 일치 | 사용자 확인 후 템플릿 + 마스터 업데이트 |
| 완전히 다른 문서 | 섹션 구조 50% 미만 일치 | 맥락 설명 요청 (신규 문서? 대체? 양식 변경?) |

Excel형의 경우: `_columns` 구조 비교로 동일 판단.

### 5단계: 마스터 저장

#### 서술형 문서 (md/pdf/docx/hwpx)

`references/{폴더}/{문서명}/` 디렉토리 생성.

**분량 기준 분리**:
- 5개 이하 섹션 또는 100줄 이하 → `index.md` 단일 파일
- 그 이상 → `index.md` (섹션 목록 + 핵심 요약) + `section-01.md`, `section-02.md` ...

`index.md` 상단에 front matter 추가.

#### Excel형 문서 (xlsx)

`references/{폴더}/{문서명}/` 에 JSON 마스터 + index.md 저장.

### 6단계: AGENTS.md 업데이트

`doc_type`이 requirements, architecture, api, db 인 문서가 추가/변경될 때:

1. 루트 `AGENTS.md`의 `## 지식베이스 문서` 테이블을 갱신한다.
2. 문서가 처음 등록되는 경우 행 추가, 업데이트인 경우 버전·상태 갱신.

```markdown
## 지식베이스 문서

| 문서 | 경로 | 버전 | 상태 |
|------|------|------|------|
| 요구사항정의서 | references/01-requirements/요구사항정의서/index.md | 1.2.0 | approved |
```

### 7단계: git commit + 태그

```bash
git add references/ AGENTS.md
git commit -m "docs: {문서명} {신규 등록|업데이트} v{version} ({source_format})"
./scripts/tag.sh import {문서명} {version}
```

---

## `/spec-import draft <문서유형>` — AI 초안 생성

기존 references의 문서들을 바탕으로 AI가 새 문서 초안을 생성한다.

### 지원 문서유형

| 유형 | 입력 참고 문서 | 저장 위치 |
|------|------------|---------|
| requirements | 00-rfp/ | 01-requirements/ |
| architecture | 01-requirements/ + 00-rfp/ | 02-design/ |
| api | 01-requirements/ + 02-design/{아키텍처}/ | 02-design/ |
| db | 01-requirements/ + 02-design/{아키텍처}/ | 02-design/ |

### 공통 단계

1. **입력 문서 파악**: 위 테이블 기준으로 관련 파일을 우선순위 순으로 탐색
   - index.md 먼저 읽어 개요 파악
   - 필요한 section-XX.md만 선택적으로 참조
2. **템플릿 참조**: `skills/spec-import/data/{유형}-template.md` 를 Read해 구조 파악
3. **초안 작성**: 참고 문서 기반으로 내용 채움
4. **5단계 이후 동일**: 저장 → AGENTS.md 업데이트 → git commit

### 요구사항 초안 (requirements draft)

RFP에서 기능/비기능 요구사항을 추출해 `requirements.json` 스키마로 작성.

**ID 규칙**:
- 기능: `SFR-001`, `SFR-002` ...
- 비기능 접두사: PER(성능), SEC(보안), REL(신뢰성), INT(인터페이스), CON(제약사항), QUA(품질)

작성 후 json-to-md.py로 index.md 생성.

---

## `/spec-import status` — 현황 확인

`references/` 하위 모든 index.md의 front matter를 읽어 테이블로 출력한다.

```
| 문서명 | 유형 | 버전 | 상태 | 마지막 수정 |
|--------|------|------|------|------------|
| 요구사항정의서 | requirements | 1.2.0 | approved | 2026-02-20 |
| 아키텍처설계서 | architecture | 0.3.0 | draft | 2026-02-24 |
```

---

## 분석 전용: Excel 구조 파악

import 전에 구조를 먼저 확인할 때:

```bash
uv run --with openpyxl python3 skills/spec-import/scripts/parse-excel.py <파일경로> --summary
uv run --with openpyxl python3 skills/spec-import/scripts/parse-excel.py <파일경로> --sheet 시트명
```

---

## 요구사항 Excel merge 전략

xlsx 재수신 시 merge 방식 선택:

| 전략 | 동작 |
|------|------|
| `upsert` (기본) | ID 기준 덮어씀, 기존에만 있는 ID 유지 |
| `replace` | 시트 전체 교체 |
| `append` | 신규 ID만 추가 |

```bash
uv run --with openpyxl python3 skills/spec-import/scripts/excel-to-json.py <파일> --merge replace
```

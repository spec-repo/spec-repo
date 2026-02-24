---
name: sp-design-db
description: "DB설계서 관리. 요구사항·아키텍처 기반 초안 도출(draft), 기존 문서 임포트(import), PDF/docx 내보내기(export), DDL 생성(ddl), 현황 확인(status)을 지원한다."
metadata:
  author: spec-repo
  version: "1.0"
---

$ARGUMENTS 에 지정된 서브커맨드를 실행한다. 인자가 없으면 사용법을 안내한다.

**사용법**:
- `/sp-design-db draft` — 요구사항 + 아키텍처 → DB설계서.md 초안 생성
- `/sp-design-db import <file>` — 기존 PDF/docx → MD 구조화
- `/sp-design-db export [--format pdf|docx]` — MD → 산출물 파일 생성
- `/sp-design-db ddl [--dialect mysql|oracle|postgresql]` — MD → DDL 생성
- `/sp-design-db status` — 현황 확인

---

## 파일 구조

```
skills/sp-design-db/
└── data/
    └── DB설계서-template.md    # 표준 템플릿 (에이전트 참조용)
```

**프로젝트 내 파일 구조**:
```
references/02-design/
└── DB설계서.md    ← 진실의 원천 (직접 편집 가능, git 추적)
snapshots/db/      ← 내보낸 산출물 (.gitignore 권장)
```

---

## draft: 요구사항 + 아키텍처 → DB설계서 초안 생성

### 1단계: 입력 문서 파악

아래 순서로 파일을 탐색한다:
1. `references/01-requirements/requirements-index.md` — 요구사항 전체 개요
2. `references/02-design/아키텍처설계서.md` — DBMS 종류 및 버전
3. `references/01-requirements/requirements.md` — 데이터 관련 항목 상세 (필요 시)
4. `references/00-rfp/*/index.md` — RFP에서 데이터 요건 (없으면 skip)

### 2단계: 테이블 구조 도출

요구사항에서 엔티티와 관계를 도출한다.

**테이블 도출 기준**:
- 기능 요구사항의 주요 명사 = 엔티티 후보
- 마스터 데이터: 사용자, 코드, 조직 등
- 트랜잭션 데이터: 요구사항의 입력/처리 단위

**ERD 작성 (Mermaid)**:
- 1:N 관계 → `||--o{`
- M:N 관계 → 중간 테이블 생성
- 테이블명 → 영문 대문자 스네이크 케이스 (예: `USER_INFO`)

**초안에서 채울 항목**:
- 주요 테이블명, PK 컬럼
- 기본적인 FK 관계 (ERD)
- DBMS는 아키텍처설계서에서 추출

**비워두는 항목**:
- 상세 컬럼 타입/길이 제약 (DB 설계 확정 후 채움)
- 인덱스 정의 (성능 테스트 후 추가)
- NOT NULL 제약 (구현 단계에서 확정)

### 3단계: 템플릿 기반 작성

`skills/sp-design-db/data/DB설계서-template.md`를 Read해서 구조를 파악한 후, 프로젝트에 맞게 내용을 채워 `references/02-design/DB설계서.md`를 생성한다.

### 4단계: front matter 업데이트

```yaml
status: draft
updated: {오늘 날짜}
based_on:
  requirements: "{requirements 버전}"
  architecture: "{아키텍처설계서 version}"
```

### 5단계: git commit + draft 태그

```bash
git add references/02-design/DB설계서.md
git commit -m "feat: DB설계서 초안 작성 (테이블 N개)"
./scripts/tag.sh draft DB설계서 {version}
```

---

## import: 기존 문서 → MD 변환

기존 DB설계서(PDF/docx)를 MD로 구조화한다.

### PDF 파일

```bash
node -e "
const fs = require('fs');
const pdfParse = require('pdf-parse');
pdfParse(fs.readFileSync('<pdf-file>')).then(d => console.log(d.text));
" > /tmp/db-extracted.txt
```

### docx 파일

```bash
uv run --with python-docx python3 -c "
import docx, sys
doc = docx.Document(sys.argv[1])
for p in doc.paragraphs: print(p.text)
" <docx-file> > /tmp/db-extracted.txt
```

추출된 텍스트를 읽어 `DB설계서.md` 구조(ERD + 테이블 정의 + 인덱스)로 재구성한다.

**비지원 형식**:
| 수신 형식 | 처리 |
|---------|------|
| `.hwp` | 지원 불가. HWP→PDF 변환 후 재시도 안내 |
| `.xlsx` | 컬럼 정의 표가 Excel로 온 경우: 내용을 복사해 MD 테이블로 변환 안내 |

### git commit + import 태그

```bash
git add references/02-design/DB설계서.md
git commit -m "feat: DB설계서 임포트 v{version} ({source})"
./scripts/tag.sh import DB설계서 {version}
```

---

## export: MD → 산출물 파일 생성

```bash
# PDF
npx md-to-pdf references/02-design/DB설계서.md --dest snapshots/db/

# docx (pandoc)
pandoc references/02-design/DB설계서.md \
  -o snapshots/db/DB설계서_v{version}.docx

# 커스텀 Word 템플릿 적용
pandoc references/02-design/DB설계서.md \
  --reference-doc=references/02-design/_template.docx \
  -o snapshots/db/DB설계서_v{version}.docx
```

출력 경로: `snapshots/db/DB설계서_v{version}_{YYYYMMDD}.{ext}`

---

## ddl: MD → DDL 생성

`DB설계서.md`의 테이블 정의 섹션을 파싱해 DDL을 생성한다.

**지원 방언**:
- `oracle` (기본): `CREATE TABLE`, `COMMENT ON COLUMN`
- `mysql`: `CREATE TABLE` + `COMMENT`
- `postgresql`: `CREATE TABLE` + `COMMENT ON COLUMN`

```bash
# DDL 생성 (oracle 기본)
uv run python3 skills/sp-design-db/scripts/md-to-ddl.py \
  references/02-design/DB설계서.md \
  --dialect oracle \
  --out snapshots/db/ddl_v{version}.sql
```

> `scripts/md-to-ddl.py`는 향후 구현 예정. 현재는 에이전트가 MD를 읽고 직접 DDL을 작성한다.

**DDL 생성 시 에이전트 행동**:
`DB설계서.md`의 각 테이블 정의 섹션을 읽어 다음 형식으로 DDL을 생성한다:

```sql
-- {테이블 한글명}
CREATE TABLE {테이블명} (
    {컬럼명} {타입}({길이}) {NOT NULL | NULL} {DEFAULT 값},
    ...
    CONSTRAINT PK_{테이블명} PRIMARY KEY ({pk컬럼})
);
COMMENT ON TABLE {테이블명} IS '{테이블 설명}';
COMMENT ON COLUMN {테이블명}.{컬럼명} IS '{컬럼 설명}';
```

---

## status: 현황 확인

`references/02-design/DB설계서.md`를 Read해서 다음을 보고한다:

- 버전 (`version`), 상태 (`status`), 기반 문서 버전
- 테이블 수 (### 헤딩 카운트)
- ERD 포함 여부 (Mermaid 블록 존재 여부)
- 인덱스 정의 현황 (인덱스 테이블 행 수)
- 미작성 컬럼 (설명 비어있는 행 수)

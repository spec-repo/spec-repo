---
name: sp-design-api
description: "API명세서 관리. RFP·요구사항·아키텍처 기반 초안 도출(draft), 기존 문서 임포트(import), Swagger/OpenAPI 연동(sync), PDF/docx 내보내기(export), 현황 확인(status)을 지원한다."
metadata:
  author: spec-repo
  version: "1.0"
---

$ARGUMENTS 에 지정된 서브커맨드를 실행한다. 인자가 없으면 사용법을 안내한다.

**사용법**:
- `/sp-design-api draft` — 요구사항 + 아키텍처 → API명세서.md 초안 생성
- `/sp-design-api import <file>` — 기존 PDF/docx/yaml → MD 구조화
- `/sp-design-api sync <openapi-file>` — OpenAPI(Swagger) YAML/JSON → MD 갱신
- `/sp-design-api export [--format pdf|docx]` — MD → 산출물 파일 생성
- `/sp-design-api status` — 현황 확인

---

## 파일 구조

```
skills/sp-design-api/
└── data/
    └── API명세서-template.md    # 표준 템플릿 (에이전트 참조용)
```

**프로젝트 내 파일 구조**:
```
references/02-design/
└── API명세서.md    ← 진실의 원천 (직접 편집 가능, git 추적)
snapshots/api/      ← 내보낸 산출물 (.gitignore 권장)
```

---

## draft: 요구사항 + 아키텍처 → API명세서 초안 생성

### 1단계: 입력 문서 파악

아래 순서로 파일을 탐색한다:
1. `references/01-requirements/requirements-index.md` — 요구사항 전체 개요
2. `references/02-design/아키텍처설계서.md` — 기술 스택, Base URL, 인증 방식
3. `references/01-requirements/requirements.md` — API 연관 항목 상세 (필요 시)
4. `references/00-rfp/*/index.md` — RFP에서 API 관련 요건 (없으면 skip)

### 2단계: API 구조 도출

요구사항에서 도메인 단위로 엔드포인트를 도출한다.

**엔드포인트 도출 기준**:
- 기능 요구사항 1개 ≈ 1~3개의 API
- CRUD 패턴: `GET /resource`, `POST /resource`, `GET /resource/{id}`, `PUT /resource/{id}`, `DELETE /resource/{id}`
- 목록 조회 → 검색 파라미터 포함 (`GET /resource?keyword=&page=`)

**초안에서 채울 항목**:
- Base URL, 인증 방식 — 아키텍처설계서에서 추출
- 각 엔드포인트 설명, 요청 파라미터 — 요구사항에서 도출
- 공통 에러 코드 — 아키텍처설계서 또는 RFP에서 도출
- 응답 예시 — JSON 스켈레톤으로 초안 작성 (`{}` 또는 빈 배열)

**비워두는 항목**:
- 상세 응답 Body 스키마 (개발 단계에서 채움)
- 상세 에러 케이스 (구현 후 추가)

### 3단계: 템플릿 기반 작성

`skills/sp-design-api/data/API명세서-template.md`를 Read해서 구조를 파악한 후, 프로젝트에 맞게 내용을 채워 `references/02-design/API명세서.md`를 생성한다.

### 4단계: front matter 업데이트

```yaml
status: draft
updated: {오늘 날짜}
based_on:
  requirements: "{requirements.json의 _meta.version 또는 requirements.md의 version}"
  architecture: "{아키텍처설계서.md의 version}"
```

### 5단계: git commit + draft 태그

```bash
git add references/02-design/API명세서.md
git commit -m "feat: API명세서 초안 작성 (도메인 N개, 엔드포인트 M개)"
./scripts/tag.sh draft API명세서 {version}
```

---

## import: 기존 문서 → MD 변환

기존 API명세서(PDF/docx)를 MD로 구조화한다.

### PDF 파일

```bash
node -e "
const fs = require('fs');
const pdfParse = require('pdf-parse');
pdfParse(fs.readFileSync('<pdf-file>')).then(d => console.log(d.text));
" > /tmp/api-extracted.txt
```

### docx 파일

```bash
uv run --with python-docx python3 -c "
import docx, sys
doc = docx.Document(sys.argv[1])
for p in doc.paragraphs: print(p.text)
" <docx-file> > /tmp/api-extracted.txt
```

추출된 텍스트를 읽어 `API명세서.md` 구조로 재구성한다.

### git commit + import 태그

```bash
git add references/02-design/API명세서.md
git commit -m "feat: API명세서 임포트 v{version} ({source})"
./scripts/tag.sh import API명세서 {version}
```

**비지원 형식**:
| 수신 형식 | 처리 |
|---------|------|
| `.hwp` | 지원 불가. HWP→PDF 변환 후 재시도 안내 |
| `.xlsx` | API명세서는 MD 형식으로 관리됨. 내용 복사 후 수동 재작성 안내 |

---

## sync: OpenAPI YAML/JSON → MD 갱신

Swagger/OpenAPI 스펙 파일에서 엔드포인트 목록을 읽어 MD를 갱신한다.

```bash
# OpenAPI yaml 파싱 (python)
uv run --with pyyaml python3 -c "
import yaml, json, sys
spec = yaml.safe_load(open(sys.argv[1]))
for path, methods in spec.get('paths', {}).items():
    for method, detail in methods.items():
        print(f'{method.upper()} {path}: {detail.get(\"summary\", \"\")}')
" <openapi.yaml>
```

출력 결과를 바탕으로 `API명세서.md`의 엔드포인트 섹션을 upsert 방식으로 갱신한다 (기존에만 있는 섹션 유지).

---

## export: MD → 산출물 파일 생성

```bash
# PDF
npx md-to-pdf references/02-design/API명세서.md --dest snapshots/api/

# docx (pandoc)
pandoc references/02-design/API명세서.md \
  -o snapshots/api/API명세서_v{version}.docx

# 커스텀 Word 템플릿 적용
pandoc references/02-design/API명세서.md \
  --reference-doc=references/02-design/_template.docx \
  -o snapshots/api/API명세서_v{version}.docx
```

출력 경로: `snapshots/api/API명세서_v{version}_{YYYYMMDD}.{ext}`

---

## status: 현황 확인

`references/02-design/API명세서.md`를 Read해서 다음을 보고한다:

- 버전 (`version`), 상태 (`status`), 기반 문서 버전
- 도메인 수, 엔드포인트 수 (섹션 헤딩 카운트)
- 미작성 항목 (`[기능 설명]`, `[설명]` 등 플레이스홀더 남은 항목 수)
- 응답 예시 비어있는 엔드포인트 목록

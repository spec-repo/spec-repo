# spec-repo

SI 프로젝트의 산출물 문서를 **AI 에이전트와 함께 관리**하기 위한 CLI 도구.

RFP를 받는 순간부터 요구사항 분석, 설계서 작성, 고객 납품까지 — 에이전트가 스펙 문서를 직접 읽고 쓸 수 있는 구조를 한 번에 세팅합니다.

---

## 설치

```bash
npm install -g spec-repo
```

---

## 빠른 시작

```bash
# 1. 새 프로젝트 생성
spec-repo create my-project
cd my-project

# 2. PROJECT.md 에 기술스택·컨벤션 채우기

# 3. RFP 수신
spec-repo intake ./견적요청서.pdf

# 4. 출력된 지시문을 Claude Code 등 에이전트에 붙여넣기
#    → 에이전트가 references/요구사항정의서.md 자동 작성

# 5. 검토 후 버전 태깅
./scripts/tag.sh review 요구사항정의서   # 검토 요청 + PDF 생성
./scripts/tag.sh approved 요구사항정의서 # 고객 승인 완료 + PDF 생성
```

---

## 왜 필요한가

AI 에이전트는 파일 구조와 규칙이 명확할수록 잘 작동합니다. 하지만 SI 프로젝트마다 문서 구조가 제각각이면 에이전트에게 매번 설명해야 합니다.

spec-repo는 다음을 표준화합니다:

- **어디에 뭐가 있는지** — `references/`, `templates/`, `snapshots/` 등 역할이 고정된 디렉토리
- **에이전트가 어떻게 행동해야 하는지** — `AGENTS.md`, `SKILL.md` 에 규칙 내장
- **문서 버전을 어떻게 관리하는지** — `tag.sh` 로 review/approved Git 태그 + PDF 스냅샷

---

## 생성되는 프로젝트 구조

```
my-project/
├── SKILL.md        에이전트 스킬 진입점
├── AGENTS.md       에이전트 공통 행동 규칙
├── CLAUDE.md       Claude 전용 규칙
├── PROJECT.md      기술스택, 컨벤션, 외부연동 정보
│
├── 00-rfp/         수신한 RFP 원본
├── references/     요구사항정의서, DB설계서, API명세서 등 (마스터)
├── templates/      각 문서의 초안 템플릿
├── snapshots/      고객 납품용 PDF 스냅샷
└── scripts/
    ├── tag.sh          버전 태깅 + PDF 생성
    ├── export-pdf.sh   마크다운 → PDF 수동 변환
    └── extract-pdf.sh  PDF → TXT 텍스트 추출
```

---

## 커맨드 레퍼런스

### `spec-repo create [project-name]`

새 spec-repo 프로젝트를 생성합니다.

```bash
spec-repo create my-project          # 새 디렉토리에 생성
spec-repo create .                   # 현재 디렉토리에 생성
spec-repo create my-project --no-git # git 초기화 생략
```

| 옵션 | 설명 |
|------|------|
| `--no-git` | git 초기화 건너뜀 |

### `spec-repo intake <file>`

RFP 또는 참고 문서를 프로젝트에 등록하고, 에이전트 분석 지시문을 출력합니다.

```bash
spec-repo intake ./rfp.pdf
spec-repo intake ./보안요건.md --type supplement
spec-repo intake ./rfp.pdf --dest 01-addendum
```

| 옵션 | 설명 |
|------|------|
| `--type rfp\|supplement` | 문서 유형 (기본: `rfp`) |
| `--dest <dir>` | 저장 디렉토리 (기본: `00-rfp`) |

지원 파일 형식: `.md`, `.pdf` (PDF는 텍스트 자동 추출)

---

## 문서 버전 관리

```bash
# 고객에게 보내기 전 검토 요청
./scripts/tag.sh review 요구사항정의서

# 고객 승인 완료
./scripts/tag.sh approved 요구사항정의서

# 태그 목록 확인
./scripts/tag.sh list
```

`review`와 `approved` 실행 시 `snapshots/` 에 PDF가 자동으로 생성됩니다.
PDF 재생성이 필요하면:

```bash
./scripts/export-pdf.sh 요구사항정의서 approved
./scripts/export-pdf.sh --all   # references/ 전체
```

> **사전 요건:** Node.js (npx). 첫 실행 시 Chromium을 자동 다운로드합니다 (~100MB, 1회).

---

## 요구 사항

- Node.js 18 이상
- Git (버전 태깅 사용 시)
- npx (PDF 내보내기 사용 시)

---

## 라이선스

ISC

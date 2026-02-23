# spec-repo

개발 프로젝트의 **코드 외 산출물 문서를 Git으로 관리**하고, 이를 AI 에이전트의 **지식 베이스**로 활용하기 위한 scaffold 도구.

---

## 철학

소프트웨어 개발 프로젝트에서 생산되는 산출물은 크게 두 가지다.

- **소스코드** — 개발 리포지토리에서 Git으로 관리
- **문서 산출물** — 요구사항정의서, 화면설계서, DB설계서, API명세서, 테스트케이스 등

후자는 여전히 팀마다 제각각이다. 공유 드라이브에 흩어진 Excel 파일, 버전 구분이 안 되는 파일명, 변경 이력을 알 수 없는 Word 문서.

**spec-repo는 이 문서 산출물들을 코드처럼 관리하는 것을 목표로 한다.**

별도의 `spec-repo`를 생성해 문서를 Git으로 추적하고, 개발 리포지토리에서 이 리포지토리를 에이전트 스킬로 연동하면 — 에이전트가 요구사항을 읽고, 설계서를 작성하고, 현황을 파악하는 데 필요한 컨텍스트를 항상 최신 상태로 유지할 수 있다.

---

## 왜 Agent Skills인가

현재 이 도구는 **[Agent Skills](https://agentskills.io)** 오픈 표준을 기반으로 동작한다.

Agent Skills는 Anthropic이 개발하고 공개한 에이전트 스킬 포맷으로, Claude Code, Cursor, GitHub Copilot, Gemini CLI, OpenAI Codex, Windsurf 등 20개 이상의 에이전트 도구가 지원하는 오픈 표준이다.

이 표준을 선택한 이유는 단순하다:

> 사용자가 이미 구독 중인 에이전트를 그대로 쓸 수 있어야 한다.

특정 에이전트에 종속되지 않고, 팀원 각자가 선호하는 AI 도구에서 동일한 스킬 슬래시 커맨드(`/specrepo-requirements`, `/specrepo-review` 등)를 통해 문서를 관리한다.

단, 이는 **현재 시점의 접근 방식**이다. AI 에이전트 생태계는 빠르게 진화하고 있으며, 더 나은 연동 방식이 안정화되면 변경될 수 있다.

---

## 동작 방식

```
spec-repo (문서 리포지토리)          개발 리포지토리
├── references/                      ├── src/
│   ├── requirements.json  ──────── ─┤  ...
│   └── ...                          ├── .claude/skills/
├── snapshots/                       │   └── specrepo-requirements/  ← 스킬 연동
└── 00-rfp/                          └── AGENTS.md
```

1. `spec-repo create`로 문서 리포지토리 scaffold 생성 + 에이전트 스킬 자동 설치
2. `spec-repo intake`로 RFP 등 입력 문서 등록
3. 에이전트 스킬 커맨드로 문서를 관리

```bash
/specrepo-requirements import 요구사항정의서_v0.7.8.xlsx   # Excel → JSON 임포트
/specrepo-requirements export                              # JSON → Excel 재생성
/specrepo-requirements status                              # 현황 확인
/specrepo-review                                           # 문서 전반 검토
```

---

## 빠른 시작

```bash
npm install -g spec-repo

# 새 문서 리포지토리 생성
spec-repo create my-project-spec
cd my-project-spec

# RFP 등록
spec-repo intake ./견적요청서.pdf

# 에이전트로 요구사항 정의서 작성 시작
# → 에이전트 스킬이 자동으로 설치되어 있음
```

---

## 생성되는 리포지토리 구조

```
my-project-spec/
├── SKILL.md              에이전트 스킬 진입점
├── AGENTS.md             에이전트 공통 규칙
├── PROJECT.md            프로젝트 기술스택·컨벤션
│
├── 00-rfp/               수신한 RFP 원본
├── references/           산출물 원본 (진실의 원천, Git 추적)
│   └── requirements.json 요구사항 JSON (Excel ↔ 동기화)
├── snapshots/            납품용 스냅샷 (PDF, xlsx)
└── scripts/
    ├── tag.sh            버전 태깅 + PDF 생성
    └── export-pdf.sh     마크다운 → PDF 변환
```

`references/`가 **진실의 원천**이다. Excel 파일은 이 JSON을 내보낸 스냅샷이며, Git으로 추적되지 않는다.

---

## CLI 레퍼런스

### `spec-repo create [project-name]`

scaffold를 복사하고 에이전트 스킬을 자동 설치한다.

```bash
spec-repo create my-project
spec-repo create .            # 현재 디렉토리
spec-repo create . --no-git  # git 초기화 생략
```

### `spec-repo intake <file>`

RFP 또는 참고 문서를 등록하고 에이전트 분석 지시문을 출력한다.

```bash
spec-repo intake ./rfp.pdf
spec-repo intake ./보안요건.md --type supplement
```

| 옵션 | 설명 |
|------|------|
| `--type rfp\|supplement` | 문서 유형 (기본: `rfp`) |
| `--dest <dir>` | 저장 디렉토리 (기본: `00-rfp`) |

---

## 요구 사항

- Node.js 18 이상
- Git
- Python 3 + [uv](https://docs.astral.sh/uv/) (요구사항 스킬의 Excel 처리에 필요)

---

## 라이선스

ISC

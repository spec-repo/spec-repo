---
name: spec-help
description: "spec-repo 사용법, 철학, 워크플로우를 안내한다. 처음 사용자 온보딩 및 사용 가능한 커맨드 개요를 제공한다. 사용법: /spec-help"
metadata:
  author: spec-repo
  version: "1.0"
---

이 저장소의 사용법과 철학을 안내한다.

---

다음 내용을 마크다운으로 출력한다:

---

# {{PROJECT_NAME}} spec-repo 사용 가이드

## 이 저장소의 역할

SI 프로젝트 산출물 문서를 **AI 에이전트가 활용할 수 있는 형태**로 관리하는 저장소다.

- `references/` — 마스터 문서 (진실의 원천, git 추적)
- `snapshots/` — 납품용 사본 (PDF/docx/hwpx/xlsx)
- `scripts/` — 변환·버전 관리 자동화 도구

**핵심 원칙**: `references/`의 마크다운/JSON이 항상 마스터다. `snapshots/`는 내보내기 결과물이다.

---

## 사용 가능한 커맨드

### 문서 등록 / 초안 생성

```
/spec-import <파일>              # 기존 파일(pdf/docx/hwpx/xlsx/md)을 마스터로 변환
/spec-import draft <문서유형>   # 기존 references 기반으로 AI 초안 생성
/spec-import status             # 등록된 문서 전체 현황
```

**지원 파일 포맷**: `.md` `.pdf` `.docx` `.hwpx` `.hwp` `.xlsx`

### 문서 내보내기

```
/spec-export <문서명>                        # 기본 포맷으로 내보내기
/spec-export <문서명> --format pdf|docx|hwpx|xlsx
/spec-export <문서명> --version 1.0.0       # 버전 명시
/spec-export --all                          # 전체 내보내기
```

### 도움말

```
/spec-help   # 이 가이드 출력
```

---

## 두 가지 사용 방식

### 방식 A: 외부 문서 전달 방식
> *문서를 직접 편집하는 팀원에게 적합*

1. 기존 방식대로 Word/한글/Excel에서 문서 작성·수정
2. 파일을 에이전트에게 전달: `/spec-import 요구사항정의서_v2.xlsx`
3. 에이전트가 마스터 업데이트 + 버전 증가
4. 납품 파일 생성: `/spec-export 요구사항정의서`

### 방식 B: 에이전트 협업 방식
> *이 저장소를 직접 사용하는 팀원에게 적합*

1. 에이전트와 함께 마스터 문서 논의·수정
2. `references/`의 MD/JSON이 직접 갱신됨
3. 납품 준비되면 `/spec-export 요구사항정의서 --format hwpx`

**두 방식 모두 지원된다.** 팀 내 혼용도 가능하다.

---

## 디렉토리 구조

```
references/
├── 00-rfp/          ← 수신한 RFP 및 참고 파일
├── 01-requirements/ ← 요구사항 관련 문서
├── 02-design/       ← 설계 문서 (아키텍처/API/DB 등)
├── 03-test/         ← 테스트 관련 문서
├── 04-ops/          ← 운영 관련 문서
└── 05-mgmt/         ← 사업 관리 문서
snapshots/           ← 납품용 파일 (.gitignore 권장)
scripts/             ← 변환·태깅 스크립트
AGENTS.md            ← 지식베이스 매니페스트 (자동 관리)
```

---

## 지식베이스 연동

`references/`의 핵심 문서(요구사항, 아키텍처, API, DB설계서)는 `AGENTS.md`에 자동으로 등록된다. 개발 레포에서 이 저장소의 `AGENTS.md`를 참조하면 최신 문서 위치를 항상 파악할 수 있다.

---

## 버전 관리 태그

```bash
./scripts/tag.sh review   <문서명> [버전]   # 검토 요청
./scripts/tag.sh approved <문서명> [버전]   # 고객 승인
./scripts/tag.sh list                       # 태그 목록
```

태그 형식: `YYYY-MM-DD.{action}.{문서명}[.v{버전}]`

---

현재 등록된 문서 현황은 `/spec-import status`로 확인한다.

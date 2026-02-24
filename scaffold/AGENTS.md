# {{PROJECT_NAME}} — 스펙 저장소 에이전트 지침

이 저장소는 **{{PROJECT_NAME}}** SI 프로젝트의 산출물 문서를 AI 에이전트가 활용할 수 있는 형태로 관리한다.

---

## 이 저장소의 역할

- `references/` — 마스터 문서 (진실의 원천, git 추적)
- `snapshots/` — 납품용 사본 (PDF/docx/hwpx/xlsx, `.gitignore` 권장)
- `scripts/` — 변환·버전 관리 자동화 도구

**핵심 원칙**: `references/`의 마크다운/JSON이 항상 마스터다. `snapshots/`는 내보내기 결과물이다.

---

## 사용 가능한 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/spec-import <파일>` | 문서 파일(pdf/docx/hwpx/xlsx/md) 등록·갱신 |
| `/spec-import draft <유형>` | 기존 문서 기반 AI 초안 생성 |
| `/spec-import status` | 등록된 문서 전체 현황 |
| `/spec-export <문서명>` | 납품용 파일 생성 |
| `/spec-export --all` | 전체 내보내기 |
| `/spec-help` | 사용 가이드 |

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
```

각 문서는 `references/{폴더}/{문서명}/index.md` 형태로 관리된다.

---

## 지식베이스 문서

> `/spec-import`로 문서를 등록하면 자동으로 이 테이블이 갱신된다.
> 개발 레포에서 이 저장소를 참조할 때 이 테이블로 최신 문서 위치를 파악한다.

| 문서 | 경로 | 버전 | 상태 |
|------|------|------|------|

---

## 문서 변경 원칙

- 문서를 변경할 때는 **마스터(MD/JSON)를 먼저 수정**한다
- 납품 전에는 `/spec-export`로 스냅샷을 생성한다
- `references/`의 마크다운이 항상 마스터다
- 파일을 직접 수정 후 전달하는 방식과 에이전트와 직접 협업하는 방식 모두 지원한다

---

## 프로젝트 기준 정보

→ `PROJECT.md` 참조

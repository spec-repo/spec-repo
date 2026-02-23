# spec-repo — 코드베이스 컨텍스트

## 한 줄 요약

SI 프로젝트 산출물을 AI 에이전트가 활용하기 좋은 구조로 세팅해주는 **Node.js CLI 패키지**.

## 핵심 구조

```
bin/spec-repo.js          진입점 (commander)
src/commands/create.js    spec-repo create 구현
src/commands/intake.js    spec-repo intake 구현
src/utils/scaffold.js     파일 복사 + 플레이스홀더 치환
src/utils/i18n.js         ko/en 메시지 + 로케일 자동 감지
scaffold/ko/              한국어 스캐폴드 원본
scaffold/en/              영문 스캐폴드 원본
```

## 커맨드 동작 요약

**`create [name] [--lang ko|en] [--no-git]`**
- `scaffold/<lang>/` → 대상 디렉토리 복사
- `.md` 파일에서 `{{PROJECT_NAME}}`, `{{DATE}}` 치환
- `scripts/*.sh` 실행 권한 부여 → `npm install` → 선택적 git init

**`intake <file> [--type rfp|supplement] [--dest dir]`**
- 상위 디렉토리로 올라가며 `SKILL.md` 탐색 → 프로젝트 루트 결정
- 파일을 `--dest`(기본 `00-rfp/`)에 복사
- PDF면 `pdf-parse` 로 `.txt` 추출 시도
- 에이전트 분석 지시문 stdout 출력

## 언어 감지 우선순위

`--lang` 옵션 → `LANG` / `LC_ALL` / `LC_MESSAGES` 환경변수 → 기본 `en`

## 스캐폴드 수정 시 주의

- 템플릿 변경: `scaffold/ko/templates/` 또는 `scaffold/en/templates/`
- 에이전트 규칙 변경: `scaffold/*/AGENTS.md`, `scaffold/*/SKILL.md`
- 새 언어 추가: `scaffold/<lang>/` 생성 + `i18n.js` + `create.js`의 `normalizeLang()` 수정

## 의존성

| 패키지 | 용도 |
|--------|------|
| `commander` | CLI 파싱 |
| `pdf-parse` | intake PDF → TXT 추출 |
| `md-to-pdf` (npx 런타임) | `scripts/export-pdf.sh` 내부 사용 |

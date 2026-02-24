# spec-repo — 코드베이스 컨텍스트

## 한 줄 요약

SI 프로젝트 산출물을 AI 에이전트가 활용하기 좋은 구조로 세팅해주는 **Node.js CLI 패키지**.

## 핵심 구조

```
bin/spec-repo.js          진입점 (commander)
src/commands/create.js    spec-repo create 구현
src/commands/update.js    spec-repo update 구현
src/utils/scaffold.js     파일 복사 + 플레이스홀더 치환
scaffold/                 한국어 스캐폴드 원본
skills/                   에이전트 스킬 원본 (spec-rfp, spec-req, spec-design-arch, spec-design-api, spec-design-db)
```

## 커맨드 동작 요약

**`create [name] [--no-git]`**
- `scaffold/` → 대상 디렉토리 복사
- `.md` 파일에서 `{{PROJECT_NAME}}`, `{{DATE}}` 치환
- `skills/` → `.agents/skills/` + `.claude/skills/` 자동 복사
- `scripts/*.sh` 실행 권한 부여 → `npm install` → 선택적 git init

**`update`**
- 현재 디렉토리에서 spec-repo 프로젝트 루트 탐색 (`.agents/skills/`, `.claude/skills/`, `SKILL.md` 기준)
- `skills/` (패키지 최신) → 프로젝트의 `.agents/skills/` + `.claude/skills/` 덮어쓰기

## 스캐폴드 수정 시 주의

- 템플릿 변경: `scaffold/templates/`
- 에이전트 규칙 변경: `scaffold/AGENTS.md`, `scaffold/SKILL.md`

## 의존성

| 패키지 | 용도 |
|--------|------|
| `commander` | CLI 파싱 |
| `md-to-pdf` (npx 런타임) | `scripts/export-pdf.sh` 내부 사용 |

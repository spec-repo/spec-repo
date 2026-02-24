---
name: "{{PROJECT_NAME}}-spec"
description: "{{PROJECT_NAME}} 프로젝트 요구사항·설계 산출물. 기능 구현, API 개발, DB 설계, 테스트 시나리오 작성 시 반드시 참조. 문서 변경이 필요한 경우 scripts/tag.sh 로 버전 관리."
---

# {{PROJECT_NAME}} 프로젝트 스펙

## 문서 인덱스

| 단계 | 문서 | 경로 | 상태 | 코드 |
|------|------|------|------|------|
| 01-requirements | 요구사항정의서 | references/01-requirements/requirements.md | - | ✓ |
| 02-design | 아키텍처설계서 | references/02-design/아키텍처설계서.md | - | ✓ |
| 02-design | DB설계서 | references/02-design/DB설계서.md | - | ✓ |
| 02-design | API명세서 | references/02-design/API명세서.md | - | ✓ |
| 03-test | 테스트시나리오 | references/03-test/테스트시나리오.md | - | ✓ |

## 에이전트 행동 규칙

- 코드 구현 시 `코드 = ✓` 문서를 **반드시** 먼저 확인한다
- 스펙과 다른 구현이 필요한 경우, 코드보다 문서를 먼저 수정한다
- API 변경 시 `references/02-design/API명세서.md` 를 업데이트한다
- DB 스키마 변경 시 `references/02-design/DB설계서.md` 를 업데이트한다
- `코드 = ✗` 문서는 프로세스·관리 질문에만 참조한다
- 문서 수정 후 사람에게 확인을 받고 `scripts/tag.sh` 를 실행한다

## 문서 관리 스킬

각 문서 유형별로 전용 스킬이 제공된다:

| 문서 | 스킬 | 관리 방식 |
|------|------|---------|
| 요구사항정의서 | `/specrepo-requirements` | MD + JSON (Excel 입출력) |
| 아키텍처설계서 | `/specrepo-architecture` | MD (PDF/docx 내보내기) |
| API명세서 | `/specrepo-api` | MD (OpenAPI sync, PDF/docx 내보내기) |
| DB설계서 | `/specrepo-db` | MD (DDL 생성, PDF/docx 내보내기) |

> 스킬 없이 직접 편집도 가능. 스킬은 draft 초안 생성, import/export 자동화, 버전 태깅을 지원한다.

## 버전 관리 규칙

```bash
# 검토 요청
./scripts/tag.sh review <문서명>
# 예: ./scripts/tag.sh review 요구사항정의서

# 고객 승인 완료
./scripts/tag.sh approved <문서명>
# 예: ./scripts/tag.sh approved 요구사항정의서
```

## 프로젝트 기준 정보

→ PROJECT.md 참조

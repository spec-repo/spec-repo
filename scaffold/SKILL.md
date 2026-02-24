---
name: {{PROJECT_NAME}}-spec
description: >
  {{PROJECT_NAME}} 프로젝트 요구사항·설계 산출물.
  기능 구현, API 개발, DB 설계, 테스트 시나리오 작성 시 반드시 참조.
  문서 변경이 필요한 경우 scripts/tag.sh 로 버전 관리.
allowed-tools: Read Bash
---

# {{PROJECT_NAME}} 프로젝트 스펙

## 문서 인덱스

| 단계 | 문서 | 경로 | 상태 |
|------|------|------|------|
| 01-requirements | 요구사항정의서 | references/01-requirements/requirements.md | - |
| 02-design | 아키텍처설계서 | references/02-design/아키텍처설계서.md | - |
| 02-design | DB설계서 | references/02-design/DB설계서.md | - |
| 02-design | API명세서 | references/02-design/API명세서.md | - |
| 03-test | 테스트시나리오 | references/03-test/테스트시나리오.md | - |

## 에이전트 행동 규칙

- 기능 구현 전 관련 단계 폴더의 문서를 먼저 확인한다
- 스펙과 다른 구현이 필요한 경우, 코드보다 문서를 먼저 수정한다
- API 변경 시 `references/02-design/API명세서.md` 를 업데이트한다
- DB 스키마 변경 시 `references/02-design/DB설계서.md` 를 업데이트한다
- 문서 수정 후 사람에게 확인을 받고 `scripts/tag.sh` 를 실행한다

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

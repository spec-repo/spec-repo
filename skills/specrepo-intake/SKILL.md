---
name: specrepo-intake
description: "RFP 또는 참고 문서를 등록하고 txt 추출 및 섹션 분리까지 수행합니다. 사용법: /specrepo-intake <파일경로>"
metadata:
  author: spec-repo
  version: "1.0"
---

$ARGUMENTS 에 지정된 파일을 처리한다. 인자가 없으면 사용법을 안내한다.

**사용법**: `/specrepo-intake <파일경로>`
예) `/specrepo-intake ./rfp.pdf`, `/specrepo-intake 00-rfp/견적요청서.pdf`

---

다음 순서로 진행한다:

## 1단계: 파일 등록

- 지정 파일을 `00-rfp/` 에 복사한다 (이미 있으면 덮어쓰기)
- PDF가 아닌 경우(.md 등) 2단계를 건너뛰고 바로 3단계로 이동한다

## 2단계: PDF → TXT 추출

**PDF 파일은 절대 직접 Read() 하지 않는다.**

아래 스크립트를 실행하여 텍스트를 추출한다:

```bash
./scripts/extract-pdf.sh 00-rfp/<파일명>.pdf
```

- 스크립트가 `00-rfp/<파일명>.txt` 를 생성한다
- 실패하면 사용자에게 알리고 중단한다

## 3단계: TXT → index.md + 섹션 md 분리

추출된 txt 파일(또는 md 파일)을 읽어 내용을 구조화한다.

**출력 위치**: `00-rfp/<파일명>/` 디렉토리 (없으면 생성)

### 3-1. `00-rfp/<파일명>/index.md` 생성

다음 내용을 포함한다:
- 문서 제목, 발주처, 날짜 등 기본 정보 (파악 가능한 경우)
- 주요 섹션 목록 (각 섹션 파일로의 링크 포함)
- 전체 문서 핵심 요약 (3-5줄)

형식 예시:
```markdown
# [문서명] — 인덱스

## 기본 정보
- 발주처: ...
- 문서 날짜: ...

## 섹션 목록
| 파일 | 내용 |
|------|------|
| section-01.md | [섹션 제목] |
| section-02.md | [섹션 제목] |

## 핵심 요약
...
```

### 3-2. `00-rfp/<파일명>/section-XX.md` 생성 (섹션별)

- 문서의 주요 섹션/챕터를 기준으로 분리한다
- 파일명은 `section-01.md`, `section-02.md`, ... 순서로 부여한다
- 각 파일 상단에 섹션 제목과 원문 페이지/번호를 명시한다
- 원문 텍스트를 최대한 보존하되, 마크다운 형식으로 정리한다

## 4단계: 결과 보고

완료 후 다음을 사용자에게 보여준다:
- 생성된 파일 목록 (`00-rfp/<파일명>/` 하위)
- index.md 내용 미리보기
- 다음 단계 안내:
  - 요구사항이 아직 없으면: `/specrepo-requirements draft` — RFP 섹션을 분석해 요구사항 초안 자동 작성
  - 기획팀이 만든 Excel이 있으면: `/specrepo-requirements import <파일경로>` — Excel → JSON 변환 후 관리 시작

# {{PROJECT_NAME}} — 스펙 저장소 에이전트 지침

이 저장소는 **{{PROJECT_NAME}}** 프로젝트의 산출물 문서를 관리하는 spec-repo다.
에이전트는 아래 규칙을 항상 따른다.

---

## 디렉토리 구조

```
00-rfp/        수신한 RFP 원본 파일 (PDF, MD)
references/    분석·작성된 산출물 문서 (마크다운, 마스터)
templates/     문서 초안 생성용 템플릿
scripts/       버전 관리 및 PDF 변환 자동화
snapshots/     고객 납품용 PDF 스냅샷
```

---

## RFP 또는 참고 문서를 받았을 때

사용자가 PDF나 마크다운 파일을 제공하면 **즉시 다음 순서로 진행**한다.
별도 지시가 없어도 자율적으로 수행한다.

1. **파일을 `00-rfp/` 에 복사**한다
2. **파일을 읽어 분석**한다
   - **PDF 읽기 규칙 (반드시 이 순서로):**
     1. `00-rfp/<파일명>.txt` 가 이미 있으면 그 파일을 Read() 한다
     2. 없으면 Read(`00-rfp/<파일명>.pdf`) 를 시도한다
     3. Read() 가 실패하거나 "too large" 오류가 나면 **즉시, 사용자 확인 없이** 아래를 실행한다:
        ```bash
        ./scripts/extract-pdf.sh 00-rfp/<파일명>.pdf
        ```
        생성된 `.txt` 파일을 Read() 한다
   - 읽은 내용에서 핵심 기능 요구사항 목록 파악
   - 비기능 요구사항 파악 (성능, 보안, 가용성)
   - 불명확한 부분은 `[NEEDS CLARIFICATION: ...]` 으로 표시
3. **`references/요구사항정의서.md` 를 생성**한다
   - 파일이 없으면 `templates/요구사항정의서.md` 를 복사해서 생성
   - 분석 내용으로 템플릿을 채워 넣는다
   - 요구사항 출처(RFP 페이지/섹션)를 명시한다
4. **사람에게 검토를 요청**한다
   - 작성한 내용을 요약해서 보여준다
   - 수정이 필요하면 반영한 후 다시 검토 요청
5. **사람이 승인하면** `./scripts/tag.sh review 요구사항정의서` 를 실행한다

---

## 설계 문서 작성 시

요구사항정의서가 `approved` 상태가 된 후 설계 문서를 작성한다.

| 문서 | 템플릿 | 산출 위치 |
|------|--------|----------|
| 아키텍처설계서 | templates/아키텍처설계서.md | references/아키텍처설계서.md |
| DB설계서 | templates/DB설계서.md | references/DB설계서.md |
| API명세서 | templates/API명세서.md | references/API명세서.md |
| 테스트시나리오 | templates/테스트시나리오.md | references/테스트시나리오.md |

각 문서도 동일하게: **작성 → 검토 요청 → 승인 → 태그** 순서로 진행한다.

---

## 문서 버전 관리

```bash
./scripts/tag.sh review <문서명>    # 검토 요청 (고객에게 보내기 전)
./scripts/tag.sh approved <문서명>  # 고객 승인 완료
./scripts/tag.sh list               # 태그 목록 확인
```

tag.sh 실행 시 `review`와 `approved` 모두 PDF를 자동 생성한다.
수동으로 재생성이 필요하면:
```bash
./scripts/export-pdf.sh <문서명> [review|approved]
```

---

## 문서 변경 원칙

- 코드 변경이 스펙과 달라지면 **코드보다 문서를 먼저 수정**한다
- 문서를 수정하면 반드시 사람에게 확인을 받은 후 태그를 생성한다
- `references/` 의 마크다운이 항상 마스터다. `snapshots/` 의 PDF는 납품용 사본이다

---

## 프로젝트 기준 정보

→ `PROJECT.md` 참조

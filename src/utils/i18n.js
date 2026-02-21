'use strict';

const messages = {
  ko: {
    create: {
      creating: (name) => `\n📁 프로젝트 생성 중: ${name}`,
      gitDone: '✅ git 저장소 초기화 완료',
      gitFail: '⚠️  git 초기화 실패. 수동으로 진행해주세요.',
      alreadyExists: (dir) => `오류: ${dir} 에 이미 spec-repo가 존재합니다.`,
      done: (name) => `
✅ ${name} 생성 완료

📂 구조:
  SKILL.md          에이전트 스킬 진입점
  PROJECT.md        프로젝트 기준 정보 (기술스택, 컨벤션)
  00-rfp/           수신한 RFP 파일 보관
  references/       산출물 문서 (마크다운)
  templates/        문서 템플릿
  scripts/          태깅, PDF 변환 등 자동화 스크립트
  snapshots/        고객 납품용 PDF 스냅샷

👉 다음 단계:
  1. PROJECT.md 를 프로젝트에 맞게 채워주세요
  2. RFP 파일을 받으면: spec-repo intake <rfp파일>
`,
    },
    intake: {
      noRepo: 'spec-repo 프로젝트 루트를 찾을 수 없습니다. (SKILL.md 없음)\n먼저 spec-repo create 를 실행하세요.',
      unsupportedExt: '지원하지 않는 파일 형식입니다. (지원: .md, .pdf)',
      fileNotFound: (f) => `파일을 찾을 수 없습니다: ${f}`,
      extracting: '📄 PDF 텍스트 추출 중...',
      extractFailed: '⚠️  PDF 텍스트 추출 실패. PDF 파일을 직접 분석합니다.',
      saved: (p) => `✅ 파일 저장됨: ${p}`,
      agentHeader: '📋 에이전트 분석 지시',
      agentSubtitle: '다음 지시를 에이전트(Claude Code 등)에 전달하세요:',
      rfpLabel: '제안요청서(RFP)',
      supplementLabel: '참고 문서',
      agentInstructions: (filePath, docTypeLabel, hasTemplate) => `
Read("${filePath}") 로 파일을 읽어라.

이 문서는 ${docTypeLabel}다.
다음 순서로 진행해라:

1. 문서 전체를 분석하여 핵심 요구사항을 파악한다
2. references/요구사항정의서.md 파일이 없으면 templates/요구사항정의서.md 를 복사해서 생성한다${hasTemplate ? '\n   - 문서 구조는 templates/요구사항정의서.md 를 기준으로 한다' : ''}
3. 파악한 요구사항을 바탕으로 references/요구사항정의서.md 를 작성한다
   - 미확인 사항은 [NEEDS CLARIFICATION: ...] 로 표시한다
   - RFP 원문의 섹션/페이지를 출처로 명시한다
4. 작성 완료 후 나(사람)에게 검토를 요청한다
   - 변경된 내용을 요약해서 보여준다
   - 승인하면 ./scripts/tag.sh review 요구사항정의서 를 실행한다
`,
      agentInstructionsPdfFallback: (filePath, docTypeLabel, hasTemplate) => `
⚠️  PDF 텍스트 자동 추출에 실패했다. PDF를 직접 읽어 처리해라:

Read("${filePath}") 로 파일을 읽는다 (파일이 크면 실패할 수 있다).
실패하면 사용자에게 알리고 텍스트 버전(.txt) 제공을 요청한다.

이 문서는 ${docTypeLabel}다.
텍스트를 읽은 후 다음 순서로 진행해라:

1. 문서 전체를 분석하여 핵심 요구사항을 파악한다
2. references/요구사항정의서.md 파일이 없으면 templates/요구사항정의서.md 를 복사해서 생성한다${hasTemplate ? '\n   - 문서 구조는 templates/요구사항정의서.md 를 기준으로 한다' : ''}
3. 파악한 요구사항을 바탕으로 references/요구사항정의서.md 를 작성한다
   - 미확인 사항은 [NEEDS CLARIFICATION: ...] 로 표시한다
   - RFP 원문의 섹션/페이지를 출처로 명시한다
4. 작성 완료 후 나(사람)에게 검토를 요청한다
   - 변경된 내용을 요약해서 보여준다
   - 승인하면 ./scripts/tag.sh review 요구사항정의서 를 실행한다
`,
    },
  },

  en: {
    create: {
      creating: (name) => `\n📁 Creating project: ${name}`,
      gitDone: '✅ Git repository initialized',
      gitFail: '⚠️  Git init failed. Please initialize manually.',
      alreadyExists: (dir) => `Error: spec-repo already exists at ${dir}`,
      done: (name) => `
✅ ${name} created

📂 Structure:
  SKILL.md          Agent skill entry point
  PROJECT.md        Project reference (tech stack, conventions)
  00-rfp/           Received RFP files
  references/       Spec documents (markdown)
  templates/        Document templates
  scripts/          Tagging, PDF export automation
  snapshots/        Approved PDF snapshots for delivery

👉 Next steps:
  1. Fill in PROJECT.md for your project
  2. When you receive an RFP: spec-repo intake <rfp-file>
`,
    },
    intake: {
      noRepo: 'spec-repo project root not found. (No SKILL.md)\nRun spec-repo create first.',
      unsupportedExt: 'Unsupported file type. (Supported: .md, .pdf)',
      fileNotFound: (f) => `File not found: ${f}`,
      saved: (p) => `✅ File saved: ${p}`,
      extracting: '📄 Extracting text from PDF...',
      extractFailed: '⚠️  PDF text extraction failed. Will pass PDF path directly.',
      agentHeader: '📋 Agent Analysis Instructions',
      agentSubtitle: 'Pass the following instructions to your agent (Claude Code, etc.):',
      rfpLabel: 'Request for Proposal (RFP)',
      supplementLabel: 'supplementary document',
      agentInstructions: (filePath, docTypeLabel, hasTemplate) => `
Read("${filePath}").

This document is a ${docTypeLabel}.
Follow these steps:

1. Analyze the full document and identify the key requirements
2. If references/requirements.md does not exist, copy templates/requirements.md to create it${hasTemplate ? '\n   - Follow the structure defined in templates/requirements.md' : ''}
3. Write references/requirements.md based on the requirements found
   - Mark unclear items as [NEEDS CLARIFICATION: ...]
   - Reference the source section/page from the RFP
4. When done, ask me (human) to review
   - Summarize what changed
   - On approval, run: ./scripts/tag.sh review requirements
`,
      agentInstructionsPdfFallback: (filePath, docTypeLabel, hasTemplate) => `
⚠️  Automatic PDF text extraction failed. Read the PDF directly:

Read("${filePath}") — note: this may fail for large PDFs.
If it fails, inform the user and ask them to provide a text version (.txt).

This document is a ${docTypeLabel}.
After reading the text, follow these steps:

1. Analyze the full document and identify the key requirements
2. If references/requirements.md does not exist, copy templates/requirements.md to create it${hasTemplate ? '\n   - Follow the structure defined in templates/requirements.md' : ''}
3. Write references/requirements.md based on the requirements found
   - Mark unclear items as [NEEDS CLARIFICATION: ...]
   - Reference the source section/page from the RFP
4. When done, ask me (human) to review
   - Summarize what changed
   - On approval, run: ./scripts/tag.sh review requirements
`,
    },
  },
};

/**
 * 시스템 로케일 기반으로 언어 자동 감지
 */
function detectLang() {
  const locale = process.env.LANG || process.env.LC_ALL || process.env.LC_MESSAGES || '';
  return locale.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

/**
 * @param {'ko'|'en'|undefined} lang
 */
function getMessages(lang) {
  const resolved = lang || detectLang();
  return messages[resolved] || messages.en;
}

module.exports = { getMessages, detectLang };

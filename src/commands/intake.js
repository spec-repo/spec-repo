'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');

const m = {
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
};

const intake = new Command('intake');

intake
  .description('RFP 또는 참고 문서 수신')
  .argument('<file>', '파일 경로 (.md 또는 .pdf)')
  .option('--type <type>', '문서 유형: rfp | supplement', 'rfp')
  .option('--dest <dir>', '저장 디렉토리 [00-rfp]', '00-rfp')
  .action(async (file, options) => {
    const repoRoot = findRepoRoot(process.cwd());

    if (!repoRoot) {
      console.error('Error: ' + m.noRepo);
      process.exit(1);
    }

    const ext = path.extname(file).toLowerCase();
    if (!['.md', '.pdf'].includes(ext)) {
      console.error('Error: ' + m.unsupportedExt);
      process.exit(1);
    }

    if (!fs.existsSync(file)) {
      console.error('Error: ' + m.fileNotFound(file));
      process.exit(1);
    }

    const destDir = path.join(repoRoot, options.dest);
    fs.mkdirSync(destDir, { recursive: true });

    const fileName = path.basename(file);
    const destPath = path.join(destDir, fileName);
    fs.copyFileSync(file, destPath);

    const relDest = path.relative(repoRoot, destPath);
    console.log(m.saved(relDest));

    // PDF인 경우 텍스트 추출 시도
    let readTarget = relDest;
    let pdfFallback = false;
    if (ext === '.pdf') {
      const txtPath = await extractPdfText(destPath);
      if (txtPath) {
        readTarget = path.relative(repoRoot, txtPath);
      } else {
        pdfFallback = true;
      }
    }

    printAgentInstructions(readTarget, options.type, repoRoot, pdfFallback);
  });

function findRepoRoot(dir) {
  let current = dir;
  while (current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, 'SKILL.md'))) return current;
    current = path.dirname(current);
  }
  return null;
}

/**
 * pdf-parse 로 PDF → TXT 추출.
 * 성공하면 생성된 .txt 경로 반환, 실패하면 null 반환.
 */
async function extractPdfText(pdfAbsPath) {
  try {
    console.log(m.extracting);
    const { PDFParse } = await import('pdf-parse');
    const buffer = fs.readFileSync(pdfAbsPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    const txtPath = pdfAbsPath.replace(/\.pdf$/i, '.txt');
    fs.writeFileSync(txtPath, result.text, 'utf-8');
    return txtPath;
  } catch {
    console.warn(m.extractFailed);
    return null;
  }
}

function printAgentInstructions(filePath, docType, repoRoot, pdfFallback = false) {
  const templateDir = path.join(repoRoot, 'templates');
  const hasTemplate = fs.existsSync(path.join(templateDir, '요구사항정의서.md'));

  const docTypeLabel = docType === 'rfp' ? m.rfpLabel : m.supplementLabel;
  const instructions = pdfFallback
    ? m.agentInstructionsPdfFallback(filePath, docTypeLabel, hasTemplate)
    : m.agentInstructions(filePath, docTypeLabel, hasTemplate);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${m.agentHeader}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${m.agentSubtitle}

---
${instructions}
---
`);
}

module.exports = intake;

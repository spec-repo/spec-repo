'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { getMessages } = require('../utils/i18n');

const intake = new Command('intake');

intake
  .description('RFP 또는 참고 문서 수신 / Receive RFP or reference document')
  .argument('<file>', '파일 경로 (.md 또는 .pdf) / file path (.md or .pdf)')
  .option('--type <type>', '문서 유형: rfp | supplement', 'rfp')
  .option('--dest <dir>', '저장 디렉토리 / destination dir  [00-rfp]', '00-rfp')
  .action(async (file, options) => {
    const repoRoot = findRepoRoot(process.cwd());
    const lang = repoRoot ? detectProjectLang(repoRoot) : undefined;
    const m = getMessages(lang);

    if (!repoRoot) {
      console.error('Error: ' + m.intake.noRepo);
      process.exit(1);
    }

    const ext = path.extname(file).toLowerCase();
    if (!['.md', '.pdf'].includes(ext)) {
      console.error('Error: ' + m.intake.unsupportedExt);
      process.exit(1);
    }

    if (!fs.existsSync(file)) {
      console.error('Error: ' + m.intake.fileNotFound(file));
      process.exit(1);
    }

    const destDir = path.join(repoRoot, options.dest);
    fs.mkdirSync(destDir, { recursive: true });

    const fileName = path.basename(file);
    const destPath = path.join(destDir, fileName);
    fs.copyFileSync(file, destPath);

    const relDest = path.relative(repoRoot, destPath);
    console.log(m.intake.saved(relDest));

    // PDF인 경우 텍스트 추출 시도
    let readTarget = relDest;
    let pdfFallback = false;
    if (ext === '.pdf') {
      const txtPath = await extractPdfText(destPath, m);
      if (txtPath) {
        readTarget = path.relative(repoRoot, txtPath);
      } else {
        pdfFallback = true;
      }
    }

    printAgentInstructions(readTarget, options.type, repoRoot, m, pdfFallback);
  });

function findRepoRoot(dir) {
  let current = dir;
  while (current !== path.parse(current).root) {
    if (fs.existsSync(path.join(current, 'SKILL.md'))) return current;
    current = path.dirname(current);
  }
  return null;
}

/** SKILL.md 내용으로 프로젝트 언어 추측 (한글 포함 여부) */
function detectProjectLang(repoRoot) {
  try {
    const content = fs.readFileSync(path.join(repoRoot, 'SKILL.md'), 'utf-8');
    return /references\/요구사항정의서/.test(content) ? 'ko' : 'en';
  } catch {
    return undefined;
  }
}

/**
 * pdf-parse 로 PDF → TXT 추출.
 * 성공하면 생성된 .txt 경로 반환, 실패하면 null 반환.
 */
async function extractPdfText(pdfAbsPath, m) {
  try {
    console.log(m.intake.extracting);
    const { PDFParse } = await import('pdf-parse');
    const buffer = fs.readFileSync(pdfAbsPath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    const txtPath = pdfAbsPath.replace(/\.pdf$/i, '.txt');
    fs.writeFileSync(txtPath, result.text, 'utf-8');
    return txtPath;
  } catch {
    console.warn(m.intake.extractFailed);
    return null;
  }
}

function printAgentInstructions(filePath, docType, repoRoot, m, pdfFallback = false) {
  const templateDir = path.join(repoRoot, 'templates');
  // 언어에 맞는 템플릿 파일명 확인
  const hasKoTemplate = fs.existsSync(path.join(templateDir, '요구사항정의서.md'));
  const hasEnTemplate = fs.existsSync(path.join(templateDir, 'requirements.md'));
  const hasTemplate = hasKoTemplate || hasEnTemplate;

  const docTypeLabel = docType === 'rfp' ? m.intake.rfpLabel : m.intake.supplementLabel;
  const instructions = pdfFallback
    ? m.intake.agentInstructionsPdfFallback(filePath, docTypeLabel, hasTemplate)
    : m.intake.agentInstructions(filePath, docTypeLabel, hasTemplate);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${m.intake.agentHeader}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${m.intake.agentSubtitle}

---
${instructions}
---
`);
}

module.exports = intake;

#!/usr/bin/env bash
# extract-pdf.sh — PDF에서 텍스트 추출 (Node.js / pdf-parse)
#
# 사전 요건: Node.js, pdf-parse (npm install)
#
# 사용법:
#   ./scripts/extract-pdf.sh <파일.pdf>
#   → 같은 위치에 <파일.txt> 생성
#
# 예시:
#   ./scripts/extract-pdf.sh 00-rfp/제안요청서.pdf
#   → 00-rfp/제안요청서.txt 생성

set -e

PDF_FILE="${1:-}"

if [ -z "$PDF_FILE" ]; then
  echo "사용법: $0 <파일.pdf>"
  exit 1
fi

if [ ! -f "$PDF_FILE" ]; then
  echo "오류: 파일을 찾을 수 없습니다: $PDF_FILE"
  exit 1
fi

if ! command -v node &>/dev/null; then
  echo "오류: Node.js가 설치되어 있지 않습니다."
  echo "설치: https://nodejs.org/"
  exit 1
fi

TXT_FILE="${PDF_FILE%.pdf}.txt"

echo "추출 중: $PDF_FILE → $TXT_FILE"

node -e "
(async () => {
  const fs = require('fs');
  let PDFParse;
  try {
    ({ PDFParse } = await import('pdf-parse'));
  } catch (e) {
    console.error('오류: pdf-parse 를 찾을 수 없습니다.');
    console.error('프로젝트 루트에서 npm install 을 실행하세요.');
    process.exit(1);
  }
  const buf = fs.readFileSync(process.argv[1]);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  await parser.destroy();
  fs.writeFileSync(process.argv[2], result.text, 'utf-8');
  const lines = result.text.split('\n').length;
  process.stderr.write('✅ 완료: ' + process.argv[2] + ' (' + lines + ' 줄)\n');
})();
" "$PDF_FILE" "$TXT_FILE"

#!/usr/bin/env bash
# extract-pdf.sh — Extract text from a PDF file (Node.js / pdf-parse)
#
# Prerequisites: Node.js, pdf-parse (npm install)
#
# Usage:
#   ./scripts/extract-pdf.sh <file.pdf>
#   → Produces <file.txt> in the same directory
#
# Example:
#   ./scripts/extract-pdf.sh 00-rfp/rfp.pdf
#   → Produces 00-rfp/rfp.txt

set -e

PDF_FILE="${1:-}"

if [ -z "$PDF_FILE" ]; then
  echo "Usage: $0 <file.pdf>"
  exit 1
fi

if [ ! -f "$PDF_FILE" ]; then
  echo "Error: file not found: $PDF_FILE"
  exit 1
fi

if ! command -v node &>/dev/null; then
  echo "Error: Node.js is not installed."
  echo "Install: https://nodejs.org/"
  exit 1
fi

TXT_FILE="${PDF_FILE%.pdf}.txt"

echo "Extracting: $PDF_FILE → $TXT_FILE"

node -e "
(async () => {
  const fs = require('fs');
  let PDFParse;
  try {
    ({ PDFParse } = await import('pdf-parse'));
  } catch (e) {
    console.error('Error: pdf-parse not found.');
    console.error('Run npm install in the project root.');
    process.exit(1);
  }
  const buf = fs.readFileSync(process.argv[1]);
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText();
  await parser.destroy();
  fs.writeFileSync(process.argv[2], result.text, 'utf-8');
  const lines = result.text.split('\n').length;
  process.stderr.write('✅ Done: ' + process.argv[2] + ' (' + lines + ' lines)\n');
})();
" "$PDF_FILE" "$TXT_FILE"

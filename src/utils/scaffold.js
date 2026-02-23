'use strict';

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function scaffoldProject(targetDir, projectName) {
  const scaffoldSrc = path.join(__dirname, '../../scaffold');

  // 디렉토리 구조 생성
  const dirs = [
    '00-rfp',
    'snapshots',
    'references',
    'scripts',
    'templates',
  ];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(targetDir, dir), { recursive: true });
  }

  // scaffold 파일 복사
  copyDir(scaffoldSrc, targetDir);

  // 루트의 모든 .md 파일에서 {{PROJECT_NAME}}, {{DATE}} 치환
  const today = new Date().toISOString().split('T')[0];
  for (const file of fs.readdirSync(targetDir)) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(targetDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content
      .replace(/\{\{PROJECT_NAME\}\}/g, projectName)
      .replace(/\{\{DATE\}\}/g, today);
    fs.writeFileSync(filePath, content);
  }

  // scripts 실행 권한 부여
  const scriptsDir = path.join(targetDir, 'scripts');
  if (fs.existsSync(scriptsDir)) {
    for (const file of fs.readdirSync(scriptsDir)) {
      if (file.endsWith('.sh')) {
        fs.chmodSync(path.join(scriptsDir, file), 0o755);
      }
    }
  }
}

module.exports = { scaffoldProject };

'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { scaffoldProject } = require('../utils/scaffold');
const { getMessages } = require('../utils/i18n');

const create = new Command('create');

create
  .description('새 spec-repo 프로젝트 생성 / Create a new spec-repo project')
  .argument('[project-name]', '프로젝트명 (생략 시 현재 디렉토리) / project name (omit for current dir)')
  .option('--no-git', 'git 저장소 초기화 건너뜀 / skip git init')
  .option('--lang <lang>', '언어 선택: ko | en  (기본: 시스템 로케일 자동 감지)')
  .action((projectName, options) => {
    const lang = normalizeLang(options.lang);
    const m = getMessages(lang);
    const cwd = process.cwd();
    let targetDir;
    let resolvedName;

    if (!projectName || projectName === '.') {
      targetDir = cwd;
      resolvedName = path.basename(cwd);
    } else {
      targetDir = path.join(cwd, projectName);
      resolvedName = projectName;
    }

    if (fs.existsSync(path.join(targetDir, 'SKILL.md'))) {
      console.error(m.create.alreadyExists(targetDir));
      process.exit(1);
    }

    fs.mkdirSync(targetDir, { recursive: true });

    console.log(m.create.creating(resolvedName));
    scaffoldProject(targetDir, resolvedName, lang);

    // pdf-parse 등 프로젝트 의존성 설치
    const { execSync } = require('child_process');
    try {
      execSync('npm install', { cwd: targetDir, stdio: 'ignore' });
    } catch {
      // 설치 실패해도 프로젝트 생성은 계속 진행
    }

    if (options.git) {
      const { execSync } = require('child_process');
      try {
        execSync('git init', { cwd: targetDir, stdio: 'ignore' });
        execSync('git add .', { cwd: targetDir, stdio: 'ignore' });
        execSync(`git commit -m "init: ${resolvedName} spec-repo"`, {
          cwd: targetDir,
          stdio: 'ignore',
        });
        console.log(m.create.gitDone);
      } catch {
        console.warn(m.create.gitFail);
      }
    }

    console.log(m.create.done(resolvedName));
  });

function normalizeLang(input) {
  if (!input) return undefined; // i18n.js의 detectLang()에 위임
  const l = input.toLowerCase();
  if (l === 'ko' || l === 'korean') return 'ko';
  if (l === 'en' || l === 'english') return 'en';
  console.warn(`Unknown --lang "${input}", falling back to auto-detect.`);
  return undefined;
}

module.exports = create;

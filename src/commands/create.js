'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { scaffoldProject } = require('../utils/scaffold');

const m = {
  alreadyExists: (dir) => `오류: ${dir} 에 이미 spec-repo가 존재합니다.`,
  creating: (name) => `\n📁 프로젝트 생성 중: ${name}`,
  gitDone: '✅ git 저장소 초기화 완료',
  gitFail: '⚠️  git 초기화 실패. 수동으로 진행해주세요.',
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
  2. RFP 파일을 받으면: /specrepo-intake <rfp파일> (에이전트 슬래시 커맨드)
`,
};

const create = new Command('create');

create
  .description('새 spec-repo 프로젝트 생성')
  .argument('[project-name]', '프로젝트명 (생략 시 현재 디렉토리)')
  .option('--no-git', 'git 저장소 초기화 건너뜀')
  .action((projectName, options) => {
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
      console.error(m.alreadyExists(targetDir));
      process.exit(1);
    }

    fs.mkdirSync(targetDir, { recursive: true });

    console.log(m.creating(resolvedName));
    scaffoldProject(targetDir, resolvedName);

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
        console.log(m.gitDone);
      } catch {
        console.warn(m.gitFail);
      }
    }

    console.log(m.done(resolvedName));
  });

module.exports = create;

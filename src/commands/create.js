'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { scaffoldProject } = require('../utils/scaffold');

const b = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;

const m = {
  alreadyExists: (dir) => `\x1b[31merror\x1b[0m  ${dir} 에 이미 spec-repo가 존재합니다.`,
  creating: (name) => `\n  ${dim('spec-repo')}  ${b(name)}\n`,
  gitDone: `  ${green('✓')} git 초기화`,
  gitFail: `  ${dim('!')} git 초기화 실패 (수동으로 진행해주세요)`,
  done: (name) => `
  ${green('✓')} ${b(name)} 생성 완료

  ${b('구조')}
  references/
  ├─ 00-rfp/            ${dim('RFP 원본')}
  ├─ 01-requirements/   ${dim('요구사항정의서')}
  ├─ 02-design/         ${dim('설계 문서 (아키텍처, DB, API)')}
  ├─ 03-test/           ${dim('테스트 시나리오')}
  ├─ 04-ops/            ${dim('운영/배포 문서')}
  └─ 05-mgmt/           ${dim('관리 문서')}
  scripts/              ${dim('태깅, PDF 변환 자동화')}
  snapshots/            ${dim('납품용 스냅샷 (gitignore)')}

  ${b('다음 단계')}
  1  사용 중인 에이전트에서 ${cyan('/spec-import')} ${dim('<파일>')} 을 실행하세요
     문서 파일(pdf/docx/hwpx/xlsx/md)을 전달하면 마스터로 변환·등록합니다
  2  사용법 확인: ${cyan('/spec-help')}
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

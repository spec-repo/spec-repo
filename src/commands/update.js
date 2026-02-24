'use strict';

const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const { version } = require('../../package.json');
const { copyDir } = require('../utils/scaffold');

function findProjectRoot(startDir) {
  let current = startDir;
  for (let i = 0; i < 10; i++) {
    if (
      fs.existsSync(path.join(current, '.agents', 'skills')) ||
      fs.existsSync(path.join(current, '.claude', 'skills')) ||
      fs.existsSync(path.join(current, 'SKILL.md'))
    ) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

const update = new Command('update');

update
  .description('프로젝트의 spec-repo 스킬을 최신 버전으로 업데이트')
  .action(() => {
    const projectRoot = findProjectRoot(process.cwd());
    if (!projectRoot) {
      console.error('오류: spec-repo 프로젝트를 찾을 수 없습니다.');
      console.error('spec-repo 프로젝트 디렉토리 안에서 실행해주세요.');
      process.exit(1);
    }

    const skillsSrc = path.join(__dirname, '../../skills');
    if (!fs.existsSync(skillsSrc)) {
      console.error('오류: 스킬 소스를 찾을 수 없습니다.');
      process.exit(1);
    }

    const skillNames = fs.readdirSync(skillsSrc).filter((name) => {
      return fs.statSync(path.join(skillsSrc, name)).isDirectory();
    });

    const targets = [
      path.join(projectRoot, '.agents', 'skills'),
      path.join(projectRoot, '.claude', 'skills'),
    ].filter(fs.existsSync);

    if (targets.length === 0) {
      console.error('오류: 스킬 디렉토리(.agents/skills 또는 .claude/skills)가 없습니다.');
      process.exit(1);
    }

    for (const target of targets) {
      for (const skillName of skillNames) {
        copyDir(path.join(skillsSrc, skillName), path.join(target, skillName));
      }
    }

    console.log(`\n✅ 스킬 업데이트 완료 (spec-repo v${version})`);
    console.log(`   프로젝트: ${projectRoot}`);
    console.log(`   업데이트된 스킬:`);
    for (const name of skillNames) {
      console.log(`     - ${name}`);
    }
    console.log('\n에이전트를 재시작하면 변경 사항이 반영됩니다.');
  });

module.exports = update;

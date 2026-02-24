#!/usr/bin/env node

'use strict';

const { program } = require('commander');
const { version } = require('../package.json');

program
  .name('spec-repo')
  .description('AI-friendly spec document management for SI projects')
  .version(version);

program.addCommand(require('../src/commands/create'));
program.addCommand(require('../src/commands/update'));

program.parse();

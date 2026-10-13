import { readFile, mkdir, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const files = ['src/core/router.js', 'src/core/dom.js', 'src/pages/login.js', 'src/pages/modules.js', 'src/pages/student.js', 'src/pages/ava.js', 'src/pages/ava-report.js', 'src/pages/credit.js', 'src/main.js'];
const parts = await Promise.all(files.map(file => readFile(new URL(file, root), 'utf8')));
const cssFiles = {
  login: ['login'],
  modules: ['common', 'modules'],
  student: ['common', 'student'],
  ava: ['ava'],
  avaReport: ['ava-report'],
  credit: ['common', 'credit']
};
const cssNames = [...new Set(Object.values(cssFiles).flat())];
const cssSources = Object.fromEntries(await Promise.all(cssNames.map(async name => [
  name,
  await readFile(new URL(`src/styles/${name}.css`, root), 'utf8')
])));
const metadata = `// ==UserScript==
// @name         Material SIGAA
// @namespace    https://github.com/meursault03/material-sigaa
// @version      ${version}
// @description  Interface moderna para o SIGAA/UFC
// @match        *://si3.ufc.br/sigaa/*
// @match        *://www.si3.ufc.br/sigaa/*
// @run-at       document-end
// @grant        none
// ==/UserScript==\n`;
const output = `${metadata}\n(() => {\n'use strict';\nconst STYLE_CSS = ${JSON.stringify(cssSources)};\nconst PAGE_CSS = ${JSON.stringify(cssFiles)};\n${parts.join('\n')}\n})();\n`;
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/material-sigaa.user.js', root), output);

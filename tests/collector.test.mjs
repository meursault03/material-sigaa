import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const script = await readFile(new URL('../scripts/extract-sigaa-console.js', import.meta.url), 'utf8');

test('o JSON inteiro oculta código inline e valores de campos sensíveis sem mudar a página', async t => {
  const secrets = ['SCRIPT_TOKEN_FICTICIO', 'QUOTED_TOKEN_FICTICIO', 'PASSWORD_FICTICIO',
    'TEXTAREA_SECRET_FICTICIO', 'SELECT_SECRET_FICTICIO', 'VIEWSTATE_FICTICIO', 'URL_TOKEN_FICTICIO',
    'URL_SESSION_FICTICIO', 'BUTTON_SECRET_FICTICIO'];
  const dom = new JSDOM(`<!doctype html><html data-token="${secrets[0]}"><head>
    <style>body { background-image: url('/sigaa/img.png?token=${secrets[6]}'); }</style>
    </head><body>
    <script>const token = "${secrets[0]}"; const data = {"token":"${secrets[1]}"};</script>
    <form action="/sigaa/exemplo.jsf?token=${secrets[6]}" method="post">
      <input type="password" name="user.senha" value="${secrets[2]}">
      <input type="hidden" name="javax.faces.ViewState" value="${secrets[5]}">
      <table><tr><td><textarea name="csrf">${secrets[3]}</textarea></td></tr></table>
      <select name="auth"><option value="${secrets[4]}">${secrets[4]}</option></select>
      <button name="csrf" value="${secrets[8]}"><span>${secrets[8]}</span></button>
      <input name="atividade" value="Atividade de extensão">
    </form>
    <a href="/sigaa/exemplo.jsf?token=${secrets[6]}&token=${secrets[6]}&session=${secrets[7]}&id=42"
      onclick="const token = '${secrets[0]}'" data-token="${secrets[0]}">Abrir atividade</a>
    <div style="background-image:url('/sigaa/img.png?token=${secrets[6]}')">Referência visual</div>
  </body></html>`, { url: 'https://si3.ufc.br/sigaa/exemplo.jsf', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  const before = window.document.documentElement.outerHTML;
  Object.defineProperty(window.document.body, 'innerText', { value: `Abrir atividade ${secrets[3]}` });
  window.Blob = Blob;
  let blob;
  window.URL.createObjectURL = value => { blob = value; return 'blob:teste'; };
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = () => {};
  window.performance.getEntriesByType = () => [];
  const array = window.Array.prototype;
  Object.defineProperty(array, 'toJSON', { configurable: true, writable: true, value() { return 'prototype'; } });
  const toJSON = Object.getOwnPropertyDescriptor(array, 'toJSON');
  await window.eval(script);
  const json = await blob.text();
  for (const secret of secrets) assert(!json.includes(secret), `segredo reapareceu no relatório: ${secret}`);
  const report = JSON.parse(json);
  assert(Array.isArray(report.page.forms));
  assert.equal(report.page.forms[0].fields.find(field => field.name === 'atividade').value, 'Atividade de extensão');
  assert(report.page.links[0].href.includes('id=42'));
  assert.equal(window.document.documentElement.outerHTML, before);
  assert.deepEqual(Object.getOwnPropertyDescriptor(array, 'toJSON'), toJSON);
});

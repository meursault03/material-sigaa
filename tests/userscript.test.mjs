import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { JSDOM } from 'jsdom';

const root = new URL('../', import.meta.url);
const script = await readFile(new URL('dist/material-sigaa.user.js', root), 'utf8');
const pages = {
  login: 'login', modules: 'modules', student: 'student', credit: 'credit',
  ava: 'ava', 'ava-intro': 'ava', 'ava-secondary': 'ava', 'ava-report': 'avaReport'
};
const fixtures = Object.fromEntries(await Promise.all(Object.keys(pages).map(async name => [
  name, await readFile(new URL(`fixtures/${name}.html`, root), 'utf8')
])));
const url = 'https://si3.ufc.br/sigaa/portais/discente/discente.jsf';
const settle = window => new Promise(resolve => window.setTimeout(resolve, 180));

function formState(doc) {
  return [...doc.forms].map(form => ({
    name: form.name, id: form.id, action: form.action, method: form.method,
    fields: [...form.elements].map(field => ({
      name: field.name, type: field.type, value: field.value,
      disabled: field.disabled, checked: field.checked, form: field.form?.id
    })),
    links: [...form.querySelectorAll('a')].map(link => ({
      href: link.getAttribute('href'), onclick: link.getAttribute('onclick')
    }))
  }));
}

for (const [fixture, page] of Object.entries(pages)) {
  test(`${fixture}: reconhece a tela, preserva formulários e é idempotente`, async t => {
    const dom = new JSDOM(fixtures[fixture], { url, runScripts: 'outside-only' });
    t.after(() => dom.window.close());
    const { document } = dom.window;
    const before = formState(document);
    const forms = [...document.forms];
    dom.window.eval(script);
    await settle(dom.window);
    assert.equal(document.getElementById('material-sigaa-styles')?.dataset.materialSigaaPage, page);
    const first = document.body.outerHTML;
    document.body.append(document.createElement('div'));
    document.body.lastChild.remove();
    await settle(dom.window);
    assert.equal(document.body.outerHTML, first);
    assert.deepEqual(formState(document), before);
    assert.deepEqual([...document.forms], forms);
    assert.equal(document.querySelectorAll('#material-sigaa-styles').length, 1);
  });
}

test('troca de adapter e limpa CSS em uma tela desconhecida após atualização parcial', async t => {
  const dom = new JSDOM(fixtures.student, { url, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { document } = dom.window;
  document.body.classList.add('classe-original');
  dom.window.eval(script);
  const credit = new dom.window.DOMParser().parseFromString(fixtures.credit, 'text/html');
  document.getElementById('conteudo').replaceWith(credit.getElementById('conteudo'));
  await settle(dom.window);
  assert(document.body.classList.contains('material-sigaa-credit'));
  assert(!document.body.classList.contains('material-sigaa-student'));
  document.getElementById('conteudo').innerHTML = '<p>Tela sem adapter</p>';
  await settle(dom.window);
  assert.equal(document.getElementById('material-sigaa-styles'), null);
  assert.equal(document.getElementById('material-sigaa-icons'), null);
  assert.equal(document.body.className, 'classe-original');
});

test('AVA inicial reconhece uma nova tela dentro do container sem trocar o body', async t => {
  const dom = new JSDOM('<div id="shell"></div>', { url, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const ava = new dom.window.DOMParser().parseFromString(fixtures.ava, 'text/html');
  dom.window.document.getElementById('shell').innerHTML = ava.body.innerHTML;
  dom.window.eval(script);
  const credit = new dom.window.DOMParser().parseFromString(fixtures.credit, 'text/html');
  dom.window.document.getElementById('shell').innerHTML = credit.body.innerHTML;
  await settle(dom.window);
  assert.equal(dom.window.document.getElementById('material-sigaa-styles')?.dataset.materialSigaaPage, 'credit');
  assert(!dom.window.document.body.classList.contains('material-sigaa-ava'));
});

test('uma página fora de /sigaa/ fica sem adaptação', t => {
  const dom = new JSDOM(fixtures.login, { url: 'https://si3.ufc.br/outro/', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const before = dom.window.document.body.outerHTML;
  dom.window.eval(script);
  assert.equal(dom.window.document.body.outerHTML, before);
  assert.equal(dom.window.document.getElementById('material-sigaa-styles'), null);
});

test('textos de status não repetem a identificação, mas novas estruturas JSF são reconhecidas', async t => {
  const dom = new JSDOM('<main id="conteudo"><span id="status">Carregando</span></main>', {
    url, runScripts: 'outside-only'
  });
  t.after(() => dom.window.close());
  const { document } = dom.window;
  const querySelector = document.querySelector.bind(document);
  let queries = 0;
  document.querySelector = (...args) => {
    queries++;
    return querySelector(...args);
  };
  dom.window.eval(script);
  const initialQueries = queries;
  document.getElementById('status').textContent = 'Pronto';
  await settle(dom.window);
  assert.equal(queries, initialQueries);
  assert.equal(document.getElementById('material-sigaa-styles'), null);
  const student = new dom.window.DOMParser().parseFromString(fixtures.student, 'text/html');
  document.getElementById('conteudo').replaceWith(student.getElementById('conteudo'));
  await settle(dom.window);
  assert.equal(document.getElementById('material-sigaa-styles')?.dataset.materialSigaaPage, 'student');
});

test('login volta a ser adaptado quando o mesmo formulário reaparece', async t => {
  const dom = new JSDOM(fixtures.login, { url, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { document } = dom.window;
  dom.window.eval(script);
  const form = document.forms.namedItem('loginForm');
  const parent = form.parentElement;
  form.remove();
  await settle(dom.window);
  assert.equal(document.getElementById('material-sigaa-styles'), null);
  parent.append(form);
  await settle(dom.window);
  assert(document.body.classList.contains('material-sigaa-login'));
  assert.equal(document.querySelectorAll('label[for="material-sigaa-user"]').length, 1);
  assert.equal(form.querySelector('input[name="user.login"]').labels[0].textContent, 'Usuário');
});

test('atualiza a disponibilidade dos módulos quando os atributos do link mudam', async t => {
  const dom = new JSDOM(fixtures.modules, { url, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { document } = dom.window;
  dom.window.eval(script);
  const link = document.querySelector('#portais li.discente > a');
  link.setAttribute('aria-disabled', 'true');
  await settle(dom.window);
  assert(link.parentElement.classList.contains('material-sigaa-unavailable'));
  link.removeAttribute('aria-disabled');
  link.setAttribute('href', 'javascript:void(0)');
  await settle(dom.window);
  assert(link.parentElement.classList.contains('material-sigaa-unavailable'));
  link.setAttribute('href', '/sigaa/verPortalDiscente.do');
  await settle(dom.window);
  assert(link.parentElement.classList.contains('material-sigaa-available'));
});

test('reaplica rótulos nos campos repostos dentro do mesmo formulário de login', async t => {
  const dom = new JSDOM(fixtures.login, { url, runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { document } = dom.window;
  dom.window.eval(script);
  const input = document.querySelector('input[name="user.login"]');
  const replacement = input.cloneNode();
  replacement.removeAttribute('id');
  input.closest('tr').querySelector('th').textContent = 'Usuário:';
  input.replaceWith(replacement);
  await settle(dom.window);
  assert.equal(replacement.labels.length, 1);
  assert.equal(replacement.labels[0].textContent, 'Usuário');
  const before = document.body.outerHTML;
  document.body.append(document.createElement('div'));
  document.body.lastChild.remove();
  await settle(dom.window);
  assert.equal(document.body.outerHTML, before);
});

test('a versão do artefato acompanha package.json', async () => {
  const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  assert(script.includes(`// @version      ${version}\n`));
});

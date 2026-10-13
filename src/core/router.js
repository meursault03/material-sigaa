function detectPage(doc = document, path = location.pathname) {
  const form = doc.forms.namedItem('loginForm');
  if (
    path.startsWith('/sigaa/') &&
    form &&
    form.querySelector('input[name="user.login"]') &&
    form.querySelector('input[name="user.senha"]') &&
    form.action.includes('/sigaa/logar.do')
  ) return 'login';
  if (
    path.startsWith('/sigaa/') &&
    doc.querySelector('#menu_principal > #modulos > ul') &&
    doc.querySelector('#menu_principal > #portais > ul')
  ) return 'modules';
  if (
    path.startsWith('/sigaa/') &&
    doc.querySelector('#barraEsquerda') &&
    doc.querySelector('#barraDireita') &&
    doc.querySelector('#conteudo') &&
    doc.querySelector('#nomeTurma') &&
    doc.querySelector('form#formMenu')
  ) return 'ava';
  if (
    path.startsWith('/sigaa/') &&
    doc.querySelector('#relatorio-paisagem-container .tabelaRelatorio')
  ) return 'avaReport';
  if (
    path.startsWith('/sigaa/') &&
    doc.querySelector('#conteudo form#form #submetidas') &&
    doc.querySelector('#conteudo form#form #acompanhamentoHoras')
  ) return 'credit';
  if (
    path.startsWith('/sigaa/portais/discente/') &&
    doc.querySelector('#portal-docente > #main-docente') &&
    doc.querySelector('#portal-docente > #perfil-docente')
  ) return 'student';
  return null;
}

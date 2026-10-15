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
  if (path.startsWith('/sigaa/')) {
    const content = doc.getElementById('conteudo');
    const title = content?.querySelector(':scope > h2, :scope > form > h2')?.textContent.replace(/\s+/g, ' ').trim() || '';
    if (title.endsWith('> Consultar Progresso no Curso') &&
        content.querySelector('#progressoObrigatorias') && content.querySelector('#progressoOptativas')) return 'progress';
    if (content?.querySelector('table.listagem')) {
      if (title.endsWith('> Todas as Turmas')) return 'classes';
      if (title.endsWith('> Consultar Histórico de IRA')) return 'ira';
      if (title.endsWith('> Consultar Pendências de Conclusão')) return 'completion';
    }
  }
  return null;
}

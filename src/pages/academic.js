function enhanceAcademic(page, doc = document) {
  doc.body.classList.add('material-sigaa-standard', 'material-sigaa-academic', `material-sigaa-${page}`);
  enhanceHeader(doc);
  const content = doc.getElementById('conteudo');
  // Permite rolar tabelas e diagramas largos pelo teclado.
  if (!content.hasAttribute('tabindex')) content.tabIndex = 0;
  for (const table of doc.querySelectorAll('#conteudo > table, #conteudo > form > table')) {
    if (table.caption) table.classList.add('material-sigaa-academic-table');
  }
  if (page === 'progress') {
    for (const svg of content.querySelectorAll('#progressoObrigatorias, #progressoOptativas')) {
      const region = svg.parentElement;
      region.classList.add('material-sigaa-progress-diagram');
      if (!region.hasAttribute('tabindex')) region.tabIndex = 0;
      if (!region.hasAttribute('role')) region.setAttribute('role', 'region');
      if (!region.hasAttribute('aria-label')) region.setAttribute('aria-label',
        svg.id === 'progressoObrigatorias' ? 'Disciplinas obrigatórias' : 'Disciplinas optativas');
    }
  }
}

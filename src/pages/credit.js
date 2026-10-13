function enhanceCredit(doc = document) {
  if (!doc.querySelector('#conteudo form#form #submetidas') ||
      !doc.querySelector('#conteudo form#form #acompanhamentoHoras')) return;
  doc.body.classList.add('material-sigaa-standard', 'material-sigaa-credit');
  enhanceHeader(doc);
}

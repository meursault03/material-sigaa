function enhanceAvaReport(doc = document) {
  if (!doc.querySelector('#relatorio-paisagem-container .tabelaRelatorio')) return;
  doc.body.classList.add('material-sigaa-ava-report');
}

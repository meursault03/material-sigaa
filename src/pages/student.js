function enhanceStudent(doc = document) {
  const portal = doc.querySelector('#portal-docente');
  if (!portal?.querySelector(':scope > #main-docente') || !portal.querySelector(':scope > #perfil-docente')) return;
  doc.body.classList.add('material-sigaa-standard', 'material-sigaa-student');
  enhanceHeader(doc);
}

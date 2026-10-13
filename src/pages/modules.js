function enhanceModules(doc = document) {
  const menu = doc.querySelector('#menu_principal');
  if (!menu?.querySelector(':scope > #modulos > ul') || !menu.querySelector(':scope > #portais > ul')) return;

  doc.body.classList.add('material-sigaa-standard', 'material-sigaa-modules');
  enhanceHeader(doc);
  for (const item of menu.querySelectorAll(':scope > div > ul > li')) {
    const link = item.querySelector(':scope > a');
    const href = link?.getAttribute('href')?.trim() ?? '';
    const available = !!link && link.getAttribute('aria-disabled') !== 'true' && !!href && !href.startsWith('javascript:');
    item.classList.toggle('material-sigaa-available', available);
    item.classList.toggle('material-sigaa-unavailable', !available);
  }
}

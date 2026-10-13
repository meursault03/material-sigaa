function enhanceHeader(doc = document) {
  const systemInfo = doc.getElementById('info-sistema');
  if (!systemInfo || systemInfo.querySelector('.material-sigaa-header-inner')) return;
  const inner = doc.createElement('div');
  inner.className = 'material-sigaa-header-inner';
  while (systemInfo.firstChild) inner.append(systemInfo.firstChild);
  systemInfo.append(inner);
}

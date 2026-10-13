function enhanceLogin(doc = document) {
  const form = doc.forms.namedItem('loginForm');
  if (!form) return;
  const main = form.closest('main');
  if (!main) return;
  for (const element of main.parentElement?.children ?? []) {
    if (element.tagName === 'DIV' && element.textContent.trim() === 'Não Definido') {
      element.classList.add('material-sigaa-empty-label');
    }
  }
  const panel = form.closest('td')?.parentElement?.closest('table');
  const systems = main?.querySelector('td.sistemaAtual')?.closest('table');
  if (!main || !panel || !systems) return;

  doc.body.classList.add('material-sigaa-login');
  enhanceHeader(doc);
  if (form.dataset.materialSigaaized === 'true') return;
  main.classList.add('material-sigaa-main');
  panel.classList.add('material-sigaa-panel');
  systems.classList.add('material-sigaa-systems');
  form.classList.add('material-sigaa-form');

  const login = form.querySelector('input[name="user.login"]');
  const password = form.querySelector('input[name="user.senha"]');
  for (const [input, label] of [[login, 'Usuário'], [password, 'Senha']]) {
    if (!input.id) input.id = `material-sigaa-${input === login ? 'user' : 'password'}`;
    const heading = input.closest('tr')?.querySelector('th');
    if (heading) {
      heading.textContent = '';
      const element = doc.createElement('label');
      element.htmlFor = input.id;
      element.textContent = label;
      heading.append(element);
    }
  }

  const card = form.closest('.logon');
  card?.classList.add('material-sigaa-card');
  const recovery = [...panel.querySelectorAll('p')].find(p => p.querySelector('a[href*="recuperar_"]'));
  recovery?.classList.add('material-sigaa-recovery');
  const notice = main.querySelector('p[style*="color: #F00"]')?.parentElement;
  notice?.classList.add('material-sigaa-notice');

  const register = panel.querySelector('a[href*="/cadastro/"]')?.closest('table');
  register?.classList.add('material-sigaa-register');
  for (const link of register?.querySelectorAll('a') ?? []) {
    link.classList.add('material-sigaa-register-link');
    link.querySelector('img')?.classList.add('material-sigaa-legacy-icon');
  }
  const error = panel.querySelector('center');
  if (error?.textContent.trim()) error.classList.add('material-sigaa-error');
  panel.querySelector('a[href*="drive.google.com"]')?.closest('table')?.classList.add('material-sigaa-tutorials');
  const adobe = panel.querySelector('a[href*="get.adobe.com"]')?.closest('table');
  adobe?.classList.add('material-sigaa-adobe');
  const adobeIcon = adobe?.querySelector('a img[src*="adobe"]');
  adobeIcon?.classList.add('material-sigaa-legacy-icon');
  adobeIcon?.closest('a')?.classList.add('material-sigaa-pdf-link');
  form.dataset.materialSigaaized = 'true';
}

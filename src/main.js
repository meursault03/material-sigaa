function injectStyles(page, doc = document) {
  let style = doc.getElementById('material-sigaa-styles');
  if (style?.dataset.materialSigaaPage === page) return;
  if (['login', 'modules', 'student', 'credit'].includes(page) && !doc.getElementById('material-sigaa-icons')) {
    const link = doc.createElement('link');
    link.id = 'material-sigaa-icons';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&icon_names=account_circle,apps,assessment,badge,contact_support,family_restroom,logout,manage_accounts,picture_as_pdf,school&display=block';
    doc.head.append(link);
  }
  if (!style) {
    style = doc.createElement('style');
    style.id = 'material-sigaa-styles';
    doc.head.append(style);
  }
  style.textContent = (PAGE_CSS[page] || []).map(name => STYLE_CSS[name]).join('\n');
  style.dataset.materialSigaaPage = page;
}

let activePage = null;

function run() {
  const page = detectPage();
  if (page !== activePage) {
    document.body.classList.remove('material-sigaa-standard', 'material-sigaa-login',
      'material-sigaa-modules', 'material-sigaa-student', 'material-sigaa-ava',
      'material-sigaa-ava-report', 'material-sigaa-credit');
    activePage = page;
  }
  if (!page) {
    document.getElementById('material-sigaa-styles')?.remove();
    document.getElementById('material-sigaa-icons')?.remove();
    return null;
  }
  injectStyles(page);
  if (page === 'login') enhanceLogin();
  if (page === 'modules') enhanceModules();
  if (page === 'student') enhanceStudent();
  if (page === 'ava') enhanceAva();
  if (page === 'avaReport') enhanceAvaReport();
  if (page === 'credit') enhanceCredit();
  return page;
}

run();
let scheduled = false;
new MutationObserver(records => {
  // Relógios e avisos em texto não mudam a identificação da página.
  if (scheduled || !records.some(record =>
    record.type === 'attributes'
      ? record.target.matches('#menu_principal a')
      : [...record.addedNodes, ...record.removedNodes].some(node => node.nodeType === Node.ELEMENT_NODE)
  )) return;
  scheduled = true;
  setTimeout(() => {
    scheduled = false;
    run();
  }, 100);
}).observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['href', 'aria-disabled']
});

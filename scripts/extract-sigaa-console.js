/*
 * Cole todo este arquivo no Console do navegador com a página do SIGAA aberta.
 * Ele baixa um JSON local da página atual. Não envia dados pela rede.
 */
(async () => {
  'use strict';

  const startedAt = new Date().toISOString();
  const secretName = /password|senha|passwd|secret|token|csrf|auth|viewstate|session|jsessionid|nonce/i;
  const styleProperties = [
    'display', 'position', 'inset', 'top', 'right', 'bottom', 'left',
    'width', 'height', 'min-width', 'max-width', 'min-height', 'max-height',
    'margin', 'padding', 'box-sizing', 'overflow', 'overflow-x', 'overflow-y',
    'z-index', 'float', 'clear', 'grid-template-columns', 'grid-template-rows',
    'flex-direction', 'align-items', 'justify-content', 'gap',
    'color', 'background-color', 'background-image', 'border', 'border-radius',
    'box-shadow', 'opacity', 'visibility', 'font-family', 'font-size',
    'font-weight', 'line-height', 'text-align', 'white-space', 'transform'
  ];

  function clean(value) {
    return String(value ?? '').replace(/\s+/g, ' ').trim();
  }

  function safeUrl(value) {
    if (!value) return '';
    if (/^javascript:/i.test(value.trim())) return '[Código inline omitido]';
    if (/^(data|blob):/i.test(value)) return '[URL embutida omitida]';
    try {
      const url = new URL(value, location.href);
      for (const key of [...url.searchParams.keys()]) {
        if (secretName.test(key)) url.searchParams.set(key, '[REMOVIDO]');
      }
      return url.href.replace(/;jsessionid=[^/?#]+/ig, ';jsessionid=[REMOVIDO]');
    } catch {
      return String(value);
    }
  }

  function isSecretField(element) {
    return element.type === 'password' || secretName.test(element.name || '') || secretName.test(element.id || '');
  }

  function safeCode(value) {
    return value ? '[Código inline omitido]' : '';
  }

  function safeCss(value) {
    return value.replace(/url\((['"]?)(.*?)\1\)/gi, (_, quote, url) => `url("${safeUrl(url)}")`);
  }

  function sanitizedDocument(doc) {
    const clone = doc.documentElement.cloneNode(true);
    for (const field of clone.querySelectorAll('input, textarea, select, button')) {
      if (isSecretField(field)) {
        field.setAttribute('value', '[REMOVIDO]');
        for (const element of [field, ...field.querySelectorAll('*')]) {
          for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) node.textContent = '[REMOVIDO]';
          }
        }
        for (const option of field.options || []) {
          option.value = '[REMOVIDO]';
        }
      }
    }
    for (const script of clone.querySelectorAll('script:not([src])')) {
      script.textContent = safeCode(script.textContent);
    }
    for (const style of clone.querySelectorAll('style')) {
      style.textContent = safeCss(style.textContent);
    }
    for (const element of [clone, ...clone.querySelectorAll('*')]) {
      for (const attribute of [...element.attributes]) {
        if (attribute.name.startsWith('on') || attribute.name === 'srcdoc') {
          element.setAttribute(attribute.name, safeCode(attribute.value));
        } else if (secretName.test(attribute.name)) {
          element.setAttribute(attribute.name, '[REMOVIDO]');
        } else if (attribute.name === 'style') {
          element.setAttribute(attribute.name, safeCss(attribute.value));
        } else if (['href', 'src', 'action', 'formaction'].includes(attribute.name)) {
          element.setAttribute(attribute.name, safeUrl(attribute.value));
        }
      }
    }
    const snapshot = doc.implementation.createHTMLDocument(doc.title);
    snapshot.replaceChild(clone, snapshot.documentElement);
    return snapshot;
  }

  function safeVisibleText(doc) {
    let text = doc.body?.innerText || '';
    for (const field of doc.querySelectorAll('input, textarea, select, button')) {
      if (!isSecretField(field)) continue;
      const values = [field.value, field.textContent,
        ...[...field.options || []].flatMap(option => [option.value, option.textContent])];
      for (const value of values) {
        if (value) text = text.split(value).join('[REMOVIDO]');
      }
    }
    return text;
  }

  function fieldsOf(form) {
    return [...form.querySelectorAll('input, select, textarea, button')].map(field => ({
      tag: field.tagName.toLowerCase(),
      type: field.type || '',
      name: field.name || '',
      id: field.id || '',
      label: clean([...field.labels || []].map(label => label.textContent).join(' ') || field.getAttribute('aria-label')),
      value: isSecretField(field) ? '[REMOVIDO]' : field.value ?? '',
      checked: 'checked' in field ? field.checked : undefined,
      disabled: field.disabled,
      required: field.required,
      options: field.tagName === 'SELECT'
        ? [...field.options].map(option => ({ text: clean(option.textContent), value: option.value, selected: option.selected }))
        : undefined
    }));
  }

  function tableOf(table) {
    return {
      id: table.id || '',
      className: String(table.className || ''),
      caption: clean(table.caption?.textContent),
      rows: [...table.rows].map(row => [...row.cells].map(cell => ({
        tag: cell.tagName.toLowerCase(),
        text: clean(cell.innerText || cell.textContent),
        colspan: cell.colSpan,
        rowspan: cell.rowSpan
      })))
    };
  }

  function stylesheetOf(sheet) {
    const result = {
      href: safeUrl(sheet.href),
      ownerId: sheet.ownerNode?.id || '',
      ownerTag: sheet.ownerNode?.tagName || '',
      disabled: sheet.disabled
    };
    try {
      result.css = safeCss([...sheet.cssRules].map(rule => rule.cssText).join('\n'));
    } catch (error) {
      result.error = String(error);
    }
    return result;
  }

  async function computedElements(doc, snapshot) {
    const elements = [...doc.querySelectorAll('*')];
    const sanitizedElements = [...snapshot.querySelectorAll('*')];
    const indices = new Map(elements.map((element, index) => [element, index]));
    const result = [];
    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];
      const style = doc.defaultView.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      result.push({
        index,
        parentIndex: indices.get(element.parentElement) ?? null,
        tag: element.tagName.toLowerCase(),
        id: element.id || '',
        classes: String(element.className?.baseVal ?? element.className ?? ''),
        name: element.getAttribute('name') || '',
        role: element.getAttribute('role') || '',
        text: clean(element.children.length ? '' : sanitizedElements[index]?.textContent).slice(0, 200),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        style: Object.fromEntries(styleProperties.map(property => [property, safeCss(style.getPropertyValue(property))]))
      });
      if (index && index % 250 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }
    return result;
  }

  async function capture(doc, depth = 0) {
    const view = doc.defaultView;
    const snapshot = sanitizedDocument(doc);
    const result = {
      url: safeUrl(view.location.href),
      referrer: safeUrl(doc.referrer),
      title: doc.title,
      language: doc.documentElement.lang,
      readyState: doc.readyState,
      detectedView: doc.querySelector('#conteudo #formAva') ? 'Turma Virtual'
        : doc.querySelector('#portal-docente #main-docente') ? 'Portal do Discente'
          : doc.querySelector('#menu_principal #modulos') ? 'Módulos e Portais'
            : doc.forms.namedItem('loginForm') ? 'Login' : 'Outra página',
      modernStylePresent: Boolean(doc.getElementById('material-sigaa-styles')),
      bodyClasses: doc.body?.className || '',
      viewport: { width: view.innerWidth, height: view.innerHeight, devicePixelRatio: view.devicePixelRatio },
      html: snapshot.documentElement.outerHTML,
      visibleText: safeVisibleText(doc),
      headings: [...snapshot.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(element => ({
        level: element.tagName.toLowerCase(), id: element.id || '', text: clean(element.textContent)
      })),
      forms: [...snapshot.forms].map(form => ({
        id: form.id || '', name: form.name || '', action: safeUrl(form.action),
        method: form.method, enctype: form.enctype, fields: fieldsOf(form)
      })),
      tables: [...snapshot.querySelectorAll('table')].map(tableOf),
      links: [...snapshot.querySelectorAll('a')].map(link => ({
        text: clean(link.innerText || link.textContent), href: safeUrl(link.href),
        target: link.target, title: link.title
      })),
      images: [...doc.images].map(image => ({ src: safeUrl(image.src), alt: image.alt, width: image.naturalWidth, height: image.naturalHeight })),
      scripts: [...snapshot.scripts].map(script => ({ src: safeUrl(script.src), type: script.type, inlineText: script.src ? '' : safeCode(script.textContent) })),
      stylesheets: [...doc.styleSheets].map(stylesheetOf),
      computedElements: await computedElements(doc, snapshot),
      frames: []
    };
    if (depth < 2) {
      for (const frame of doc.querySelectorAll('iframe, frame')) {
        try {
          result.frames.push(await capture(frame.contentDocument, depth + 1));
        } catch (error) {
          result.frames.push({ src: safeUrl(frame.src), error: String(error) });
        }
      }
    }
    return result;
  }

  const report = {
    kind: 'SIGAA page inspection',
    capturedAt: startedAt,
    note: 'Arquivo local. Contém conteúdo acadêmico e pode conter dados pessoais; revise antes de compartilhar.',
    page: await capture(document),
    resources: performance.getEntriesByType('resource').map(entry => ({
      url: safeUrl(entry.name), type: entry.initiatorType,
      durationMs: Math.round(entry.duration), transferSize: entry.transferSize
    }))
  };
  // O Prototype usado pelo SIGAA define Array.prototype.toJSON e faz o
  // JSON.stringify transformar arrays em strings. Desative-o apenas durante
  // a serialização síncrona e restaure a definição original em seguida.
  const arrayToJSON = Object.getOwnPropertyDescriptor(Array.prototype, 'toJSON');
  let data;
  try {
    Array.prototype.toJSON = function () { return this; };
    data = JSON.stringify(report, null, 2);
  } finally {
    if (arrayToJSON) Object.defineProperty(Array.prototype, 'toJSON', arrayToJSON);
    else delete Array.prototype.toJSON;
  }
  const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const filename = `sigaa-${location.pathname.split('/').filter(Boolean).join('-') || 'pagina'}-${startedAt.replace(/[:.]/g, '-')}.json`;
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 60000);
  console.info(`SIGAA: ${filename} gerado (${(blob.size / 1024 / 1024).toFixed(1)} MB).`);
})();

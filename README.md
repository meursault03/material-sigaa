# SIGAA Modern

Userscript para modernizar gradualmente a interface do SIGAA/UFC. Adapta a tela de entrada, Módulos e Portais, Portal do Discente, Turma Virtual, páginas internas da AVA, relatório de frequência e telas de Creditação de Horas, conservando formulários, links e permissões originais.

## Instalação

Execute `npm run build` e instale [`dist/sigaa-modern.user.js`](dist/sigaa-modern.user.js) em um gerenciador de userscripts. O script reconhece cada tela pelos elementos da página e pelo endereço quando necessário. O SIGAA pode mostrar a AVA ou a Creditação mantendo a URL do Portal do Discente; essas telas também são reconhecidas nesse caso. Depois de atualizar o arquivo instalado, recarregue a aba do SIGAA.

Para conferir se o estilo foi inserido, execute `!!document.getElementById('sigaa-modern-styles')` no Console do navegador. O resultado esperado nas telas reconhecidas é `true`.

## Estrutura

- `src/core/router.js`: identifica a página pelo caminho e pelo DOM.
- `src/pages/login.js`: adiciona classes e rótulos ao formulário existente.
- `src/pages/modules.js`: classifica opções por link e `aria-disabled`, mantendo todas no DOM.
- `src/pages/student.js`: adapta o Portal do Discente sem mover os formulários JSF.
- `src/pages/ava.js`: adapta a Turma Virtual e páginas internas sem alterar os painéis geridos pelo jQuery UI.
- `src/pages/ava-report.js`: adapta o relatório de frequência exibido em outra janela.
- `src/pages/credit.js`: adapta as telas de Creditação de Horas, inclusive quando chegam pelo Portal do Discente.
- `src/styles/`: visual das páginas adaptadas.
- `fixtures/`: recortes anonimizados das estruturas recebidas para orientar os seletores.

O texto usa a fonte local disponível no navegador. Algumas telas usam Material Symbols para ícones; a AVA conserva os ícones do próprio SIGAA e não solicita fontes externas. O CSS é aplicado somente à tela identificada, e as reações às atualizações parciais do SIGAA são agrupadas para reduzir trabalho repetido. Não há dependências de execução nem código de autenticação.

## Extrair informações de uma página

Abra a página desejada no SIGAA, abra o Console do navegador e cole todo o conteúdo de [`scripts/extract-sigaa-console.js`](scripts/extract-sigaa-console.js). O navegador baixa um JSON com o HTML, textos visíveis, formulários, tabelas, links, imagens, scripts, folhas de estilo, estilos calculados e recursos carregados. Execute novamente em cada tela que quiser registrar, inclusive após abrir painéis ou mudar de turma.

O coletor só lê a página aberta e cria um arquivo local. Ele não navega automaticamente, não envia dados nem lê cookies ou armazenamento do navegador. Senhas, tokens conhecidos e valores do JSF ViewState são ocultados, mas o arquivo pode conter nome, notas e outras informações pessoais; revise antes de compartilhar.

# Material SIGAA

Userscript para melhorar a leitura e a organização do SIGAA da Universidade
Federal do Ceará. Aplica estilos e pequenos ajustes ao DOM existente, preservando
os formulários, links e fluxos do sistema. 

Projeto independente, em desenvolvimento, voltado ao uso do aluno na UFC. Preferi usar o Material Design pois acho bonito, caso ache feio, faça em outro estilo, espero que esse userscript possa incentivar a criação de outros repositórios modificando o SIGAA.

## Instalação

1. Instale um gerenciador de userscripts, como
   [Violentmonkey](https://violentmonkey.github.io/) ou
   [Tampermonkey](https://www.tampermonkey.net/).
2. Abra [`dist/material-sigaa.user.js`](dist/material-sigaa.user.js) e copie o conteúdo
   completo do arquivo, incluindo o bloco `==UserScript==`.
3. Crie um novo script no editor do gerenciador, substitua o conteúdo pelo arquivo
   copiado e salve.
4. Abra o SIGAA/UFC ou recarregue a aba já aberta.

No Chrome 138 ou posterior com Tampermonkey 5.3 ou posterior, habilite
**Permitir scripts de usuário** nos detalhes da extensão e confira o acesso a
`si3.ufc.br`. Consulte as
[instruções do Tampermonkey](https://www.tampermonkey.net/faq.php?locale=en&q=Q209).

O arquivo em `dist/` já contém o JavaScript e o CSS. Node.js e npm são necessários
apenas para desenvolver ou gerar outra versão.

Para atualizar, substitua o conteúdo do script instalado pela nova versão e
recarregue a página. Para voltar ao visual original, desative o script no
gerenciador e recarregue a aba.

## Telas adaptadas

| Tela | Adaptação |
| --- | --- |
| Entrada | Formulário de login, rótulos, recuperação de acesso e cadastro |
| Módulos e Portais | Organização das opções e indicação visual de disponibilidade |
| Portal do Discente | Turmas, atividades, notícias e dados do aluno |
| Turma Virtual / AVA | Conteúdo das aulas, apresentação e páginas internas com a estrutura reconhecida |
| Relatório de frequência | Leitura na tela; os estilos novos não se aplicam à impressão |
| Creditação de Horas | Formulário, solicitações submetidas e acompanhamento de horas |

O script executa somente em `si3.ufc.br/sigaa/*` e
`www.si3.ufc.br/sigaa/*`, por HTTP ou HTTPS. A identificação combina o caminho da
URL com elementos do DOM: a AVA e a Creditação também podem ser reconhecidas
quando o SIGAA mantém o endereço do Portal do Discente.

## Escopo e limites

- A autenticação, as permissões e o envio dos formulários continuam a cargo do
  SIGAA. O script não preenche credenciais nem automatiza operações acadêmicas.
- As transformações reaproveitam os elementos existentes. Forms, actions, nomes
  dos campos, eventos dos links e valores do JSF ViewState são preservados.
- Atualizações parciais do DOM são agrupadas e a tela é identificada novamente.
  Mudanças apenas em textos de relógios e avisos não repetem essa identificação.
  Alterações de `href` e `aria-disabled` nos links de Módulos e Portais atualizam
  a indicação visual de disponibilidade.
  Ao mudar de adapter, as classes anteriores são removidas. Uma tela não
  reconhecida fica sem o CSS do userscript.
- A cobertura é gradual. Mudanças na estrutura do SIGAA podem exigir novos
  seletores e fixtures; outras instituições não fazem parte do escopo atual.
- As fixtures são recortes anonimizados. Os testes não substituem a conferência
  dos fluxos reais, dos scripts legados e do layout no navegador.

O userscript não coleta dados acadêmicos, não usa analytics e não lê cookies ou
armazenamento do navegador. Algumas telas carregam ícones Material Symbols pelo
Google Fonts; se esse recurso estiver bloqueado, os ícones podem perder a
aparência esperada. A AVA conserva os ícones do SIGAA e não carrega essa fonte.

## Desenvolvimento

Use Node.js 22.22.2 ou posterior na linha 22, 24.15.0 ou posterior na linha 24,
ou uma versão a partir da 26, com npm.

```sh
npm ci --ignore-scripts
npm test
```

| Comando | Resultado |
| --- | --- |
| `npm run build` | Gera `dist/material-sigaa.user.js` a partir do código e dos estilos |
| `npm test` | Gera o build e executa os testes com `node:test` e `jsdom` |

`jsdom` é uma dependência de desenvolvimento. Não é incluído no userscript.
Os testes verificam as oito fixtures, a preservação dos formulários, a
idempotência, as transições parciais e a ocultação de valores sensíveis no JSON
do coletor. Não carregam recursos externos nem enviam formulários.

### Estrutura

```text
src/
  core/       Identificação de páginas e infraestrutura comum do DOM
  pages/      Um adapter para cada tipo de página
  styles/     Estilos comuns e estilos de cada tela
  main.js     Aplicação do adapter e observação das atualizações
fixtures/     Recortes anonimizados do HTML do SIGAA
tests/        Testes do artefato distribuído e do coletor
scripts/      Build e ferramenta de inspeção local
dist/         Userscript instalável
```

Ao adaptar uma tela, registre uma fixture, ajuste a identificação se necessário
e mantenha a transformação no adapter correspondente. Preserve os controles do
SIGAA, não dependa da posição das linhas e verifique a execução repetida. Atualize
o build junto com o código-fonte; a versão do arquivo vem de `package.json`.

Versione o lockfile, as fixtures anonimizadas e `dist/`. Dependências instaladas,
logs, cobertura, arquivos do sistema e capturas brutas são ignorados por
[`.gitignore`](.gitignore). Preferências pessoais de exclusão podem ficar em
`.git/info/exclude`, que não é compartilhado pelo Git.

## Inspecionar uma página

O coletor é uma ferramenta separada, executada manualmente; não faz parte do
userscript instalado.

1. Abra a tela do SIGAA que deseja registrar.
2. Cole todo o conteúdo de
   [`scripts/extract-sigaa-console.js`](scripts/extract-sigaa-console.js) no Console
   do navegador.
3. Guarde o JSON baixado em `captures/` se for trazê-lo para o projeto.
4. Execute novamente após abrir painéis ou mudar de turma, se precisar registrar
   esses estados.

O relatório contém HTML, textos, formulários, tabelas, links, imagens, metadados
dos scripts, folhas de estilo, estilos calculados e recursos carregados. O
coletor cria um arquivo local, sem enviar dados, navegar por outras páginas ou
ler cookies e armazenamento.

Código JavaScript inline e handlers são omitidos. Campos de senha e campos
identificados como tokens, sessão ou ViewState têm seus valores ocultados nas
representações do relatório. Essa identificação não é uma anonimização completa:
nomes, notas, matrículas e segredos em lugares inesperados ainda podem aparecer.
Revise o JSON antes de compartilhar e adicione a `fixtures/` somente recortes
anonimizados.

## Se algo não funcionar

Confira se o script está habilitado e se o endereço está dentro dos domínios
suportados. No Console, este comando indica se o CSS foi inserido:

```js
!!document.getElementById('material-sigaa-styles')
```

O resultado é `true` em uma tela reconhecida. Se for `false`, a tela pode não ter
adapter ou sua estrutura pode ter mudado. Desative o script e recarregue a página
para comparar o comportamento com o SIGAA original.

Ao relatar um problema, inclua a tela, os passos para reproduzir, o navegador,
o gerenciador e a versão do script. Anexe erros do Console ou imagens somente
depois de remover dados pessoais. Não compartilhe credenciais ou ViewState.


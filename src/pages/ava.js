function enhanceAva(doc = document) {
  if (!doc.querySelector('#barraEsquerda') || !doc.querySelector('#barraDireita') || !doc.querySelector('#conteudo')) return;
  doc.body.classList.add('material-sigaa-ava');
}

// tooltips.js
const shownTooltips = new Set();

export function showTooltip(targetEl, text) {
    console.log("aqui tooltip")
  // no lo vuelvas a mostrar si ya salió
  if (shownTooltips.has(text)) return;
  shownTooltips.add(text);

  // 1) crea el div y ponle el texto
  const tip = document.createElement('div');
  tip.className = 'tooltip';
  tip.textContent = text;
  document.body.appendChild(tip);

  // 2) fuerza un repaint y mide ya con el texto
  const tipRect = tip.getBoundingClientRect();
  const elRect  = targetEl.getBoundingClientRect();

  // 3) posiciona centrado justo debajo
  tip.style.left = `${elRect.left + (elRect.width - tipRect.width)/2}px`;
  tip.style.top  = `${elRect.bottom + 8}px`;

  // 4) muestra con transición
  requestAnimationFrame(() => tip.classList.add('show'));

  // 5) oculta y elimina tras 3s
  setTimeout(() => {
    tip.classList.remove('show');
    setTimeout(() => tip.remove(), 300); // déjalo 300ms para la transición de salida
  }, 3000);
}

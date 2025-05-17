import { presentIntroduction } from './Introduccion';
import { readText } from './speak';

const steps = [
  { iconId: 'micIcon',  message: '<strong>Pulsa y mantén el botón</strong> mientras hablas. Suelta cuando termines tu mensaje.' },
  { iconId: 'sendBtn',  message: 'Revisa. Si es lo que quieres, <strong>envíalo</strong>; la IA lo analizará.' },
  { iconId: 'clearBtn', message: '¿Quieres decirlo diferente? Elige <strong>Borrar</strong> y vuelve a decirlo.' }
];

let tutorialStep = -1;
let overlay, textEl, nextBtn, skipBtn, iconsContainer, transcripcion, micOverlay, nuevoOverlay;
const originalPlacement = {};
const originalPointer   = {};

// Parsea mensaje con <strong> en un array de {char, bold}
function parseMessage(html) {
  const parts = html.split(/(<strong>|<\/strong>)/);
  let bold = false;
  const result = [];
  for (let part of parts) {
    if (part === '<strong>') bold = true;
    else if (part === '</strong>') bold = false;
    else {
      for (let ch of part) result.push({ ch, bold });
    }
  }
  return result;
}

// Máquina de escribir que respeta negrita via spans
async function typewriter(el, html) {
  el.innerHTML = '';
  const seq = parseMessage(html);
  let currentBold = seq[0]?.bold || false;
  let span = document.createElement('span');
  if (currentBold) span.classList.add('bold');
  el.appendChild(span);

  for (let { ch, bold } of seq) {
    if (bold !== currentBold) {
      currentBold = bold;
      span = document.createElement('span');
      if (currentBold) span.classList.add('bold');
      el.appendChild(span);
    }
    span.textContent += ch;
    await new Promise(r => setTimeout(r, 50));
  }
}

// Limpia las etiquetas para la voz
function stripTags(html) {
  return html.replace(/<[^>]+>/g, '');
}

function measureHidden(id) {
  const elem = document.getElementById(id);
  const toRestore = [];
  let cur = elem;
  while (cur && cur !== document.body) {
    const s = getComputedStyle(cur);
    if (s.display === 'none') {
      toRestore.push({ el: cur, disp: cur.style.display, vis: cur.style.visibility });
      cur.style.display    = 'block';
      cur.style.visibility = 'hidden';
    }
    cur = cur.parentElement;
  }
  const rect = elem.getBoundingClientRect();
  toRestore.forEach(({ el, disp, vis }) => {
    el.style.display    = disp;
    el.style.visibility = vis;
  });
  return rect;
}

function restoreAllIcons() {
  for (let { iconId } of steps) {
    const icon  = document.getElementById(iconId);
    const place = originalPlacement[iconId];
    if (!icon || !place) continue;

    icon.classList.remove('tutorial-icon');
    icon.style.position      = '';
    icon.style.left          = '';
    icon.style.top           = '';
    icon.style.display       = '';
    icon.style.pointerEvents = originalPointer[iconId];

    if (place.nextSibling) place.parent.insertBefore(icon, place.nextSibling);
    else                    place.parent.appendChild(icon);
  }
}

export async function startTutorial(config = {}) {
  overlay        = document.getElementById('tutorialOverlay');
  textEl         = document.getElementById('tutorialText');
  nextBtn        = document.getElementById('tutorialNext');
  iconsContainer = document.getElementById('tutorialIcons');
  transcripcion  = document.getElementById('Transcripcion');
  micOverlay     = document.getElementById('micOverlay');
  nuevoOverlay     = document.getElementById('new');

  // Guardar posiciones y desactivar clicks en iconos
  for (let { iconId } of steps) {
    const icon = document.getElementById(iconId);
    originalPlacement[iconId] = { parent: icon.parentNode, nextSibling: icon.nextSibling };
    originalPointer[iconId] = icon.style.pointerEvents;
    icon.style.pointerEvents = 'none';
  }

  tutorialStep           = -1;
  overlay.style.display  = 'block';
  overlay.style.opacity  = '1';
  overlay.style.zIndex   = '999';

  if (!document.getElementById('tutorialSkip')) {
    skipBtn = document.createElement('button');
    skipBtn.id = 'tutorialSkip';
    overlay.appendChild(skipBtn);
  } else {
    skipBtn = document.getElementById('tutorialSkip');
  }

  if (config.nextSize) nextBtn.style.cssText += `width:${config.nextSize.width};height:${config.nextSize.height};`;
  if (config.skipSize) skipBtn.style.cssText += `width:${config.skipSize.width};height:${config.skipSize.height};`;

  nextBtn.disabled = true;
  nextBtn.onclick  = advanceStep;
  skipBtn.onclick  = () => endTutorial(true);

  const intro = 'Hola, mi nombre es NewRoman. Espero te encuentres muy bien. Ahora te guiaré por un breve tutorial.';
  readText(intro);
  await typewriter(textEl, intro);
  nextBtn.disabled = false;
}

async function advanceStep() {
  nextBtn.disabled = true;

  if (tutorialStep >= 0 && tutorialStep < steps.length) {
    const prevId = steps[tutorialStep].iconId;
    const prev   = document.getElementById(prevId);
    const place  = originalPlacement[prevId];
    prev.classList.remove('tutorial-icon');
    prev.style.position = '';
    prev.style.left     = '';
    prev.style.top      = '';
    prev.style.display  = '';
    if (place.nextSibling) place.parent.insertBefore(prev, place.nextSibling);
    else                    place.parent.appendChild(prev);
  }

  tutorialStep++;
  if (tutorialStep >= steps.length) return endTutorial(false);

  iconsContainer.innerHTML = '';
  const { iconId, message } = steps[tutorialStep];
  const icon = document.getElementById(iconId);
  const rect = measureHidden(iconId);

  overlay.appendChild(icon);
  icon.classList.add('tutorial-icon');

  readText(stripTags(message));
  await typewriter(textEl, message);

  const tr = textEl.getBoundingClientRect();
  icon.style.left    = `${tr.left + tr.width/2 - rect.width/2}px`;
  icon.style.top     = `${tr.bottom + 20}px`;
  icon.style.display = 'block';

  nextBtn.disabled = false;
}

function endTutorial(omitir) {
  restoreAllIcons();

  overlay.style.opacity = '0';
  overlay.style.zIndex  = '0';
  nextBtn.disabled      = true;
  nextBtn.onclick       = null;
  skipBtn.onclick       = null;

  micOverlay.style.display = 'block';
  nuevoOverlay.style.display = 'block';
  micOverlay.addEventListener('click', () => {
    micOverlay.style.display    = 'none';
    overlay.style.display       = 'none';
    transcripcion.style.display = 'flex';
  }, { once: true });

  presentIntroduction();
}

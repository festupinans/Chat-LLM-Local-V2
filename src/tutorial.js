import { presentIntroduction } from './Introduccion';
import { readText } from './speak';

const steps = [
  { iconId: 'micIcon',   message: 'Pulsa y mantén el botón mientras hablas. Suelta cuando termines tu mensaje.' },
  { iconId: 'sendBtn',   message: 'Revisa. Si es lo que quieres, envíalo; la IA lo analizará.' },
  { iconId: 'clearBtn',  message: '¿Quieres decirlo diferente? Elige Borrar y vuelve a decirlo.' }
];

let tutorialStep = -1;
const overlay      = document.getElementById('tutorialOverlay');
const textEl       = document.getElementById('tutorialText');
const nextBtn      = document.getElementById('tutorialNext');
const transcripcion= document.getElementById('Transcripcion');
const iconsContainer = document.getElementById('tutorialIcons');

// Para restaurar la posición original
const originalPlacement = {};

// Máquina de escribir
async function typewriter(el, str) {
  el.textContent = '';
  for (let ch of str) {
    el.textContent += ch;
    await new Promise(r => setTimeout(r, 50));
  }
}

// Mide aun oculto
function measureHidden(id) {
  const elem = document.getElementById(id);
  const toRestore = [];
  let cur = elem;
  while (cur && cur !== document.body) {
    const s = window.getComputedStyle(cur);
    if (s.display === 'none') {
      toRestore.push({el: cur, disp: cur.style.display, vis: cur.style.visibility});
      cur.style.display = 'block';
      cur.style.visibility = 'hidden';
    }
    cur = cur.parentElement;
  }
  const rect = elem.getBoundingClientRect();
  toRestore.forEach(({el, disp, vis}) => {
    el.style.display = disp;
    el.style.visibility = vis;
  });
  return rect;
}

export function startTutorial() {
  // Guarda la posición original de cada icono
  for (let {iconId} of steps) {
    const icon = document.getElementById(iconId);
    originalPlacement[iconId] = { 
      parent: icon.parentNode, 
      nextSibling: icon.nextSibling 
    };
  }

  tutorialStep = -1;
  overlay.style.display = 'block';
  readText('Espero te encuentres muy bien, antes que nada te daré un pequeño tutorial');
  advanceStep();
}

async function advanceStep() {
  // Devolver ícono anterior si no es el primer paso
  if (tutorialStep >= 0 && tutorialStep < steps.length) {
    const prevIconId = steps[tutorialStep]?.iconId;
    const prevIcon = document.getElementById(prevIconId);
    const { parent, nextSibling } = originalPlacement[prevIconId];
    prevIcon.classList.remove('tutorial-icon');
    prevIcon.style.position = '';
    prevIcon.style.left = '';
    prevIcon.style.top = '';
    prevIcon.style.display = '';
    if (nextSibling) parent.insertBefore(prevIcon, nextSibling);
    else parent.appendChild(prevIcon);
  }

  // Avanza al siguiente paso
  tutorialStep++;
  if (tutorialStep >= steps.length) return endTutorial();
  iconsContainer.innerHTML = '';

  const { iconId, message } = steps[tutorialStep];
  const icon = document.getElementById(iconId);
  const rect = measureHidden(iconId);

  // Mueve ícono actual al overlay
  overlay.appendChild(icon);
  icon.classList.add('tutorial-icon');

  readText(message);
  // Escribe y lee mensaje
  await typewriter(textEl, message);

  // Posiciona debajo del texto
  const textRect = textEl.getBoundingClientRect();
  icon.style.left = `${textRect.left + textRect.width/2 - rect.width/2}px`;
  icon.style.top = `${textRect.bottom + 20}px`;
  icon.style.display = 'block';

  nextBtn.onclick = advanceStep;
}


function endTutorial() {
  overlay.style.opacity='0';
  overlay.style.zIndex='0'
  nextBtn.onclick = null;
  micOverlay.style.display = 'block';
    micOverlay.addEventListener('click', () => {
      micOverlay.style.display = 'none';
      overlay.style.display='none';
      transcripcion.style.display = 'flex';
    }, { once: true });
  presentIntroduction();
}


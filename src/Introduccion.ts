import { readText } from './speak';
import { sendMensajeIANormal } from './peticiones_False-Stream';

let initialPhase = true;
let subPhase = 0;
const collected: { name?: string; email?: string; empresa?: string } = {};

// Apuntamos al div que contendrá siempre un <p>
const transcriptTA = document.getElementById('transcript')  as HTMLTextAreaElement;
const messageLabel = document.getElementById('messageLabel') as HTMLDivElement;

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'k' && !e.repeat) {
      e.preventDefault();
      sendMensajeIA();
    }
  });
});

const senBtn       = document.getElementById('sendBtn')  as HTMLButtonElement;
const clearBtn     = document.getElementById('clearBtn') as HTMLButtonElement;

document.addEventListener('DOMContentLoaded', () => {
  resetAll();

  senBtn.addEventListener('click', () => {
    sendMensajeIA();
  });
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'k' && !e.repeat) {
      e.preventDefault();
      sendMensajeIA();
    }
  });
});

function resetAll() {
  initialPhase = true;
  subPhase     = 0;
  clearMessageLabel();
}


export async function sendMensajeIA(): Promise<void> {
  console.log("Enviado mensaje Nuevo");

  // 1) Leer el texto actual del <p> dentro de messageLabel
  const p = messageLabel.querySelector('p');
  const text = p?.textContent?.trim() ?? '';

  // 2) Mostrar inmediatamente lo que dictaste (si quieres sobreescribirlo)
  //    Si prefieres no sobreescribir aquí, comenta esta línea:
  // messageLabel.innerHTML = `<p class="userInput">${text || '[Sin texto]'}</p>`;

  if (initialPhase) {
    // Fase de recogida de datos
    if (subPhase === 0) {
      if (!text) {
        readText('No capturé nada. Intenta de nuevo.');
        return;
      }
      collected.name = text;
      subPhase++;
      askNext();
      return;
    }
    if (subPhase === 1) {
      if (!text) {
        readText('Por favor, ingresa tu correo electrónico.');
        return;
      }
      collected.email = text;
      subPhase++;
      askNext();
      return;
    }
    if (subPhase === 2) {
      if (!text) {
        readText('Por favor, ingresa el nombre de la empresa.');
        return;
      }
      collected.empresa = text;

      // Mostrar JSON en el mismo div
      const datos = {
        name: collected.name!,
        email: collected.email!,
        empresa: collected.empresa!
      };
      messageLabel.innerHTML = `<p class="collectedData">${JSON.stringify(datos, null, 2)}</p>`;

      await fetch('http://localhost:3000/api/robot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });

      readText('¡Perfecto! Ahora puedes preguntarme lo que desees.');
      initialPhase = false;
      // Preparamos para la siguiente entrada
      clearMessageLabel();
      return;
    }
  } else {
    // Post‑fase: mandamos a la IA normal
    await sendMensajeIANormal();
  }
}

function askNext() {
  clearMessageLabel();
  switch (subPhase) {
    case 0:
      readText('Por favor dime tu nombre.');
      break;
    case 1:
      readText('Por favor ingresa tu correo electrónico.');
      break;
    case 2:
      readText('Por favor ingresa el nombre de la empresa.');
      break;
  }
}

function clearMessageLabel() {
  // Borramos cualquier <p> anterior y dejamos listo para nuevo texto
  messageLabel.innerHTML = `<p class="userInput"></p>`;
}

export function presentIntroduction() {
  readText('A continuación, necesito que me proporciones algunos datos.');
  setTimeout(() => {
    askNext();
  }, 3000);
}

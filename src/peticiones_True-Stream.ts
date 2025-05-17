import { readText } from './speak';
import { messageHistory as initialMessageHistory } from './Parametros';

const API_CHAT = 'http://192.168.1.11:41343/v1/chat/completions';
let messageHistory = [...initialMessageHistory];

let initialPhase = true;
let subPhase = 0;
const collected: { name?: string; email?: string; empresa?: string } = {};

// DOM
const senBtn       = document.getElementById('sendBtn')  as HTMLButtonElement;
const clearBtn     = document.getElementById('clearBtn') as HTMLButtonElement;
const messageLabel = document.getElementById('messageLabel') as HTMLDivElement;

document.addEventListener('DOMContentLoaded', () => {
  resetAll();

  senBtn.addEventListener('click', () => {
    stopRecognition();
    sendMensajeIA();
  });
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'k' && !e.repeat) {
      e.preventDefault();
      stopRecognition();
      sendMensajeIA();
    }
  });
});

// Reconocimiento de voz omitido aquí; asumo que sigue igual y escribe en <p> interno de messageLabel
function stopRecognition() {
  if ((window as any).recognition) {
    (window as any).recognition.stop();
    (window as any).recognition = null;
  }
}

// Presentación inicial
function presentIntroduction() {
  readText('¡Hola! Soy NewRoman, tu asistente virtual. ...');
  setTimeout(() => askNext(), 3000);
}

function askNext() {
  clearMessageLabel();
  switch (subPhase) {
    case 0: readText('Por favor dime tu nombre.');       break;
    case 1: readText('Por favor ingresa tu correo electrónico.'); break;
    case 2: readText('Por favor ingresa el nombre de la empresa.'); break;
  }
}

// Función auxiliar: deja un <p> vacío dentro de messageLabel
function clearMessageLabel() {
  messageLabel.innerHTML = `<p class="userInput"></p>`;
}

// Extrae el texto del <p> interno
function getMessageLabelText(): string {
  const p = messageLabel.querySelector('p');
  return p?.textContent?.trim() ?? '';
}

// Envío streaming / normal
async function sendMensajeNormal(): Promise<void> {
  const msg = getMessageLabelText();
  clearMessageLabel();
  messageHistory.push({ role: 'user', content: msg });

  // ... aquí va tu lógica de streaming idéntica ...
  // al final escribe respuesta en messageLabel:
  // messageLabel.innerHTML = `<p class="assistant">${respuesta}</p>`;
}

async function sendMensajeIA(): Promise<void> {
  const text = getMessageLabelText();

  if (initialPhase) {
    if (subPhase === 0) {
      if (!text) { readText('No capturé nada.'); return; }
      collected.name = text;
      subPhase++; askNext(); return;
    }
    if (subPhase === 1) {
      if (!text) { readText('Por favor, ingresa tu correo electrónico.'); return; }
      collected.email = text;
      subPhase++; askNext(); return;
    }
    if (subPhase === 2) {
      if (!text) { readText('Por favor, ingresa el nombre de la empresa.'); return; }
      collected.empresa = text;
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
      clearMessageLabel();
      return;
    }
  } else {
    await sendMensajeNormal();
  }
}

function resetAll() {
  initialPhase = true;
  subPhase     = 0;
  Object.keys(collected).forEach(k => delete (collected as any)[k]);
  messageHistory = [...initialMessageHistory];
  clearMessageLabel();
  // presentIntroduction(); // si quieres reactivar la intro
}

(window as any).sendMensajeIA         = sendMensajeIA;
(window as any).presentIntroduction   = presentIntroduction;

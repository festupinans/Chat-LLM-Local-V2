import { readText } from './speak';
import { sendMensajeIANormal } from './peticiones_False-Stream';
// import { sendMensajeNormal } from './peticiones_True-Stream';

let initialPhase = true;
let subPhase = 0;
const collected: { name?: string; email?: string; empresa?: string } = {};
const transcriptTA = document.getElementById('transcript') as HTMLTextAreaElement;
// const messageLabel = document.getElementById('messageLabel')!;

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'k' && !e.repeat) {
      e.preventDefault();
      sendMensajeIA();
    }
  });

  // --- NUEVO: Soporte para botón EnviarBtn (mouse y táctil) ---
  const enviarBtn = document.getElementById('EnviarBtn') as HTMLElement | null;
  if (enviarBtn) {
    // Mouse
    enviarBtn.addEventListener('click', () => {
      sendMensajeIA();
    });

    // Pantallas táctiles
    enviarBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      sendMensajeIA();
    });
  }
});

export async function sendMensajeIA(): Promise<void> {
  console.log("Enviado mensaje Nuevo");

  const text = transcriptTA.value.trim();
//   await sendMensajeIANormal();

//   await sendMensajeNormal();

  if (initialPhase) {
    // Guarda según subPhase y avanza
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
      // Formatea el JSON de una vez y envía
      const datos = {
        name: collected.name!,
        email: collected.email!,
        empresa: collected.empresa!
      };
      console.log(datos);
      // messageLabel.textContent = JSON.stringify(datos);
      // await fetch('http://localhost:3000/api/robot', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(datos)
      // });
      readText('¡Perfecto! Ahora puedes preguntarme lo que desees.');
      initialPhase = false;
      transcriptTA.value = '';
      // messageLabel.textContent = '';
      return;
    }
  } else {
    await sendMensajeIANormal();
  }
}

// Avanza la fase inicial preguntando uno a uno
function askNext() {
  transcriptTA.value = '';                
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

export function presentIntroduction() {
  readText('¡Hola! Soy NeuRoman tu asistente virtual. Estoy aquí para ayudarte. Antes de comenzar, necesito que me proporciones algunos datos. Empecemos.');
  setTimeout(() => {
    askNext();
  }, 3000); // Da tiempo para escuchar la introducción
}
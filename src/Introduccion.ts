// (Tu archivo actual, que contiene sendMensajeIA, askNext, etc.)

import { readText } from './speak';
// import { sendMensajeIANormal } from './Ollama'; // Comentado según tu ejemplo

let initialPhase = true;
let subPhase = 0;
const collected: { name?: string; email?: string; empresa?: string } = {};
// NUEVA VARIABLE: Para controlar que la animación solo se ejecute una vez
let hasAnimationRun = false; 

// Apuntamos al div que contendrá siempre un <p>
const transcriptTA = document.getElementById('transcript')  as HTMLTextAreaElement;
const messageLabel = document.getElementById('messageLabel') as HTMLDivElement;

// NUEVAS REFERENCIAS DOM: Necesitas que estos elementos existan en tu HTML
const supDialog = document.getElementById("supDialog") as HTMLHeadingElement; // Referencia al h2
const cajaD = document.querySelector(".cajaD") as HTMLDivElement; // Referencia al div.cajaD
const cajaT = document.querySelector(".cajaT") as HTMLDivElement; // Referencia al div.cajaT

document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'k' && !e.repeat) {
      e.preventDefault();
      sendMensajeIA();
    }
  });
});

const senBtn       = document.getElementById('sendBtn')  as HTMLButtonElement;
const clearBtn     = document.getElementById('clearBtn') as HTMLButtonElement; 

document.addEventListener('DOMContentLoaded', () => {
  resetAll();

  senBtn.addEventListener('click', () => {
    sendMensajeIA();
     const envCont = document.getElementById("envCont");
  if (envCont) {
    envCont.style.display = "none";
  }
  });
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'k' && !e.repeat) {
      e.preventDefault();
      sendMensajeIA();
       const envCont = document.getElementById("envCont");
  if (envCont) {
    envCont.style.display = "none";
  }
    }
  });
});

function resetAll() {
  initialPhase = true;
  subPhase     = 0;
  clearMessageLabel();
  // Al resetear, asegúrate de que la bandera de animación también se resetee si es necesario
  // Esto dependerá de si quieres que la animación se repita en un nuevo "ciclo" de intro
  // Si no quieres que se repita NUNCA, déjala fuera de resetAll.
  // Si quieres que se repita si reinicias el chat (ej. con el botón "Nuevo Chat"), inclúyela aquí:
  // hasAnimationRun = false; 
}


export async function sendMensajeIA(): Promise<void> {
  console.log("Enviado mensaje Nuevo");

  // 1) Leer el texto actual del <p> dentro de messageLabel
  const bubble = document.getElementById('bubble') as HTMLDivElement;
  const p = bubble.querySelector('p');
  const text = p?.textContent?.trim() ?? '';

  // 2) Mostrar inmediatamente lo que dictaste (si quieres sobreescribirlo)
  //    Si prefieres no sobreescribir aquí, comenta esta línea:
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
    if (subPhase === 2) { // Este es el punto después de la tercera pregunta de introducción
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
      
      // --- LOGICA DE ANIMACIÓN MOVVIDA Y CONTROLADA PARA QUE SE EJECUTE UNA VEZ ---
      if (!hasAnimationRun) { // Solo si la animación NO ha corrido
          // Coge el h2 y cámbiale el texto
          if (supDialog) { 
              supDialog.textContent = "En que te puedo ayudar?";
          }
          // Muestra el div por 3 segundos
          if (cajaD) { 
              cajaD.style.display = "flex"; // Asumiendo que quieres que se muestre como flex
              setTimeout(() => {
                  cajaD.style.display = "none"; // Oculta el div después de 3 segundos
                  // Cambia el margin-top y height de .cajaT después de que cajaD se oculte
                  if (cajaT) { 
                      cajaT.style.marginTop = "-80%";
                      cajaT.style.height = "22vh";
                  }
              }, 3000); // 3000 milisegundos = 3 segundos
          }
          hasAnimationRun = true; // Marca que la animación ya se ejecutó
      }
      // FIN LOGICA MOVIDA Y CONTROLADA

      // Preparamos para la siguiente entrada
      clearMessageLabel();
      return;
    }
  } else {
    // Post‑fase: mandamos a la IA normal
    window.dispatchEvent(new CustomEvent('initialPhaseCompleted', { detail: text }));
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
  readText('¡Hola! Soy NewRoman, tu asistente virtual y estoy aquí para ayudarte, necesito que me proporciones algunos datos.');
  setTimeout(() => {
    askNext();
  }, 9000);
}
// src/tutorial.js

import {
  showPersistentTooltip,
  hideAllTooltips,
  showTutorialHighlightArrow,
} from "./tooltips.js";
import { presentIntroduction } from "./Introduccion.js"; // Asegúrate de que esta ruta sea correcta

// --- Referencias a elementos del DOM ---
const tutorialOverlay = document.getElementById("tutorialOverlay");
const cajaT = document.querySelector(".cajaT");
const infoButton = document.getElementById("infoButton");
const micIcon = document.getElementById("micIcon"); // El micrófono que cambia de imagen
const sendBtnContainer = document.getElementById("envCont"); // Contenedor del botón de enviar
const sendBtn = document.getElementById("sendBtn");
const skipTutorialBtn = document.getElementById("skipTutorialBtn"); // Este ahora será el botón "Omitir"
const otherNewButton = document.getElementById("new"); // El botón 'new' de tu HTML, si existe y lo quieres ocultar durante el tutorial

// NUEVOS ELEMENTOS PARA EL TUTORIAL INTERACTIVO
let tutorialTitleElement = null; // Para el título "Tutorial"
let nextStepButton = null; // Para el botón "Siguiente"
let resolveNextStep = null; // Para controlar la pausa/continuación de las escenas

// --- Variables de estado del tutorial ---
let tutorialActive = false;
let tutorialSkipped = false; // Bandera para saber si el usuario omitió el tutorial
let tutorialNewChatButton = null; // Referencia al botón "Nuevo Chat" que el tutorial creará temporalmente

// --- Función para reiniciar el estado de los elementos antes de cada paso o al finalizar ---
// Asegura que cada escena comience "limpia" y que al final el DOM se quede limpio de elementos del tutorial.
function resetElementsForStep() {
  // Ocultar elementos principales del chat y restablecer sus estilos a los normales de la app
  if (cajaT) {
    cajaT.style.display = "none"; // Siempre oculto al resetear
    cajaT.style.margin = "0"; // Eliminar márgenes específicos del tutorial
    cajaT.style.width = "51vw"; // Restablecer ancho normal
    cajaT.style.minHeight = "240px"; // Restablecer altura mínima normal
  }
  if (infoButton) {
    infoButton.style.height = "2.8vh";
    infoButton.style.display = "none";
  }
  if (micIcon) micIcon.style.display = "none";
  if (sendBtnContainer) sendBtnContainer.style.display = "none";

  // Ocultar y remover el botón "Nuevo Chat" del tutorial si existe
  if (tutorialNewChatButton) {
    infoButton.style.height = "3vh";
    tutorialNewChatButton.style.display = "none";
    if (tutorialNewChatButton.parentNode) {
      tutorialNewChatButton.parentNode.removeChild(tutorialNewChatButton);
    }
    tutorialNewChatButton = null;
  }

  // Ocultar el botón 'new' si existe en el HTML original
  if (otherNewButton) {
    otherNewButton.style.display = "none";
  }

  // Limpiar y ocultar el título "Tutorial" si existe
  if (tutorialTitleElement) {
    if (tutorialTitleElement.parentNode) {
      tutorialTitleElement.parentNode.removeChild(tutorialTitleElement);
    }
    tutorialTitleElement = null;
  }

  // Ocultar el botón "Siguiente"
  if (nextStepButton) {
    nextStepButton.style.display = "none";
  }

  // Asegurar que los elementos del tutorial tengan un z-index adecuado
  // (mayor que el del overlay, que es 900)
  if (cajaT) cajaT.style.zIndex = "901";
  if (infoButton) infoButton.style.zIndex = "901";
  if (micIcon) micIcon.style.zIndex = "901";
  if (sendBtnContainer) sendBtnContainer.style.zIndex = "901";
  if (nextStepButton) nextStepButton.style.zIndex = "950"; // El botón "Siguiente" por encima de todo
  if (tutorialTitleElement) tutorialTitleElement.style.zIndex = "902"; // El título por encima de cajaT

  // Ocultar todos los tooltips activos para limpiar la pantalla entre escenas
  hideAllTooltips();
}

// --- Definición de las escenas del tutorial ---
// Cada función asíncrona representa una "escena" que esperará el clic del usuario para avanzar
const tutorialSteps = [
  async () => {
    // Escena 2: Grabar, Info, Enviar (elementos del chat)
    console.log("Tutorial Escena 1: Grabar, Info, Enviar.");
    resetElementsForStep(); // Limpiar todo antes de mostrar solo el título

    // Crear y mostrar el título "Tutorial" si no existe
    if (!tutorialTitleElement) {
      tutorialTitleElement = document.createElement("h1");
      tutorialTitleElement.textContent = "Tutorial";
      tutorialTitleElement.style.position = "absolute";
      tutorialTitleElement.style.top = "2em"; // 2em desde la parte superior
      tutorialTitleElement.style.left = "50%";
      tutorialTitleElement.style.transform = "translateX(-50%)"; // Solo centrado horizontalmente
      tutorialTitleElement.style.color = "#FFF";
      tutorialTitleElement.style.textAlign = "center";
      tutorialTitleElement.style.fontFamily = '"Work Sans"';
      tutorialTitleElement.style.fontSize = "8rem";
      tutorialTitleElement.style.zIndex = "902"; // Asegurar que esté por encima del overlay
      document.body.appendChild(tutorialTitleElement);
    }
    tutorialTitleElement.style.display = "block"; // Mostrar el título

    // Mostrar elementos de la escena con los estilos específicos del tutorial
    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/micro.gif";
      showTutorialHighlightArrow(
        micIcon,
        `<span>Pulsa el botón una vez</span> para que la IA te escuche.`,
        "center", // O 'left' según la imagen que se ajuste mejor
        160 // Altura de la flecha en píxeles (ajusta según tus imágenes)
      );
    }
    if (sendBtnContainer) sendBtnContainer.style.display = "flex";

    // Mostrar tooltips específicos para esta escena
    if (infoButton) {
      showPersistentTooltip(infoButton, "Instrucciones", "right");
    }
    if (micIcon) showPersistentTooltip(micIcon, "Grabar", "bottom");
    if (sendBtnContainer)
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");

    // Mostrar el botón "Siguiente" (restableciendo su texto si se cambió)
    if (nextStepButton) {
      nextStepButton.style.display = "flex";
      nextStepButton.querySelector("p").textContent = "Siguiente";
    }

    await waitForNextStep(); // Espera el clic en "Siguiente"
  },
  async () => {
    // Escena 3: Escuchando, Info, Enviar
    console.log("Tutorial Escena 2: Escuchando, Info, Enviar.");
    resetElementsForStep();

    // Mostrar elementos (los mismos que la escena 2, solo cambia el micrófono)
    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/stopR.gif"; // Cambia la imagen del micrófono
    }
    if (sendBtnContainer) sendBtnContainer.style.display = "flex";

    // Mostrar tooltips
    if (infoButton) {
      showPersistentTooltip(infoButton, "Instrucciones", "bottom");
    }
    if (micIcon) {
      showPersistentTooltip(micIcon, "Escuchando", "bottom");
      showTutorialHighlightArrow(
        micIcon,
        `Estoy escuchando tu mensaje. <span>Pulsa </span> para detener la grabación.`,
        "center", // O 'left' según la imagen que se ajuste mejor
        160 // Altura de la flecha en píxeles (ajusta según tus imágenes)
      );
    }
    if (sendBtnContainer)
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");

    if (nextStepButton) nextStepButton.style.display = "flex";
    await waitForNextStep();
  },
  async () => {
    // Escena 2: Grabar, Info, Enviar (elementos del chat)
    console.log("Tutorial Escena 3: Grabar, Info, Enviar.");
    resetElementsForStep(); // Limpiar todo antes de mostrar solo el título
    // Mostrar elementos de la escena con los estilos específicos del tutorial
    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/micro.gif";
      showTutorialHighlightArrow(
        micIcon,
        `¿Algo no quedó bien? <span>pulsa y vuelve a grabarlo</span>`,
        "center", // O 'left' según la imagen que se ajuste mejor
        160 // Altura de la flecha en píxeles (ajusta según tus imágenes)
      );
    }
    if (sendBtnContainer) sendBtnContainer.style.display = "flex";

    // Mostrar tooltips específicos para esta escena
    if (infoButton) {
      showPersistentTooltip(infoButton, "Instrucciones", "bottom");
    }
    if (micIcon) showPersistentTooltip(micIcon, "Grabar", "bottom");
    if (sendBtnContainer)
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");

    // Mostrar el botón "Siguiente" (restableciendo su texto si se cambió)
    if (nextStepButton) {
      nextStepButton.style.display = "flex";
      nextStepButton.querySelector("p").textContent = "Siguiente";
    }

    await waitForNextStep(); // Espera el clic en "Siguiente"
  },
  async () => {
    // Escena 4: Cancelar, Nuevo Chat, Info, Enviar
    console.log("Tutorial Escena 4: Cancelar, Nuevo Chat, Info, Enviar.");
    resetElementsForStep();

    // Mostrar elementos
    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/cancelR.gif"; // Micrófono a "Cancelar"
      showTutorialHighlightArrow(
        micIcon,
        `Estoy pensando tu respuesta. <span>Pulsa si deseas detener el razonamiento.</span>`,
        "center", // O 'left' según la imagen que se ajuste mejor
        160 // Altura de la flecha en píxeles (ajusta según tus imágenes)
      );
    }
    if (sendBtnContainer) sendBtnContainer.style.display = "flex";

    // --- CREAR Y MOSTRAR EL BOTÓN "NUEVO CHAT" ESPECÍFICO PARA EL TUTORIAL ---
    if (!tutorialNewChatButton) {
      tutorialNewChatButton = document.createElement("img");
      tutorialNewChatButton.id = "tutorialNewChatButton";
      tutorialNewChatButton.src = "public/nuevoC.png";
      tutorialNewChatButton.alt = "Nuevo Chat";
      tutorialNewChatButton.style.position = "absolute";
      tutorialNewChatButton.style.top = "6.7vh";
      tutorialNewChatButton.style.right = "7vw";
      tutorialNewChatButton.style.width = "auto";
      tutorialNewChatButton.style.height = "3vh";
      tutorialNewChatButton.style.cursor = "pointer";
      tutorialNewChatButton.style.zIndex = "901";
      document.body.appendChild(tutorialNewChatButton);
      console.log("Botón 'Nuevo Chat' del tutorial creado y mostrado.");
    }
    if (tutorialNewChatButton) {
      tutorialNewChatButton.style.height = "4.5vh";
      tutorialNewChatButton.style.display = "block";
    }

    // Mostrar tooltips
    if (infoButton) showPersistentTooltip(infoButton, "Instrucciones", "right");
    if (micIcon) showPersistentTooltip(micIcon, "Cancelar pregunta", "bottom");
    if (sendBtnContainer)
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");
    if (tutorialNewChatButton)
      showPersistentTooltip(tutorialNewChatButton, "Nuevo Chat", "bottom");

    // Ocultar el botón "Siguiente" en la última escena (o cambiarlo a "Finalizar" si lo prefieres)
    if (nextStepButton) {
      nextStepButton.style.display = "flex";
      nextStepButton.querySelector("p").textContent = "Siguiente"; // Texto "Finalizar" en la última escena
    }
    await waitForNextStep(); // Espera el clic en "Finalizar"
  },
  async () => {
    // Escena 2: Grabar, Info, Enviar (elementos del chat)
    console.log("Tutorial Escena 5: Grabar, Info, Enviar.");
    resetElementsForStep(); // Limpiar todo antes de mostrar solo el título

    // --- CREAR Y MOSTRAR EL BOTÓN "NUEVO CHAT" ESPECÍFICO PARA EL TUTORIAL ---
    if (!tutorialNewChatButton) {
      tutorialNewChatButton = document.createElement("img");
      tutorialNewChatButton.id = "tutorialNewChatButton";
      tutorialNewChatButton.src = "public/nuevoC.png";
      tutorialNewChatButton.alt = "Nuevo Chat";
      tutorialNewChatButton.style.position = "absolute";
      tutorialNewChatButton.style.top = "6.7vh";
      tutorialNewChatButton.style.right = "7vw";
      tutorialNewChatButton.style.width = "auto";
      tutorialNewChatButton.style.height = "3vh";
      tutorialNewChatButton.style.cursor = "pointer";
      tutorialNewChatButton.style.zIndex = "901";
      document.body.appendChild(tutorialNewChatButton);
      console.log("Botón 'Nuevo Chat' del tutorial creado y mostrado.");
    }
    if (tutorialNewChatButton) {
      tutorialNewChatButton.style.height = "4.5vh";
      tutorialNewChatButton.style.display = "block";
    }
    if (tutorialNewChatButton) {
      showPersistentTooltip(tutorialNewChatButton, "Nuevo Chat", "bottom");
      showTutorialHighlightArrow(
        tutorialNewChatButton,
        `Pulsa <span>"Nuevo chat" </span> para comenzar una nueva conversación con la IA`,
        "left", // O 'left' según la imagen que se ajuste mejor
        120 // Altura de la flecha en píxeles (ajusta según tus imágenes)
      );
    }

    // Mostrar elementos de la escena con los estilos específicos del tutorial
    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/micro.gif";
    }
    if (sendBtnContainer) {
      sendBtnContainer.style.display = "flex";
    }

    if(sendBtn){
        showTutorialHighlightArrow(
        sendBtn,
        `Si estás conforme con lo que dijiste, pulsa el botón <span>"Enviar".</span>`,
        "left", // O 'left' según la imagen que se ajuste mejor
        180 // Altura de la flecha en píxeles (ajusta según tus imágenes)
      );
    }

    // Mostrar tooltips específicos para esta escena
    if (infoButton) {
      showPersistentTooltip(infoButton, "Instrucciones", "right");
    }
    if (micIcon) showPersistentTooltip(micIcon, "Grabar", "bottom");
    if (sendBtnContainer){
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");        
    }
    // Mostrar el botón "Siguiente" (restableciendo su texto si se cambió)
    if (nextStepButton) {
      nextStepButton.style.display = "flex";
      nextStepButton.querySelector("p").textContent = "Finalizar";
    }

    await waitForNextStep(); // Espera el clic en "Siguiente"
  },
];

// --- Helper para esperar el clic del botón "Siguiente/Comenzar/Finalizar" ---
function waitForNextStep() {
  return new Promise((resolve) => {
    resolveNextStep = resolve; // Almacena la función resolve para llamarla desde el listener
  });
}

// --- Función principal para iniciar el tutorial ---
export async function startTutorial() {
  if (tutorialActive) return;
  tutorialActive = true;
  tutorialSkipped = false;

  // Mostrar el overlay que cubre todo
  if (tutorialOverlay) tutorialOverlay.style.display = "block";
  // Mostrar el botón para omitir el tutorial
  if (skipTutorialBtn) skipTutorialBtn.style.display = "flex";

  // Crear el botón "Siguiente" si no existe
  if (!nextStepButton) {
    nextStepButton = document.createElement("div");
    nextStepButton.className = "next-step-button"; // Reutilizamos la clase que tenías para el estilo
    nextStepButton.id = "nextStepButton"; // Le damos un ID distinto para referencia
    const p = document.createElement("p");
    nextStepButton.appendChild(p); // El texto se establecerá en cada escena
    document.body.appendChild(nextStepButton);

    // Añadir el listener para pasar a la siguiente escena
    nextStepButton.addEventListener("click", () => {
      if (resolveNextStep) {
        resolveNextStep(); // Resuelve la promesa de la escena actual
        resolveNextStep = null; // Limpia la referencia
      }
    });
  }
  // El display del botón "Siguiente" se controla dentro de cada escena

  // Iterar sobre cada paso del tutorial
  for (let i = 0; i < tutorialSteps.length; i++) {
    if (tutorialSkipped) {
      break;
    }
    await tutorialSteps[i](); // Ejecuta la función de la escena y espera el clic
  }

  // Una vez que el tutorial termina (o se omite), llamamos a endTutorial
  endTutorial();
}

// --- Función para finalizar el tutorial ---
function endTutorial() {
  console.log("Tutorial finalizado.");
  tutorialActive = false;

  // Ocultar el overlay y el botón de omitir
  if (tutorialOverlay) tutorialOverlay.style.display = "none";
  if (skipTutorialBtn) skipTutorialBtn.style.display = "none";

  // Asegurarse de remover el botón "Siguiente" del DOM al finalizar
  if (nextStepButton) {
    if (nextStepButton.parentNode) {
      nextStepButton.parentNode.removeChild(nextStepButton);
    }
    nextStepButton = null;
  }

  // Asegurarse de que todos los tooltips estén ocultos
  hideAllTooltips();
  resetElementsForStep();
  presentIntroduction();
}

// --- Listener para el botón de omitir el tutorial ---
if (skipTutorialBtn) {
  skipTutorialBtn.addEventListener("click", () => {
    console.log("Tutorial omitido.");
    tutorialSkipped = true;
    // Si hay una promesa de espera activa, resuélvela para que el bucle avance y se rompa
    if (resolveNextStep) {
      resolveNextStep();
      resolveNextStep = null;
    }
    endTutorial(); // Finaliza el tutorial inmediatamente
  });
}

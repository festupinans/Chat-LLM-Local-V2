// src/tutorial.js

import {
  showPersistentTooltip,
  hideAllTooltips,
  showTutorialHighlightArrow,
} from "./tooltips.js";
import { presentIntroduction } from "./Introduccion.js";

// --- Referencias a elementos del DOM ---
const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialInteractionOverlay = document.getElementById("tutorialInteractionOverlay"); // NUEVO: Overlay de interacción
const cajaT = document.querySelector(".cajaT");
const infoButton = document.getElementById("infoButton");
const micIcon = document.getElementById("micIcon");
const sendBtnContainer = document.getElementById("envCont");
const sendBtn = document.getElementById("sendBtn");
const skipTutorialBtn = document.getElementById("skipTutorialBtn");
const otherNewButton = document.getElementById("new");

// NUEVOS ELEMENTOS PARA EL TUTORIAL INTERACTIVO
let tutorialTitleElement = null;
let nextStepButton = null;
let resolveNextStep = null;

// --- Variables de estado del tutorial ---
let tutorialActive = false;
let tutorialSkipped = false;
let tutorialNewChatButton = null;

function resetElementsForStep() {
  // Ocultar elementos principales del chat y restablecer sus estilos a los normales de la app
  if (cajaT) {
    cajaT.style.display = "none";
    cajaT.style.margin = "0";
    cajaT.style.width = "51vw";
    cajaT.style.minHeight = "240px";
    cajaT.style.pointerEvents = "auto"; // Restaurar a normal post-tutorial
  }
  if (infoButton) {
    infoButton.style.height = "2.8vh";
    infoButton.style.display = "none";
    infoButton.style.pointerEvents = "auto";
  }
  if (micIcon) {
    micIcon.style.display = "none";
    micIcon.style.pointerEvents = "auto";
  }
  if (sendBtnContainer) {
    sendBtnContainer.style.display = "none";
    sendBtnContainer.style.pointerEvents = "auto";
  }
  if (sendBtn) sendBtn.style.pointerEvents = "auto";


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
    nextStepButton.style.pointerEvents = "auto"; // Restaurar a normal post-tutorial
  }

  // Ocultar el overlay de interacción
  if (tutorialInteractionOverlay) {
    tutorialInteractionOverlay.style.display = "none";
  }

  // Asegurar que los elementos del tutorial tengan un z-index adecuado
  if (cajaT) cajaT.style.zIndex = "901";
  if (infoButton) infoButton.style.zIndex = "901";
  if (micIcon) micIcon.style.zIndex = "901";
  if (sendBtnContainer) sendBtnContainer.style.zIndex = "901";
  // nextStepButton y tutorialTitleElement ya tienen z-index en CSS o se asigna al crearse
  if (tutorialTitleElement) tutorialTitleElement.style.zIndex = "902";

  // Ocultar todos los tooltips activos para limpiar la pantalla entre escenas
  hideAllTooltips();
}

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

    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
      cajaT.style.pointerEvents = "none";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
      infoButton.style.pointerEvents = "none";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/micro.gif";
      micIcon.style.pointerEvents = "none";
      showTutorialHighlightArrow(
        micIcon,
        `<span>Pulsa el botón una vez</span> para que la IA te escuche.`,
        "center", // O 'left' según la imagen que se ajuste mejor
        160 // Altura de la flecha en píxeles (ajusta según tus imágenes)
      );
    }
    if (sendBtnContainer) {
      sendBtnContainer.style.display = "flex";
      sendBtnContainer.style.pointerEvents = "none";
    }
    if (sendBtn) sendBtn.style.pointerEvents = "none";

    if (infoButton) {
      showPersistentTooltip(infoButton, "Instrucciones", "bottom");
    }
    if (micIcon) showPersistentTooltip(micIcon, "Grabar", "bottom");
    if (sendBtnContainer)
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");

    if (nextStepButton) {
      nextStepButton.style.display = "flex";
      nextStepButton.querySelector("p").textContent = "Siguiente";
      nextStepButton.style.zIndex = "9999";
    }
    if (skipTutorialBtn) {
        skipTutorialBtn.style.display = "flex"
        skipTutorialBtn.style.zIndex = "9999";
    }

    await waitForNextStep();
  },
  async () => {
    console.log("Tutorial Escena 3: Escuchando, Info, Enviar.");
    resetElementsForStep();

    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
      cajaT.style.pointerEvents = "none";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
      infoButton.style.pointerEvents = "none";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/stopR.gif";
      micIcon.style.pointerEvents = "none";
    }
    if (sendBtnContainer) {
      sendBtnContainer.style.display = "flex";
      sendBtnContainer.style.pointerEvents = "none";
    }
    if (sendBtn) sendBtn.style.pointerEvents = "none";

    if (infoButton) {
      showPersistentTooltip(infoButton, "Instrucciones", "bottom");
    }
    if (micIcon) {
      showPersistentTooltip(micIcon, "Escuchando", "bottom");
      showTutorialHighlightArrow(
        micIcon,
        `Estoy escuchando tu mensaje. <span>Pulsa </span> para detener la grabación.`,
        "center",
        160
      );
    }
    if (sendBtnContainer)
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");

    if (nextStepButton) {
      nextStepButton.style.display = "flex";
      nextStepButton.style.zIndex = "9999";
    }
    if (skipTutorialBtn) skipTutorialBtn.style.zIndex = "9999";
    await waitForNextStep();
  },
  async () => {
    console.log("Tutorial Escena 4: Grabar, Info, Enviar.");
    resetElementsForStep();

    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
      cajaT.style.pointerEvents = "none";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
      infoButton.style.pointerEvents = "none";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/micro.gif";
      micIcon.style.pointerEvents = "none";
      showTutorialHighlightArrow(
        micIcon,
        `¿Algo no quedó bien? <span>pulsa y vuelve a grabarlo</span>`,
        "center",
        160
      );
    }
    if (sendBtnContainer) {
      sendBtnContainer.style.display = "flex";
      sendBtnContainer.style.pointerEvents = "none";
    }
    if (sendBtn) sendBtn.style.pointerEvents = "none";

    if (infoButton) {
      showPersistentTooltip(infoButton, "Instrucciones", "bottom");
    }
    if (micIcon) showPersistentTooltip(micIcon, "Grabar", "bottom");
    if (sendBtnContainer)
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");

    if (nextStepButton) {
      nextStepButton.style.display = "flex";
      nextStepButton.querySelector("p").textContent = "Siguiente";
      nextStepButton.style.zIndex = "9999";
    }
    if (skipTutorialBtn) skipTutorialBtn.style.zIndex = "9999";

    await waitForNextStep();
  },
  async () => {
    console.log("Tutorial Escena 5: Cancelar, Nuevo Chat, Info, Enviar.");
    resetElementsForStep();

    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
      cajaT.style.pointerEvents = "none";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
      infoButton.style.pointerEvents = "none";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/cancelR.gif";
      micIcon.style.pointerEvents = "none";
      showTutorialHighlightArrow(
        micIcon,
        `Estoy pensando tu respuesta. <span>Pulsa si deseas detener el razonamiento.</span>`,
        "center",
        160
      );
    }
    if (sendBtnContainer) {
      sendBtnContainer.style.display = "flex";
      sendBtnContainer.style.pointerEvents = "none";
    }
    if (sendBtn) sendBtn.style.pointerEvents = "none";

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
      tutorialNewChatButton.style.zIndex = "901"; // Por encima del overlay oscuro
      document.body.appendChild(tutorialNewChatButton);
      console.log("Botón 'Nuevo Chat' del tutorial creado y mostrado.");
    }
    if (tutorialNewChatButton) {
      tutorialNewChatButton.style.height = "4.5vh";
      tutorialNewChatButton.style.display = "block";
      tutorialNewChatButton.style.pointerEvents = "none"; // Desactivar clics
    }

    if (infoButton) showPersistentTooltip(infoButton, "Instrucciones", "right");
    if (micIcon) showPersistentTooltip(micIcon, "Cancelar pregunta", "bottom");
    if (sendBtnContainer)
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");
    if (tutorialNewChatButton)
      showPersistentTooltip(tutorialNewChatButton, "Nuevo Chat", "bottom");

    if (nextStepButton) {
      nextStepButton.style.display = "flex";
      nextStepButton.querySelector("p").textContent = "Siguiente";
      nextStepButton.style.zIndex = "9999";
    }
    if (skipTutorialBtn) skipTutorialBtn.style.zIndex = "9999";
    await waitForNextStep();
  },
  async () => {
    console.log("Tutorial Escena 6: Nuevo Chat y Enviar (final)."); // Ajusté el número de escena
    resetElementsForStep();

    // Mostrar solo los elementos relevantes para esta escena final
    if (cajaT) {
      cajaT.style.display = "flex";
      cajaT.style.margin = "10em 4em";
      cajaT.style.width = "75vw";
      cajaT.style.minHeight = "300px";
      cajaT.style.pointerEvents = "none";
    }
    if (infoButton) {
      infoButton.style.display = "block";
      infoButton.style.height = "4.7vh";
      infoButton.style.pointerEvents = "none";
    }
    if (micIcon) {
      micIcon.style.display = "block";
      micIcon.src = "public/micro.gif"; // Volver a grabar
      micIcon.style.pointerEvents = "none";
    }
    if (sendBtnContainer) {
      sendBtnContainer.style.display = "flex";
      sendBtnContainer.style.pointerEvents = "none";
    }
    if (sendBtn) sendBtn.style.pointerEvents = "none";

    if (!tutorialNewChatButton) {
      // Si el botón no existe por alguna razón, recréalo.
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
    }
    if (tutorialNewChatButton) {
      tutorialNewChatButton.style.height = "4.5vh";
      tutorialNewChatButton.style.display = "block";
      tutorialNewChatButton.style.pointerEvents = "none"; // Desactivar clics
      showPersistentTooltip(tutorialNewChatButton, "Nuevo Chat", "bottom");
      showTutorialHighlightArrow(
        tutorialNewChatButton,
        `Pulsa <span>"Nuevo chat" </span> para comenzar una nueva conversación con la IA`,
        "left",
        120
      );
    }

    if (sendBtn) {
      showTutorialHighlightArrow(
        sendBtn,
        `Si estás conforme con lo que dijiste, pulsa el botón <span>"Enviar".</span>`,
        "left",
        180
      );
    }

    if (infoButton) {
      showPersistentTooltip(infoButton, "Instrucciones", "right");
    }
    if (micIcon) showPersistentTooltip(micIcon, "Grabar", "bottom");
    if (sendBtnContainer) {
      showPersistentTooltip(sendBtnContainer, "Enviar", "right");
    }

    if (nextStepButton) {
      nextStepButton.style.display = "flex";
      nextStepButton.querySelector("p").textContent = "Finalizar";
      nextStepButton.style.zIndex = "9999";
    }
    if (skipTutorialBtn) skipTutorialBtn.style.zIndex = "9999";

    await waitForNextStep();
  },
];

function waitForNextStep() {
  return new Promise((resolve) => {
    resolveNextStep = resolve;
  });
}

export async function startTutorial() {
  if (tutorialActive) return;
  tutorialActive = true;
  tutorialSkipped = false;

  if (tutorialOverlay) {
    tutorialOverlay.style.display = "block";
    requestAnimationFrame(() => {
      tutorialOverlay.classList.add("show"); // Activa la transición de opacidad
    });
  }

  // Mostrar el nuevo overlay de interacción
  if (tutorialInteractionOverlay) {
    tutorialInteractionOverlay.style.display = "block";
    tutorialInteractionOverlay.style.zIndex = "920"; // Asegura que esté por encima de elementos del tutorial pero debajo de botones de control
    tutorialInteractionOverlay.style.pointerEvents = "none"; // Permite el paso de eventos a los elementos hijos con 'pointer-events: all'
  }


  if (!nextStepButton) {
    nextStepButton = document.createElement("div");
    nextStepButton.className = "next-step-button";
    nextStepButton.id = "nextStepButton";
    const p = document.createElement("p");
    nextStepButton.appendChild(p);
    // Añade el botón al body directamente, su z-index lo pondrá por encima de tutorialInteractionOverlay
    document.body.appendChild(nextStepButton);

    nextStepButton.addEventListener("click", () => {
      if (resolveNextStep) {
        resolveNextStep();
        resolveNextStep = null;
      }
    });
  }
  // Asegúrate de que los botones de control (skipTutorialBtn y nextStepButton)
  // tienen un z-index muy alto y pointer-events: all
  if (skipTutorialBtn) skipTutorialBtn.style.pointerEvents = "all";
  if (nextStepButton) nextStepButton.style.pointerEvents = "all";


  for (let i = 0; i < tutorialSteps.length; i++) {
    if (tutorialSkipped) {
      break;
    }
    await tutorialSteps[i]();
  }

  endTutorial();
}

function endTutorial() {
  console.log("Tutorial finalizado.");
  tutorialActive = false;

  if (tutorialOverlay) {
    tutorialOverlay.classList.remove("show"); // Desactiva la transición
    setTimeout(() => {
      tutorialOverlay.style.display = "none"; // Oculta después de la transición
    }, 300); // Coincide con la duración de la transición
  }
  if (skipTutorialBtn) {
    skipTutorialBtn.style.display = "none";
    skipTutorialBtn.style.pointerEvents = "none"; // Desactivar clics
  }

  if (nextStepButton) {
    if (nextStepButton.parentNode) {
      nextStepButton.parentNode.removeChild(nextStepButton);
    }
    nextStepButton = null;
  }

  // Ocultar el nuevo overlay de interacción
  if (tutorialInteractionOverlay) {
    tutorialInteractionOverlay.style.display = "none";
  }

  hideAllTooltips();
  resetElementsForStep(); // Este también limpiará los z-index y pointer-events de elementos del chat
  presentIntroduction();
}

if (skipTutorialBtn) {
  skipTutorialBtn.addEventListener("click", () => {
    console.log("Tutorial omitido.");
    tutorialSkipped = true;
    if (resolveNextStep) {
      resolveNextStep();
      resolveNextStep = null;
    }
    endTutorial();
  });
}
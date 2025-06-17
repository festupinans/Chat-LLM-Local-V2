// recorder.js
import { sendMensajeIANormal, StopSendMensaje } from "./Ollama";
import { synth, isIASpeaking } from "./speak";
import { PlayIdel } from "./ThreeJS/AnimController";
import { showTooltip, hideAllTooltips} from "./tooltips.js";
let firstMic = true,
  firstStop = true,
  firstCancel = true,
  firstSend    = true,
    firstNewChat = true;
// ——————————————————————————————————————————————————————————————————————————
// Variables globales y estados
// ——————————————————————————————————————————————————————————————————————————
let recognition = null;
let finalTranscript = "";
let isRecognizing = false;
let hasUsedToggleOnce = false;
let questionCount = 0;
let avisador = false;
let isIAThinking = false;
let isIAResponding = false;
let iaQuestionCount = 0; // NUEVA VARIABLE: Contador de preguntas de IA

// ——————————————————————————————————————————————————————————————————————————
// Referencias al DOM
// ——————————————————————————————————————————————————————————————————————————
const micIcon = document.getElementById("micIcon");
const sendButton = document.getElementById("sendBtn");
const envCont = document.getElementById("envCont");
const messageLabel = document.getElementById("messageLabel");
// NUEVAS REFERENCIAS DOM (aunque no se usan directamente en este script para la animación, se mantienen)
const supDialog = document.getElementById("supDialog"); // Referencia al h2
const cajaD = document.querySelector(".cajaD"); // Referencia al div.cajaD
const cajaT = document.querySelector(".cajaT"); // Referencia al div.cajaT

// --- Listener para el evento de voz finalizada naturalmente ---
window.addEventListener("iaspeech:ended", () => {
  console.log("La IA terminó de hablar de forma natural, reiniciando estado.");
  if (isIAResponding && !isIASpeaking) {
    resetAfterIA();
  }
});

// --- Listener para cuando la fase inicial se completa (manteniendo el evento) ---
window.addEventListener("initialPhaseCompleted", (event) => {
  console.log("Fase inicial de preguntas completada desde Recorder.js.");
  // Aquí podrías añadir lógica adicional si es necesario en recorder.js
});

// ——————————————————————————————————————————————————————————————————————————
// startRecognition: abre SpeechRecognition y muestra burbujas de dictado
// ——————————————————————————————————————————————————————————————————————————
function startRecognition() {
  // AÑADIR ESTO: Si la IA está hablando cuando el usuario presiona para iniciar el reconocimiento
  // DEBEMOS CANCELAR LA VOZ DE LA IA INMEDIATAMENTE.
  if (isIASpeaking) {
    console.log(
      "IA estaba hablando, pero el usuario inició el reconocimiento. Cancelando voz de IA."
    );
    const valor = Math.floor(Math.random() * 2) + 1;
    PlayIdel();
    synth.cancel(); // Detiene la síntesis de voz actual
    // Opcional: Si quieres un reseteo más completo de la IA al interrumpirla así,
    // podrías llamar a resetAfterIA() aquí, pero synth.cancel() es lo mínimo necesario.
    // resetAfterIA(); // Esto puede ser demasiado agresivo, prueba sin él primero.
  }

  avisador = false;
  recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = true;

  finalTranscript = "";
  messageLabel.innerHTML = "";
  //   updateSendButtonState();

  recognition.onresult = (event) => {
    let interimTranscript = "";
    let currentFinalSegment = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      if (result.isFinal) {
        currentFinalSegment += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    finalTranscript += currentFinalSegment;
    const displayTranscript = finalTranscript + interimTranscript;

    messageLabel.innerHTML = "";
    const bubble = document.createElement("div");
    bubble.className = "messageBubble";
    bubble.id = "bubble";
    const p = document.createElement("p");
    p.className = event.results[event.results.length - 1].isFinal
      ? "final"
      : "interim";
    p.textContent = displayTranscript;
    bubble.appendChild(p);
    messageLabel.appendChild(bubble);

    //     updateSendButtonState();
  };

  recognition.onerror = (e) => {
    console.error("Speech error", e);
    resetAfterIA();
  };

  recognition.onend = () => {
    isRecognizing = false;
    recognition = null;
    console.log("Reconocimiento finalizado:", finalTranscript);

    if (questionCount < 3 && finalTranscript.trim() !== "") {
      envCont.style.display = "flex";
    }
    updateSendButtonState();
  };

  recognition.start();
  isRecognizing = true;
  console.log("Reconocimiento iniciado");
}

// ——————————————————————————————————————————————————————————————————————————
// stopRecognition: detiene SpeechRecognition
// ——————————————————————————————————————————————————————————————————————————
function stopRecognition() {
  if (recognition) {
    recognition.stop();
    isRecognizing = false;
    updateSendButtonState();
  }
}

// ——————————————————————————————————————————————————————————————————————————
// updateSendButtonState: habilita/deshabilita “Enviar” si no hay texto
// ——————————————————————————————————————————————————————————————————————————
function updateSendButtonState() {
  if (avisador == true) {
    envCont.style.display = "none";
  } else {
    sendButton.disabled = finalTranscript.trim() === "";
    if (!isIAThinking && !isIAResponding && finalTranscript.trim() !== "") {
      envCont.style.display = "flex";
      if (firstSend) {
        showTooltip(sendButton, 'Enviar', 'bottom');
        firstSend = false;
      }
    } else {
      envCont.style.display = "none";
    }
  }
}

// ——————————————————————————————————————————————————————————————————————————
// toggleRecognition: maneja los 3 estados del micrófono:
// 1) idle -> startRecognition
// 2) listening -> stopRecognition y posponer envFASE según questionCount
// 3) thinking/responding -> CANCELAR IA
// ——————————————————————————————————————————————————————————————————————————
function toggleRecognition() {
  // Si la IA está pensando o respondiendo, este clic SIEMPRE CANCELA LA INTERACCIÓN
  if (isIAThinking || isIAResponding) {
    console.log("Usuario cancela interacción con IA por completo."); // Forzar la cancelación de cualquier síntesis de voz en curso o en cola
    synth.cancel(); // Limpiar las burbujas de la IA inmediatamente // Restablecer todo el estado de la IA
    //     messageLabel.innerHTML = "";
    resetAfterIA();
    return; // Terminar la función aquí, ya se ha manejado la cancelación
  } // 1) INTRODUCCIÓN (questionCount < 3)

  if (!isRecognizing && questionCount < 3) {
    if (!hasUsedToggleOnce) {
      envCont.style.display = "none";
      hasUsedToggleOnce = true;
    }
    micIcon.src = "stopR.gif";
    startRecognition();   
    if (firstStop) {
      showTooltip(micIcon, "Escuchando", 'bottom');
      firstStop = false;
    }
    envCont.style.display = "none";
    return;
  }
  if (isRecognizing && questionCount < 3) {
    stopRecognition();
    micIcon.src = "micro.gif";
    if (firstMic) {
    showTooltip(micIcon, 'Grabar', 'down');
    firstMic = false;
  }
    return;
  } // 2) FASE IA (questionCount >= 3)

  if (!isRecognizing && questionCount >= 3) {
    startRecognition();
    micIcon.src = "stopR.gif";
    envCont.style.display = "none";
    return;
  }

  if (isRecognizing && questionCount >= 3) {
    stopRecognition();
    const userText = finalTranscript.trim();
    if (!userText) {
      micIcon.src = "micro.gif";
      updateSendButtonState();
      return;
    }
    micIcon.src = "micro.gif";
    updateSendButtonState();
    return;
  }
}

// ——————————————————————————————————————————————————————————————————————————
// EventListeners iniciales
// ——————————————————————————————————————————————————————————————————————————
micIcon.addEventListener("click", toggleRecognition);
micIcon.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    toggleRecognition();
  },
  { passive: false }
);

// ——————————————————————————————————————————————————————————————————————————
// sendButton 'click': maneja INTRODUCCIÓN (3 preguntas) y LLAMA A IA
// ——————————————————————————————————————————————————————————————————————————
sendButton.addEventListener("click", () => {
  hideAllTooltips();
  if (finalTranscript.trim() === "") return;
  console.log(`Texto enviado:`, finalTranscript);

  if (questionCount < 3) {
    console.log(`Pregunta INTRO ${questionCount + 1}:`, finalTranscript);
    envCont.style.display = "none";
    questionCount++;
    //     finalTranscript = "";
    updateSendButtonState();
  } else {
    // FASE IA
    const userText = finalTranscript.trim();
    //     messageLabel.innerHTML = "";
    envCont.style.display = "none"; // 3) IA pensando

    isIAThinking = true;
    micIcon.src = "cancelR.gif"; // Micrófono con "X" de cancelar // Mostrar ícono “pensar.gif”

    if (firstCancel) {
      showTooltip(micIcon, 'Cancelar pregunta', 'bottom');
      firstCancel = false;
    }
    const thinkingWrapper = document.createElement("div");
    thinkingWrapper.style.width = "90%";
    thinkingWrapper.style.display = "flex";
    thinkingWrapper.style.justifyContent = "flex-end";
    thinkingWrapper.id = "cuadroPensando";
    const thinkImg = document.createElement("img");
    thinkImg.src = "Think.gif";
    thinkImg.alt = "IA Pensando...";
    thinkImg.style.width = "5rem";
    thinkImg.style.height = "5rem";
    thinkImg.style.objectFit = "contain";
    thinkingWrapper.appendChild(thinkImg);
    messageLabel.appendChild(thinkingWrapper); // Invocar IA con streaming y pasar callbacks para UI

    sendMensajeIANormal(
      userText,
      (chunk) => {
        if (isIAThinking) {
          isIAThinking = false;
          isIAResponding = true;
          messageLabel.innerHTML = "";
        }
        let bubble = messageLabel.querySelector(".messageIA");
        if (!bubble) {
          bubble = document.createElement("div");
          bubble.className = "messageIA";
          const p = document.createElement("p");
          p.innerHTML = chunk;
          bubble.appendChild(p);
          messageLabel.appendChild(bubble);
        } else {
          const p = bubble.querySelector("p");
          p.innerHTML = chunk;
        }
      },
      () => {
        // Callback cuando la IA termina de responder (ya sea texto o voz)
        avisador = true;
        iaQuestionCount++; // Incrementa el contador de preguntas de IA
        checkAndShowNewChatButton(); // Llama a la función para verificar el botón // Aquí no llamamos a resetAfterIA() directamente. // El evento 'iaspeech:ended' (desde speak.ts) se encargará de resetear // cuando la voz termine su reproducción natural.
      },
      () => {
        // IA cancelada o error
        avisador = true;
        resetAfterIA(); // Si hay un error, reseteamos manualmente.
      }
    );
  }
});

// ——————————————————————————————————————————————————————————————————————————
// Función auxiliar: resetAfterIA()
//   Restaurar estado micrófono y banderas IA cuando la IA finaliza o se cancela
// ——————————————————————————————————————————————————————————————————————————
function resetAfterIA() {
  // IMPORTANTE: NO LLAMAR synth.cancel() AQUÍ.
  // La cancelación explícita la maneja toggleRecognition().
  isIAThinking = false;
  isIAResponding = false;
  micIcon.src = "micro.gif"; // Volver al icono de micrófono normal
  micIcon.style.marginLeft = "auto";
  //   finalTranscript = ""; // También limpia el finalTranscript al resetear

  envCont.style.display = "none";
  PlayIdel();
  StopSendMensaje();
  updateSendButtonState();
}

// ——————————————————————————————————————————————————————————————————————————
// NUEVA FUNCIÓN: checkAndShowNewChatButton()
//   Verifica el contador de preguntas de IA y muestra el botón si es necesario
// ——————————————————————————————————————————————————————————————————————————
function checkAndShowNewChatButton() {
  if (iaQuestionCount >= 3) {
    let newChatButton = document.getElementById("newChatButton");
    if (!newChatButton) {
      // Si el botón no existe, lo creamos
      newChatButton = document.createElement("img");
      newChatButton.id = "newChatButton";
      newChatButton.src = "nuevoC.png";
      newChatButton.alt = "Nuevo Chat"; // Estilos CSS para posicionamiento
      newChatButton.style.position = "absolute";
      newChatButton.style.top = "6.7vh";
      newChatButton.style.right = "7vw";
      newChatButton.style.width = "auto"; // O un tamaño fijo si lo prefieres
      newChatButton.style.height = "3vh"; // Ajusta el tamaño del botón
      newChatButton.style.cursor = "pointer"; // Indica que es clickeable
      newChatButton.style.zIndex = "1000"; // Asegura que esté por encima de otros elementos
      newChatButton.style.display = "block"; // Asegúrate de que esté visible // Event Listener para recargar la página

      newChatButton.addEventListener("click", () => {
        location.reload(); // Recarga la página
      });

      document.body.appendChild(newChatButton); // Añade el botón al body
      console.log("Botón 'Nuevo Chat' creado y mostrado.");
    } else {
      newChatButton.style.display = "block"; // Si ya existe, asegúrate de que esté visible
      console.log("Botón 'Nuevo Chat' mostrado.");
    }
    if (firstNewChat) {
    showTooltip(newChatButton, 'Nuevo chat', 'bottom');
    firstNewChat = false;
  }
  }
}

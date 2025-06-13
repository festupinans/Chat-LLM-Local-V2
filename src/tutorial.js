// src/tutorial.js

import { showTooltip, hideAllTooltips } from './tooltips.js'; // Asegúrate de que tooltips.js exporte hideAllTooltips
import { presentIntroduction } from './Introduccion.js'; // Asegúrate de que esta ruta sea correcta

// --- Referencias a elementos del DOM ---
const tutorialOverlay = document.getElementById('tutorialOverlay');
const cajaT = document.querySelector('.cajaT');
const infoButton = document.getElementById('infoButton');
const micIcon = document.getElementById('micIcon'); // El micrófono que cambia de imagen
const sendBtnContainer = document.getElementById('envCont'); // Contenedor del botón de enviar
const skipTutorialBtn = document.getElementById('skipTutorialBtn');
const otherNewButton = document.getElementById('new'); // El botón 'new' de tu HTML, si existe y lo quieres ocultar durante el tutorial

// --- Variables de estado del tutorial ---
let tutorialActive = false;
let tutorialTimeout; // Para poder cancelar el temporizador de la escena actual
let tutorialSkipped = false; // Bandera para saber si el usuario omitió el tutorial
let tutorialNewChatButton = null; // Referencia al botón "Nuevo Chat" que el tutorial creará temporalmente

// --- Función para reiniciar el estado de los elementos antes de cada paso o al finalizar ---
// Asegura que cada escena comience "limpia" y que al final el DOM se quede limpio de elementos del tutorial.
function resetElementsForStep() {
    // Ocultar elementos principales del chat
    if (cajaT) cajaT.style.display = 'none';
    if (infoButton) infoButton.style.display = 'none';
    if (micIcon) micIcon.style.display = 'none';
    if (sendBtnContainer) sendBtnContainer.style.display = 'none';

    // Ocultar el botón "Nuevo Chat" si lo estamos manejando para el tutorial
    if (tutorialNewChatButton) {
        tutorialNewChatButton.style.display = 'none';
        // También lo removemos del DOM para que no interfiera después del tutorial
        if (tutorialNewChatButton.parentNode) {
            tutorialNewChatButton.parentNode.removeChild(tutorialNewChatButton);
        }
        tutorialNewChatButton = null; // Limpiar la referencia
    }

    // Si tienes otro botón con id="new" en tu HTML que no es el dinámico de recorder.js,
    // y quieres asegurarte de que esté oculto durante el tutorial
    if (otherNewButton) {
        otherNewButton.style.display = 'none';
    }

    // Asegurar que los elementos que se muestran en el tutorial tengan un z-index adecuado para el tutorial
    // (un z-index mayor que el del overlay, que es 900)
    if (cajaT) cajaT.style.zIndex = '901';
    if (infoButton) infoButton.style.zIndex = '901';
    if (micIcon) micIcon.style.zIndex = '901';
    if (sendBtnContainer) sendBtnContainer.style.zIndex = '901';
    // El z-index del `tutorialNewChatButton` se establece al crearse.

    // Ocultar todos los tooltips activos para limpiar la pantalla entre escenas
    hideAllTooltips();
}

// --- Definición de las escenas del tutorial ---
// Cada función asíncrona representa una "escena" que durará 4 segundos
const tutorialSteps = [
    async () => { // Escena 1: Grabar, Info, Enviar
        console.log("Tutorial Escena 1: Grabar, Info, Enviar");
        resetElementsForStep(); // Limpiar antes de mostrar los elementos de esta escena

        // Mostrar elementos de la escena
        if (cajaT) cajaT.style.display = 'flex'; // Muestra la caja principal de chat
        if (infoButton) infoButton.style.display = 'block'; // Muestra el botón de información
        if (micIcon) {
            micIcon.style.display = 'block'; // Muestra el micrófono
            micIcon.src = 'public/micro.gif'; // Asegura la imagen correcta
        }
        if (sendBtnContainer) sendBtnContainer.style.display = 'flex'; // Muestra el botón de enviar

        // Mostrar tooltips específicos para esta escena
        if (infoButton) showTooltip(infoButton, "Instrucciones", "right");
        if (micIcon) showTooltip(micIcon, "Grabar", "bottom");
        if (sendBtnContainer) showTooltip(sendBtnContainer, "Enviar", "right");

        await waitFor(4000); // Duración de la escena
    },
    async () => { // Escena 2: Escuchando, Info, Enviar (repetir)
        console.log("Tutorial Escena 2: Escuchando, Info, Enviar");
        resetElementsForStep(); // Limpiar para la siguiente escena

        // Mostrar elementos (los mismos que la escena 1, solo cambia el micrófono)
        if (cajaT) cajaT.style.display = 'flex';
        if (infoButton) infoButton.style.display = 'block';
        if (micIcon) {
            micIcon.style.display = 'block';
            micIcon.src = 'public/stopR.gif'; // Cambia la imagen del micrófono
        }
        if (sendBtnContainer) sendBtnContainer.style.display = 'flex';

        // Mostrar tooltips (se repiten, pero el de micIcon cambia)
        if (infoButton) showTooltip(infoButton, "Instrucciones", "right");
        if (micIcon) showTooltip(micIcon, "Escuchando", "bottom"); // Nuevo tooltip para el micrófono
        if (sendBtnContainer) showTooltip(sendBtnContainer, "Enviar", "right");

        await waitFor(4000);
    },
    async () => { // Escena 3: Cancelar, Nuevo Chat, Info, Enviar
        console.log("Tutorial Escena 3: Cancelar, Nuevo Chat, Info, Enviar");
        resetElementsForStep(); // Limpiar para la última escena

        // Mostrar elementos (los mismos, más el botón "Nuevo Chat", y cambio de mic)
        if (cajaT) cajaT.style.display = 'flex';
        if (infoButton) infoButton.style.display = 'block';
        if (micIcon) {
            micIcon.style.display = 'block';
            micIcon.src = 'public/cancelR.gif'; // Cambia la imagen del micrófono a "Cancelar"
        }
        if (sendBtnContainer) sendBtnContainer.style.display = 'flex';

        // --- CREAR Y MOSTRAR EL BOTÓN "NUEVO CHAT" ESPECÍFICO PARA EL TUTORIAL ---
        if (!tutorialNewChatButton) { // Solo crearlo si no existe ya
            tutorialNewChatButton = document.createElement("img");
            tutorialNewChatButton.id = "tutorialNewChatButton"; // ID único para el botón del tutorial
            tutorialNewChatButton.src = "public/nuevoC.png"; // Ruta de tu imagen
            tutorialNewChatButton.alt = "Nuevo Chat";
            tutorialNewChatButton.style.position = "absolute";
            tutorialNewChatButton.style.top = "6.7vh"; // Misma posición que en recorder.js
            tutorialNewChatButton.style.right = "7vw"; // Misma posición
            tutorialNewChatButton.style.width = "auto";
            tutorialNewChatButton.style.height = "3vh";
            tutorialNewChatButton.style.cursor = "pointer";
            tutorialNewChatButton.style.zIndex = "901"; // Asegura que esté por encima del overlay
            document.body.appendChild(tutorialNewChatButton); // Añadirlo al body
            console.log("Botón 'Nuevo Chat' del tutorial creado y mostrado.");

            // Opcional: Puedes añadir un listener si quieres que haga algo durante el tutorial,
            // por ejemplo, omitir el tutorial.
            // tutorialNewChatButton.addEventListener('click', () => {
            //     skipTutorialBtn.click(); // Simula un clic en el botón de omitir
            // });
        }
        if (tutorialNewChatButton) tutorialNewChatButton.style.display = "block"; // Asegurarse de que esté visible

        // Mostrar tooltips
        if (infoButton) showTooltip(infoButton, "Instrucciones", "right");
        if (micIcon) showTooltip(micIcon, "Cancelar pregunta", "bottom");
        if (sendBtnContainer) showTooltip(sendBtnContainer, "Enviar", "right");
        if (tutorialNewChatButton) showTooltip(tutorialNewChatButton, "Nuevo Chat", "bottom"); // Tooltip para el botón del tutorial

        await waitFor(4000);
    }
];

// --- Helper para esperar (pausar la ejecución de forma no bloqueante) ---
function waitFor(ms) {
    return new Promise(resolve => {
        // Almacenamos el ID del setTimeout para poder cancelarlo si se omite el tutorial
        tutorialTimeout = setTimeout(resolve, ms);
    });
}

// --- Función principal para iniciar el tutorial ---
export async function startTutorial() {
    if (tutorialActive) return; // Evita que el tutorial se inicie si ya está activo
    tutorialActive = true;
    tutorialSkipped = false; // Reinicia la bandera de omitido al inicio

    // Mostrar el overlay que cubre todo
    if (tutorialOverlay) tutorialOverlay.style.display = 'block';
    // Mostrar el botón para omitir el tutorial
    if (skipTutorialBtn) skipTutorialBtn.style.display = 'block';

    // Iterar sobre cada paso del tutorial
    for (let i = 0; i < tutorialSteps.length; i++) {
        if (tutorialSkipped) { // Si el usuario omite el tutorial, salimos del bucle
            break;
        }
        await tutorialSteps[i](); // Ejecuta la función de la escena y espera su duración
    }

    // Una vez que el tutorial termina (o se omite), llamamos a endTutorial
    endTutorial();
}

// --- Función para finalizar el tutorial ---
function endTutorial() {
    console.log("Tutorial finalizado.");
    tutorialActive = false; // Desactiva el estado del tutorial

    // Ocultar el overlay y el botón de omitir
    if (tutorialOverlay) tutorialOverlay.style.display = 'none';
    if (skipTutorialBtn) skipTutorialBtn.style.display = 'none';

    // Asegurarse de que todos los tooltips estén ocultos
    hideAllTooltips();

    // Resetear los elementos a su estado por defecto (ocultos o removidos del DOM)
    // Esto también se encargará de remover el botón "Nuevo Chat" temporal del tutorial.
    resetElementsForStep();

    // Finalmente, llamar a la función de introducción normal de la aplicación
    presentIntroduction();
}

// --- Listener para el botón de omitir el tutorial ---
if (skipTutorialBtn) {
    skipTutorialBtn.addEventListener('click', () => {
        console.log("Tutorial omitido.");
        tutorialSkipped = true; // Establece la bandera de omitido
        clearTimeout(tutorialTimeout); // Cancela el setTimeout actual (detiene la espera de la escena)
        endTutorial(); // Finaliza el tutorial inmediatamente
    });
}
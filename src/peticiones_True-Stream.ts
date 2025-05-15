import { readText } from './speak';
import { messageHistory as initialMessageHistory } from './Parametros';
// import { initInteraction } from './initInteraction';

const API_CHAT = 'http://127.0.0.1:1234/v1/chat/completions';
let messageHistory = [...initialMessageHistory];

let initialPhase = true;
let subPhase = 0;
const collected: { name?: string; email?: string; empresa?: string } = {};

// DOM
// const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
// const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const senBtn = document.getElementById('senBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const transcriptTA = document.getElementById('transcript') as HTMLTextAreaElement;
const messageLabel = document.getElementById('messageLabel')!;
// const razonamiento = document.getElementById('Razonamiento')!;
// const loader = document.getElementById('loader')!;

// Setup inicial
document.addEventListener('DOMContentLoaded', () => {
  // loader.style.display = 'none';
  // bindButtons();
  // resetAll(); // Inicia la fase inicial

  // --- AÑADIDO: envía con click o con tecla 'k' ---
  senBtn.addEventListener('click', () => {
    // stopRecognition();
    sendMensajeIA();
  });
  document.addEventListener('keydown', e => {
    if (e.key.toLowerCase() === 'k' && !e.repeat) {
      e.preventDefault();
      stopRecognition();
      sendMensajeIA();
    }
  });
  // ---------------------------------------------
});

// function bindButtons() {
//   startBtn.addEventListener('click', onStart);
//   stopBtn.addEventListener('click', onStop);
//   clearBtn.addEventListener('click', onClear);
//   senBtn.addEventListener('click', sendMensajeIA);
//   document.addEventListener('keydown', e => {
//     if (e.ctrlKey && e.code === 'Space') {
//       e.preventDefault();
//       resetAll();
//     }
//   });
// }

// Reconocimiento (idéntico al tuyo, sólo habilita sen/clear en onend)
let recognition: any = null;
let transcriptText = '';
// function onStart() {
//   transcriptText = '';
//   transcriptTA.value = '';
//   startRecognition();
//   startBtn.disabled = true;
//   stopBtn.disabled = false;
// }
// function onStop() {
//   stopRecognition();
//   startBtn.disabled = false;
//   stopBtn.disabled = true;
// }
// function onClear() {
//   transcriptText = '';
//   transcriptTA.value = '';
//   clearBtn.disabled = true;
//   senBtn.disabled = true;
// }

// function startRecognition() {
//   const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
//   if (!SR) return console.error('SpeechRecognition no soportado');
//   recognition = new SR();
//   recognition.lang = 'es-ES';
//   recognition.continuous = true;
//   recognition.interimResults = true;
//   recognition.onresult = (ev: any) => {
//     let interim = '';
//     for (let i = ev.resultIndex; i < ev.results.length; i++) {
//       const part = ev.results[i][0].transcript;
//       if (ev.results[i].isFinal) transcriptText += part;
//       else interim += part;
//     }
//     transcriptTA.value = transcriptText + interim;
//   };
//   recognition.onend = () => {
//     clearBtn.disabled = transcriptText.trim() === '';
//     senBtn.disabled = transcriptText.trim() === '';
//   };
//   recognition.onerror = () => stopRecognition();
//   recognition.start();
// }

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

// Presentación inicial antes de pedir los datos
function presentIntroduction() {
  readText('¡Hola! Soy NewRoman, tu asistente virtual. Estoy aquí para ayudarte. Antes de comenzar, necesito que me proporciones algunos datos. Empecemos.');
  setTimeout(() => {
    askNext();
  }, 3000); // Da tiempo para escuchar la introducción
}

// Avanza la fase inicial preguntando uno a uno
function askNext() {
  transcriptTA.value = '';                
  // clearBtn.disabled = true;
  // senBtn.disabled = true;
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
  // startBtn.disabled = false;
  // stopBtn.disabled = true;
}

async function sendMensajeNormal(): Promise<void> {
  // loader.style.display = 'block';
  const msg = transcriptTA.value.trim();
  transcriptTA.value = '';
  messageHistory.push({ role: 'user', content: msg });

  const resp = await fetch(API_CHAT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-r1-distill-qwen-7b',
      messages: messageHistory,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true
    })
  });
  if (!resp.ok) throw new Error(resp.statusText);

  const reader = resp.body!.getReader();
  const decoder = new TextDecoder('utf-8');
  let thinking = true;

  messageLabel.textContent = '';
  // razonamiento.textContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });

    for (const line of chunk.split('\n').filter(l => l.trim())) {
      if (!line.startsWith('data:')) continue;
      const data = line.replace(/^data:/, '').trim();

      if (data === '[DONE]') break;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0].delta.content || '';

        if (content === '<think>') {
          thinking = true;
        } else if (content === '</think>') {
          thinking = false;
        } else {
          if (thinking) {
            // razonamiento.textContent += content;
          } else {
            messageLabel.textContent += content;
          }
        }
      } catch (error) {
        console.error('Error al parsear JSON:', error);
      }
    }
  }

  // Al finalizar, leer el mensaje final
  readText(messageLabel.textContent!);
  messageHistory.push({ role: 'assistant', content: messageLabel.textContent! });

  // loader.style.display = 'none';

  // Después de un intercambio normal, vuelve a habilitar escucha
  // startBtn.disabled = false;
}

async function sendMensajeIA(): Promise<void> {
  console.log("Enviado mensaje");

  const text = transcriptTA.value.trim();

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
      messageLabel.textContent = JSON.stringify(datos);
      await fetch('http://localhost:3000/api/robot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      readText('¡Perfecto! Ahora puedes preguntarme lo que desees.');
      initialPhase = false;
      transcriptTA.value = '';
      messageLabel.textContent = '';
      return;
    }
  } else {
    await sendMensajeNormal();
  }
}

// Vuelve todo a la fase inicial
function resetAll() {
  initialPhase = true;
  subPhase = 0;
  Object.keys(collected).forEach(k => delete (collected as any)[k]);
  messageHistory = [...initialMessageHistory];
  transcriptTA.value = '';
  messageLabel.textContent = '';
  // razonamiento.textContent = '';
  // presentIntroduction(); // Presentación inicial antes de todo
}

(window as any).sendMensajeIA = sendMensajeIA;
(window as any).presentIntroduction = presentIntroduction;

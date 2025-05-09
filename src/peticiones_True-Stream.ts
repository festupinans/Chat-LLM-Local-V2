import { readText } from './speak';
import { messageHistory as initialMessageHistory } from './Parametros';
import { initInteraction } from './initInteraction';

<<<<<<< HEAD
let url = 'http://192.168.1.11:41343/v1/chat/completions';

// Crear una copia local de messageHistory para trabajar con ella
let messageHistory = [...initialMessageHistory];

// Funciones principales para enviar y recibir mensajes
async function sendMensajeIA(): Promise<void> {
    const message = (document.getElementById('transcript') as HTMLTextAreaElement)?.value || '';
    // const loader = document.getElementById('loader');
    const razonamiento = document.getElementById('Razonamiento');

    // if (loader) {
    //     loader.style.display = 'block';
    // }

    try {
        // Actualizar el historial de mensajes con el nuevo mensaje del usuario
        messageHistory.push({ role: 'user', content: message });

        // Enviar el mensaje usando POST
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-r1-distill-qwen-7b', // Ajusta el modelo según sea necesario
                messages: messageHistory,
                temperature: 0.7,
                max_tokens: 512,
                stream: true // Habilitar streaming
            }),
        });

        if (!response.ok) {
            throw new Error(`Error al enviar el mensaje: ${response.statusText}`);
        }

        // Procesar la respuesta en streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let receivedMessage = '';
        let receivedRazonamiento = '';
        const labelElement = document.getElementById('messageLabel');
        let pensando = true;

        while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decodificar el fragmento recibido
            const chunk = decoder.decode(value, { stream: true });

            // Procesar cada línea del stream como JSON
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const jsonString = line.replace('data:', '').trim();
                    if (jsonString !== '[DONE]') {
                        try {
                            const parsed = JSON.parse(jsonString);
                            const content = parsed.choices[0]?.delta?.content || '';

                            // Mostrar el mensaje progresivamente
                            if (labelElement && !pensando) {
                                receivedMessage += content;
                                labelElement.textContent = receivedMessage;
                            }

                            if (content === '</think>' || !pensando) {
                                pensando = false;
                            }

                            if (pensando && razonamiento && content !== '<think>') {
                                receivedRazonamiento += content;
                                razonamiento.textContent = receivedRazonamiento;
                            }
                        } catch (error) {
                            console.error('Error al parsear JSON:', error);
                        }
                    }
                }
            }
        }
        readText(receivedMessage); // Llamada a la función importada
        pensando = true;

        // Actualizar el historial de mensajes con la respuesta completa de la IA
        messageHistory.push({ role: 'assistant', content: receivedMessage });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Ocultar el loader
        // if (loader) {
        //     loader.style.display = 'none';
        // }
    }
}

// Agregar combinación de teclas para borrar el historial
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.code === 'Space') { // Detectar Ctrl + Espacio
        event.preventDefault(); // Prevenir el comportamiento por defecto
        messageHistory = [...initialMessageHistory]; // Restablecer el historial
        showTooltip('Historial de mensajes restablecido.'); // Mostrar tooltip
    }
=======
const API_CHAT = 'http://127.0.0.1:1234/v1/chat/completions';
let messageHistory = [...initialMessageHistory];

let initialPhase = true;
let subPhase = 0;
const collected: { name?: string; email?: string; empresa?: string } = {};

// DOM
const startBtn = document.getElementById('startBtn') as HTMLButtonElement;
const stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
const senBtn = document.getElementById('senBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const transcriptTA = document.getElementById('transcript') as HTMLTextAreaElement;
const messageLabel = document.getElementById('messageLabel')!;
const razonamiento = document.getElementById('Razonamiento')!;
const loader = document.getElementById('loader')!;

// Setup inicial
document.addEventListener('DOMContentLoaded', () => {
  loader.style.display = 'none';
  bindButtons();
  resetAll(); // Inicia la fase inicial
>>>>>>> cedf3ea75697c92f2631dd4e2cb6ce856b9a41bb
});

function bindButtons() {
  startBtn.addEventListener('click', onStart);
  stopBtn.addEventListener('click', onStop);
  clearBtn.addEventListener('click', onClear);
  senBtn.addEventListener('click', sendMensajeIA);
  document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      resetAll();
    }
  });
}

// Reconocimiento (idéntico al tuyo, sólo habilita sen/clear en onend)
let recognition: any = null;
let transcriptText = '';
function onStart() {
  transcriptText = '';
  transcriptTA.value = '';
  startRecognition();
  startBtn.disabled = true;
  stopBtn.disabled = false;
}
function onStop() {
  stopRecognition();
  startBtn.disabled = false;
  stopBtn.disabled = true;
}
function onClear() {
  transcriptText = '';
  transcriptTA.value = '';
  clearBtn.disabled = true;
  senBtn.disabled = true;
}

function startRecognition() {
  const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SR) return console.error('SpeechRecognition no soportado');
  recognition = new SR();
  recognition.lang = 'es-ES';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = (ev: any) => {
    let interim = '';
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const part = ev.results[i][0].transcript;
      if (ev.results[i].isFinal) transcriptText += part;
      else interim += part;
    }
    transcriptTA.value = transcriptText + interim;
  };
  recognition.onend = () => {
    clearBtn.disabled = transcriptText.trim() === '';
    senBtn.disabled = transcriptText.trim() === '';
  };
  recognition.onerror = () => stopRecognition();
  recognition.start();
}

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
  clearBtn.disabled = true;
  senBtn.disabled = true;
  switch (subPhase) {
    case 0:
      readText('Por favor dime tu nombre.');
      break;
    case 1:
      break;
    case 2:
      break;
  }
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

async function sendMensajeNormal(): Promise<void> {
  loader.style.display = 'block';
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
      max_tokens: 512,
      stream: true
    })
  });
  if (!resp.ok) throw new Error(resp.statusText);

  const reader = resp.body!.getReader();
  const decoder = new TextDecoder('utf-8');
  let thinking = true;

  messageLabel.textContent = '';
  razonamiento.textContent = '';

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
            razonamiento.textContent += content;
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

  loader.style.display = 'none';

  // Después de un intercambio normal, vuelve a habilitar escucha
  startBtn.disabled = false;
}

async function sendMensajeIA(): Promise<void> {
  senBtn.disabled = true;
  clearBtn.disabled = true;
  startBtn.disabled = true;

  const text = transcriptTA.value.trim();

  if (initialPhase) {
    // Guarda según subPhase y avanza
    if (subPhase === 0) {
      if (!text) {
        readText('No capturé nada. Intenta de nuevo.');
        startBtn.disabled = false;
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
        startBtn.disabled = false;
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
        startBtn.disabled = false;
        return;
      }
      collected.empresa = text;
      // Formatea el JSON de una vez y envía
      const datos = {
        name: collected.name!,
        email: collected.email!,
        empresa: collected.empresa!
      };
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
      // Ahora habilita escuchar y enviar para el chat
      startBtn.disabled = false;
      senBtn.disabled = true;
      clearBtn.disabled = true;
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
  razonamiento.textContent = '';
  presentIntroduction(); // Presentación inicial antes de todo
}

(window as any).sendMensajeIA = sendMensajeIA;

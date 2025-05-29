// import './style.css';
import { messageHistory as initialMessageHistory } from './Parametros';
import { readText } from './speak';
import { marked } from 'marked';

let url = 'http://localhost:11434/api/generate';

// Copia del historial inicial
let messageHistory = [...initialMessageHistory];

export async function sendMensajeIANormal(): Promise<void> {
  const labelDiv = document.getElementById('messageLabel') as HTMLDivElement;
  const userP = labelDiv.querySelector('p');
  const userText = userP?.textContent?.trim() ?? '';

  try {
    messageHistory.push({ role: 'user', content: userText });

    const historialComoTexto = messageHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n');
    const prompt = `${historialComoTexto}\nUsuario: ${userText}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3:4b',
        prompt: prompt, // Usa 'prompt' para compatibilidad
        temperature: 0.7,
        max_tokens: -1,
        stream: true // Activa el modo streaming
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al enviar el mensaje: ${response.statusText}`);
    }

    // Procesar respuesta en streaming
    const reader = response.body?.getReader();
    let respuesta = '';
    let decoder = new TextDecoder();

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.split('\n').forEach(linea => {
          if (linea.trim() !== '') {
            try {
              const obj = JSON.parse(linea);
              if (obj.response) {
                respuesta += obj.response;
                // Actualiza la UI en tiempo real
                labelDiv.innerHTML = `<div class="assistant">${marked(respuesta)}</div>`;
              }
            } catch (e) {
              // Ignora líneas que no sean JSON válidas
            }
          }
        });
      }
    }

    respuesta = respuesta
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/^Asistente:\s*/i, '');;

    messageHistory.push({ role: 'assistant', content: respuesta.trim() || '[Respuesta vacía]' });
    let t = textoLimpioString(respuesta);
    readText(t);
    console.log(t);

  } catch (error) {
    console.error('Error:', error);
  }
}

function textoLimpioString(texto: string) {
  const reemplazos: Record<string, string> = {
    'RV': 'realidad virtual',
    'VR': 'realidad virtual',
    'RA': 'realidad aumentada',
    'AR': 'realidad aumentada',
    'IA': 'inteligencia artificial'
  };

  let textoLimpio = texto
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '');

  // Reemplazos dinámicos
  for (const [clave, valor] of Object.entries(reemplazos)) {
    const regex = new RegExp(`\\b${clave}\\b`, 'g');
    textoLimpio = textoLimpio.replace(regex, valor);
  }

  return textoLimpio;
}

// Declara la función en la interfaz Window para evitar errores de TS
declare global {
  interface Window {
    sendMensajeIANormal: () => Promise<void>;
  }
}

window.sendMensajeIANormal = sendMensajeIANormal;
// Agregar el controlador de eventos al botón
// document.addEventListener('DOMContentLoaded', () => {
//     const button = document.getElementById('sendMessageButton');
//     if (button) {
//         button.addEventListener('click', sendMensajeIANormal);
//     }
// });

// (window as any).sendMensajeIA = sendMensajeIANormal;
// import './style.css';
import { messageHistory as initialMessageHistory } from './Parametros';
import { readText } from './speak';

let url = 'http://192.168.1.11:41343/v1/chat/completions';

// Copia del historial inicial
let messageHistory = [...initialMessageHistory];

export async function sendMensajeIANormal(): Promise<void> {
  const labelDiv = document.getElementById('messageLabel') as HTMLDivElement;
  // Encontrar el <p> interno y extraer su texto
  const userP = labelDiv.querySelector('p');
  const userText = userP?.textContent?.trim() ?? '';

  try {
    // 1) Añadir el mensaje del usuario
    messageHistory.push({ role: 'user', content: userText });

    // 2) Enviar petición
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1-distill-qwen-7b',
        messages: messageHistory,
        temperature: 0.7,
        max_tokens: -1,
        stream: false
      }),
    });
    if (!response.ok) {
      throw new Error(`Error al enviar el mensaje: ${response.statusText}`);
    }

    // 3) Procesar respuesta
    const receivedMessage = await processResponse(response);
    messageHistory.push({ role: 'assistant', content: receivedMessage });

    // 4) Mostrar respuesta como <p class="assistant">
    labelDiv.innerHTML = `<p class="assistant">${receivedMessage}</p>`;
    readText(receivedMessage);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function processResponse(response: Response): Promise<string> {
  const lmStudioReceived = await response.json();
  let content = lmStudioReceived.choices[0].message.content || "Respuesta no válida";

  // Limpia etiquetas <think> y HTML
  content = content
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/<[^>]*>/g, '');

  return content;
}

// import './style.css';
import { Ollama } from 'ollama'
import { messageHistory as initialMessageHistory } from './Parametros';
import { readText } from './speak';
import { marked } from 'marked';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

let messageHistory = [...initialMessageHistory];

let cancelSendMensaje = false;

// Nueva función para detener la ejecución
export function StopSendMensaje() {
  cancelSendMensaje = true;
  ollama.abort();
}

// Modifica la función principal para chequear el flag
export async function sendMensajeIANormal(
  userText: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: () => void
): Promise<void> {
  cancelSendMensaje = false;
  try {
    messageHistory.push({ role: 'user', content: userText });

    // Prepara el historial para la API nueva
    const messages = messageHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    let respuestaCompleta = '';

    const stream = await ollama.chat({
      model: 'gemma3:4b', 
      messages,
      stream: true,
    });

    for await (const part of stream) {
      if (cancelSendMensaje) {
        console.log('Ejecución cancelada por el usuario.');
        onError();
        return;
      }
      if (part.message?.content) {
        respuestaCompleta += part.message.content;
        const cleanedChunkForDisplay = (marked.parse(respuestaCompleta) as string)
          .replace(/<[^>]*>/g, '');
        onChunk(cleanedChunkForDisplay);
      }
    }

    respuestaCompleta = respuestaCompleta
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/^Asistente:\s*/i, '');

    messageHistory.push({ role: 'assistant', content: respuestaCompleta.trim() || '[Respuesta vacía]' });
    const t = textoLimpioString(respuestaCompleta);

    await readText(t);
    console.log(t);
    onComplete();

  } catch (error) {
    console.error('Error en sendMensajeIANormal:', error);
    onError();
  }
}


function textoLimpioString(texto: string) {
  const reemplazos: Record<string, string> = {
    'RV': 'realidad virtual',
    'VR': 'realidad virtual',
    'RA': 'realidad aumentada',
    'AR': 'realidad aumentada',
    'IA': 'inteligencia artificial',
    'Encantado/a': 'Encando o Encantada'
  };

  let textoLimpio = texto
    .replace(/\*\*(.*?)\*\*/g, '$1') // Elimina ** negritas **
    .replace(/`(.*?)`/g, '$1')     // Elimina `código`
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, ''); // Elimina emojis

  // Reemplazos dinámicos
  for (const [clave, valor] of Object.entries(reemplazos)) {
    const regex = new RegExp(`\\b${clave}\\b`, 'g');
    textoLimpio = textoLimpio.replace(regex, valor);
  }

  return textoLimpio;
}
declare global {
  interface Window {
    sendMensajeIANormal: (
      userText: string,
      onChunk: (chunk: string) => void,
      onComplete: () => void,
      onError: () => void
    ) => Promise<void>;
  }
}
// import './style.css';
import { messageHistory as initialMessageHistory } from './Parametros';
import { readText } from './speak';
import { marked } from 'marked';

let url = 'http://localhost:11434/api/generate';

// Copia del historial inicial
let messageHistory = [...initialMessageHistory];

// Flag de cancelación
let cancelSendMensaje = false;

// Nueva función para detener la ejecución
export function StopSendMensaje() {
  cancelSendMensaje = true;
}

// Modifica la función principal para chequear el flag
export async function sendMensajeIANormal(
  userText: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: () => void
): Promise<void> {
  cancelSendMensaje = false; // Reinicia el flag al inicio
  try {
    messageHistory.push({ role: 'user', content: userText });

    // La lógica de `prompt` se ajusta para usar el historial de chat de Ollama.
    // Aunque el API de generate tiene un campo `prompt`, para chat se usa `messages`.
    // Sin embargo, si estás utilizando el endpoint `generate` para un modelo de chat,
    // a menudo el prompt se construye concatenando el historial.
    // Aquí mantenemos la construcción de `prompt` como la tenías, ya que es lo que espera tu `generate` endpoint.
    const historialComoTexto = messageHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n');
    const prompt = `${historialComoTexto}\nUsuario: ${userText}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3:4b',
        prompt: prompt,
        temperature: 0.7,
        // En `generate`, `max_tokens` es `num_predict`. -1 a menudo significa sin límite.
        num_predict: -1,
        stream: true // Activa el modo streaming
      }),
    });

    if (!response.ok) {
      throw new Error(`Error al enviar el mensaje: ${response.statusText}`);
    }

    // Procesar respuesta en streaming
    const reader = response.body?.getReader();
    let respuestaCompleta = '';
    let decoder = new TextDecoder();

    if (reader) {
      while (true) {
        if (cancelSendMensaje) {
          console.log('Ejecución cancelada por el usuario.');
          onError(); // Puedes llamar a onError o a otro callback si prefieres
          return;
        }
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        chunk.split('\n').forEach(linea => {
          if (linea.trim() !== '') {
            try {
              const obj = JSON.parse(linea);
              if (obj.response) {
                respuestaCompleta += obj.response;
                const cleanedChunkForDisplay = (marked.parse(respuestaCompleta) as string)
                  .replace(/<[^>]*>/g, '');
                onChunk(cleanedChunkForDisplay);
              }
            } catch (e) {
              console.warn("Línea no JSON válida o sin 'response' ignorada:", linea, e);
            }
          }
        });
      }
    }

    respuestaCompleta = respuestaCompleta
      .replace(/<think>[\s\S]*?<\/think>/g, '')
      .replace(/<[^>]*>/g, '') // Elimina cualquier otra etiqueta HTML/XML
      .replace(/^Asistente:\s*/i, ''); // Elimina "Asistente:" al inicio

    messageHistory.push({ role: 'assistant', content: respuestaCompleta.trim() || '[Respuesta vacía]' });
    let t = textoLimpioString(respuestaCompleta);
    
    // *** ¡Aquí está el cambio! Agrega 'await' ***
    await readText(t); 
    
    console.log(t);
    onComplete(); // Llama al callback de completado
  } catch (error) {
    console.error('Error en sendMensajeIANormal:', error);
    onError(); // Llama al callback de error
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

// Declara la función en la interfaz Window para evitar errores de TS
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
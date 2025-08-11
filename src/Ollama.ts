// import './style.css';
import { messageHistory as initialMessageHistory } from './Parametros';
import { readText } from './speak';
import { marked } from 'marked';
import { blog1, blog2, blog3, blog4, blog5 } from './Json/Blogs';
import { embeddingData } from './DataLoader'; // Asegúrate de exportar tu array de embeddings desde DataLoader

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

    const contextos = await obtenerContextoRelevante(userText, 1); // o más de 1 si quieres
    const contexto = contextos.join('\n\n');

    // Construye el prompt incluyendo el contexto relevante
    const historialComoTexto = messageHistory.map(msg => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n');
    const prompt = `Contexto relevante:\n${contexto}\n\n${historialComoTexto}\nUsuario: ${userText}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3:4b',
        prompt: prompt,
        temperature: 0.7, // Reducido para respuestas más consistentes
        // Limita las respuestas a máximo 150 tokens (~100-120 palabras)
        // num_predict: 100,
        // Parámetros adicionales para respuestas más controladas
        top_p: 0.95, // Nucleus sampling - reduce palabras menos probables
        top_k: 50, // Limita las opciones de palabras siguientes
        // repeat_penalty: 1.1, // Evita repeticiones excesivas
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
          onError();
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
                // Limpiar el texto antes de enviarlo al HTML
                let textoLimpio = respuestaCompleta
                  // .replace(/<think>[\s\S]*?<\/think>/g, '')
                  .replace(/^Asistente:\s*/i, ''); // Elimina "Asistente:" al inicio
                const cleanedChunkForDisplay = (marked.parse(textoLimpio) as string);
                onChunk(cleanedChunkForDisplay);
              }
              // Si es el final del stream, imprime estadísticas
              if (obj.done) {
                // Duración total en segundos
                const totalSegundos = obj.total_duration ? obj.total_duration / 1e9 : 0;
                // Tokens por segundo
                const tokensPorSegundo = (obj.eval_count && obj.eval_duration)
                  ? obj.eval_count / (obj.eval_duration / 1e9)
                  : 0;
                console.log(`Tiempo total de respuesta: ${totalSegundos.toFixed(2)}s`);
                console.log(`Tokens generados: ${obj.eval_count || 0}`);
                console.log(`Velocidad: ${tokensPorSegundo.toFixed(2)} tokens/s`);
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

    console.log('Respuesta completa:', respuestaCompleta);

    messageHistory.push({ role: 'assistant', content: respuestaCompleta.trim() || '[Respuesta vacía]' });
    let t = textoLimpioString(respuestaCompleta);
    
    // *** ¡Aquí está el cambio! Agrega 'await' ***
    await readText(t); 
    
    console.log(t);
    onComplete(); // Llama al callback de completado
    console.log(messageHistory);
  } catch (error) {
    console.error('Error en sendMensajeIANormal:', error);
    onError(); // Llama al callback de error
  }
}

/**
 * Genera y guarda el embedding de un texto o de un archivo JSON con texto.
 * @param input Puede ser un string de texto o la ruta a un archivo JSON que contenga el texto.
 * @param outputFile Ruta donde guardar el embedding generado (por defecto: embedding_output.json)
 */
export async function embeddingInformation(
): Promise<void> {
  const texto = blog5;

  // Llama al endpoint de embeddings
  const response = await fetch('http://localhost:11434/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      input: texto
    }),
  });

  if (!response.ok) {
    throw new Error(`Error al generar embedding: ${response.statusText}`);
  }

  const data = await response.json();

  // Imprime el embedding y el texto original por consola
  const embeddingData = {
    texto,
    embedding: data.embeddings?.[0] || [],
    modelo: data.model,
    fecha: new Date().toISOString()
  };

  console.log('Embedding generado:', JSON.stringify(embeddingData, null, 2));
}

// Función para calcular la similitud coseno entre dos vectores
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

/**
 * Busca el texto más relevante en la base de embeddings para una pregunta dada.
 * Devuelve el texto más similar para usarlo como contexto en el prompt del modelo.
 */
export async function obtenerContextoRelevante(
  pregunta: string,
  topK: number = 1 // Puedes ajustar para traer más de un contexto si lo deseas
): Promise<string[]> {
  // 1. Genera el embedding de la pregunta
  const response = await fetch('http://localhost:11434/api/embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'nomic-embed-text',
      input: pregunta
    }),
  });
  if (!response.ok) {
    throw new Error(`Error al generar embedding de la pregunta: ${response.statusText}`);
  }
  const data = await response.json();
  const preguntaEmbedding = data.embeddings[0];

  // 2. Calcula la similitud con cada embedding almacenado
  const resultados = embeddingData
    .map(item => ({
      ...item,
      similitud: cosineSimilarity(preguntaEmbedding, item.embedding)
    }))
    .sort((a, b) => b.similitud - a.similitud)
    .slice(0, topK);

  // Devuelve los textos más relevantes
  return resultados.map(r => r.texto);
}

function textoLimpioString(texto: string) {
  const reemplazos: Record<string, string> = {
    'RV': 'realidad virtual',
    'VR': 'realidad virtual',
    'RA': 'realidad aumentada',
    'AR': 'realidad aumentada',
    'IA': 'inteligencia artificial',
    'Encantado/a': 'Encando o Encantada',
    'Asistente:': '',
    'COP' : 'Pesos colombianos'
  };

  let textoLimpio = texto
    .replace(/\*\*(.*?)\*\*/g, '$1') // Elimina ** negritas **
    .replace(/`(.*?)`/g, '$1')     // Elimina `código`
    .replace(/\*/g, '')            // Elimina asteriscos individuales
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '') // Elimina emojis
    .replace(/\$/g, ''); // Elimina signo de dollar

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
    embeddingInformation: (input: string) => Promise<void>;
  }
}

// Asigna las funciones al objeto global window
if (typeof window !== 'undefined') {
  window.sendMensajeIANormal = sendMensajeIANormal;
  window.embeddingInformation = embeddingInformation;
}
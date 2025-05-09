// src/initInteraction.ts
import { readText } from './speak';

/**
 * Dispara la fase inicial de presentación y recolección de datos.
 * Al terminar, devuelve control para que puedas continuar con sendMensajeIA.
 */
export async function initInteraction(): Promise<void> {
  // 1) Presentación
  readText(
    '¡Hola! Soy tu asistente virtual de Newrona. ' +
    'Antes de comenzar, dime tu nombre, tu correo electrónico y el nombre de tu empresa. ' +
    'Cuando termines, pulsa Enviar.',
    1, 1, 'Microsoft Sabina - Spanish (Mexico)'
  );
  // Esperar unos segundos para que termine de hablar
  await new Promise(r => setTimeout(r, 7000));

  // 2) Escuchar (una sola frase)
  // NOTA: aquí simplemente habilitas tu botón de Enviar — 
  //    la transcripción visual permite ver/editar antes de pulsar Enviar.
}

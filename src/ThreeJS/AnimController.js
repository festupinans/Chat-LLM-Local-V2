import * as THREE from "three";
import { NombresAnimaciones } from "./Scene";

/**
 * Reproduce una animación con opciones avanzadas.
 * @param {number} i - Índice de la animación.
 * @param {object} options - Opciones de reproducción.
 * @param {number} [options.fadeDuration=0.3] - Duración de la transición (segundos).
 * @param {number} [options.loop=Infinity] - Cantidad de repeticiones (Infinity para bucle infinito).
 * @param {function} [options.onFinished] - Callback cuando termina la animación (si no es infinita).
 */

let animacionActual = null; // Guarda el índice de la animación activa

export function PlaAnim(i, options = {}) {
  const { fadeDuration = 0.3, loop = Infinity, onFinished = null } = options;

  // Validar índice y existencia de la animación
  if (
    typeof i !== "number" ||
    i < 0 ||
    i >= NombresAnimaciones.length ||
    !NombresAnimaciones[i]
  ) {
    console.warn("Animación no encontrada o índice inválido:", i, NombresAnimaciones[i]);
    return;
  }

  // Si la animación ya está activa, no hacer nada
  if (animacionActual === i && NombresAnimaciones[i].isRunning()) {
    console.log("La animación ya está activa:", NombresAnimaciones[i]._clip?.name);
    return;
  }

  console.log("Reproduciendo animación:", NombresAnimaciones[i]._clip?.name);

  // Detener todas las animaciones activas con transición suave
  NombresAnimaciones.forEach((anim) => {
    if (anim && anim.isRunning()) {
      anim.fadeOut(fadeDuration);
      setTimeout(() => anim.stop(), fadeDuration * 1000);
    } else if (anim) {
      anim.stop();
    }
  });

  const action = NombresAnimaciones[i];

  // Configurar el loop
  if (loop === Infinity) {
    action.setLoop(THREE.LoopRepeat, Infinity);
  } else if (loop === 1) {
    action.setLoop(THREE.LoopOnce, 0);
    action.clampWhenFinished = true;
  } else {
    action.setLoop(THREE.LoopRepeat, loop);
  }

  // Opcional: callback al terminar (solo si no es infinito)
  // ...

  // Iniciar la animación con transición suave
  action.reset().fadeIn(fadeDuration).play();

  // Actualizar el índice de la animación activa
  animacionActual = i;
}

window.PlaAnim = PlaAnim;
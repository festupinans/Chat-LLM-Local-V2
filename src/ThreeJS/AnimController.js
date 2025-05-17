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
function PlaAnim(i, options = {}) {
  const { fadeDuration = 0.3, loop = Infinity, onFinished = null } = options;

  // console.log(NombresAnimaciones[i]._clip.name);
  if (!NombresAnimaciones[i]) {
    console.warn("Animación no encontrada:", i);
    return;
  }

  // Detener todas las animaciones activas con transición suave
  NombresAnimaciones.forEach((anim, idx) => {
    if (anim.isRunning()) {
      anim.fadeOut(fadeDuration);
      setTimeout(() => anim.stop(), fadeDuration * 1000);
    } else {
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
  if (loop !== Infinity && typeof onFinished === "function") {
    action._onFinished = () => {
      onFinished();
      action._onFinished = null;
    };
    action._listener = (e) => {
      if (e.action === action && action._onFinished) {
        action._onFinished();
        action.getMixer().removeEventListener("finished", action._listener);
      }
    };
    action.getMixer().addEventListener("finished", action._listener);
  }

  // Iniciar la animación con transición suave
  action.reset().fadeIn(fadeDuration).play();
}

window.PlaAnim = PlaAnim;

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

function PlaAnim(i, options = {}) {
  const { fadeDuration = 0.3, loop = Infinity } = options;
  
  // console.log("Animacion solicitada:", NombresAnimaciones[i]?._clip?.name);
  
  // Validar índice y existencia de la animación
  if (
    typeof i !== "number" ||
    i < 0 ||
    i >= 6 ||
    !NombresAnimaciones[i]
  ) {
    console.warn(
      "Animación no encontrada o índice inválido:",
      i,
      NombresAnimaciones[i]
    );
    return;
  }

  // Si la animación ya está activa, no hacer nada
  if (animacionActual === i) {
    // console.log(
    //   "La animación ya está activa:",
    //   NombresAnimaciones[i]._clip?.name
    // );
    return;
  }

  // console.log("Reproduciendo animación:", NombresAnimaciones[i]._clip?.name);

  if (animacionActual !== null && NombresAnimaciones[animacionActual]) {
    const anim = NombresAnimaciones[animacionActual];
    // console.log(anim.isRunning());
    
    if (anim.isRunning()) {
      anim.fadeOut(fadeDuration);
      // console.log(`Deteniendo animación actual: ${anim._clip?.name}`);
      // setTimeout(() => anim.stop(), fadeDuration * 1000);
      // anim.stop();
      // console.log(`Animación actual detenida: ${anim._clip?.name}`);
    }
  }

  const action = NombresAnimaciones[i];

  // console.log("action:", action);
  // console.log("action._clip:", action._clip);
  // console.log("action._clip?.name:", action._clip?.name);

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

export function PlayIdel() {
  // console.log("-------------------------------------------------------------");
  // console.log("Debe Estar Inactivo");

  const valor = Math.floor(Math.random() * 4);
  PlaAnim(valor, {
    fadeDuration: 0.5,
    loop: Infinity
  });
}

export function PlayTalk(){
  // console.log("-------------------------------------------------------------");
  // console.log("Debe Hablar");
  
  const valor = Math.floor(Math.random() * 2) + 4;
  PlaAnim(valor, {
    fadeDuration: 0.5,
    loop: Infinity
  });
}
window.PlayIdel = PlayIdel;
window.PlayTalk = PlayTalk;
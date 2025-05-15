const thumb = document.getElementById("sliderCiruclo");
const track = document.getElementById("sliderTrack");

const body = document.getElementById("slider-background");
const transcripción = document.getElementById("Transcripcion");

let dragging = false;

const startDrag = (e) => {
  dragging = true;
  e.preventDefault(); // Evita comportamientos predeterminados
};

const stopDrag = () => {
  dragging = false;
};

const onDrag = (e) => {
  if (!dragging) return;

  e.preventDefault(); // Evita que el movimiento afecte otros elementos

  const rect = track.getBoundingClientRect();
  let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;

  // Limitar el movimiento dentro del track
  const offset = 100;
  x = Math.max(offset, Math.min(x, rect.width - offset));

  // Detectar si está al inicio o al final
  if (x === offset) {
    console.log("Thumb está al inicio del track");
  } else if (x === rect.width - offset) {
    console.log("Thumb está al final del track");
    body.style.display = "none";
    transcripción.style.display = "flex";
    presentIntroduction();
  }

  // Calcular el alpha del gradiente en función de la posición del thumb
  let alpha = ((x - offset) / (rect.width - 2 * offset)).toFixed(2);
  if (alpha >= 0.3) {
    // Normalizar entre 0 y 1
    body.style.background = `linear-gradient(0deg, rgba(77, 0, 94, ${alpha}) 0%, rgba(0, 0, 0, 0) 100%)`;
  }

  // Mover el thumb
  thumb.style.left = `${x - thumb.offsetWidth / 2}px`;
};

// Eventos para mouse
thumb.addEventListener("mousedown", startDrag);
document.addEventListener("mouseup", stopDrag);
document.addEventListener("mousemove", onDrag);

// Eventos para dispositivos táctiles (configurando como no pasivos)
thumb.addEventListener("touchstart", startDrag, { passive: false });
document.addEventListener("touchend", stopDrag, { passive: false });
document.addEventListener("touchmove", onDrag, { passive: false });

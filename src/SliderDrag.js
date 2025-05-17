import { presentIntroduction } from './Introduccion';
import { startTutorial } from './tutorial';

const thumb           = document.getElementById("sliderCiruclo");
const track           = document.getElementById("sliderTrack");
const body            = document.getElementById("slider-background");
const transcripcion   = document.getElementById("Transcripcion");
const micOverlay    = document.getElementById("micOverlay");
const nuevoOverlay    = document.getElementById("nuevoOverlay");

// Nuevos elementos para texto e ícono
const sliderTexto     = document.querySelector('.sliderTexto');
const sliderIconImg   = document.querySelector('#sliderCiruclo .sliderCirculoImagen');
// Para centrar al vuelo
const sliderBody      = document.querySelector('.sliderBody');

let dragging = false;
let done     = false;  // para disparar solo una vez

// helper para await
function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

const startDrag = (e) => {
  dragging = true;
  e.preventDefault();
};

const stopDrag = () => {
  dragging = false;
};

const onDrag = async (e) => {
  if (!dragging) return;
  e.preventDefault();

  const rect = track.getBoundingClientRect();
  let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;

  const offset = 100;
  const maxX   = rect.width - offset;
  x = Math.max(offset, Math.min(x, maxX));
  if (x >= maxX && !done) {
    done = true;
    sliderBody.style.justifyContent = 'center';
    sliderTexto.style.transition   = 'opacity 2s ease';
    sliderIconImg.style.transition = 'opacity 2s ease';
    sliderTexto.style.opacity      = '0';
    sliderIconImg.style.opacity    = '0';
    sliderTexto.textContent        = 'Hablemos';
    sliderIconImg.src              = '/public/iniciar.png';
    sliderTexto.style.opacity      = '1';
    sliderIconImg.style.opacity    = '1';
    await delay(1000);
    thumb.style.left = `${maxX - thumb.offsetWidth/2}px`;
    body.style.display         = "none";
    startTutorial();
    // micOverlay.style.display = 'block';
    // // 3) Al hacer clic en el overlay, revelas la transcripción
    // micOverlay.addEventListener('click', () => {
    //   micOverlay.style.display = 'none';
    //   transcripcion.style.display = 'flex';
    // }, { once: true });

    // presentIntroduction();
    return;
  }

  // --- FLUJO NORMAL mientras arrastras ---
  let alpha = ((x - offset) / (rect.width - 2*offset)).toFixed(2);
  if (alpha >= 0.3) {
    body.style.background =
      `linear-gradient(0deg, rgba(77, 0, 94, ${alpha}) 0%, rgba(0, 0, 0, 0) 100%)`;
  }

  thumb.style.left = `${x - thumb.offsetWidth/2}px`;
};

// Eventos ratón
thumb.addEventListener("mousedown", startDrag);
document.addEventListener("mouseup",  stopDrag);
document.addEventListener("mousemove", onDrag);

// Eventos táctiles (no pasivos para permitir preventDefault)
thumb.addEventListener("touchstart", startDrag,  { passive: false });
document.addEventListener("touchend",   stopDrag,  { passive: false });
document.addEventListener("touchmove",  onDrag,    { passive: false });

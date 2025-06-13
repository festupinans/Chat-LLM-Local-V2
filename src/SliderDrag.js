import { presentIntroduction } from './Introduccion';
import { startTutorial } from './tutorial';
import { showTooltip } from './tooltips.js';

const thumb         = document.getElementById("sliderCiruclo");
const track         = document.getElementById("sliderTrack");
const body          = document.getElementById("slider-background");
const transcripcion = document.getElementById("Transcripcion");
const micOverlay    = document.getElementById("micOverlay");
const nuevoOverlay  = document.getElementById("nuevoOverlay");

const sliderTexto   = document.querySelector('.sliderTexto');
const flechaIcon    = document.getElementById('flechaIcon');
const iniciarIcon   = document.getElementById('iniciarIcon');
const sliderBody    = document.querySelector('.sliderBody');

let dragging = false;
let done = false;

// Helper para await (pausar la ejecución)
function waitFor(ms) {
  return new Promise(res => setTimeout(res, ms));
}

// Interpolación RGB para thumb
function interpolateRGB(color1, color2, progress) {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);
  return `rgb(${r}, ${g}, ${b})`;
}

// Interpolación RGBA entre objetos
function interpolateColor(c1, c2, p) {
  return {
    r: c1.r + (c2.r - c1.r) * p,
    g: c1.g + (c2.g - c1.g) * p,
    b: c1.b + (c2.b - c1.b) * p,
    a: c1.a + (c2.a - c1.a) * p
  };
}
function rgba(c) {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a.toFixed(2)})`;
}

const sbStart = [
  { r: 0, g: 0, b: 0, a: 0.0 },
  { r: 0, g: 0, b: 0, a: 0.5 },
  { r: 0, g: 0, b: 0, a: 1.0 }
];
const sbEnd = [
  { r: 255, g: 255, b: 255, a: 0.0 },
  { r: 255, g: 255, b: 255, a: 0.5 },
  { r: 111, g: 0, b: 255, a: 1.0 }
];

const handleStartDrag = (e) => {
  if (done) return;
  dragging = true;
  e.preventDefault();
  [thumb, sliderBody, body, flechaIcon, iniciarIcon, sliderTexto]
      .forEach(el => el.style.transition = 'none');
};

const handleStopDrag = async () => {
  dragging = false;
  if (!done) {
    thumb.style.transition = 'left 0.5s ease-out, background-color 0.5s ease-out';
    [sliderBody, body].forEach(el => el.style.transition = 'background 0.5s ease-out');
    [flechaIcon, iniciarIcon].forEach(el => el.style.transition = 'opacity 0.5s ease-out');
    sliderTexto.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';

    thumb.style.left = '0px';
    thumb.style.backgroundColor = '#110C2B';
    sliderBody.style.background = `linear-gradient(30deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%)`;
    body.style.background = `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)`;
    flechaIcon.style.opacity = '1';
    iniciarIcon.style.opacity = '0';
    sliderTexto.textContent = 'Quiero hablar contigo';
    sliderTexto.style.transform = 'translateY(0)';
    sliderTexto.style.opacity = '1';
    sliderBody.style.justifyContent = 'flex-end';
    await waitFor(500);
  }
};

const handleDragMove = async (e) => {
  if (!dragging) return;
  e.preventDefault();
  const rect = track.getBoundingClientRect();
  let x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const maxX = rect.width - thumb.offsetWidth;
  x = Math.max(0, Math.min(x, maxX));
  thumb.style.left = `${x}px`;

  const p = x / maxX;

  // fondo de fondo: transparente->negro al inicio, a blanco+morado al final
  const c1 = interpolateColor(sbStart[0], sbEnd[0], p);
  const c2 = interpolateColor(sbStart[1], sbEnd[1], p);
  const c3 = interpolateColor(sbStart[2], sbEnd[2], p);
  body.style.background = `linear-gradient(180deg, ${rgba(c1)} 0%, ${rgba(c2)} 50%, ${rgba(c3)} 100%)`;

  // thumb
  thumb.style.backgroundColor = interpolateRGB('#110C2B', '#6F00FF', p);
  flechaIcon.style.opacity = `${1 - p}`;
  iniciarIcon.style.opacity = `${p}`;
  sliderTexto.style.transform = `translateY(${30 * p}px)`;
  sliderTexto.style.opacity = `${1 - p}`;

  // sliderBody gradiente
  const sb1 = interpolateColor(sbStart[0], sbEnd[0], p);
  const sb2 = interpolateColor(sbStart[1], sbEnd[1], p);
  const sb3 = interpolateColor(sbStart[2], sbEnd[2], p);
  const grad = `linear-gradient(30deg, ${rgba(sb1)} 0%, ${rgba(sb2)} 50%, ${rgba(sb3)} 100%)`;
  sliderBody.style.background = grad;
  sliderBody.style.boxShadow = `0 0 20px ${rgba(sb3).replace(/rgba/, 'rgba').replace('1.00', '0.6')}`;
  sliderBody.style.border = '1px solid transparent';

  // cambio de texto
  if (p > 0.7 && sliderTexto.textContent !== 'Hablemos') {
    sliderTexto.style.transition = 'transform 0.1s ease-out, opacity 0.1s ease-out';
    sliderTexto.style.transform = 'translateY(-100%)';
    sliderTexto.style.opacity = '0';
    await waitFor(100);
    sliderTexto.textContent = 'Hablemos';
    sliderTexto.style.transform = 'translateY(0)';
    sliderTexto.style.opacity = '1';
  } else if (p <= 0.7 && sliderTexto.textContent !== 'Quiero hablar contigo' && !done) {
    sliderTexto.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    sliderTexto.style.transform = 'translateY(100%)';
    sliderTexto.style.opacity = '0';
    await waitFor(100);
    sliderTexto.textContent = 'Quiero hablar contigo';
    sliderTexto.style.transform = 'translateY(0)';
    sliderTexto.style.opacity = '1';
  }

  // cuando completa
  if (x >= maxX && !done) {
    done = true;
    dragging = false;

    [thumb, sliderBody, body, flechaIcon, iniciarIcon, sliderTexto]
      .forEach(el => el.style.transition = 'opacity 0.6s ease-out');
    sliderTexto.style.opacity = '0';
    body.style.opacity = '0';
    await waitFor(600);
     body.style.display         = "none";
    // startTutorial();
    transcripcion.style.display = 'flex';

    // presentIntroduction();
    startTutorial();
    // const infoBtn = document.getElementById('infoButton');
    // if (infoBtn) showTooltip(infoBtn, 'Info');
  }
};

// Eventos
thumb.addEventListener("mousedown", handleStartDrag);
thumb.addEventListener("touchstart", handleStartDrag, { passive: false });
document.addEventListener("mousemove", handleDragMove);
document.addEventListener("touchmove", handleDragMove, { passive: false });
document.addEventListener("mouseup", handleStopDrag);
document.addEventListener("touchend", handleStopDrag);

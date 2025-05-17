let recognition     = null;
let transcriptText  = '';
let isRecognizing  = false;

// Inicio de reconocimiento
function startRecognition() {
  if (isRecognizing) return;
  isRecognizing = true;

  // Inicializa el API
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'es-ES';
  recognition.continuous = true;
  recognition.interimResults = true;

  transcriptText = '';
  document.getElementById('messageLabel').textContent = '';

  recognition.onresult = event => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const texto = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        transcriptText += texto;
      }
      const label = document.getElementById('messageLabel');
// Limpias hijos
label.innerHTML = ''; 
// Creas un párrafo interim
const p = document.createElement('p');
p.className = event.results[i].isFinal ? 'final' : 'interim';
p.textContent = event.results[i].isFinal
                ? transcriptText
                : texto;
label.appendChild(p);
    }
  };

  recognition.onerror = e => console.error('Speech error', e);
  recognition.onend   = () => {
    isRecognizing = false;
    // Aquí podrías llamar a sendMensajeIA() si quieres auto‑enviar
    console.log('Reconocimiento finalizado:', transcriptText);
  };

  recognition.start();
}

// Detener reconocimiento
function stopRecognition() {
  if (!recognition) return;
  recognition.stop();
  recognition = null;
  // isRecognizing se pondrá a false en onend
}

// Bindeo al icono
const micIcon = document.getElementById('micIcon');
micIcon.addEventListener('mousedown', startRecognition);
micIcon.addEventListener('mouseup',   stopRecognition);
micIcon.addEventListener('mouseleave', stopRecognition); // por si arrastras fuera

// Para pantallas táctiles
micIcon.addEventListener('touchstart', e => {
  e.preventDefault();
  startRecognition();
}, { passive: false });

micIcon.addEventListener('touchend', e => {
  e.preventDefault();
  stopRecognition();
}, { passive: false });

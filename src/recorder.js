let recognition = null;
let transcriptText = "";
let isRecognizing = false;

function startRecognition() {
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = true;

  transcriptText = "";
  document.getElementById("messageLabel").textContent = "";

  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const texto = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        transcriptText += texto;
      }
      const label = document.getElementById("messageLabel");
      label.innerHTML = "";
      const p = document.createElement("p");
      p.className = event.results[i].isFinal ? "final" : "interim";
      p.textContent = event.results[i].isFinal ? transcriptText : texto;
      label.appendChild(p);
    }
  };

  recognition.onerror = (e) => console.error("Speech error", e);

  recognition.onend = () => {
    isRecognizing = false;
    recognition = null;
    console.log("Reconocimiento finalizado:", transcriptText);
  };

  recognition.start();
  isRecognizing = true;
  console.log("Reconocimiento iniciado");
}

function stopRecognition() {
  if (recognition) {
    recognition.stop(); // onend lo pondrá en null
  }
}

// 🔁 Alternador
let hasUsedToggleOnce = false;

function toggleRecognition() {
  const contEnv = document.getElementById("envCont");
  const micIcon = document.getElementById("micIcon");

  if (!hasUsedToggleOnce) {
    contEnv.style.display = 'none'; // Ocultar solo la primera vez
    hasUsedToggleOnce = true;
  }

  if (isRecognizing) {
    stopRecognition();
    micIcon.src = "micro.png"; // volver al ícono del micrófono
    micIcon.style.width = '8vw';
    micIcon.style.marginLeft = 'auto';
    contEnv.style.display = 'flex';
  } else {
    startRecognition();
    micIcon.src = "stopR.png"; // cambiar al ícono de detener
    micIcon.style.width = '14vw';
    micIcon.style.marginLeft = '-2em';    
    contEnv.style.display = 'none';
  }
}

// Evento único para clic o toque
const micIcon = document.getElementById("micIcon");
micIcon.addEventListener("click", toggleRecognition);

// (Opcional) Para pantallas táctiles si necesitas compatibilidad extra
micIcon.addEventListener("touchend", (e) => {
  e.preventDefault();
  toggleRecognition();
}, { passive: false });

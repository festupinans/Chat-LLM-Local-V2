let recognition = null;
let transcriptText = '';
let isRecognizing = false; // Bandera para evitar múltiples inicios

// Función para iniciar el reconocimiento
function startRecognition() {
    if (isRecognizing) return; // Evitar múltiples inicios
    isRecognizing = true;

    recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.lang = 'es-ES'; // Configura el idioma
    recognition.continuous = true; // Permite la transcripción continua
    recognition.interimResults = true; // Muestra resultados intermedios

    // Reiniciar el texto de la transcripción
    transcriptText = '';
    document.getElementById('transcript').value = '';

    recognition.onresult = event => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                transcriptText += event.results[i][0].transcript;
                document.getElementById('transcript').innerText = transcriptText;
            } else {
                document.getElementById('transcript').innerText = event.results[i][0].transcript;
            }
        }
    };

    recognition.onerror = event => {
        console.error('Error:', event);
    };

    recognition.onstart = () => {
        console.log('Reconocimiento iniciado');
    };

    recognition.onend = () => {
        console.log('Reconocimiento finalizado');
        document.getElementById('transcript').value = transcriptText;
        isRecognizing = false;
    };

    recognition.start();
}

// Función para detener el reconocimiento
function stopRecognition() {
    if (recognition) {
        recognition.stop();
        recognition = null;
        isRecognizing = false;
    }
}

// Detectar la tecla Espacio para iniciar y detener el reconocimiento
document.addEventListener('keydown', event => {
    if (event.code === 'Space' && !isRecognizing) {
        startRecognition();
    }
});

document.addEventListener('keyup', event => {
    if (event.code === 'Space' && isRecognizing) {
        stopRecognition();
        // sendMensajeIA()
    }
});

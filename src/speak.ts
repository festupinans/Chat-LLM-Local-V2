const synth = window.speechSynthesis;

export function readText(
    text: string,
    rate: number = 1,
    pitch: number = 1.5,
    voiceName?: "Microsoft Sabina - Spanish (Mexico)" // Nombre de la voz opcional
) {
    if (!text.trim()) {
        console.warn('El texto está vacío. No se puede leer.');
        return;
    }

    synth.cancel(); // Detiene cualquier narración anterior, pausada o en curso

    const utterance = new SpeechSynthesisUtterance(text);

    // Configurar velocidad y tono
    utterance.rate = rate; // Velocidad (1 es normal, 0.5 es más lento, 2 es más rápido)
    utterance.pitch = pitch; // Tono (1 es normal, 0.5 es más grave, 2 es más agudo)

    // Configurar la voz si se especifica
    const voices = synth.getVoices();
    if (voiceName) {
        const selectedVoice = voices.find((voice) => voice.name === voiceName);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            console.warn(`La voz "${voiceName}" no se encontró. Usando la voz predeterminada.`);
        }
    }

    // Manejar eventos
    utterance.onstart = () => {
        console.log('Lectura iniciada.');
        window.dispatchEvent(new CustomEvent('toggleAnimation', { detail: true }));
        
        const valor = Math.floor(Math.random() * 2) + 4;
        (window as any).PlaAnim(valor, {
            fadeDuration: 0.5,
            loop: Infinity,
            onFinished: () => alert("¡Animación terminada!"),
        });
    };

    utterance.onend = () => {
        console.log('Lectura finalizada.');
        window.dispatchEvent(new CustomEvent('toggleAnimation', { detail: false }));
       
        const valor = Math.floor(Math.random() * 2) + 1;
        (window as any).PlaAnim(valor, {
            fadeDuration: 0.5,
            loop: Infinity,
            onFinished: () => alert("¡Animación terminada!"),
        });
    };

    utterance.onerror = (event) => {
        console.error('Error durante la síntesis de voz:', event.error);

        // const valor = Math.floor(Math.random() * 2) + 1;
        (window as any).PlaAnim(1, {
            fadeDuration: 0.5,
            loop: Infinity,
            onFinished: () => alert("¡Animación terminada!"),
        });
    };

    synth.speak(utterance);
}

export function pauseSpeech() {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        console.log('Lectura pausada.');
    }
}

export function resumeSpeech() {
    if (synth.paused) {
        synth.resume();
        console.log('Lectura reanudada.');
    }
}

// Función para listar las voces disponibles
export function listVoices() {
    const voices = synth.getVoices();
    voices.forEach((voice, index) => {
        console.log(`${index + 1}: ${voice.name} (${voice.lang})`);
        console.log(voice.name);
    });
}

// Extender la interfaz Window para incluir listVoices
declare global {
    interface Window {
        listVoices: () => void;
    }
}

window.listVoices = listVoices;
// speak.ts

export const synth = window.speechSynthesis;
export let isIASpeaking = false; 

export function readText(
    text: string,
    rate: number = 1,
    pitch: number = 1.5,
    voiceName?: "Microsoft Sabina - Spanish (Mexico)" 
) {
    if (!text.trim()) {
        console.warn('El texto está vacío. No se puede leer.');
        return;
    }

    // Importante: Cancelar cualquier reproducción anterior si una nueva inicia
    if (synth.speaking) {
        synth.cancel(); 
    }

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = rate;
    utterance.pitch = pitch;

    const voices = synth.getVoices();
    if (voiceName) {
        const selectedVoice = voices.find((voice) => voice.name === voiceName);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            console.warn(`La voz "${voiceName}" no se encontró. Usando la voz predeterminada.`);
        }
    }

    utterance.onstart = () => {
        console.log('Lectura iniciada.');
        isIASpeaking = true; 
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
        isIASpeaking = false; 
        window.dispatchEvent(new CustomEvent('toggleAnimation', { detail: false }));
        window.dispatchEvent(new CustomEvent('iaspeech:ended')); 
       
        const valor = Math.floor(Math.random() * 2) + 1;
        (window as any).PlaAnim(valor, {
            fadeDuration: 0.5,
            loop: Infinity,
            onFinished: () => alert("¡Animación terminada!"),
        });
    };

    utterance.onerror = (event) => {
        if (event.error === "interrupted") {
            isIASpeaking = false; 
            return; 
        }
        console.error('Error durante la síntesis de voz:', event.error);
        isIASpeaking = false; 
    };

    synth.speak(utterance);
}

export function pauseSpeech() { /* ... */ } // Puedes mantener estas funciones, aunque no se usarán para "cancelar"
export function resumeSpeech() { /* ... */ } // Puedes mantener estas funciones
export function isSpeechPaused() { return synth.paused; } // Puedes mantener esta función

export function listVoices() { /* ... */ }
declare global { interface Window { listVoices: () => void; } }
window.listVoices = listVoices;
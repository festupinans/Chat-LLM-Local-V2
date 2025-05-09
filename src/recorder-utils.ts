export function startRecognitionOnce(): Promise<string> {
    return new Promise((resolve, reject) => {
      const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!SpeechRec) {
        return reject(new Error('SpeechRecognition no está disponible en este navegador.'));
      }
  
      const recognition = new SpeechRec();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;
  
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript.trim();
        recognition.stop();
        resolve(text);
      };
  
      recognition.onerror = (evt: { error: string }) => {
        recognition.stop();
        reject(evt.error || 'Error en el reconocimiento de voz.');
      };
  
      recognition.start();
    });
  }
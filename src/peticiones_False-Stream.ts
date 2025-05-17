// import './style.css';
import { messageHistory as initialMessageHistory } from './Parametros';
import { readText } from './speak';

let url = 'http://172.20.10.4:41343/v1/chat/completions';

// Variable para almacenar el historial de mensajes
let messageHistory = [...initialMessageHistory];

// Funciones principales para enviar y recibir mensajes
export async function sendMensajeIANormal(): Promise<void> {
    //   const message = (document.getElementById('messageInput') as HTMLInputElement)?.value || '';
    const message = document.getElementById('messageLabel') as HTMLDivElement | null;
    (window as any).PlaAnim(3, {
            fadeDuration: 0.5,
            loop: Infinity,
            onFinished: () => alert("¡Animación terminada!"),
        });
    try {
        // Actualizar el historial de mensajes con el nuevo mensaje del usuario
        messageHistory.push({ role: 'user', content: message?.innerText ?? ""});

        // Enviar el mensaje usando POST
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-r1-distill-qwen-7b', // Ajusta el modelo según sea necesario
                messages: messageHistory,
                temperature: 0.7,
                max_tokens: -1,
                stream: false
            }),
        });

        if (!response.ok) {
            throw new Error(`Error al enviar el mensaje: ${response.statusText}`);
        }

        // Obtener la respuesta
        const receivedMessage = await processResponse(response);

        // Actualizar el historial de mensajes con la respuesta de la IA
        messageHistory.push({ role: 'assistant', content: receivedMessage });

        // Muestra la respuesta en la etiqueta P
        // const labelElement = document.getElementById('messageLabel');
        if (message) {
            message.innerText = receivedMessage;
            readText(receivedMessage);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Ocultar el loader

    }
}

// Función para procesar la respuesta del servidor
async function processResponse(response: Response): Promise<string> {
    const lmStudioReceived = await response.json();

    // Aquí puedes implementar el procesamiento específico de la respuesta
    let content = lmStudioReceived.choices[0].message.content || "Respuesta no válida";

    // Eliminar etiquetas <think> y su contenido
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '');

    // Eliminar cualquier otra etiqueta HTML no deseada
    content = content.replace(/<[^>]*>/g, '');

    return content;
}
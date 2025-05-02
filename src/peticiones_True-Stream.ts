// import './style.css';
import { readText } from './speak.ts';


let url = 'http://192.168.1.13:41343/v1/chat/completions';

// Variable para almacenar el historial de mensajes
let messageHistory: { role: string, content: string }[] = [
    { role: "system", content: "Tu nombre es Asistente virtual Newrona. Responde siempre en español, de forma amigable, carismática y alegre. Puedes deducir información sencilla o de sentido común para enriquecer tus respuestas. Sé breve y directo, pero mantén un tono cálido y profesional." },

    { role: "user", content: "¿Dónde se encuentran ubicados?" },
    { role: "assistant", content: "Estamos en Bogotá, Cra 15 #82-84." },

    { role: "user", content: "¿Qué es Newrona?" },
    { role: "assistant", content: "Newrona es una empresa colombiana con 10 años de trayectoria en el mercado latinoamericano.Experta en el diseñando y desarrollando de experiencias interactivas, por medio de la apropiación de tecnologías inmersivas como Realidad Virtual, Realidad Aumentada, Metaverso, Maping, holografía e Inteligencia artificial." },

    { role: "user", content: "¿Qué hacemos en Newrona?" },
    { role: "assistant", content: "Transformamos ideas en proyectos interactivos usando tecnologías inmersivas para potenciar comunicación y procesos comerciales." },

    { role: "user", content: "¿Cuánto tiempo demora una cotización?" },
    { role: "assistant", content: "Hasta 8 días hábiles, dependiendo de los requerimientos del proyecto." },

    { role: "user", content: "¿Qué son las tecnologías inmersivas?" },
    { role: "assistant", content: "Son tecnologías que estimulan los sentidos para generar experiencias inmersivas." },

    { role: "user", content: "¿Para qué usan estas tecnologías?" },
    { role: "assistant", content: "Creamos experiencias sensoriales e interactivas que posicionan tu marca como innovadora." },

    { role: "user", content: "¿Cuál es la diferencia entre RA y WebAR?" },
    { role: "assistant", content: "La RA requiere apps dedicadas, mientras que la WebAR funciona desde el navegador." },

    { role: "user", content: "¿Cuánto tiempo tarda un desarrollo en RA o RV?" },
    { role: "assistant", content: "RA: 4 semanas o más. RV: 6 semanas o más. Depende de los retos del proyecto." },

    { role: "user", content: "¿Se pueden hacer entrenamientos en RV?" },
    { role: "assistant", content: "¡Claro! La RV permite simulaciones realistas para practicar en un entorno seguro, reduciendo riesgos laborales. De hecho, gracias a la Realidad Virtual, estudios comentan que existe una disminución del 43% en las lesiones laborales." },

    { role: "user", content: "¿Qué diferencia hay entre un video normal y uno en RV?" },
    { role: "assistant", content: "El primero te permite observar, el segundo te hace parte de la experiencia. ¡Es como estar allí!" },

    { role: "user", content: "¿Por qué se habla tanto del metaverso?" },
    { role: "assistant", content: "Es una red social virtual en crecimiento. Grandes empresas como Meta lo están impulsando." },

    { role: "user", content: "¿Cómo usar el metaverso en mi organización?" },
    { role: "assistant", content: "Puedes usarlo para Ferias, eventos virtuales, onboarding, lanzamientos de productos, Creación de campus universitarios virtuales y más." },

    { role: "user", content: "¿Cuánto tarda un desarrollo en el metaverso?" },
    { role: "assistant", content: "Desde 6 semanas en adelante, dependiendo de la complejidad del universo digital." },
];

// Funciones principales para enviar y recibir mensajes
async function sendMensajeIA(): Promise<void> {
    const message = (document.getElementById('transcript') as HTMLTextAreaElement)?.value || '';
    const loader = document.getElementById('loader');
    const razonamiento = document.getElementById('Razonamiento');

    if (loader) {
        loader.style.display = 'block';
    }

    try {
        // Actualizar el historial de mensajes con el nuevo mensaje del usuario
        messageHistory.push({ role: 'user', content: message });

        // Enviar el mensaje usando POST
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-r1-distill-qwen-7b', // Ajusta el modelo según sea necesario
                messages: messageHistory,
                temperature: 0.7,
                max_tokens: 512,
                stream: true // Habilitar streaming
            }),
        });

        if (!response.ok) {
            throw new Error(`Error al enviar el mensaje: ${response.statusText}`);
        }

        // Procesar la respuesta en streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let receivedMessage = '';
        let receivedRazonamiento = '';
        const labelElement = document.getElementById('messageLabel');
        let pensando = true;

        while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decodificar el fragmento recibido
            const chunk = decoder.decode(value, { stream: true });

            // Procesar cada línea del stream como JSON
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const jsonString = line.replace('data:', '').trim();
                    if (jsonString !== '[DONE]') {
                        try {
                            const parsed = JSON.parse(jsonString);
                            const content = parsed.choices[0]?.delta?.content || '';

                            // Mostrar el mensaje progresivamente
                            if (labelElement && !pensando) {
                                receivedMessage += content;
                                labelElement.textContent = receivedMessage;
                            }

                            if (content === '</think>' || !pensando) {
                                pensando = false;
                            }

                            if (pensando && razonamiento && content !== '<think>') {
                                receivedRazonamiento += content;
                                razonamiento.textContent = receivedRazonamiento;
                            }
                        } catch (error) {
                            console.error('Error al parsear JSON:', error);
                        }
                    }
                }
            }
        }
        readText(receivedMessage); // Llamada a la función importada
        pensando = true;

        // Actualizar el historial de mensajes con la respuesta completa de la IA
        messageHistory.push({ role: 'assistant', content: receivedMessage });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Ocultar el loader
        if (loader) {
            loader.style.display = 'none';
        }
    }
}


(window as any).sendMensajeIA = sendMensajeIA;
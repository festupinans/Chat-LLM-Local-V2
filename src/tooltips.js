// tooltips.js
const shownTooltips = new Set();
const activeTooltipElements = []; // Array para mantener referencias a los elementos DOM de los tooltips
const tooltipAnimationFrames = new Map(); // Mapa para almacenar los IDs de animación de requestAnimationFrame para cada tooltip
const tooltipTimeouts = new Map(); // Mapa para almacenar los IDs de los setTimeout para cada tooltip
// NEW: Un mapa para almacenar el texto del tooltip y la referencia al elemento DOM
const tooltipTextMap = new Map();

export function showTooltip(targetEl, text, position = 'bottom') {
    if (shownTooltips.has(text)) return;
    shownTooltips.add(text);

    const tip = document.createElement('div');
    tip.className = `tooltip tooltip-${position}`;
    tip.textContent = text;
    document.body.appendChild(tip);

    activeTooltipElements.push(tip);
    tooltipTextMap.set(text, tip); // NEW: Almacenar la referencia del elemento DOM por su texto

    function updatePosition() {
        const tipRect = tip.getBoundingClientRect();
        const elRect = targetEl.getBoundingClientRect();

        let left, top;

        switch (position) {
            case 'top':
                left = elRect.left + (elRect.width - tipRect.width) / 2;
                top = elRect.top - tipRect.height - 12;
                break;
            case 'right':
                left = elRect.right + 12;
                top = elRect.top + (elRect.height - tipRect.height) / 2;
                break;
            case 'left':
                left = elRect.left - tipRect.width - 12;
                top = elRect.top + (elRect.height - tipRect.height) / 2;
                break;
            case 'bottom':
            default:
                left = elRect.left + (elRect.width - tipRect.width) / 2;
                top = elRect.bottom + 12;
                break;
        }

        tip.style.left = `${left}px`;
        tip.style.top = `${top}px`;
    }

    let animationFrameId;
    function loop() {
        updatePosition();
        tooltipAnimationFrames.set(tip, requestAnimationFrame(loop));
    }

    loop();

    requestAnimationFrame(() => tip.classList.add('show'));

    const timeoutId = setTimeout(() => {
        // Al ocultarse automáticamente, llamar a la función de ocultado interno
        _hideTooltipElement(tip, text);
    }, 3000);

    tooltipTimeouts.set(tip, timeoutId);
}

// --- NEW INTERNAL HELPER FUNCTION: _hideTooltipElement ---
// Función auxiliar para manejar la lógica de ocultamiento de un tooltip específico
function _hideTooltipElement(tip, text) {
    if (!tip || !tip.classList.contains('show')) { // Si el tooltip no existe o ya está en proceso de desaparecer
        // Limpiar las referencias aunque no esté "mostrándose" activamente
        if (tooltipAnimationFrames.has(tip)) {
            cancelAnimationFrame(tooltipAnimationFrames.get(tip));
            tooltipAnimationFrames.delete(tip);
        }
        if (tooltipTimeouts.has(tip)) {
            clearTimeout(tooltipTimeouts.get(tip));
            tooltipTimeouts.delete(tip);
        }
        shownTooltips.delete(text);
        const index = activeTooltipElements.indexOf(tip);
        if (index > -1) {
            activeTooltipElements.splice(index, 1);
        }
        if (tip.parentNode) tip.parentNode.removeChild(tip); // Asegurarse de removerlo del DOM
        tooltipTextMap.delete(text); // Limpiar del mapa de texto
        return;
    }

    tip.classList.remove('show');
    if (tooltipAnimationFrames.has(tip)) {
        cancelAnimationFrame(tooltipAnimationFrames.get(tip));
        tooltipAnimationFrames.delete(tip);
    }
    if (tooltipTimeouts.has(tip)) {
        clearTimeout(tooltipTimeouts.get(tip));
        tooltipTimeouts.delete(tip);
    }

    setTimeout(() => {
        if (tip && tip.parentNode) { // Verificar si el elemento todavía existe
            tip.parentNode.removeChild(tip);
        }
        shownTooltips.delete(text);
        const index = activeTooltipElements.indexOf(tip);
        if (index > -1) {
            activeTooltipElements.splice(index, 1);
        }
        tooltipTextMap.delete(text); // Limpiar del mapa de texto
    }, 300); // Duración de la animación de salida
}

// --- NEW FUNCTION: hideSpecificTooltip ---
export function hideSpecificTooltip(textToHide) {
    const tipToHide = tooltipTextMap.get(textToHide);
    if (tipToHide) {
        console.log(`Ocultando tooltip específico: "${textToHide}"`);
        _hideTooltipElement(tipToHide, textToHide);
    } else {
        console.log(`No se encontró tooltip con el texto: "${textToHide}" para ocultar.`);
    }
}

// --- hideAllTooltips (sin cambios, sigue siendo útil para el tutorial) ---
export function hideAllTooltips() {
    console.log("Ocultando todos los tooltips.");
    // Usamos un slice para iterar sobre una copia, ya que _hideTooltipElement modificará activeTooltipElements
    [...activeTooltipElements].forEach(tip => {
        // Necesitamos encontrar el texto asociado a este 'tip' para llamar a _hideTooltipElement correctamente
        let textFound = null;
        for (let [text, element] of tooltipTextMap.entries()) {
            if (element === tip) {
                textFound = text;
                break;
            }
        }
        if (textFound) {
            _hideTooltipElement(tip, textFound);
        }
    });

    // Asegurarse de que todas las colecciones estén vacías después de la iteración
    shownTooltips.clear();
    activeTooltipElements.length = 0;
    tooltipAnimationFrames.clear();
    tooltipTimeouts.clear();
    tooltipTextMap.clear();
}
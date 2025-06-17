// tooltips.js
const shownTooltips = new Set();
const activeTooltipElements = [];
const tooltipAnimationFrames = new Map();
const tooltipTimeouts = new Map();
const persistentTooltips = new Set();
const tooltipTextMap = new Map();

const tutorialArrowIndicators = new Map();

// --- Funciones de show existentes ---
export function showTooltip(targetEl, text, position = 'bottom') {
    if (shownTooltips.has(text)) {
        console.log(`[showTooltip] Tooltip ya mostrado para "${text}". Ignorando.`);
        return;
    }
    shownTooltips.add(text);

    const tip = document.createElement('div');
    tip.className = `tooltip tooltip-${position}`;
    tip.textContent = text;
    document.body.appendChild(tip);

    // Asegurarse de que el z-index sea lo suficientemente alto
    tip.style.zIndex = '901'; // Por encima del overlay (900)

    activeTooltipElements.push(tip);
    tooltipTextMap.set(text, tip);

    function updatePosition() {
        if (!document.body.contains(tip)) {
            console.log("[updatePosition] Tooltip ya no está en el DOM, cancelando animación.", text);
            cancelAnimationFrame(tooltipAnimationFrames.get(tip));
            tooltipAnimationFrames.delete(tip);
            return;
        }
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
        animationFrameId = requestAnimationFrame(loop);
        tooltipAnimationFrames.set(tip, animationFrameId);
        updatePosition();
    }

    loop();

    requestAnimationFrame(() => tip.classList.add('show'));

    if (!persistentTooltips.has(text)) {
        const timeoutId = setTimeout(() => {
            console.log(`[showTooltip] Timeout activado para ocultar tooltip: "${text}"`);
            _hideTooltipElement(tip, text);
        }, 3000);
        tooltipTimeouts.set(tip, timeoutId);
    }
}

export function showPersistentTooltip(targetEl, text, position = 'bottom') {
    persistentTooltips.add(text);
    showTooltip(targetEl, text, position);
}

export function showTutorialHighlightArrow(targetEl, htmlText, arrowDirection, arrowHeight = 100) {
    if (tutorialArrowIndicators.has(targetEl)) {
        console.log(`[showTutorialHighlightArrow] Ya existe un indicador de flecha para este target. Ocultando el anterior para:`, targetEl);
        _hideTutorialHighlightArrow(targetEl); // Usar la función interna
    }

    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = `tutorial-highlight-arrow tutorial-arrow-${arrowDirection}`;
    indicatorContainer.style.position = 'absolute';
    indicatorContainer.style.zIndex = '905'; // Más alto que los tooltips
    indicatorContainer.style.display = 'flex';
    indicatorContainer.style.flexDirection = 'column';
    indicatorContainer.style.alignItems = 'center';

    const arrowImage = document.createElement('img');
    arrowImage.className = 'tutorial-highlight-arrow-image';
    if (arrowDirection === 'right') {
        arrowImage.src = `public/F-Der.png`;
    } else if (arrowDirection === 'left') {
        arrowImage.src = `public/F-Izq.png`;
    } else { // 'center'
        arrowImage.src = `public/F-Izq.png`;
    }
    arrowImage.alt = `Flecha de tutorial hacia la ${arrowDirection}`;
    arrowImage.style.height = `${arrowHeight}px`;
    arrowImage.style.width = 'auto';
    arrowImage.style.display = 'block';
    arrowImage.style.marginTop = "-5em";

    const textWrapper = document.createElement('div');
    textWrapper.className = 'tutorial-highlight-text-wrapper';
    textWrapper.style.minWidth = '50px';
    textWrapper.style.maxWidth = '400px';
    textWrapper.style.boxSizing = 'border-box';
    textWrapper.style.padding = '10px 20px';

    const textElement = document.createElement('p');
    textElement.className = 'tutorial-highlight-arrow-text';
    textElement.innerHTML = htmlText;
    textElement.style.textAlign = 'center';

    textWrapper.appendChild(textElement);
    indicatorContainer.appendChild(arrowImage);
    indicatorContainer.appendChild(textWrapper);
    document.body.appendChild(indicatorContainer);

    function updatePosition() {
        if (!document.body.contains(indicatorContainer)) {
            console.log("[updatePosition] Indicador de flecha ya no está en el DOM, cancelando animación.", targetEl);
            cancelAnimationFrame(tutorialArrowIndicators.get(targetEl)?.animationFrameId);
            tutorialArrowIndicators.delete(targetEl);
            return;
        }

        const elRect = targetEl.getBoundingClientRect();
        const arrowRect = arrowImage.getBoundingClientRect();

        let top = elRect.bottom + 10;
        let left = 0;

        textWrapper.style.width = 'auto';
        const contentWidth = textElement.scrollWidth;
        textWrapper.style.width = `${Math.min(contentWidth + 40, parseInt(textWrapper.style.maxWidth))}px`;

        const wrapperWidth = textWrapper.offsetWidth;
        const wrapperHeight = textWrapper.offsetHeight;

        const targetCenterX = elRect.left + elRect.width / 2;

        if (arrowDirection === 'center') {
            left = targetCenterX - indicatorContainer.offsetWidth / 2;
            indicatorContainer.style.alignItems = 'center';
            arrowImage.style.marginRight = '9em';
        } else if (arrowDirection === 'left') {
            left = targetCenterX - wrapperWidth;
            indicatorContainer.style.alignItems = 'flex-end';
            arrowImage.style.marginTop = "-1em";
            arrowImage.style.marginRight = '2em';
        } else { // 'right'
            left = targetCenterX;
            indicatorContainer.style.alignItems = 'flex-start';
        }

        left = Math.max(0, left);
        left = Math.min(left, window.innerWidth - indicatorContainer.offsetWidth);

        indicatorContainer.style.left = `${left}px`;
        indicatorContainer.style.top = `${top}px`;
        arrowImage.style.marginBottom = `0`;
    }

    let animationFrameId;
    function loop() {
        animationFrameId = requestAnimationFrame(loop);
        const currentIndicatorData = tutorialArrowIndicators.get(targetEl);
        if (currentIndicatorData) {
            currentIndicatorData.animationFrameId = animationFrameId;
        }
        updatePosition();
    }
    loop();

    tutorialArrowIndicators.set(targetEl, { container: indicatorContainer, animationFrameId: animationFrameId });

    requestAnimationFrame(() => indicatorContainer.classList.add('show'));
}

// Renombrada a función interna (privada)
function _hideTutorialHighlightArrow(targetEl) {
    const indicatorData = tutorialArrowIndicators.get(targetEl);
    if (!indicatorData) {
        console.warn(`[_hideTutorialHighlightArrow] No se encontró indicador para el targetEl proporcionado.`, targetEl);
        return;
    }

    const indicatorContainer = indicatorData.container;
    const animationFrameId = indicatorData.animationFrameId;

    console.log(`[_hideTutorialHighlightArrow] Ocultando indicador de flecha para target:`, targetEl, `Elemento:`, indicatorContainer);

    if (!indicatorContainer || !indicatorContainer.parentNode || !indicatorContainer.classList.contains('show')) {
        console.warn(`[_hideTutorialHighlightArrow] Indicador ya oculto o no en el DOM. Limpiando referencias.`, indicatorContainer);
        if (indicatorContainer && indicatorContainer.parentNode) {
            indicatorContainer.parentNode.removeChild(indicatorContainer);
            console.log(`[_hideTutorialHighlightArrow] REMOCIÓN FORZADA exitosa para flecha.`, targetEl);
        }
        _cleanTutorialArrowReferences(targetEl, animationFrameId);
        return;
    }

    indicatorContainer.classList.remove('show');
    indicatorContainer.style.opacity = '0';
    indicatorContainer.style.pointerEvents = 'none';

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        console.log(`[_hideTutorialHighlightArrow] cancelAnimationFrame para flecha tutorial:`, animationFrameId);
    }

    setTimeout(() => {
        if (indicatorContainer && indicatorContainer.parentNode) {
            indicatorContainer.parentNode.removeChild(indicatorContainer);
            console.log(`[_hideTutorialHighlightArrow] Elemento de flecha removido del DOM para target:`, targetEl);
        } else {
            console.warn(`[_hideTutorialHighlightArrow] El contenedor ya no está en el DOM o no tiene padre al intentar remover (setTimeout).`, indicatorContainer);
        }
        _cleanTutorialArrowReferences(targetEl, animationFrameId);
        console.log(`[_hideTutorialHighlightArrow] Referencias de flecha tutorial limpiadas para target:`, targetEl);
    }, 300);
}

// Renombrada a función interna (privada)
function _hideAllTutorialHighlightArrows() {
    console.log(">>> [_hideAllTutorialHighlightArrows] Iniciando _hideAllTutorialHighlightArrows <<<");
    const keysToHide = [...tutorialArrowIndicators.keys()];
    keysToHide.forEach(targetEl => {
        _hideTutorialHighlightArrow(targetEl); // Llamar a la función interna de ocultamiento
    });
    tutorialArrowIndicators.clear();
    console.log(">>> [_hideAllTutorialHighlightArrows] Finalizado _hideAllTutorialHighlightArrows <<<");
}

function _hideTooltipElement(tip, text) {
    console.log(`[_hideTooltipElement] Intentando ocultar tooltip "${text}". Elemento:`, tip);

    if (!tip || !tip.parentNode || !tip.classList.contains('show')) {
        console.warn(`[_hideTooltipElement] Tooltip "${text}" ya oculto o no en el DOM. Limpiando referencias.`, tip);
        if (tip && tip.parentNode) {
            tip.parentNode.removeChild(tip);
            console.log(`[_hideTooltipElement] REMOCIÓN FORZADA exitosa para tooltip.`, text);
        }
        _cleanTooltipReferences(tip, text);
        return;
    }

    tip.classList.remove('show');
    tip.style.opacity = '0';
    tip.style.pointerEvents = 'none';

    _cleanTooltipReferences(tip, text);

    setTimeout(() => {
        if (tip && tip.parentNode) {
            tip.parentNode.removeChild(tip);
            console.log(`[_hideTooltipElement] Tooltip "${text}" removido del DOM.`);
        } else {
            console.warn(`[_hideTooltipElement] Tooltip "${text}" ya no está en el DOM o no tiene padre al intentar remover (setTimeout).`);
        }
    }, 300);
}

// Helper para limpiar las referencias de un tooltip
function _cleanTooltipReferences(tip, text) {
    if (!tip) return;

    if (tooltipAnimationFrames.has(tip)) {
        cancelAnimationFrame(tooltipAnimationFrames.get(tip));
        tooltipAnimationFrames.delete(tip);
        console.log(`[_cleanTooltipReferences] requestAnimationFrame cancelado para "${text}"`);
    }
    if (tooltipTimeouts.has(tip)) {
        clearTimeout(tooltipTimeouts.get(tip));
        tooltipTimeouts.delete(tip);
        console.log(`[_cleanTooltipReferences] setTimeout cancelado para "${text}"`);
    }
    shownTooltips.delete(text);
    const index = activeTooltipElements.indexOf(tip);
    if (index > -1) {
        activeTooltipElements.splice(index, 1);
    }
    tooltipTextMap.delete(text);
    persistentTooltips.delete(text);
}

// Helper para limpiar las referencias de una flecha de tutorial
function _cleanTutorialArrowReferences(targetEl, animationFrameId) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    tutorialArrowIndicators.delete(targetEl);
}


/**
 * Función principal para ocultar todos los tooltips y elementos de tutorial.
 * Esta función consolida toda la limpieza.
 */
export function hideAllTooltips() {
  console.log("=== [hideAllTooltips] Forzando remoción de todos los tooltips y flechas…");

  // 1. Elimina cualquier tooltip que siga en el DOM
  document.querySelectorAll('.tooltip').forEach(tip => {
    if (tip.parentNode) tip.parentNode.removeChild(tip);
  });

  // 2. Elimina cualquier flecha de tutorial que siga en el DOM
  document.querySelectorAll('.tutorial-highlight-arrow').forEach(el => {
    if (el.parentNode) el.parentNode.removeChild(el);
  });

  // 3. Resetea tus colecciones internas
  shownTooltips.clear();
  activeTooltipElements.length = 0;
  tooltipAnimationFrames.clear();
  tooltipTimeouts.clear();
  tooltipTextMap.clear();
  persistentTooltips.clear();
  tutorialArrowIndicators.clear();

  console.log("=== [hideAllTooltips] Colecciones reseteadas:",
    { shownTooltips: shownTooltips.size, active: activeTooltipElements.length }
  );
}

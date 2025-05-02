import * as dat from 'dat.gui';

/**
 * Crea una interfaz para modificar los parámetros de un objeto.
 * @param {Object} object - El objeto cuyos parámetros se van a modificar.
 * @param {string} folderName - (Opcional) Nombre de la carpeta en la GUI.
 * @param {Object} options - (Opcional) Configuración adicional para los parámetros.
 * @returns {dat.GUI} - La instancia de dat.GUI creada.
 */
export function createGUI(object, folderName = 'Parameters', options = {}) {
  const gui = new dat.GUI();

  // Crear una carpeta para organizar los controles
  const folder = gui.addFolder(folderName);

  // Iterar sobre las propiedades del objeto
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = object[key];

      // Si es un número, agregar un control deslizante
      if (typeof value === 'number') {
        const { min = 0, max = 100, step = 1 } = options[key] || {};
        folder.add(object, key, min, max, step);
      }
      // Si es un color, agregar un control de color
      else if (typeof value === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(value)) {
        folder.addColor(object, key);
      }
      // Si es un booleano, agregar un checkbox
      else if (typeof value === 'boolean') {
        folder.add(object, key);
      }
    }
  }

  folder.close(); // Abrir la carpeta por defecto
  return gui;
}
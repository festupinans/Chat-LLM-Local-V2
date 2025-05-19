import * as dat from "dat.gui";

/**
 * Crea una interfaz para modificar los parámetros de un objeto.
 * @param {Object} object - El objeto cuyos parámetros se van a modificar.
 * @param {string} folderName - (Opcional) Nombre de la carpeta en la GUI.
 * @param {Object} options - (Opcional) Configuración adicional para los parámetros.
 * @returns {dat.GUI} - La instancia de dat.GUI creada.
 */
export function createGUI(object, folderName = "Parameters", options = {}) {
  const gui = new dat.GUI();

  // Crear una carpeta para organizar los controles
  const folder = gui.addFolder(folderName);

  // Solo mostrar las propiedades definidas en options
  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = object[key];
      const { min = 0, max = 100, step = 1 } = options[key] || {};
      if (typeof value === "number") {
        folder.add(object, key, min, max, step);
      } else if (typeof value === "boolean") {
        folder.add(object, key);
      } else if (
        typeof value === "string" &&
        /^#([0-9A-F]{3}){1,2}$/i.test(value)
      ) {
        folder.addColor(object, key);
      }
    }
  }

  folder.close(); // Abrir la carpeta por defecto
  return gui;
}

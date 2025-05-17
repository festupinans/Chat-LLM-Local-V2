import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { log } from 'three/tsl';

/**
 * Carga un modelo 3D en formato GLB.
 * @param {string} path - Ruta del archivo GLB.
 * @returns {Promise<{scene: THREE.Group, animations: Array}>} - Promesa que resuelve con el modelo cargado y sus animaciones.
 */

export function loadModel(path) {
  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        // Cambia materiales y configura sombras
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            // Configura sombras
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        resolve({ scene: gltf.scene, animations: gltf.animations }); // Devuelve ambos
      },
      undefined,
      (error) => {
        console.error('Error al cargar el modelo:', error);
        reject(error);
      }
    );
  });
}
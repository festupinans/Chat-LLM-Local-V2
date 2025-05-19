import * as THREE from "three";
import { loadModel } from "./LoadModel";
import { createGUI } from "./dat";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PlaAnim } from "./AnimController";
import * as dat from "dat.gui";

// Instancia única de dat.GUI para toda la escena
const gui = new dat.GUI();

let habla = false; // Variable para controlar el estado de la animación
let emissiveMaterial = null; // Referencia al material del modelo
let animationFrameId = null; // ID del requestAnimationFrame
let time = 0; // Tiempo para la animación
export let NombresAnimaciones = [];

function toggleAnimation(valor) {
  habla = valor; // Actualiza el estado de la animación
  if (habla) {
    // console.log("Animación activada");
    startEmissiveAnimation();
  } else {
    // console.log("Animación desactivada");
    stopEmissiveAnimation();
  }
}

function startEmissiveAnimation() {
  if (!emissiveMaterial) return;

  function animateEmissive() {
    if (!habla) return; // Detener la animación si habla es false
    time += 0.05; // Incremento del tiempo para la animación
    emissiveMaterial.emissiveIntensity = 50 + 50 * Math.sin(time); // Oscila entre 1 y 100
    animationFrameId = requestAnimationFrame(animateEmissive);
  }

  if (!animationFrameId) {
    animateEmissive();
  }
}

function stopEmissiveAnimation() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (emissiveMaterial) {
    emissiveMaterial.emissiveIntensity = 1; // Restablecer el valor por defecto
  }
}

window.addEventListener("toggleAnimation", (event) => {
  const customEvent = event;
  toggleAnimation(customEvent.detail); // Usar el valor enviado en el evento
});

export function initScene() {
  // Creamos la escena
  const scene = new THREE.Scene();
  const color = new THREE.Color().setHex(0xffffff);
  scene.background = color;

  // Creamos la cámara
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  );
  camera.position.z = 3;
  camera.position.y = 1.3;

  // Creamos el renderizador
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Opcional: sombras suaves

  // OrbitControls (inicialmente desactivados)
  // let controlsEnabled = true;
  // const controls = new OrbitControls(camera, renderer.domElement);
  // controls.enabled = controlsEnabled;

  // Agregamos el canvas al DOM
  const container = document.getElementById("app"); // Seleccionamos el contenedor en index.html
  if (container) {
    container.appendChild(renderer.domElement);
  }

  // Agregamos luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048; // Mejor calidad de sombra
  directionalLight.shadow.mapSize.height = 2048;
  // directionalLight.shadow.camera.near = 0.5;
  // directionalLight.shadow.camera.far = 50;
  scene.add(directionalLight);

  // --- Carpeta unificada para la cámara ---
  const folderCamera = gui.addFolder("Cámara");

  // Subcarpeta para posición
  const posCamera = folderCamera.addFolder("Posición");
  posCamera.add(camera.position, "x", -10, 10, 0.1);
  posCamera.add(camera.position, "y", -10, 10, 0.1);
  posCamera.add(camera.position, "z", 0, 20, 0.1);

  // Subcarpeta para rotación en grados
  const rotCameraDegrees = {
    x: THREE.MathUtils.radToDeg(camera.rotation.x),
    y: THREE.MathUtils.radToDeg(camera.rotation.y),
    z: THREE.MathUtils.radToDeg(camera.rotation.z),
  };
  const rotCamera = folderCamera.addFolder("Rotación (°)");
  ["x", "y", "z"].forEach((axis) => {
    rotCamera.add(rotCameraDegrees, axis, -180, 180, 1).onChange((value) => {
      camera.rotation[axis] = THREE.MathUtils.degToRad(value);
    });
  });

  // Subcarpeta para parámetros ópticos
  const opticsCamera = folderCamera.addFolder("Óptica");
  opticsCamera
    .add(camera, "fov", 10, 120, 1)
    .onChange(() => camera.updateProjectionMatrix());
  opticsCamera
    .add(camera, "near", 0.01, 10, 0.1)
    .onChange(() => camera.updateProjectionMatrix());
  opticsCamera
    .add(camera, "far", 100, 2000, 10)
    .onChange(() => camera.updateProjectionMatrix());
  opticsCamera
    .add(camera, "zoom", 0.1, 5, 0.01)
    .onChange(() => camera.updateProjectionMatrix());
  opticsCamera
    .add(camera, "aspect", 0.1, 4, 0.01)
    .onChange(() => camera.updateProjectionMatrix());
  opticsCamera
    .add(camera, "focus", 0, 100, 0.1)
    .onChange(() => camera.updateProjectionMatrix());

  // Suelo y paredes (4 planos formando una caja)
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });

  // Piso
  const floor = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // Pared trasera
  const wallBack = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  wallBack.position.z = -3;
  wallBack.position.y = 10;
  wallBack.receiveShadow = true;
  wallBack.rotation.x = 0;
  scene.add(wallBack);

  // Pared izquierda
  const wallLeft = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  wallLeft.position.x = -1.5;
  wallLeft.position.y = 10;
  wallLeft.rotation.y = Math.PI / 2;
  wallLeft.receiveShadow = true;
  scene.add(wallLeft);

  // Pared derecha
  const wallRight = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  wallRight.position.x = 1.5;
  wallRight.position.y = 10;
  wallRight.rotation.y = -Math.PI / 2;
  wallRight.receiveShadow = true;
  scene.add(wallRight);

  // GUI para mover cada plano
  // createGUI(floor.position, "Piso posición", {
  //   x: { min: -20, max: 20, step: 0.1 },
  //   y: { min: -5, max: 20, step: 0.1 },
  //   z: { min: -20, max: 20, step: 0.1 },
  // });
  // createGUI(floor.rotation, "Piso rotación", {
  //   x: { min: -Math.PI, max: Math.PI, step: 0.01 },
  //   y: { min: -Math.PI, max: Math.PI, step: 0.01 },
  //   z: { min: -Math.PI, max: Math.PI, step: 0.01 },
  // });

  createGUI(wallBack.position, "Pared Trasera posición", {
    x: { min: -20, max: 20, step: 0.1 },
    y: { min: -5, max: 20, step: 0.1 },
    z: { min: -20, max: 20, step: 0.1 },
  });
  // createGUI(wallBack.rotation, "Pared Trasera rotación", {
  //   x: { min: -Math.PI, max: Math.PI, step: 0.01 },
  //   y: { min: -Math.PI, max: Math.PI, step: 0.01 },
  //   z: { min: -Math.PI, max: Math.PI, step: 0.01 },
  // });

  // --- Pared Izquierda ---
  const folderLeft = gui.addFolder("Pared Izquierda");

  // Posición
  const posLeft = folderLeft.addFolder("Posición");
  posLeft.add(wallLeft.position, "x", -20, 20, 0.1);
  posLeft.add(wallLeft.position, "y", -5, 20, 0.1);
  posLeft.add(wallLeft.position, "z", -20, 20, 0.1);

  // Rotación en grados
  const rotLeftDegrees = {
    x: THREE.MathUtils.radToDeg(wallLeft.rotation.x),
    y: THREE.MathUtils.radToDeg(wallLeft.rotation.y),
    z: THREE.MathUtils.radToDeg(wallLeft.rotation.z),
  };
  const rotLeft = folderLeft.addFolder("Rotación (°)");
  ["x", "y", "z"].forEach((axis) => {
    rotLeft.add(rotLeftDegrees, axis, -180, 180, 1).onChange((value) => {
      wallLeft.rotation[axis] = THREE.MathUtils.degToRad(value);
    });
  });

  // --- Pared Derecha ---
  const folderRight = gui.addFolder("Pared Derecha");

  // Posición
  const posRight = folderRight.addFolder("Posición");
  posRight.add(wallRight.position, "x", -20, 20, 0.1);
  posRight.add(wallRight.position, "y", -5, 20, 0.1);
  posRight.add(wallRight.position, "z", -20, 20, 0.1);

  // Rotación en grados
  const rotRightDegrees = {
    x: THREE.MathUtils.radToDeg(wallRight.rotation.x),
    y: THREE.MathUtils.radToDeg(wallRight.rotation.y),
    z: THREE.MathUtils.radToDeg(wallRight.rotation.z),
  };
  const rotRight = folderRight.addFolder("Rotación (°)");
  ["x", "y", "z"].forEach((axis) => {
    rotRight.add(rotRightDegrees, axis, -180, 180, 1).onChange((value) => {
      wallRight.rotation[axis] = THREE.MathUtils.degToRad(value);
    });
  });

  // Cargar un modelo 3D
  loadModel("/models/Animaciones1.glb")
    .then(({ scene: model, animations }) => {
      scene.add(model);
      // model.castShadow = true;
      // model.receiveShadow = true;
      // console.log("Modelo");
      // console.log(model);

      // Obtener el material emissive del modelo
      emissiveMaterial = model.children[0].children[2].material;
      // console.log(emissiveMaterial);

      // Iniciar o detener la animación según el estado inicial de habla
      if (habla) {
        startEmissiveAnimation();
      } else {
        stopEmissiveAnimation();
      }

      // Verificar si el modelo tiene animaciones
      if (animations && animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);

        // Reproducir todas las animaciones en loop
        animations.forEach((clip) => {
          const action = mixer.clipAction(clip);
          // action.play();
          console.log(action._clip.name);
          NombresAnimaciones.push(action);
        });
        console.log(NombresAnimaciones);

        // Actualizar el mixer en cada frame
        const clock = new THREE.Clock();
        function animate() {
          const delta = clock.getDelta();
          mixer.update(delta);
          requestAnimationFrame(animate);
        }
        animate();
      } else {
        console.log("El modelo no tiene animaciones.");
      }
      // presentIntroduction();
      const valor = Math.floor(Math.random() * 2) + 1;
      PlaAnim(valor, {
        fadeDuration: 0.5,
        loop: Infinity,
        onFinished: () => alert("¡Animación terminada!"),
      });
    })
    .catch((error) => {
      console.error("No se pudo cargar el modelo:", error);
    });

  // Función para manejar el redimensionamiento
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onWindowResize, false);

  // Animación
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
  // loadModel("/models/Caja.glb").then(({ scene: model, animations }) => {
  //   scene.add(model);

  //   const color = new THREE.Color().setRGB(1, 1, 1);
  //   model.children[0].material.color = color;
  //   console.log(model);
  //   model.castShadow = true;
  //   model.receiveShadow = true;
  //   // console.log(model.children[0].material.color);
  // });
}

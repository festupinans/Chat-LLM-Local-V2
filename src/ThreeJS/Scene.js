import * as THREE from "three";
import { loadModel } from "./LoadModel";
import { createGUI } from "./dat";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PlaAnim } from "./AnimController";
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
    0.1,
    1000
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

  // // Crear GUI para la cámara
  // createGUI(camera.position, "Camera Position", {
  //   x: { min: -10, max: 10, step: 0.1 },
  //   y: { min: -10, max: 10, step: 0.1 },
  //   z: { min: 0, max: 20, step: 0.1 },
  // });
  // createGUI(camera, "Camera Settings", {
  //   fov: { min: 10, max: 120, step: 1 },
  //   near: { min: 0.1, max: 10, step: 0.1 },
  //   far: { min: 100, max: 2000, step: 10 },
  // });

  // Crear GUI para la luz ambiental
  // createGUI(ambientLight, "Ambient Light", {
  //   intensity: { min: 0, max: 30, step: 0.1 },
  // });
  // createGUI(ambientLight.color, "Ambient Light Color");

  // // Crear GUI para la luz direccional
  // createGUI(directionalLight.position, "Directional Light Position", {
  //   x: { min: -20, max: 20, step: 0.1 },
  //   y: { min: -20, max: 20, step: 0.1 },
  //   z: { min: -20, max: 20, step: 0.1 },
  // });
  // createGUI(directionalLight, "Directional Light", {
  //   intensity: { min: 0, max: 30, step: 0.1 },
  // });
  // createGUI(directionalLight.color, "Directional Light Color");

  // Suelo y paredes (4 planos formando una caja)
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });

  // Piso
  const floor = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // // Pared trasera
  // const wallBack = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  // wallBack.position.z = -3;
  // wallBack.position.y = 10;
  // wallBack.receiveShadow = true;
  // wallBack.rotation.x = 0;
  // scene.add(wallBack);

  // // Pared izquierda
  // const wallLeft = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  // wallLeft.position.x = -1.5;
  // wallLeft.position.y = 10;
  // wallLeft.rotation.y = Math.PI / 2;
  // wallLeft.receiveShadow = true;
  // scene.add(wallLeft);

  // // Pared derecha
  // const wallRight = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  // wallRight.position.x = 1.5;
  // wallRight.position.y = 10;
  // wallRight.rotation.y = -Math.PI / 2;
  // wallRight.receiveShadow = true;
  // scene.add(wallRight);

  // GUI para mover cada plano
  // createGUI(floor.position, "Piso posición", {
  //   x: { min: -20, max: 20, step: 0.1 },
  //   y: { min: -5, max: 20, step: 0.1 },
  //   z: { min: -20, max: 20, step: 0.1 },
  // });
  // createGUI(wallBack.position, "Pared Trasera posición", {
  //   x: { min: -20, max: 20, step: 0.1 },
  //   y: { min: -5, max: 20, step: 0.1 },
  //   z: { min: -20, max: 20, step: 0.1 },
  // });
  // createGUI(wallLeft.position, "Pared Izquierda posición", {
  //   x: { min: -20, max: 20, step: 0.1 },
  //   y: { min: -5, max: 20, step: 0.1 },
  //   z: { min: -20, max: 20, step: 0.1 },
  // });
  // createGUI(wallRight.position, "Pared Derecha posición", {
  //   x: { min: -20, max: 20, step: 0.1 },
  //   y: { min: -5, max: 20, step: 0.1 },
  //   z: { min: -20, max: 20, step: 0.1 },
  // });

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

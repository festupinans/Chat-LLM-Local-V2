import * as THREE from "three";
import { loadModel } from "./LoadModel";
import { createGUI } from "./dat";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PlaAnim } from "./AnimController";
import * as dat from "dat.gui";


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
  camera.position.y = 1.5;
  camera.zoom = 0.2;
  camera.fov = 19
  camera.updateProjectionMatrix()

  // Creamos el renderizador
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap ; // Opcional: sombras suaves

  // Agregamos el canvas al DOM
  const container = document.getElementById("app"); // Seleccionamos el contenedor en index.html
  if (container) {
    container.appendChild(renderer.domElement);
  }

  // Agregamos luces
  const ambientLight = new THREE.AmbientLight(0xffffff, 3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(5, 10, 7.5);
  directionalLight.castShadow = false;

  const punto = new THREE.PointLight( 0xffffff, 1, 100 )
  punto.position.set(2,2,3)
  punto.intensity = 60
  // punto.power = 1800
  punto.decay = 2.5
  punto.castShadow = true
  punto.shadow.mapSize.width = 256*2;
  punto.shadow.mapSize.height = 256*2;
  punto.shadow.camera.near = 1
  punto.shadow.camera.far = 500
  punto.shadow.camera.left = -10
  punto.shadow.camera.right = 10
  punto.shadow.camera.top = 10
  punto.shadow.camera.bottom = -10
  punto.shadow.radius = 10
  punto.shadow.blurSamples = 10
  punto.shadow.bias = -0.001;
  punto.shadow.normalBias = 0.01;

  console.log(punto);
  
  scene.add(punto)

  // Suelo y paredes (4 planos formando una caja)
  const floorGeometry = new THREE.PlaneGeometry(20, 20);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
  
  
  // Piso
  const floor = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  console.log(floor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  floor.receiveShadow = true;
  scene.add(floor);

  // Pared trasera
  const wallBack = new THREE.Mesh(floorGeometry, wallMaterial.clone());
  wallBack.position.z = -1.5;
  // wallBack.position.y = ;
  wallBack.receiveShadow = true;
  wallBack.rotation.x = 0;
  // wallBack.scale.set(5,5,5)
  scene.add(wallBack);
  
  // Cargar un modelo 3D
  loadModel("/models/Animaciones1.glb")
    .then(({ scene: model, animations }) => {
      scene.add(model);
      // model.position.y =
      model.scale.x = 1.2
      model.scale.y = 1.2
      model.scale.z = 1.2
      model.position.z = -.5
      console.log()

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
}

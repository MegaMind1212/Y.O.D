import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// Initialize camera, scene, renderer, and other basics
const camera = new THREE.PerspectiveCamera(
  10,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 13;

const scene = new THREE.Scene();
let bee;
let mixer;
const loader = new GLTFLoader();

// Load the model (GLTF format)
loader.load(
  'blackT/black.gltf', // Path to your model file
  function (gltf) {
    bee = gltf.scene;
    scene.add(bee);

    bee.position.set(0, -2.5, 0); // Lowered the y value to -2.5
    bee.scale.set(1.7, 1.7, 1.7);

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(bee);
      mixer.clipAction(gltf.animations[0]).play();
    } else {
      console.warn('No animations found in this GLTF model.');
    }

    modelMove(); // Initial position of the model
  },
  undefined,
  function (error) {
    console.error('Error loading model:', error);
  }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
scene.add(topLight);

// Animation render loop
const reRender3D = () => {
  requestAnimationFrame(reRender3D);
  renderer.render(scene, camera);
  if (mixer) mixer.update(0.02);
};
reRender3D();

// Handling 3D Model movement on scroll
let arrPositionModel = [
  { id: "sizeSelection", position: { x: 0, y: -2.2, z: 0 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
  { id: "colorSelection", position: { x: 0, y: -2.2, z: 0 }, rotation: { x: 0, y: 0.5, z: 0 } },
  { id: "designImprint", position: { x: 0, y: -2.2, z: 0 }, rotation: { x: 0.3, y: 0.5, z: 0 } },
  { id: "contact", position: { x: 0, y: -2.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }
];

const initialPosition = { x: 0, y: -2.5, z: 0 };
const initialRotation = { x: 0, y: 0, z: 0 };

const modelMove = () => {
  const isMobile = window.innerWidth <= 768; // Check if it's mobile
  const sections = document.querySelectorAll('.section');
  let currentSection = null;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2 && rect.bottom > 0) {
      currentSection = section.id;
    }
  });

  console.log('Current Section:', currentSection);  // Log the current section for debugging

  const positionActive = arrPositionModel.findIndex((val) => val.id === currentSection);

  if (positionActive >= 0) {
    const newCoordinates = arrPositionModel[positionActive];

    gsap.to(bee.position, {
      x: newCoordinates.position.x,
      y: newCoordinates.position.y,
      z: newCoordinates.position.z,
      duration: 1.5,
      ease: "power1.out"
    });

    gsap.to(bee.rotation, {
      x: newCoordinates.rotation.x,
      y: newCoordinates.rotation.y,
      z: newCoordinates.rotation.z,
      duration: 1.5,
      ease: "power1.out"
    });
  } else {
    gsap.to(bee.position, {
      x: initialPosition.x,
      y: initialPosition.y,
      z: initialPosition.z,
      duration: 1.5,
      ease: "power1.out"
    });

    gsap.to(bee.rotation, {
      x: initialRotation.x,
      y: initialRotation.y,
      z: initialRotation.z,
      duration: 1.5,
      ease: "power1.out"
    });
  }
};

// Scroll Event Listener
window.addEventListener('scroll', () => {
  if (bee) {
    modelMove();
  }
});

// Window Resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Adjust model's position based on mobile screen
  if (window.innerWidth <= 768) {
    camera.position.z = 10;  // For mobile, bring the camera closer
  } else {
    camera.position.z = 13;  // For desktop, keep the camera further
  }
});

// Color Selection (Black/White)
document.getElementById('blackTshirt').addEventListener('click', () => {
  bee.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set('#000000'); // Change to black color
    }
  });
});

document.getElementById('whiteTshirt').addEventListener('click', () => {
  bee.traverse((child) => {
    if (child.isMesh) {
      child.material.color.set('#FFFFFF'); // Change to white color
    }
  });
});

// Handle Size Selection Buttons
document.getElementById('sizeS').addEventListener('click', () => {
  bee.scale.set(1, 1, 1);
});

document.getElementById('sizeM').addEventListener('click', () => {
  bee.scale.set(1.2, 1.2, 1.2);
});

document.getElementById('sizeL').addEventListener('click', () => {
  bee.scale.set(1.5, 1.5, 1.5);
});

document.getElementById('sizeXL').addEventListener('click', () => {
  bee.scale.set(1.7, 1.7, 1.7);
});

document.getElementById('sizeXXL').addEventListener('click', () => {
  bee.scale.set(2, 2, 2);
});

// Design Selection (Texture Replacement)
document.addEventListener('DOMContentLoaded', () => {
  const imageHolders = document.querySelectorAll('#rotating-design-selector .image-holder img');

  imageHolders.forEach((img) => {
    img.addEventListener('mouseenter', () => {
      img.style.transform = 'scale(1.2)';
      img.style.transition = 'transform 0.3s ease';
      img.parentElement.style.zIndex = '2';
    });

    img.addEventListener('mouseleave', () => {
      img.style.transform = 'scale(1)';
      img.style.transition = 'transform 0.3s ease';
      img.parentElement.style.zIndex = '0';
    });

    img.addEventListener('click', (e) => {
      const imgSrc = e.target.src;

      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(
        imgSrc,
        () => {
          console.log('Texture loaded successfully:', imgSrc);
        },
        undefined,
        (err) => {
          console.error('Error loading texture:', err);
        }
      );

      bee.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      });
    });
  });
});

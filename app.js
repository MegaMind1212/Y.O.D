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

    // Start position for mobile (adjusted vertically for better view)
    if (window.innerWidth <= 768) {
      bee.position.set(0, -1.5, 0);  // Mobile view: position remains as it was
    } else {
      bee.position.set(0, -2.5, 0);  // Desktop view: move it downward slightly (e.g., -2.5)
    }

    bee.scale.set(1.7, 1.7, 1.7); // Initial scale set to original size

    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(bee);
      mixer.clipAction(gltf.animations[0]).play();
    } else {
      console.warn('No animations found in this GLTF model.');
    }

    updateModelScale(); // Update scale after model load
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
  { id: "sizeSelection", position: { x: 0, y: -1.5, z: 0 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
  { id: "colorSelection", position: { x: 0, y: -1.5, z: 0 }, rotation: { x: 0, y: 0.5, z: 0 } },
  { id: "designImprint", position: { x: 0, y: -1.5, z: 0 }, rotation: { x: 0, y: -0.5, z: 0 } },
  { id: "contact", position: { x: 0, y: -1.5, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }
];

const initialPosition = { x: 0, y: -1.5, z: 0 }; // Updated starting y value for mobile
const initialRotation = { x: 0, y: 0, z: 0 };

const modelMove = () => {
  const isMobile = window.innerWidth <= 768; // Check if it's mobilel
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

    // Lock the y-position to avoid jumping upwards, only modify x and z
    gsap.to(bee.position, {
      x: newCoordinates.position.x,
      y: bee.position.y, // Keep current y position
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
    // If no section matches, keep the model in its initial position
    gsap.to(bee.position, {
      x: initialPosition.x,
      y: bee.position.y, // Keep current y position
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

  // Adjust model's position and scale after resize
  updateModelPosition();
  updateModelScale();
});

// Update Model Scale
function updateModelScale() {
  if (window.matchMedia("(max-width: 768px)").matches) {
    // Apply smaller scale on mobile
    if (bee) {
      bee.scale.set(1.0, 1.0, 1.0); // Slightly smaller scale for mobile to keep the model visible and proportionate
    }
  } else {
    // Keep original scale on desktop
    if (bee) {
      bee.scale.set(1.7, 1.7, 1.7); // Default desktop scale
    }
  }
}

// Adjust Model's Position Based on Screen Size
function updateModelPosition() {
  const isMobile = window.innerWidth <= 768;
  
  if (bee) {
    if (isMobile) {
      // Mobile Positioning (Y = -1.5 for mobile)
      bee.position.set(0, -1.5, 0);
    } else {
      // Desktop Positioning (move it downwards slightly)
      bee.position.set(0, -2.5, 0);  // Slightly adjusted downward for desktop
    }
  }
}

// Size-specific positioning and padding
const sizePadding = {
  small: -3.5,  // Smaller models move further down
  medium: -2.5, // Default medium position
  large: -2.0,  // Larger models move up
  xlarge: -1.5, // Very large models move even higher
  xxl: -1.0    // Extra large models should move closer to the center
};

// Handle Size Selection Buttons
document.getElementById('sizeS').addEventListener('click', () => {
  adjustModelSize(1.1, 'small');
});

document.getElementById('sizeM').addEventListener('click', () => {
  adjustModelSize(1.2, 'medium');
});

document.getElementById('sizeL').addEventListener('click', () => {
  adjustModelSize(1.4, 'large');
});

document.getElementById('sizeXL').addEventListener('click', () => {
  adjustModelSize(1.5, 'xlarge');
});

document.getElementById('sizeXXL').addEventListener('click', () => {
  adjustModelSize(1.6, 'xxl');
});

// Adjust size and ensure the model remains centered
function adjustModelSize(scale) {
  const isMobile = window.innerWidth <= 768;
  const currentPositionY = bee.position.y;  // Save current Y position

  // Apply the size adjustment
  bee.scale.set(scale, scale, scale);
  
  // Ensure model stays centered vertically
  if (isMobile) {
    bee.position.set(0, -1.5, 0);  // Center for mobile
  } else {
    bee.position.set(0, -2.5, 0);  // Center for desktop
  }
}



// Color Selection (Black/White)
document.getElementById('blackTshirt').addEventListener('click', () => {
  applyDesignColor('black');
});

document.getElementById('whiteTshirt').addEventListener('click', () => {
  applyDesignColor('white');
});

// Apply design color effects (both for black and white)
function applyDesignColor(color) {
  bee.traverse((child) => {
    if (child.isMesh) {
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(color === 'black' ? 'img/black.png' : 'img/white.png');
      child.material.map = texture;
      child.material.needsUpdate = true;
    }
  });

  // Adjust lighting and material properties for both colors
  if (color === 'black') {
    adjustLightingAndMaterial('black');
  } else {
    adjustLightingAndMaterial('white');
  }
}

// Adjust lighting and material for black or white designs
function adjustLightingAndMaterial(color) {
  if (color === 'white') {
    // Lower the intensity of the lights for white designs
    scene.traverse((object) => {
      if (object.isLight) {
        object.intensity = 0.5;  // Lower intensity for better contrast
      }
    });

    // Reduce brightness and shine for the material of white design
    bee.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.specular = new THREE.Color(0x888888); // Less shiny for white
        child.material.emissive = new THREE.Color(0x333333); // Darker to prevent washout
      }
    });
  } else {
    // Reset lighting for black designs
    scene.traverse((object) => {
      if (object.isLight) {
        object.intensity = 1.3;  // Reset intensity for black designs
      }
    });

    // Reset material properties for black design
    bee.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.specular = new THREE.Color(0x333333); // Default specular for black
        child.material.emissive = new THREE.Color(0x000000); // Default emissive for black
      }
    });
  }
}

// Design Selection (Texture Replacement)
document.addEventListener('DOMContentLoaded', () => {
  const imageHolders = document.querySelectorAll('#rotating-design-selector .image-holder img');
  let selectedColor = 'default';  // Default color before any selection (no color applied)

  // Handle mouseenter and mouseleave effects (scale images)
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
  });

  // Function to handle color selection (black or white)
  function setSelectedColor(color) {
    selectedColor = color;
    console.log('Selected Color:', color);
  }

  // Color selection event listeners
  document.getElementById('blackTshirt').addEventListener('click', () => {
    setSelectedColor('black');
  });

  document.getElementById('whiteTshirt').addEventListener('click', () => {
    setSelectedColor('white');
  });

  // Handle image click (apply texture based on selected color)
  imageHolders.forEach((img) => {
    img.addEventListener('click', (e) => {
      // Find the relevant display, black-bg, or white-bg image
      const displayImage = img.closest('.image-holder').querySelector('.display');
      const blackImage = img.closest('.image-holder').querySelector('.black-bg');
      const whiteImage = img.closest('.image-holder').querySelector('.white-bg');

      // Load the appropriate texture based on the selected color
      let textureSrc = displayImage.src;  // Default to display image (when no color is selected)

      if (selectedColor === 'black') {
        textureSrc = blackImage.src;  // Use black version if selected
      } else if (selectedColor === 'white') {
        textureSrc = whiteImage.src;  // Use white version if selected
      }

      // Apply the texture to the model
      const textureLoader = new THREE.TextureLoader();
      const texture = textureLoader.load(textureSrc, () => {
        console.log('Texture loaded successfully:', textureSrc);
      });

      // Apply the texture to the model (this assumes `bee` is your 3D model object)
      bee.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      });

      // Adjust lighting when design is applied (reduce overexposure for white design)
      if (selectedColor === 'white') {
        adjustLightingAndMaterial('white');
      } else if (selectedColor === 'black') {
        adjustLightingAndMaterial('black');
      }
    });
  });
});


//New js for toggle front and back
// Existing structure for selected design
let selectedDesign = { 
  display: 'img/yodl.png', 
  vector: 'img/designs/d1.png', 
  whiteBg: 'img/designs/d1w.png', 
  blackBg: 'img/designs/d1b.png' 
};

// Default side selection (front side by default)
let selectedSide = 'Front';

// Function to update the T-shirt color based on user selection
function updateTshirtColor(color) {
  const frontTshirt = document.getElementById("frontTshirt");
  const backTshirt = document.getElementById("backTshirt");
  const frontDesign = document.getElementById("frontDesign");
  const backDesign = document.getElementById("backDesign");

  if (color === 'black') {
      frontTshirt.src = 'img/frontblack.png';
      backTshirt.src = 'img/backblack.png';
      // Apply the selected color's design
      frontDesign.src = selectedDesign.blackBg;  // Apply the black version of the design to the front
      backDesign.src = 'img/yodl.png';  // Show Yodl logo on the back
  } else {
      frontTshirt.src = 'img/frontwhite.png';
      backTshirt.src = 'img/backwhite2.png';
      // Apply the selected color's design
      frontDesign.src = selectedDesign.whiteBg;  // Apply the white version of the design to the front
      backDesign.src = 'img/yodl.png';  // Show Yodl logo on the back
  }
}

// Function to update the design image on the T-shirt when a new design is selected
function setSelectedDesign(designId) {
  const designs = [
    { display: 'img/designs/d1.jpg', vector: 'img/designs/d1.png', whiteBg: 'img/designs/d1w.png', blackBg: 'img/designs/d1b.png' },
    { display: 'img/designs/d2.jpg', vector: 'img/designs/d2.png', whiteBg: 'img/designs/d2w.png', blackBg: 'img/designs/d2b.png' },
    { display: 'img/designs/d3.jpg', vector: 'img/designs/d3.png', whiteBg: 'img/designs/d3w.png', blackBg: 'img/designs/d3b.png' },
    { display: 'img/designs/d4.jpg', vector: 'img/designs/d4.png', whiteBg: 'img/designs/d4w.png', blackBg: 'img/designs/d4b.png' },
    { display: 'img/designs/d5.jpg', vector: 'img/designs/d5.png', whiteBg: 'img/designs/d5w.png', blackBg: 'img/designs/d5b.png' },
    { display: 'img/designs/d6.jpg', vector: 'img/designs/d6.png', whiteBg: 'img/designs/d6w.png', blackBg: 'img/designs/d6b.png' },
    { display: 'img/designs/d7.jpg', vector: 'img/designs/d7.png', whiteBg: 'img/designs/d7w.png', blackBg: 'img/designs/d7b.png' }
  ];

  selectedDesign = designs[designId - 1];  // Set the design based on clicked design (d1 -> d7)

  // Update the front and back design images to reflect the selected design (use vector form)
  document.getElementById("frontDesign").src = selectedDesign.vector;
  document.getElementById("backDesign").src = 'img/yodl.png';  // Show Yodl logo on the back by default
}

// Event listener for design selection (when a user clicks a design)
document.querySelectorAll('.image-holder').forEach((holder, index) => {
  holder.addEventListener('click', () => {
    setSelectedDesign(index + 1); // 1-based index (d1 to d7)
  });
});

// Color selection logic (black or white)
document.getElementById('blackTshirt').addEventListener('click', () => {
  updateTshirtColor('black');
});

document.getElementById('whiteTshirt').addEventListener('click', () => {
  updateTshirtColor('white');
});

// Toggle between front and back design views
let isFrontDesign = true;

document.getElementById("toggleDesignSide").addEventListener("click", () => {
  const frontDesign = document.getElementById("frontDesign");
  const backDesign = document.getElementById("backDesign");

  // Check if frontDesign is showing (if the design is on the front)
  if (isFrontDesign) {
    // Swap to the back side
    frontDesign.src = 'img/yodl.png'; // Show Yodl logo on the front side
    backDesign.src = selectedDesign.vector; // Show design on the back side
    selectedSide = 'Back'; // Update the selected side to "Back"
  } else {
    // Swap to the front side
    backDesign.src = 'img/yodl.png'; // Show Yodl logo on the back side
    frontDesign.src = selectedDesign.vector; // Show design on the front side
    selectedSide = 'Front'; // Update the selected side to "Front"
  }

  // Toggle between front and back
  isFrontDesign = !isFrontDesign; 
  
 
// Function to update the summary table
// Function to update the T-shirt design side in the summary table
function updateSideSelection() {
  // Update the side in the summary table
  document.getElementById('selectedSide').textContent = selectedSide;
}

  // Update only the side in the summary table
  updateSideSelection();
});






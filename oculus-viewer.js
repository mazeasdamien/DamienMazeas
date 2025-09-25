import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const container = document.getElementById('oculus-container');

if (container) {
    const backgroundContainer = document.getElementById('background-container');

    // --- Basic Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    
    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // --- State & Clock for Animation ---
    let oculusModel = null;
    const clock = new THREE.Clock();
    
    // --- Standard Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(2, 5, 3);
    scene.add(directionalLight);
    
    // --- Helper function to read page's CSS variables ---
    function getColorFromCSS(variableName) {
        if (backgroundContainer) {
            const colorStr = getComputedStyle(backgroundContainer).getPropertyValue(variableName).trim();
            if (colorStr) {
                return new THREE.Color(colorStr);
            }
        }
        if (variableName === '--gradient-2') return new THREE.Color(0x0ea5e9);
        if (variableName === '--gradient-3') return new THREE.Color(0xfb923c);
        return new THREE.Color(0xffffff);
    }

    // --- Immersive Colored Lighting (with much stronger intensity) ---
    const pointLight1 = new THREE.PointLight(getColorFromCSS('--gradient-2'), 30, 20);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(getColorFromCSS('--gradient-3'), 30, 20);
    pointLight2.position.set(-2, -2, -2);
    scene.add(pointLight2);
    
    // --- Model Loading ---
    const loader = new GLTFLoader();
    loader.load(
        '3dmodels/oculus_quest_3.glb',
        (gltf) => {
            oculusModel = gltf.scene;
            
            oculusModel.traverse((child) => {
                if (child.isMesh && (child.name.includes('Lens') || child.name.includes('Lenses'))) {
                    const lensMaterial = new THREE.MeshStandardMaterial({
                        color: 0x111111,
                        roughness: 0.1,
                        metalness: 0,
                        emissive: 0x87ceeb,
                        emissiveIntensity: 2.5
                    });
                    child.material = lensMaterial;
                }
            });

            oculusModel.scale.setScalar(8);
            oculusModel.position.set(0, -0.4, 0);
            scene.add(oculusModel);
            controls.target.copy(oculusModel.position);
        },
        undefined,
        (error) => {
            console.error('An error happened while loading the model:', error);
        }
    );

    // --- Event Listeners ---
    function onWindowResize() {
        if (container.clientWidth > 0 && container.clientHeight > 0) {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
    }
    window.addEventListener('resize', onWindowResize);

    // --- NEW: Listen for the custom event from script.js ---
    window.addEventListener('themeUpdated', () => {
        // Use a smooth transition for the color change
        pointLight1.color.lerp(getColorFromCSS('--gradient-2'), 0.5);
        pointLight2.color.lerp(getColorFromCSS('--gradient-3'), 0.5);
    });

    // --- Animation Loop ---
    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 4;
        pointLight1.position.z = Math.cos(elapsedTime * 0.5) * 4;
        
        pointLight2.position.x = Math.sin(elapsedTime * 0.3 + Math.PI) * 4;
        pointLight2.position.z = Math.cos(elapsedTime * 0.3 + Math.PI) * 4;

        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}
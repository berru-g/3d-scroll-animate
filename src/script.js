// Variables globales
let scene, camera, renderer, model, mixer;
let controls, clock;

// Initialisation de Three.js
function init() {
    // Créer la scène
    scene = new THREE.Scene();
    // Blanc : 0xFFFFFF
    scene.background = new THREE.Color(null);

    // Créer la caméra
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    // Créer le renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    document.getElementById('container3D').appendChild(renderer.domElement);

    // Ajouter des contrôles orbitaux
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Ajouter des lumières
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Ajouter une lumière supplémentaire pour mieux éclairer le modèle
    const pointLight = new THREE.PointLight(0x6b5ce7, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Initialiser l'horloge pour les animations
    clock = new THREE.Clock();

    // Charger le modèle 3D
    loadModel();

    // Gestion du redimensionnement
    window.addEventListener('resize', onWindowResize);

    // Gestion du scroll
    window.addEventListener('scroll', onScroll);

    // Commencer l'animation
    animate();
}

function loadModel() {
    const loader = new THREE.GLTFLoader();

    // Utilisation d'un modèle 3D glb ou gltf plus légé
    // https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/models/gltf/Parrot.glb
    //https://raw.githubusercontent.com/berru-g/3d-scroll-animate/main/assets/btwin_triban_100_road_bike.glb 'https://raw.githubusercontent.com/berru-g/plane/main/avion/cessna172.glb';
    const modelUrl = 'https://raw.githubusercontent.com/berru-g/3d-scroll-animate/main/assets/scene.gltf';

    loader.load(
        modelUrl,
        function (gltf) {
            model = gltf.scene;
            scene.add(model);

            // Ajuster l'échelle et la position si nécessaire
            model.scale.set(4, 4, 4);
            model.position.set(0, 10, 0);

            // Configurer les animations s'il y en a
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });
            }

            // Centrer le modèle et ajuster les contrôles
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            controls.target.copy(center);
            controls.update();

            // Cacher le loader une fois le modèle chargé
            document.querySelector('.loader').style.opacity = 0;
            setTimeout(() => {
                document.querySelector('.loader').style.display = 'none';
            }, 500);
        },
        function (xhr) {
            // Progression du chargement
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Erreur lors du chargement du modèle:', error);
            // En cas d'erreur, afficher un cube à la place
            showFallbackModel();
        }
    );
}

function showFallbackModel() {
    // Créer un cube à la place si le modèle ne charge pas
    const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const material = new THREE.MeshPhongMaterial({
        color: 0x6b5ce7,
        shininess: 100,
        specular: 0xfd79a8
    });

    model = new THREE.Mesh(geometry, material);
    scene.add(model);

    // Cacher le loader
    document.querySelector('.loader').style.opacity = 0;
    setTimeout(() => {
        document.querySelector('.loader').style.display = 'none';
    }, 500);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onScroll() {
    if (!model) return;

    // Calculer la progression du scroll (0 à 1)
    const scrollY = window.scrollY;
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercentage = Math.min(scrollY / totalHeight, 1);

    // Appliquer des transformations basées sur le scroll
    model.rotation.x = scrollPercentage * Math.PI * 1;
    model.rotation.y = scrollPercentage * Math.PI * 2;
    model.rotation.z = scrollPercentage * Math.PI;

    // Modifier l'échelle en fonction du scroll
    const scale = 2 + scrollPercentage * 1.5;
    model.scale.set(scale, scale, scale);

    // Modifier la position en Y pour un effet de "lévitation"
    model.position.y = -1 + scrollPercentage * 2;

    // Changer la couleur du matériau si c'est un Mesh (pour le fallback)
    if (model.material) {
        const hue = (scrollPercentage * 360) % 360;
        model.material.color.setHSL(hue / 360, 0.8, 0.5);
    }

    // Ajuster l'intensité des lumières en fonction du scroll
    const lights = scene.children.filter(child => child.isLight);
    lights.forEach(light => {
        light.intensity = 0.5 + scrollPercentage * 1.5;
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Mettre à jour les animations du modèle
    if (mixer) {
        mixer.update(clock.getDelta());
    }

    // Mise à jour des contrôles
    controls.update();

    // Rendu de la scène
    renderer.render(scene, camera);
}

// Démarrer l'application
init();
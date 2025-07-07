// === SETUP SCENE, CAMERA, RENDERER ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
if (window.innerWidth < 768) {
  camera.position.z = 70;  // farther for mobile
} else {
  camera.position.z = 50;  // normal for desktop
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === STARFIELD BACKGROUND ===
function createStars() {
  const starsGeometry = new THREE.BufferGeometry();
  const starsCount = 10000;
  const positions = [];
  for (let i = 0; i < starsCount; i++) {
    positions.push(
      THREE.MathUtils.randFloatSpread(1000),
      THREE.MathUtils.randFloatSpread(1000),
      THREE.MathUtils.randFloatSpread(1000)
    );
  }
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}
createStars();

// === LIGHTING ===
const light = new THREE.PointLight(0xffffff, 3, 200);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// === TEXTURE LOADING ===
const loader = new THREE.TextureLoader();
const textures = {
  sun: loader.load("textures/sun.jpg"),
  mercury: loader.load("textures/mercury.jpg"),
  venus: loader.load("textures/venus.jpg"),
  earth: loader.load("textures/earth.jpg"),
  mars: loader.load("textures/mars.jpg"),
  jupiter: loader.load("textures/jupiter.jpg"),
  saturn: loader.load("textures/saturn.jpg"),
  uranus: loader.load("textures/uranus.jpg"),
  neptune: loader.load("textures/neptune.jpg")
};

// === SUN ===
const sunGeo = new THREE.SphereGeometry(4, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ map: textures.sun });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// === PLANETS ===
const controlPanel = document.getElementById("controls");
const defaultSpeeds = {
  mercury: 0.04, venus: 0.035, earth: 0.03, mars: 0.025,
  jupiter: 0.02, saturn: 0.015, uranus: 0.01, neptune: 0.008
};

const planetsData = [
  { name: "mercury", size: 0.5, distance: 7 },
  { name: "venus", size: 0.8, distance: 10 },
  { name: "earth", size: 1, distance: 13 },
  { name: "mars", size: 0.7, distance: 16 },
  { name: "jupiter", size: 1.6, distance: 21 },
  { name: "saturn", size: 1.4, distance: 26 },
  { name: "uranus", size: 1.2, distance: 30 },
  { name: "neptune", size: 1.2, distance: 35 }
];

const planets = [];

function createOrbitRing(radius) {
  const ringGeo = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
}

planetsData.forEach((planet) => {
  const geo = new THREE.SphereGeometry(planet.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ map: textures[planet.name] });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const planetObj = {
    name: planet.name,
    mesh,
    distance: planet.distance,
    speed: defaultSpeeds[planet.name],
    angle: Math.random() * Math.PI * 2,
    slider: null
  };

  // Saturn's Ring
  if (planet.name === "saturn") {
    const ringGeo = new THREE.RingGeometry(2.0, 3.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xd2b48c, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
    planetObj.ring = ring;
  }

  // Orbit ring
  createOrbitRing(planet.distance);

  // Slider
  const label = document.createElement("label");
  label.textContent = `${planet.name} speed`;
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0.001;
  slider.max = 0.1;
  slider.step = 0.001;
  slider.value = planetObj.speed;
  slider.addEventListener("input", (e) => {
    planetObj.speed = parseFloat(e.target.value);
  });

  controlPanel.appendChild(label);
  controlPanel.appendChild(document.createElement("br"));
  controlPanel.appendChild(slider);
  controlPanel.appendChild(document.createElement("br"));

  planetObj.slider = slider;
  planets.push(planetObj);
});

// === RESET BUTTON ===
const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset Speeds";
resetBtn.style.cssText = "margin-top:10px;padding:6px 12px;border:none;border-radius:5px;background:#00f7ff;color:#000;font-weight:bold;cursor:pointer;";
resetBtn.onclick = () => {
  planets.forEach(p => {
    p.speed = defaultSpeeds[p.name];
    p.slider.value = defaultSpeeds[p.name];
  });
};
controlPanel.appendChild(resetBtn);

// === SCREENSHOT BUTTON ===
const screenshotBtn = document.createElement("button");
screenshotBtn.textContent = "📸 Take Screenshot";
screenshotBtn.style.cssText = "margin-top:10px;margin-left:10px;padding:6px 12px;border:none;border-radius:5px;background:#ffaa00;color:#000;font-weight:bold;cursor:pointer;";
screenshotBtn.onclick = () => {
  const dataURL = renderer.domElement.toDataURL("image/png");
  const link = document.createElement('a');
  link.download = 'solar_system.png';
  link.href = dataURL;
  link.click();
};
controlPanel.appendChild(screenshotBtn);

// === ANIMATION + CAMERA ROTATION ===
let camAngle = 0;
function animate() {
  requestAnimationFrame(animate);

  camAngle += 0.0015;
  camera.position.x = Math.sin(camAngle) * 60;
  camera.position.z = Math.cos(camAngle) * 60;
  camera.lookAt(0, 0, 0);

  planets.forEach((p) => {
    p.angle += p.speed;
    const x = Math.cos(p.angle) * p.distance;
    const z = Math.sin(p.angle) * p.distance;
    p.mesh.position.set(x, 0, z);
    if (p.name === "saturn" && p.ring) p.ring.position.set(x, 0, z);
  });

  renderer.render(scene, camera);
}
animate();

// === RESIZE ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

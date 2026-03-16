/* ===== THREE.JS MARS GLOBE ===== */
(function () {
  const canvas = document.getElementById('mars-canvas');
  const fallback = document.getElementById('mars-fallback');

  /* --- WebGL check --- */
  function webglAvailable() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  if (!webglAvailable()) {
    canvas.style.display = 'none';
    fallback.style.display = 'block';
    return;
  }

  /* --- Viewport < 768 → skip globe --- */
  if (window.innerWidth < 768) return;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 3.8;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  /* --- Lighting --- */
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(-3, 2, 4);
  scene.add(sun);

  /* --- Mars sphere --- */
  const geometry = new THREE.SphereGeometry(2.2, 64, 64);

  /* Placeholder material (dark) until texture loads */
  const material = new THREE.MeshStandardMaterial({ color: 0x1a0a04, roughness: 0.9, metalness: 0 });
  const mars = new THREE.Mesh(geometry, material);

  /* Position bottom center — large, partially below viewport */
  mars.position.x = 0;
  mars.position.y = -2.6;
  scene.add(mars);

  /* Lazy-load texture */
  const loader = new THREE.TextureLoader();
  const primaryURL = 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg';

  loader.load(
    primaryURL,
    function (texture) {
      material.map = texture;
      material.color.set(0xffffff);
      material.needsUpdate = true;
    },
    undefined,
    function () {
      /* Texture failed; keep dark sphere as visual fallback */
      material.color.set(0x8b3a0e);
      material.needsUpdate = true;
    }
  );

  /* --- Atmospheric glow --- */
  const glowGeo = new THREE.SphereGeometry(2.35, 64, 64);
  const glowMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
        gl_FragColor = vec4(0.75, 0.35, 0.15, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.copy(mars.position);
  scene.add(glow);

  /* --- Animation loop --- */
  const rotationSpeed = (2 * Math.PI) / 60; /* one full rotation per 60 s */

  function animate() {
    requestAnimationFrame(animate);
    const delta = 1 / 60;
    mars.rotation.y += rotationSpeed * delta;
    glow.rotation.y = mars.rotation.y;
    renderer.render(scene, camera);
  }
  animate();

  /* --- Resize handler --- */
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ===== SCROLL REVEAL ===== */
(function () {
  const reveals = document.querySelectorAll('.reveal');

  function check() {
    reveals.forEach(function (el) {
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight - 80) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', check);
  window.addEventListener('load', check);
  check();
})();

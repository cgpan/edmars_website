(function () {
  // ── Mars Globe ──
  const canvas = document.getElementById('mars-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 2.8;

  // Sphere
  const geo = new THREE.SphereGeometry(1, 64, 64);

  // Procedural Mars texture using canvas
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 512; texCanvas.height = 256;
  const ctx = texCanvas.getContext('2d');

  // Base color
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0,   '#7a2a10');
  grad.addColorStop(0.3, '#a33a18');
  grad.addColorStop(0.6, '#8b3012');
  grad.addColorStop(1,   '#6a2208');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Add noise-like craters / terrain
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 18 + 1;
    const brightness = Math.random() > 0.5 ? 1.15 : 0.82;
    const cg = ctx.createRadialGradient(x, y, 0, x, y, r);
    const base = 'rgba(' + Math.floor(140*brightness) + ',' + Math.floor(50*brightness) + ',' + Math.floor(20*brightness);
    cg.addColorStop(0, base + ',0.45)');
    cg.addColorStop(1, base + ',0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }

  const texture = new THREE.CanvasTexture(texCanvas);
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.85,
    metalness: 0.05,
  });
  const sphere = new THREE.Mesh(geo, mat);
  sphere.position.set(3.2, -0.3, -1);
  scene.add(sphere);

  // Atmosphere glow
  const atmGeo = new THREE.SphereGeometry(1.06, 32, 32);
  const atmMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#c8451a'),
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
  });
  const atm = new THREE.Mesh(atmGeo, atmMat);
  atm.position.copy(sphere.position);
  scene.add(atm);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starCount = 1200;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 80;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04 });
  scene.add(new THREE.Points(starGeo, starMat));

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.18));
  const sun = new THREE.DirectionalLight(0xffddbb, 1.4);
  sun.position.set(5, 2, 4);
  scene.add(sun);

  // Resize
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // Mouse parallax
  let mx = 0, my = 0;
  window.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 0.04;
    my = (e.clientY / window.innerHeight - 0.5) * 0.02;
  });

  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.004;
    sphere.rotation.y = t;
    sphere.position.x = 3.2 + mx;
    sphere.position.y = -0.3 + my;
    atm.position.copy(sphere.position);
    renderer.render(scene, camera);
  })();

  // ── Scroll reveal ──
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });
})();

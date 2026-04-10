import React, { useRef, useEffect, useState } from 'react';
import { RotateCcw, Play, Pause, Download } from 'lucide-react';

const DEMOS = {
  spinning_cube: {
    name: 'Spinning Cube',
    code: `
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshPhongMaterial({ color: 0x00aaff, wireframe: false, shininess: 100 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      return (t) => { cube.rotation.x = t * 0.5; cube.rotation.y = t * 0.7; };
    `,
  },
  torus_knot: {
    name: 'Torus Knot',
    code: `
      const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 128, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0xff44aa, shininess: 150 });
      const knot = new THREE.Mesh(geometry, material);
      scene.add(knot);
      return (t) => { knot.rotation.x = t * 0.3; knot.rotation.y = t * 0.5; };
    `,
  },
  particle_sphere: {
    name: 'Particle Sphere',
    code: `
      const count = 5000;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = 2 * Math.PI * Math.random();
        const r = 2 + Math.random() * 0.5;
        positions[i*3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i*3+2] = r * Math.cos(phi);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.04 });
      const particles = new THREE.Points(geo, mat);
      scene.add(particles);
      return (t) => { particles.rotation.y = t * 0.2; };
    `,
  },
  wave_grid: {
    name: 'Wave Grid',
    code: `
      const gridSize = 30;
      const meshes = [];
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
          const mat = new THREE.MeshPhongMaterial({ color: new THREE.Color().setHSL((x + z) / (gridSize * 2), 0.9, 0.6) });
          const m = new THREE.Mesh(geo, mat);
          m.position.set((x - gridSize/2) * 0.35, 0, (z - gridSize/2) * 0.35);
          m._xi = x; m._zi = z;
          scene.add(m);
          meshes.push(m);
        }
      }
      return (t) => {
        meshes.forEach(m => {
          m.position.y = Math.sin(m._xi * 0.5 + t) * Math.cos(m._zi * 0.5 + t) * 0.8;
        });
      };
    `,
  },
  dna_helix: {
    name: 'DNA Helix',
    code: `
      const strand1 = [], strand2 = [];
      for (let i = 0; i < 40; i++) {
        const t = i / 40 * Math.PI * 4;
        const y = (i / 40) * 6 - 3;
        [strand1, strand2].forEach((strand, si) => {
          const angle = t + (si * Math.PI);
          const geo = new THREE.SphereGeometry(0.15, 16, 16);
          const mat = new THREE.MeshPhongMaterial({ color: si === 0 ? 0x00aaff : 0xff4444 });
          const sphere = new THREE.Mesh(geo, mat);
          sphere.position.set(Math.cos(angle) * 1.5, y, Math.sin(angle) * 1.5);
          scene.add(sphere);
          strand.push(sphere);
        });
        if (i % 4 === 0) {
          const barGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
          const barMat = new THREE.MeshPhongMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });
          const bar = new THREE.Mesh(barGeo, barMat);
          bar.position.set(0, y, 0);
          bar.rotation.z = Math.PI / 2;
          bar.rotation.y = t;
          scene.add(bar);
        }
      }
      const group = scene.children.slice(-scene.children.length);
      return (t) => { scene.rotation.y = t * 0.3; };
    `,
  },
};

export default function BrowserCanvas3D() {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameRef = useRef(null);
  const animFnRef = useRef(null);
  const threeRef = useRef(null);
  const orbitRef = useRef({ isDragging: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0, dist: 6 });
  const [demo, setDemo] = useState('spinning_cube');
  const [running, setRunning] = useState(true);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [customCode, setCustomCode] = useState('');
  const [showEditor, setShowEditor] = useState(false);

  // Load Three.js from CDN
  useEffect(() => {
    if (window.THREE) { setThreeLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
    script.onload = () => { threeRef.current = window.THREE; setThreeLoaded(true); };
    script.onerror = () => setError('Failed to load Three.js. Check your internet connection.');
    document.head.appendChild(script);
  }, []);

  const initScene = () => {
    const THREE = window.THREE;
    if (!THREE || !mountRef.current) return;

    // Cleanup previous
    if (rendererRef.current) {
      rendererRef.current.dispose();
      mountRef.current.innerHTML = '';
    }
    cancelAnimationFrame(animFrameRef.current);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0x00aaff, 0.5, 20);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);

    // Grid helper
    const grid = new THREE.GridHelper(10, 20, 0x444444, 0x222222);
    scene.add(grid);

    // Run demo code
    try {
      const codeToRun = customCode || DEMOS[demo]?.code || DEMOS.spinning_cube.code;
      const fn = new Function('THREE', 'scene', codeToRun);
      animFnRef.current = fn(THREE, scene);
    } catch (e) {
      setError('Demo error: ' + e.message);
      return;
    }

    // Animate
    let startTime = performance.now();
    const animate = () => {
      if (!running) return;
      animFrameRef.current = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) / 1000;
      if (animFnRef.current) {
        try { animFnRef.current(t); } catch { }
      }

      // Apply orbit
      const orbit = orbitRef.current;
      scene.rotation.x = orbit.rotX;
      scene.rotation.y = orbit.rotY;

      renderer.render(scene, camera);
    };
    animate();
    setError(null);
  };

  useEffect(() => {
    if (threeLoaded) initScene();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [threeLoaded, demo, customCode]);

  useEffect(() => {
    if (!running && animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    } else if (running && threeLoaded) {
      initScene();
    }
  }, [running]);

  // Orbit controls via mouse
  const handleMouseDown = (e) => {
    orbitRef.current.isDragging = true;
    orbitRef.current.lastX = e.clientX;
    orbitRef.current.lastY = e.clientY;
  };
  const handleMouseMove = (e) => {
    if (!orbitRef.current.isDragging) return;
    const dx = e.clientX - orbitRef.current.lastX;
    const dy = e.clientY - orbitRef.current.lastY;
    orbitRef.current.rotY += dx * 0.01;
    orbitRef.current.rotX += dy * 0.01;
    orbitRef.current.lastX = e.clientX;
    orbitRef.current.lastY = e.clientY;
  };
  const handleMouseUp = () => { orbitRef.current.isDragging = false; };

  const handleWheel = (e) => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.position.z = Math.max(1, Math.min(20, camera.position.z + e.deltaY * 0.01));
  };

  const screenshot = () => {
    if (!rendererRef.current) return;
    const link = document.createElement('a');
    link.download = '3d-scene.png';
    link.href = rendererRef.current.domElement.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a12] text-white">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-[#1a1a2e] border-b border-white/10 flex-wrap">
        <span className="text-xs text-white/50 font-mono">3D Engine</span>
        <div className="w-px h-5 bg-white/20" />
        {Object.entries(DEMOS).map(([key, { name }]) => (
          <button
            key={key}
            onClick={() => { setDemo(key); setCustomCode(''); }}
            className={`px-2 py-1 text-xs rounded transition-colors ${demo === key && !customCode ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white/60'}`}
          >
            {name}
          </button>
        ))}
        <div className="w-px h-5 bg-white/20" />
        <button
          onClick={() => setShowEditor(!showEditor)}
          className={`px-2 py-1 text-xs rounded transition-colors ${showEditor ? 'bg-purple-500 text-white' : 'hover:bg-white/10 text-white/60'}`}
        >
          {'{ } Custom'}
        </button>
        <button onClick={() => setRunning(!running)} className="p-1 hover:bg-white/10 rounded">
          {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button onClick={initScene} className="p-1 hover:bg-white/10 rounded" title="Restart">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={screenshot} className="p-1 hover:bg-white/10 rounded text-green-400" title="Screenshot">
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* 3D Viewport */}
        <div className="flex-1 relative" style={{ cursor: 'grab' }}>
          <div
            ref={mountRef}
            className="w-full h-full"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          {!threeLoaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a1a]">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white/50 text-sm">Loading Three.js...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a1a]">
              <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-6 max-w-sm text-center">
                <p className="text-red-400 text-sm">{error}</p>
                <button onClick={initScene} className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm">
                  Retry
                </button>
              </div>
            </div>
          )}
          {/* Controls hint */}
          <div className="absolute bottom-3 left-3 text-xs text-white/30 bg-black/50 rounded px-2 py-1">
            Drag to orbit • Scroll to zoom
          </div>
        </div>

        {/* Code Editor panel */}
        {showEditor && (
          <div className="w-80 flex flex-col border-l border-white/10 bg-[#0f0f1a]">
            <div className="p-2 border-b border-white/10 text-xs text-white/50 font-mono">Custom Three.js Code</div>
            <textarea
              value={customCode}
              onChange={e => setCustomCode(e.target.value)}
              className="flex-1 bg-transparent text-green-400 font-mono text-xs p-3 outline-none resize-none"
              placeholder={`// Write Three.js code here\n// THREE and scene are available\n// Return an animation function: (t) => { ... }\n\n${DEMOS.spinning_cube.code}`}
              spellCheck={false}
            />
            <div className="p-2 border-t border-white/10 flex gap-2">
              <button
                onClick={() => initScene()}
                className="flex-1 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded"
              >
                ▶ Run
              </button>
              <button
                onClick={() => setCustomCode('')}
                className="px-3 py-1 text-xs hover:bg-white/10 text-white/50 rounded"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

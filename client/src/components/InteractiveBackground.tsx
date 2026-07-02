import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/hooks/useTheme";

/**
 * Scroll-driven flight through a "developer nebula" — a 1:1 port of the
 * reference template's Three.js scene: three tinted particle clouds, floating
 * code-glyph sprites, wireframe landmarks, a grid floor/ceiling, and per-section
 * color palettes that lerp as you scroll. Runs in dark mode (its native
 * environment — additive blending needs the void backdrop); light mode falls
 * back to the static CSS glow layer.
 */

const SECTION_IDS = ["home", "about", "skills", "projects", "experience", "contact"];

// Per-section palettes: [cloudA, cloudB, cloudC, fog]
const PAL = [
  [0x6f6cf7, 0x45e6d6, 0xc47bff, 0x060913], // home
  [0x45e6d6, 0x6f6cf7, 0x7bffd0, 0x061018], // about
  [0xc47bff, 0x6f6cf7, 0x45e6d6, 0x0a0916], // skills
  [0x6f6cf7, 0x4aa8ff, 0x45e6d6, 0x050b18], // projects
  [0x8f7bff, 0x45e6d6, 0xc47bff, 0x080a16], // experience
  [0x45e6d6, 0xc47bff, 0x6f6cf7, 0x061213], // contact
];

const GLYPHS = ["</>", "{ }", "=>", "();", "#", "<div>", "fn", "&&"];
const GCOLORS = ["#8f8cff", "#5df0e0", "#d29bff"];

const InteractiveBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // The nebula reads as intended only against the deep void backdrop.
    // In light mode the CSS glow layer handles the ambiance instead.
    if (theme !== "dark") {
      document.body.classList.remove("no3d");
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      console.warn("WebGL unavailable; using static background.", err);
      document.body.classList.add("no3d");
      return;
    }
    document.body.classList.remove("no3d");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.026);
    const camera = new THREE.PerspectiveCamera(
      62,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    const CAM_START = 10;
    const CAM_END = -60;
    camera.position.set(0, 0, CAM_START);

    // Track disposables for cleanup.
    const geometries: THREE.BufferGeometry[] = [];
    const materials: THREE.Material[] = [];
    const textures: THREE.Texture[] = [];

    // --- particle clouds (3, individually tinted) ---
    const makeCloud = (
      count: number,
      color: number,
      size: number,
      spread: number,
      zFrom: number,
      zTo: number
    ) => {
      const g = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = (Math.random() - 0.5) * spread;
        pos[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
        pos[i * 3 + 2] = zFrom + Math.random() * (zTo - zFrom);
      }
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const m = new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const p = new THREE.Points(g, m);
      scene.add(p);
      geometries.push(g);
      materials.push(m);
      return p;
    };
    const cloudA = makeCloud(2400, 0x6f6cf7, 0.1, 46, 16, -78);
    const cloudB = makeCloud(2200, 0x45e6d6, 0.07, 40, 16, -78);
    const cloudC = makeCloud(1600, 0xc47bff, 0.12, 56, 16, -78);

    // --- code glyph sprites ---
    const glyphTexture = (txt: string, color: string) => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const ctx = c.getContext("2d")!;
      ctx.font = '600 64px "Fira Code", monospace';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = color;
      ctx.shadowBlur = 18;
      ctx.fillStyle = color;
      ctx.fillText(txt, 64, 68);
      const t = new THREE.CanvasTexture(c);
      textures.push(t);
      return t;
    };
    const sprites: THREE.Sprite[] = [];
    for (let gi = 0; gi < 26; gi++) {
      const mat = new THREE.SpriteMaterial({
        map: glyphTexture(GLYPHS[gi % GLYPHS.length], GCOLORS[gi % 3]),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const sp = new THREE.Sprite(mat);
      sp.position.set(
        (Math.random() - 0.5) * 34,
        (Math.random() - 0.5) * 18,
        12 - Math.random() * 84
      );
      const s = 1 + Math.random() * 1.6;
      sp.scale.set(s, s, 1);
      sp.userData.speed = 0.2 + Math.random() * 0.5;
      sprites.push(sp);
      scene.add(sp);
      materials.push(mat);
    }

    // --- wireframe landmarks along the corridor ---
    const wire = (
      geo: THREE.BufferGeometry,
      color: number,
      x: number,
      y: number,
      z: number,
      rSpeed: number
    ) => {
      const m = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y, z);
      mesh.userData.r = rSpeed;
      scene.add(mesh);
      geometries.push(geo);
      materials.push(m);
      return mesh;
    };
    const meshes = [
      wire(new THREE.IcosahedronGeometry(3.4, 0), 0x6f6cf7, 7.5, 1.5, 1, 0.0022),
      wire(new THREE.TorusKnotGeometry(2.4, 0.7, 110, 14), 0x45e6d6, -8, -2, -14, 0.0016),
      wire(new THREE.OctahedronGeometry(3.6, 0), 0xc47bff, 8, 2.4, -28, 0.0026),
      wire(new THREE.DodecahedronGeometry(3.2, 0), 0x6f6cf7, -7.5, -1, -42, 0.0018),
      wire(new THREE.TorusGeometry(3, 0.85, 14, 42), 0x45e6d6, 7, -2.2, -56, 0.002),
    ];

    // --- grid floor & ceiling ---
    const gridF = new THREE.GridHelper(240, 60, 0x6f6cf7, 0x1c2246);
    gridF.position.y = -11;
    (gridF.material as THREE.Material).transparent = true;
    (gridF.material as THREE.Material).opacity = 0.22;
    scene.add(gridF);
    const gridC = new THREE.GridHelper(240, 60, 0x45e6d6, 0x14203c);
    gridC.position.y = 12.5;
    (gridC.material as THREE.Material).transparent = true;
    (gridC.material as THREE.Material).opacity = 0.1;
    scene.add(gridC);
    geometries.push(gridF.geometry, gridC.geometry);
    materials.push(gridF.material as THREE.Material, gridC.material as THREE.Material);

    const curA = new THREE.Color(PAL[0][0]);
    const curB = new THREE.Color(PAL[0][1]);
    const curC = new THREE.Color(PAL[0][2]);
    const curF = new THREE.Color(PAL[0][3]);

    // --- interaction state ---
    let mouseX = 0;
    let mouseY = 0;
    let smX = 0;
    let smY = 0;
    let scrollP = 0;
    let smScroll = 0;
    let sectionIndex = 0;

    const onPointerMove = (e: PointerEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollP = h > 0 ? window.scrollY / h : 0;
      let cur = 0;
      SECTION_IDS.forEach((id, i) => {
        const s = document.getElementById(id);
        if (s && window.scrollY >= s.offsetTop - window.innerHeight * 0.45) cur = i;
      });
      sectionIndex = Math.min(cur, PAL.length - 1);
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();
    smScroll = scrollP;

    let running = true;
    const onVisibility = () => {
      running = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const clock = new THREE.Clock();
    let raf = 0;
    const tmp = new THREE.Color();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!running) return;
      const t = clock.getElapsedTime();

      // smooth scroll & mouse
      smScroll += (scrollP - smScroll) * (reduceMotion ? 1 : 0.06);
      smX += (mouseX - smX) * 0.05;
      smY += (mouseY - smY) * 0.05;

      // camera flight
      camera.position.z = CAM_START + (CAM_END - CAM_START) * smScroll;
      camera.position.x =
        smX * (reduceMotion ? 0.4 : 1.6) + Math.sin(smScroll * Math.PI * 2) * 1.2;
      camera.position.y = -smY * (reduceMotion ? 0.3 : 1.1) + Math.sin(t * 0.3) * 0.25;
      camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, camera.position.z - 12);

      // palette lerp toward current section
      const p = PAL[sectionIndex];
      curA.lerp(tmp.set(p[0]), 0.03);
      curB.lerp(tmp.set(p[1]), 0.03);
      curC.lerp(tmp.set(p[2]), 0.03);
      curF.lerp(tmp.set(p[3]), 0.03);
      (cloudA.material as THREE.PointsMaterial).color.copy(curA);
      (cloudB.material as THREE.PointsMaterial).color.copy(curB);
      (cloudC.material as THREE.PointsMaterial).color.copy(curC);
      (scene.fog as THREE.FogExp2).color.copy(curF);

      // ambient motion
      cloudA.rotation.y = t * 0.012;
      cloudB.rotation.y = -t * 0.016;
      cloudC.rotation.y = t * 0.008;
      meshes.forEach((m, i) => {
        m.rotation.x += m.userData.r;
        m.rotation.y += m.userData.r * 1.35;
        m.position.y += Math.sin(t * 0.6 + i) * 0.0035;
      });
      sprites.forEach((sp, i) => {
        sp.position.y += Math.sin(t * sp.userData.speed + i) * 0.004;
        (sp.material as THREE.SpriteMaterial).opacity = 0.38 + Math.sin(t * 0.8 + i) * 0.18;
      });
      gridF.position.z = camera.position.z - 60;
      gridC.position.z = camera.position.z - 60;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((tx) => tx.dispose());
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="site-canvas fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default InteractiveBackground;

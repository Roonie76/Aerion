// Shuttlecock3D — high-fidelity procedural 3D badminton shuttlecock.
// Matches the reference photos: white woven cork dome, black rubber band,
// 16 feather quills with semi-transparent vanes, and the signature X-pattern
// cross-lacing thread.
//
// Pure three.js (no react-three-fiber) to match the project's existing
// patterns (see Hero3DParallax.jsx).
//
// Usage:
//   <Shuttlecock3D />                          // default: ~520px tall, gradient bg
//   <Shuttlecock3D height="70vh" />            // custom height
//   <Shuttlecock3D background="transparent" /> // transparent canvas
//   <Shuttlecock3D interactive autoRotate />   // drag to rotate + idle spin

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ── Palette (tuned to the reference photos) ─────────────────────────── */
const CORK_COLOR = new THREE.Color('#f2f0eb');
const BAND_COLOR = new THREE.Color('#111111');
const FEATHER_WHITE = new THREE.Color('#f6f6f3');
const QUILL_COLOR = new THREE.Color('#e9e6df');
const THREAD_COLOR = new THREE.Color('#f2efe6');

/* ── Procedural textures ─────────────────────────────────────────────── */

/** Woven cork surface — subtle mottled white with faint hatch marks. */
function makeCorkTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');

  // Base warm-white
  ctx.fillStyle = '#efece4';
  ctx.fillRect(0, 0, size, size);

  // Soft noise speckle
  const img = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 28;
    img.data[i] = Math.max(0, Math.min(255, img.data[i] + n));
    img.data[i + 1] = Math.max(0, Math.min(255, img.data[i + 1] + n));
    img.data[i + 2] = Math.max(0, Math.min(255, img.data[i + 2] + n * 0.8));
  }
  ctx.putImageData(img, 0, 0);

  // Fine crosshatch suggesting the woven fabric wrap
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#cfc9bb';
  ctx.lineWidth = 0.6;
  for (let i = -size; i < size * 2; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }
  for (let i = -size; i < size * 2; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, size);
    ctx.lineTo(i + size, 0);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Feather vane — semi-transparent with fine barb striations. */
function makeVaneTexture() {
  const w = 256;
  const h = 512;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  // Base translucent white fill
  ctx.fillStyle = 'rgba(248, 248, 244, 0.85)';
  ctx.fillRect(0, 0, w, h);

  // Central rachis (darker stripe)
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(200, 197, 188, 0)');
  grad.addColorStop(0.5, 'rgba(180, 177, 168, 0.55)');
  grad.addColorStop(1, 'rgba(200, 197, 188, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(w * 0.47, 0, w * 0.06, h);

  // Barb striations — thin diagonal hairs running from rachis to edge
  ctx.strokeStyle = 'rgba(210, 208, 200, 0.55)';
  ctx.lineWidth = 0.8;
  const cx = w / 2;
  for (let y = 6; y < h - 6; y += 3) {
    // Left side barbs
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(6, y - 14);
    ctx.stroke();
    // Right side barbs
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(w - 6, y - 14);
    ctx.stroke();
  }

  // Soft edge fade to suggest feathery edges
  const edgeGrad = ctx.createRadialGradient(cx, h * 0.55, h * 0.15, cx, h * 0.55, h * 0.55);
  edgeGrad.addColorStop(0, 'rgba(255,255,255,0)');
  edgeGrad.addColorStop(1, 'rgba(255,255,255,0.08)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ── Geometry builders ───────────────────────────────────────────────── */

/** Cork body: dome + slight neck, built with LatheGeometry. */
function buildCork(corkTex) {
  const pts = [];
  // Profile points from bottom tip up to the top of the neck (pre-band).
  // Coordinates are (radius, y). Dome curves from r=0 at the bottom to r=0.55 at the shoulder.
  pts.push(new THREE.Vector2(0.0, -0.55));
  pts.push(new THREE.Vector2(0.15, -0.53));
  pts.push(new THREE.Vector2(0.28, -0.49));
  pts.push(new THREE.Vector2(0.4, -0.42));
  pts.push(new THREE.Vector2(0.48, -0.32));
  pts.push(new THREE.Vector2(0.53, -0.2));
  pts.push(new THREE.Vector2(0.55, -0.08));
  pts.push(new THREE.Vector2(0.55, 0.04));
  pts.push(new THREE.Vector2(0.55, 0.08));

  const geo = new THREE.LatheGeometry(pts, 64);
  const mat = new THREE.MeshStandardMaterial({
    color: CORK_COLOR,
    map: corkTex,
    roughness: 0.82,
    metalness: 0.02,
  });
  return new THREE.Mesh(geo, mat);
}

/** Black rubber band that wraps the join between cork and feathers. */
function buildBand() {
  const geo = new THREE.CylinderGeometry(0.555, 0.555, 0.11, 64, 1, true);
  const mat = new THREE.MeshStandardMaterial({
    color: BAND_COLOR,
    roughness: 0.35,
    metalness: 0.15,
    side: THREE.DoubleSide,
  });
  const band = new THREE.Mesh(geo, mat);
  band.position.y = 0.14;
  return band;
}

/** 16 feather quills — thin tapered cylinders angled outward and upward. */
function buildQuills(featherCount, flareAngle, baseRadius, length) {
  const group = new THREE.Group();
  const geo = new THREE.CylinderGeometry(0.008, 0.012, length, 8);
  // Shift the geometry so its base sits at y=0, then it extends along +Y.
  geo.translate(0, length / 2, 0);
  const mat = new THREE.MeshStandardMaterial({
    color: QUILL_COLOR,
    roughness: 0.55,
    metalness: 0.05,
  });

  for (let i = 0; i < featherCount; i++) {
    const a = (i / featherCount) * Math.PI * 2;
    const q = new THREE.Mesh(geo, mat);
    q.position.set(Math.cos(a) * baseRadius, 0.2, Math.sin(a) * baseRadius);
    // Orient the quill: flare outward in the radial direction.
    q.rotation.order = 'YXZ';
    q.rotation.y = -a + Math.PI / 2; // face outward
    q.rotation.x = 0; // pitched via z below
    q.rotation.z = flareAngle; // outward tilt
    group.add(q);
  }
  return group;
}

/** 16 semi-transparent feather vanes that overlap slightly. */
function buildVanes(featherCount, flareAngle, baseRadius, vaneTex) {
  const group = new THREE.Group();

  // Shape profile: narrow at the base, flaring to a rounded top with a small split tip.
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.06, 0.35, 0.22, 0.9, 0.24, 1.45);
  shape.lineTo(0.1, 1.52);
  shape.lineTo(0.14, 1.48); // small notched tip on one side
  shape.lineTo(0.0, 1.5);
  shape.lineTo(-0.14, 1.48);
  shape.lineTo(-0.1, 1.52);
  shape.lineTo(-0.24, 1.45);
  shape.bezierCurveTo(-0.22, 0.9, -0.06, 0.35, 0, 0);

  const geo = new THREE.ShapeGeometry(shape, 10);
  // Map UVs so the vane texture stretches along the length of the feather.
  const pos = geo.attributes.position;
  const uvs = new Float32Array(pos.count * 2);
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    minX = Math.min(minX, pos.getX(i));
    maxX = Math.max(maxX, pos.getX(i));
    minY = Math.min(minY, pos.getY(i));
    maxY = Math.max(maxY, pos.getY(i));
  }
  for (let i = 0; i < pos.count; i++) {
    uvs[i * 2] = (pos.getX(i) - minX) / (maxX - minX);
    uvs[i * 2 + 1] = (pos.getY(i) - minY) / (maxY - minY);
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const mat = new THREE.MeshStandardMaterial({
    color: FEATHER_WHITE,
    map: vaneTex,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88,
    alphaTest: 0.02,
    depthWrite: false,
  });

  for (let i = 0; i < featherCount; i++) {
    const a = (i / featherCount) * Math.PI * 2;
    const vane = new THREE.Mesh(geo, mat);
    // Plant base at the rim, slightly above the quill root for a natural overlap.
    vane.position.set(Math.cos(a) * baseRadius, 0.21, Math.sin(a) * baseRadius);
    vane.rotation.order = 'YXZ';
    vane.rotation.y = -a + Math.PI / 2;
    vane.rotation.z = flareAngle - 0.04; // match quill, slightly steeper
    // Scale length to match a "real" feather proportion
    vane.scale.set(1.05, 1.0, 1.0);
    group.add(vane);
  }
  return group;
}

/**
 * Cross-lacing threads — the signature X-pattern between feathers.
 * Two zig-zag rings that alternate between inner/outer lace points,
 * creating visual X's when viewed from the side or bottom.
 */
function buildLacing(featherCount, flareAngle, baseRadius) {
  const group = new THREE.Group();

  // Compute the lace ring geometry at two heights along each quill.
  // Because quills flare outward, lace points are at larger radii than the rim.
  const computePoint = (i, heightAlongQuill) => {
    const a = (i / featherCount) * Math.PI * 2;
    // Quill vector in local space: start at (baseRadius, 0.2) and extend outward+up.
    const outward = Math.sin(flareAngle);
    const up = Math.cos(flareAngle);
    const r = baseRadius + outward * heightAlongQuill;
    const y = 0.2 + up * heightAlongQuill;
    return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
  };

  // Two lace rings at different quill heights — each ring is a zig-zag.
  const lacings = [
    { hLow: 0.22, hHigh: 0.38, offset: 0 },
    { hLow: 0.55, hHigh: 0.72, offset: 0 },
  ];

  const mat = new THREE.LineBasicMaterial({
    color: THREAD_COLOR,
    transparent: true,
    opacity: 0.95,
  });

  lacings.forEach(({ hLow, hHigh }) => {
    // Zig A: for each i, segment from low_i -> high_(i+1)
    const ptsA = [];
    const ptsB = [];
    for (let i = 0; i < featherCount; i++) {
      const iNext = (i + 1) % featherCount;
      ptsA.push(computePoint(i, hLow));
      ptsA.push(computePoint(iNext, hHigh));
      ptsB.push(computePoint(i, hHigh));
      ptsB.push(computePoint(iNext, hLow));
    }
    const geoA = new THREE.BufferGeometry().setFromPoints(ptsA);
    const geoB = new THREE.BufferGeometry().setFromPoints(ptsB);
    group.add(new THREE.LineSegments(geoA, mat));
    group.add(new THREE.LineSegments(geoB, mat));
  });

  // A simple continuous ring near the band (ties the feathers together at the base)
  const basePts = [];
  for (let i = 0; i < featherCount; i++) {
    basePts.push(computePoint(i, 0.08));
    basePts.push(computePoint((i + 1) % featherCount, 0.08));
  }
  const baseGeo = new THREE.BufferGeometry().setFromPoints(basePts);
  group.add(new THREE.LineSegments(baseGeo, mat));

  return group;
}

/** Assemble the full shuttlecock. Returns a THREE.Group centered at origin. */
function buildShuttlecock() {
  const group = new THREE.Group();

  const corkTex = makeCorkTexture();
  const vaneTex = makeVaneTexture();

  const FEATHER_COUNT = 16;
  const FLARE = 0.38; // radians — outward tilt of each quill
  const BASE_R = 0.55;
  const QUILL_LEN = 1.55;

  group.add(buildCork(corkTex));
  group.add(buildBand());
  group.add(buildQuills(FEATHER_COUNT, FLARE, BASE_R, QUILL_LEN));
  group.add(buildVanes(FEATHER_COUNT, FLARE, BASE_R, vaneTex));
  group.add(buildLacing(FEATHER_COUNT, FLARE, BASE_R));

  // Dispose helpers so the caller can free GPU memory cleanly
  group.userData.dispose = () => {
    corkTex.dispose();
    vaneTex.dispose();
  };

  return group;
}

/* ── React component ─────────────────────────────────────────────────── */

export default function Shuttlecock3D({
  height = '520px',
  background = 'linear-gradient(180deg, #2b5f9e 0%, #0c2348 100%)',
  autoRotate = true,
  interactive = true,
  className = '',
  style = {},
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0); // transparent — CSS background shows through
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';

    // Scene + camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      32,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.6, 4.6);
    camera.lookAt(0, 0.4, 0);

    // Lights — cool key from front-right, soft fill, rim for feather separation
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 3, 3);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x9cb7d8, 0.8);
    fill.position.set(-3, 1.5, 2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xffffff, 0.9);
    rim.position.set(-1, 4, -4);
    scene.add(rim);

    scene.add(new THREE.AmbientLight(0x3a4a66, 0.8));

    // Shuttlecock
    const shuttle = buildShuttlecock();
    // Angle it slightly so the feather fan is visible from the default camera
    shuttle.rotation.x = -0.15;
    shuttle.position.y = -0.3;
    scene.add(shuttle);

    // Interaction — drag-to-rotate
    const drag = { active: false, lastX: 0, lastY: 0, targetY: 0, targetX: -0.15 };
    let spinY = 0;

    const onPointerDown = (e) => {
      if (!interactive) return;
      drag.active = true;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onPointerUp = () => {
      drag.active = false;
      if (renderer.domElement) renderer.domElement.style.cursor = 'grab';
    };
    const onPointerMove = (e) => {
      if (!drag.active) return;
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      drag.targetY += dx * 0.008;
      drag.targetX = Math.max(-0.9, Math.min(0.9, drag.targetX + dy * 0.005));
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
    };

    if (interactive && !prefersReduce) {
      renderer.domElement.style.cursor = 'grab';
      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointermove', onPointerMove);
    }

    // Resize
    const onResize = () => {
      if (!mount) return;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // Animation loop
    const clock = new THREE.Clock();
    let raf;
    const tick = () => {
      const dt = clock.getDelta();

      if (autoRotate && !prefersReduce) {
        spinY += dt * 0.35; // gentle idle rotation
      }

      shuttle.rotation.y = prefersReduce ? 0.65 : spinY + drag.targetY;
      shuttle.rotation.x = prefersReduce ? -0.15 : drag.targetX + Math.sin(clock.elapsedTime * 0.6) * 0.015;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      if (interactive && !prefersReduce) {
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointermove', onPointerMove);
      }
      shuttle.userData.dispose?.();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate, interactive]);

  return (
    <div
      ref={mountRef}
      className={`shuttlecock-3d ${className}`.trim()}
      style={{
        position: 'relative',
        width: '100%',
        height,
        background,
        borderRadius: 'inherit',
        overflow: 'hidden',
        touchAction: 'none',
        ...style,
      }}
      aria-label="Interactive 3D shuttlecock model"
      role="img"
    />
  );
}

// Cinematic Golden Sparkles Parallax - Shader Edition
// Per-particle twinkle, continuous ember drift, soft bokeh sprites, and
// depth-scaled mouse parallax. Pauses when hero is off-screen.

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const GOLD = new THREE.Color('#c9a84c');
const GOLD_LIGHT = new THREE.Color('#e2c47a');
const GOLD_WARM = new THREE.Color('#f5d58a');
const BG = new THREE.Color('#05060a');

// Soft radial bokeh sprite - generated once, shared across layers.
function makeBokehTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0.0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,245,210,0.85)');
  g.addColorStop(0.55, 'rgba(255,220,140,0.35)');
  g.addColorStop(1.0, 'rgba(255,200,90,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aTwinkleSpeed;
  attribute float aTwinklePhase;
  attribute float aDriftSpeed;
  attribute float aDriftOffset;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSpreadY;
  uniform float uDriftAmp;
  uniform float uMouseX;
  uniform float uMouseY;
  uniform float uParallax;

  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vec3 pos = position;

    // Per-particle continuous upward drift with independent wrap.
    float cycle = aDriftOffset + uTime * aDriftSpeed;
    pos.y += mod(cycle, uSpreadY) - uSpreadY * 0.5;

    // Depth-scaled mouse parallax: particles closer to camera move more.
    float depthFactor = clamp(1.0 - (-pos.z) * 0.04, 0.15, 1.0);
    pos.x += uMouseX * uParallax * depthFactor;
    pos.y += uMouseY * uParallax * depthFactor * -0.6;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Per-particle twinkle phase + speed → no unison pulse.
    float tw = 0.55 + 0.45 * sin(uTime * aTwinkleSpeed + aTwinklePhase);
    vTwinkle = tw;
    vColor = aColor;

    // Size attenuation with pixel-ratio compensation.
    gl_PointSize = aSize * uPixelRatio * (300.0 / -mv.z) * (0.7 + tw * 0.6);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uSprite;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vec4 tex = texture2D(uSprite, gl_PointCoord);
    float a = tex.a * uOpacity * vTwinkle;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * tex.rgb, a);
  }
`;

function buildSparkleLayers(scene, sprite) {
  const layers = [];
  const configs = [
    { count: 450, spreadX: 60, spreadY: 36, size: 14, opacity: 0.14, z: -18 },
    { count: 250, spreadX: 42, spreadY: 26, size: 22, opacity: 0.22, z: -9  },
    { count: 100, spreadX: 26, spreadY: 18, size: 40, opacity: 0.38, z: -2  },
    { count: 30,  spreadX: 14, spreadY: 10, size: 70, opacity: 0.55, z:  2  },
  ];

  configs.forEach((c) => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(c.count * 3);
    const sizes = new Float32Array(c.count);
    const twSpeed = new Float32Array(c.count);
    const twPhase = new Float32Array(c.count);
    const driftSpeed = new Float32Array(c.count);
    const driftOffset = new Float32Array(c.count);
    const colors = new Float32Array(c.count * 3);

    const tmp = new THREE.Color();
    for (let i = 0; i < c.count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * c.spreadX;
      positions[i * 3 + 1] = (Math.random() - 0.5) * c.spreadY;
      positions[i * 3 + 2] = c.z + (Math.random() - 0.5) * 4;

      sizes[i] = c.size * (0.55 + Math.random() * 0.9);
      twSpeed[i] = 0.6 + Math.random() * 2.4;
      twPhase[i] = Math.random() * Math.PI * 2;
      driftSpeed[i] = 0.08 + Math.random() * 0.22;
      driftOffset[i] = Math.random() * c.spreadY;

      // Chromatic variance: mix along the three golds.
      const t = Math.random();
      if (t < 0.55) tmp.copy(GOLD_LIGHT);
      else if (t < 0.85) tmp.copy(GOLD);
      else tmp.copy(GOLD_WARM);
      const jitter = 0.85 + Math.random() * 0.3;
      colors[i * 3]     = tmp.r * jitter;
      colors[i * 3 + 1] = tmp.g * jitter;
      colors[i * 3 + 2] = tmp.b * jitter;
    }

    geo.setAttribute('position',       new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize',          new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aTwinkleSpeed',  new THREE.BufferAttribute(twSpeed, 1));
    geo.setAttribute('aTwinklePhase',  new THREE.BufferAttribute(twPhase, 1));
    geo.setAttribute('aDriftSpeed',    new THREE.BufferAttribute(driftSpeed, 1));
    geo.setAttribute('aDriftOffset',   new THREE.BufferAttribute(driftOffset, 1));
    geo.setAttribute('aColor',         new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSpreadY:    { value: c.spreadY },
        uDriftAmp:   { value: 1 },
        uMouseX:     { value: 0 },
        uMouseY:     { value: 0 },
        uParallax:   { value: 0.9 },
        uSprite:     { value: sprite },
        uOpacity:    { value: c.opacity },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);
    layers.push({ mesh: points, config: c });
  });

  return layers;
}

export default function Hero3DParallax() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isLowEnd = (navigator.hardwareConcurrency || 4) <= 4;
    const dpr = Math.min(window.devicePixelRatio, isLowEnd ? 1.5 : 2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(BG, 0);
    mount.appendChild(renderer.domElement);

    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const sprite = makeBokehTexture();
    const sparkleLayers = buildSparkleLayers(scene, sprite);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const scrollState = { v: 0 };

    const onPointerMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!prefersReduce) window.addEventListener('pointermove', onPointerMove, { passive: true });

    const scrollTween = prefersReduce ? null : gsap.to(scrollState, {
      v: 1,
      ease: 'none',
      scrollTrigger: { trigger: mount, start: 'top top', end: 'bottom top', scrub: true },
    });

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      sparkleLayers.forEach((l) => {
        l.mesh.material.uniforms.uPixelRatio.value = dpr;
      });
    };
    window.addEventListener('resize', onResize);

    // Pause RAF when hero is off-screen.
    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) tick();
    }, { threshold: 0 });
    io.observe(mount);

    const clock = new THREE.Clock();
    let raf = null;

    const tick = () => {
      if (!visible) { raf = null; return; }
      const time = clock.getElapsedTime();

      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;

      if (!prefersReduce) {
        camera.position.x = mouse.x * 0.6;
        camera.position.y = mouse.y * -0.35;
        camera.lookAt(0, 0, 0);
      }

      sparkleLayers.forEach((layer, i) => {
        const u = layer.mesh.material.uniforms;
        u.uTime.value = time;
        u.uMouseX.value = mouse.x;
        u.uMouseY.value = mouse.y;

        // Depth-scaled scroll rotation - far layers drift slower.
        layer.mesh.rotation.y = time * (0.008 + i * 0.004) + scrollState.v * 0.35;
        layer.mesh.rotation.x = mouse.y * 0.06;
      });

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      scrollTween?.scrollTrigger?.kill();
      scrollTween?.kill();
      sprite.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="hero-sparkles-canvas"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    />
  );
}

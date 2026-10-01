"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface MagiVizProps {
  /** 0..1 normalized score throughput — drives flow height + mesh energy */
  activity: number;
  /** online player count — drives bar pulse */
  online: number;
  /** emergency mode — whole scene goes red */
  emergency: boolean;
  height?: number;
}

/**
 * MAGI yield-topology viewport, ported from TheGreatGildo/nerv-ui demo.html:
 * cyan wireframe data mesh with vertex digits, 30 orange flow curves with
 * pulsing tip dots, flanking bar columns, green depth particles, slow orbit.
 */
export function MagiViz({ activity, online, emergency, height = 420 }: MagiVizProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const live = useRef({ activity, online, emergency });
  live.current = { activity, online, emergency };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
    camera.position.set(0, 6, 12);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const resize = () => {
      const r = container.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
      renderer.setSize(r.width, r.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ── 1. DATA MESH ──
    const MC = 16;
    const MR = 10;
    const meshGeo = new THREE.PlaneGeometry(11, 7, MC, MR);
    const meshMat = new THREE.MeshBasicMaterial({
      color: 0x20f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const dataMesh = new THREE.Mesh(meshGeo, meshMat);
    dataMesh.rotation.x = -Math.PI / 2;
    scene.add(dataMesh);

    const mPos = meshGeo.attributes.position as THREE.BufferAttribute;
    const baseH = new Float32Array(mPos.count);
    for (let i = 0; i < mPos.count; i++) {
      const x = mPos.getX(i);
      const z = mPos.getY(i);
      baseH[i] =
        Math.sin(x * 0.5) * Math.cos(z * 0.8) * 0.4 + Math.sin(x * 1.2 + z * 0.3) * 0.2;
    }

    // ── 2. VERTEX DIGIT LABELS ──
    const digitTex: THREE.CanvasTexture[] = [];
    for (let d = 0; d <= 9; d++) {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 44px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(d.toString(), 32, 32);
      digitTex.push(new THREE.CanvasTexture(c));
    }
    const labels: { sp: THREE.Sprite; idx: number }[] = [];
    const step = 2;
    for (let r = 0; r <= MR; r += step) {
      for (let c = 0; c <= MC; c += step) {
        const idx = r * (MC + 1) + c;
        const digit = (c / step + r / step) % 10;
        const sm = new THREE.SpriteMaterial({
          map: digitTex[digit],
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        });
        const sp = new THREE.Sprite(sm);
        sp.scale.set(0.32, 0.32, 1);
        sp.position.set(mPos.getX(idx), 0.12, -mPos.getY(idx));
        scene.add(sp);
        labels.push({ sp, idx });
      }
    }
    // red accent digits on right edge
    for (let r = 0; r <= MR; r += step) {
      const idx = r * (MC + 1) + MC;
      const rc = document.createElement("canvas");
      rc.width = 64;
      rc.height = 64;
      const rctx = rc.getContext("2d")!;
      rctx.fillStyle = "#FF3060";
      rctx.font = "bold 44px monospace";
      rctx.textAlign = "center";
      rctx.textBaseline = "middle";
      rctx.fillText(String(r % 10), 32, 32);
      const rsp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(rc),
          transparent: true,
          opacity: 0.7,
          depthWrite: false,
        })
      );
      rsp.scale.set(0.35, 0.35, 1);
      rsp.position.set(mPos.getX(idx) + 0.3, 0.12, -mPos.getY(idx));
      scene.add(rsp);
    }

    // ── 3. FLOW CURVES ──
    interface Flow {
      line: THREE.Line;
      geo: THREE.BufferGeometry;
      positions: Float32Array;
      dot: THREE.Mesh;
      dm: THREE.MeshBasicMaterial;
      lm: THREE.LineBasicMaterial;
      bx: number;
      bz: number;
      mh: number;
      ns: number;
      ph: number;
      fx: number;
      fz: number;
      sp: number;
      ax: number;
      az: number;
    }
    const NUM_FLOWS = 30;
    const flows: Flow[] = [];
    for (let i = 0; i < NUM_FLOWS; i++) {
      const bx = (Math.random() - 0.5) * 7;
      const bz = (Math.random() - 0.5) * 4;
      const mh = 2.5 + Math.random() * 4;
      const ns = 35 + Math.floor(Math.random() * 15);
      const positions = new Float32Array((ns + 1) * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const bright = 0.45 + Math.random() * 0.45;
      const lm = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(0.06, 1, bright),
        transparent: true,
        opacity: bright,
      });
      const line = new THREE.Line(geo, lm);
      scene.add(line);
      const dm = new THREE.MeshBasicMaterial({ color: 0xff9830 });
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), dm);
      scene.add(dot);
      flows.push({
        line, geo, positions, dot, dm, lm, bx, bz, mh, ns,
        ph: Math.random() * Math.PI * 2,
        fx: 1.5 + Math.random() * 2,
        fz: 1 + Math.random() * 1.5,
        sp: 0.2 + Math.random() * 0.35,
        ax: 0.3 + Math.random() * 1.0,
        az: 0.2 + Math.random() * 0.7,
      });
    }

    // ── 4. BAR COLUMNS ──
    function createBars(xPos: number, data: { h: number; w?: number; o?: number }[]) {
      const group = new THREE.Group();
      group.position.set(xPos, 0, 0);
      const bars: THREE.Mesh[] = [];
      let yOff = 0;
      data.forEach((d) => {
        const h = d.h;
        const w = d.w || 0.4;
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, 0.15),
          new THREE.MeshBasicMaterial({ color: 0xff9830, transparent: true, opacity: d.o || 0.7 })
        );
        bar.position.set(0, yOff + h / 2, 0);
        group.add(bar);
        const wire = new THREE.Mesh(
          new THREE.BoxGeometry(w + 0.04, h + 0.04, 0.19),
          new THREE.MeshBasicMaterial({ color: 0xff9830, wireframe: true, transparent: true, opacity: 0.25 })
        );
        wire.position.copy(bar.position);
        group.add(wire);
        const ghost = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, h * 0.6, 0.08),
          new THREE.MeshBasicMaterial({ color: 0xff9830, wireframe: true, transparent: true, opacity: 0.12 })
        );
        ghost.position.set(bar.position.x + 0.45, bar.position.y, bar.position.z);
        group.add(ghost);
        bars.push(bar);
        yOff += h + 0.12;
      });
      scene.add(group);
      return bars;
    }
    const leftBars = createBars(-6.8, [
      { h: 3.0, w: 0.55, o: 0.8 }, { h: 1.8, w: 0.55, o: 0.7 },
      { h: 1.3, w: 0.55, o: 0.6 }, { h: 0.3, w: 0.2, o: 0.2 },
      { h: 2.2, w: 0.35, o: 0.5 }, { h: 0.8, w: 0.3, o: 0.4 },
      { h: 1.5, w: 0.4, o: 0.55 }, { h: 0.5, w: 0.25, o: 0.3 },
    ]);
    const rightBars = createBars(6.8, [
      { h: 2.0, w: 0.45, o: 0.7 }, { h: 2.8, w: 0.55, o: 0.8 },
      { h: 1.0, w: 0.3, o: 0.5 }, { h: 1.6, w: 0.4, o: 0.55 },
      { h: 0.6, w: 0.25, o: 0.35 }, { h: 2.4, w: 0.5, o: 0.7 },
      { h: 0.9, w: 0.3, o: 0.4 }, { h: 1.8, w: 0.45, o: 0.6 },
    ]);

    // ── 5. BACKGROUND PARTICLES ──
    const bgN = 180;
    const bgPos = new Float32Array(bgN * 3);
    for (let i = 0; i < bgN; i++) {
      bgPos[i * 3] = (Math.random() - 0.5) * 35;
      bgPos[i * 3 + 1] = Math.random() * 18;
      bgPos[i * 3 + 2] = (Math.random() - 0.5) * 25 - 5;
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
    scene.add(
      new THREE.Points(
        bgGeo,
        new THREE.PointsMaterial({ color: 0x20ff60, size: 0.07, transparent: true, opacity: 0.35 })
      )
    );

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = Date.now() * 0.001;
      const { activity: act, online: onl, emergency: em } = live.current;
      const energy = 0.35 + act * 1.3;

      camera.position.x = Math.sin(t * 0.055) * 4;
      camera.position.y = 5.5 + Math.sin(t * 0.035) * 0.6;
      camera.position.z = 11 + Math.cos(t * 0.055) * 2.5;
      camera.lookAt(0, 1.5, 0);

      meshMat.color.setHex(em ? 0xff3030 : 0x20f0ff);
      for (let i = 0; i < mPos.count; i++) {
        const x = mPos.getX(i);
        const z = mPos.getY(i);
        mPos.setZ(
          i,
          baseH[i] * energy +
            Math.sin(x * 0.3 + t * 0.5) * 0.1 * energy +
            Math.cos(z * 0.5 + t * 0.3) * 0.06 +
            Math.sin(x * 0.8 + z * 0.4 + t * 0.8) * 0.04
        );
      }
      mPos.needsUpdate = true;
      labels.forEach((l) => {
        l.sp.position.y = mPos.getZ(l.idx) + 0.15;
      });

      const flowHue = em ? 0xff3030 : 0xff6020;
      const hScale = 0.45 + act * 1.1;
      flows.forEach((f) => {
        for (let j = 0; j <= f.ns; j++) {
          const frac = j / f.ns;
          const idx = j * 3;
          const y = frac * f.mh * hScale;
          f.positions[idx] =
            f.bx +
            Math.sin(frac * Math.PI * f.fx + f.ph + t * f.sp) * f.ax * frac +
            Math.sin(frac * Math.PI * 3.5 + t * f.sp * 1.5) * 0.15 * frac;
          f.positions[idx + 1] = y;
          f.positions[idx + 2] =
            f.bz +
            Math.cos(frac * Math.PI * f.fz + f.ph * 0.7 + t * f.sp * 0.8) * f.az * frac +
            Math.cos(frac * Math.PI * 2.8 + t * f.sp * 1.2) * 0.1 * frac;
        }
        f.geo.attributes.position.needsUpdate = true;
        f.lm.color.setHex(flowHue);
        const li = f.ns * 3;
        f.dot.position.set(f.positions[li], f.positions[li + 1], f.positions[li + 2]);
        f.dm.color.setHex(em ? 0xff3030 : 0xff9830);
        f.dot.scale.setScalar(0.8 + Math.sin(t * 3 + f.ph) * 0.3);
      });

      const pulse = Math.min(0.12, 0.02 + onl * 0.004);
      leftBars.forEach((b, i) => {
        b.scale.y = 1 + Math.sin(t * 1.5 + i * 0.8) * pulse;
      });
      rightBars.forEach((b, i) => {
        b.scale.y = 1 + Math.sin(t * 1.2 + i * 0.6 + 1) * pulse;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
      digitTex.forEach((tx) => tx.dispose());
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ height }}
      className="relative w-full overflow-hidden bg-black [&_canvas]:block [&_canvas]:h-full [&_canvas]:w-full"
    />
  );
}

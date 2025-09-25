"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

// Utility function
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter id="container-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence"/>
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise"/>
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced"/>
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur"/>
          <feComposite in="finalBlur" in2="finalBlur" operator="over"/>
        </filter>
      </defs>
    </svg>
  );
}

const LiquidButton = ({ className, children }: any) => {
  return (
    <button className={cn("relative px-8 py-3 rounded-full border text-white hover:scale-105 transition-all", className)}>
      {children}
      <GlassFilter />
    </button>
  );
};

export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>({});

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = { time: { value: 0 }, resolution: { value: [window.innerWidth, window.innerHeight] } };

    const vertexShader = `attribute vec3 position; void main(){ gl_Position = vec4(position,1.0); }`;
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      void main(){
        vec2 p = (gl_FragCoord.xy*2.0 - resolution)/min(resolution.x,resolution.y);
        float r = 0.05/abs(p.y+sin((p.x+time)*1.0)*0.5);
        float g = 0.05/abs(p.y+sin(p.x*1.0)*0.5);
        float b = 0.05/abs(p.y+sin((p.x- time)*1.0)*0.5);
        gl_FragColor=vec4(r,g,b,1.0);
      }
    `;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
      -1,-1,0, 1,-1,0, -1,1,0, 1,-1,0, -1,1,0, 1,1,0
    ]), 3));

    const material = new THREE.RawShaderMaterial({ vertexShader, fragmentShader, uniforms, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    sceneRef.current = { scene, camera, renderer, mesh, uniforms };

    const animate = () => {
      uniforms.time.value += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      uniforms.resolution.value = [window.innerWidth, window.innerHeight];
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full block"/>;
}

export default function App() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <WebGLShader />
      <div className="relative border border-[#27272a] p-2 w-full mx-auto max-w-3xl">
        <main className="relative border border-[#27272a] py-10 overflow-hidden">
          <h1 className="mb-3 text-white text-center text-7xl font-extrabold tracking-tighter md:text-[clamp(2rem,8vw,7rem)]">
            Blendd x Vidreiro
          </h1>
          <p className="text-white/60 px-6 text-center text-xs md:text-sm lg:text-lg">
            Unleashing creativity through bold visuals, seamless interfaces, and limitless possibilities.
          </p>
          <div className="my-8 flex items-center justify-center gap-1">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <p className="text-xs text-green-500">Available for New Projects</p>
          </div>
          <div className="flex justify-center">
            <LiquidButton>Let's Go</LiquidButton>
          </div>
        </main>
      </div>
    </div>
  );
}

"use client"

import React, { useEffect, useRef } from 'react';

// Backdrop: a faint crosshair-marker grid — thin intersecting lines that
// fade between nodes, with a brighter "+" mark at each intersection.
// Pure screen-space 2D, independent of the 3D camera, so it lives on its
// own canvas beneath Model's canvas rather than being redrawn every frame
// inside the model's render loop.
export default function BackgroundGrid() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const VW = window.innerWidth;
      const VH = window.innerHeight;

      canvas!.width = Math.round(VW * dpr);
      canvas!.height = Math.round(VH * dpr);
      canvas!.style.width = `${VW}px`;
      canvas!.style.height = `${VH}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, VW, VH);

      const target = 18; // denser, smaller cells
      const cell = Math.max(56, Math.round(VW / target));
      const ox = (VW % cell) / 2; // centre the lattice
      const oy = (VH % cell) / 2;
      const arm = Math.min(6, cell * 0.09); // half-length of each plus arm

      // faint connecting lines, brightest near the nodes and fading mid-span
      ctx!.lineWidth = 1;
      for (let x = ox; x <= VW + 1; x += cell) {
        const grad = ctx!.createLinearGradient(0, 0, 0, VH);
        grad.addColorStop(0, 'rgba(200, 210, 220, 0.07)');
        grad.addColorStop(0.5, 'rgba(200, 210, 220, 0.02)');
        grad.addColorStop(1, 'rgba(200, 210, 220, 0.07)');
        ctx!.strokeStyle = grad;
        ctx!.beginPath();
        ctx!.moveTo(Math.round(x) + 0.5, 0);
        ctx!.lineTo(Math.round(x) + 0.5, VH);
        ctx!.stroke();
      }
      for (let y = oy; y <= VH + 1; y += cell) {
        const grad = ctx!.createLinearGradient(0, 0, VW, 0);
        grad.addColorStop(0, 'rgba(200, 210, 220, 0.07)');
        grad.addColorStop(0.5, 'rgba(200, 210, 220, 0.02)');
        grad.addColorStop(1, 'rgba(200, 210, 220, 0.07)');
        ctx!.strokeStyle = grad;
        ctx!.beginPath();
        ctx!.moveTo(0, Math.round(y) + 0.5);
        ctx!.lineTo(VW, Math.round(y) + 0.5);
        ctx!.stroke();
      }

      // "+" plus mark at every intersection
      ctx!.strokeStyle = 'rgba(235, 242, 248, 0.30)';
      ctx!.lineWidth = 1.2;
      ctx!.beginPath();
      for (let x = ox; x <= VW + 1; x += cell) {
        const px = Math.round(x) + 0.5;
        for (let y = oy; y <= VH + 1; y += cell) {
          const py = Math.round(y) + 0.5;
          ctx!.moveTo(px - arm, py);
          ctx!.lineTo(px + arm, py);
          ctx!.moveTo(px, py - arm);
          ctx!.lineTo(px, py + arm);
        }
      }
      ctx!.stroke();
    }

    draw();
    window.addEventListener('resize', draw, { passive: true });
    return () => window.removeEventListener('resize', draw);
  }, []);

  return <canvas ref={canvasRef} className="background-grid-canvas" />;
}

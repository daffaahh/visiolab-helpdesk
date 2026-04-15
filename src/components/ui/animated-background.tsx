"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Logic Fortress: Setup parameter partikel
    const particles: { x: number; y: number; vx: number; vy: number }[] = [];
    const particleCount = 70; // Kepadatan garis
    const connectionDistance = 150; // Jarak maksimal partikel buat nyambung

    // Init partikel di titik random
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5, // Kecepatan gerak X (lambat)
        vy: (Math.random() - 0.5) * 0.5, // Kecepatan gerak Y (lambat)
      });
    }

    let animationFrameId: number;

    const render = () => {
      // Clear canvas setiap frame
      ctx.clearRect(0, 0, width, height);

      // Gambar background dasar (slate-950)
      ctx.fillStyle = "#020617"; 
      ctx.fillRect(0, 0, width, height);

      // Update kordinat dan gambar garis
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Mantul kalau nabrak tembok (edge collision)
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Cek jarak dengan partikel lain untuk nyambungin garis
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            // Opacity dinamis: makin deket, garis makin tebel/jelas
            const opacity = 1 - distance / connectionDistance;
            // Warna garis: Slate-800 dengan alpha (biar subtle di atas background hitam)
            ctx.strokeStyle = `rgba(30, 41, 59, ${opacity * 0.8})`; 
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Handle resize layar biar canvas nggak gepeng
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    // SOP: Wajib bersihin memory leak pas component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none" // pointer-events-none biar ga nge-block klik ke form
    />
  );
}
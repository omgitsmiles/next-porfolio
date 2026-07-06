'use client'

import { useEffect, useRef } from "react";
import { MONO } from "./theme";

type Star = { x: number; y: number; z: number; pz: number };

export function Screensaver({ onDismiss }: { onDismiss: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = (canvas.width  = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const NUM   = 260;
    const SPEED = 12;

    const stars: Star[] = Array.from({ length: NUM }, () => {
      const z = Math.random() * W;
      return { x: (Math.random() - 0.5) * W * 2, y: (Math.random() - 0.5) * H * 2, z, pz: z };
    });

    let animId: number;

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.20)";
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        s.pz = s.z;
        s.z -= SPEED;
        if (s.z <= 0) {
          s.x  = (Math.random() - 0.5) * W * 2;
          s.y  = (Math.random() - 0.5) * H * 2;
          s.z  = W;
          s.pz = W;
        }

        const sx = (s.x / s.z)  * W + W / 2;
        const sy = (s.y / s.z)  * H + H / 2;
        const px = (s.x / s.pz) * W + W / 2;
        const py = (s.y / s.pz) * H + H / 2;

        const alpha = Math.min(1, (1 - s.z / W) * 1.4);
        const size  = Math.max(0.3, (1 - s.z / W) * 2.8);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
        ctx.lineWidth   = size;
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onKey = () => onDismiss();
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      className="fixed inset-0 z-[5000] cursor-none animate-[fade-in_0.6s_ease]"
    >
      <canvas ref={canvasRef} className="block" />
      <div
        className="absolute bottom-[8%] w-full text-center text-[10px] tracking-[0.28em] select-none text-[rgba(255,255,255,0.22)]"
        style={{ fontFamily: MONO }}
      >
        CLICK OR PRESS ANY KEY — paoloOS 3.5.0
      </div>
    </div>
  );
}

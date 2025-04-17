"use client";

import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Wave class for elegant sound wave visualization
    class Wave {
      amplitude: number;
      frequency: number;
      phase: number;
      speed: number;
      color: string;
      lineWidth: number;

      constructor(
        amplitude: number,
        frequency: number,
        phase: number,
        speed: number,
        color: string,
        lineWidth: number,
      ) {
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.phase = phase;
        this.speed = speed;
        this.color = color;
        this.lineWidth = lineWidth;
      }

      draw(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        time: number,
      ) {
        ctx.beginPath();
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;

        const y = height / 2;

        for (let x = 0; x < width; x += 5) {
          const dx = x / width;
          const offsetY =
            Math.sin(dx * this.frequency + time * this.speed + this.phase) *
            this.amplitude;

          if (x === 0) {
            ctx.moveTo(x, y + offsetY);
          } else {
            ctx.lineTo(x, y + offsetY);
          }
        }

        ctx.stroke();
      }
    }

    // Initialize waves
    const waves: Wave[] = [];

    // Define initWaves function before it's used in resizeCanvas
    const initWaves = () => {
      waves.length = 0;

      // Fewer, more elegant waves
      waves.push(
        new Wave(
          canvas.height * 0.03, // Smaller amplitude
          Math.PI * 2,
          0,
          0.2,
          "rgba(30, 215, 96, 0.1)", // Very subtle green
          1.5,
        ),
      );

      waves.push(
        new Wave(
          canvas.height * 0.02,
          Math.PI * 3,
          Math.PI / 4,
          0.15,
          "rgba(30, 215, 96, 0.07)", // Even more subtle
          1,
        ),
      );

      waves.push(
        new Wave(
          canvas.height * 0.015,
          Math.PI * 4,
          Math.PI / 2,
          0.1,
          "rgba(255, 255, 255, 0.03)", // Almost invisible white
          0.5,
        ),
      );
    };

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initWaves(); // Now initWaves is defined before it's called
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background - more subtle
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0a0a0a"); // Darker, more elegant black
      gradient.addColorStop(1, "#111111");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      const time = Date.now() * 0.001;
      waves.forEach((wave) => {
        wave.draw(ctx, canvas.width, canvas.height, time);
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
}

'use client';

import { useEffect, useRef } from 'react';

/**
 * Global ambient background: a dot grid + soft glow orbs + a subtle drifting
 * particle canvas. Fixed behind all content (-z-10), non-interactive. Respects
 * prefers-reduced-motion and pauses when the tab is hidden.
 */
export function BackgroundFX() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let w = 0;
        let h = 0;
        let raf = 0;

        type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
        const particles: P[] = [];
        const COUNT = 48;

        const resize = () => {
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const seed = () => {
            particles.length = 0;
            for (let i = 0; i < COUNT; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.12,
                    vy: (Math.random() - 0.5) * 0.12,
                    r: Math.random() * 1.3 + 0.4,
                    a: Math.random() * 0.35 + 0.08,
                });
            }
        };

        const render = (move: boolean) => {
            ctx.clearRect(0, 0, w, h);
            for (const p of particles) {
                if (move) {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0) p.x = w;
                    else if (p.x > w) p.x = 0;
                    if (p.y < 0) p.y = h;
                    else if (p.y > h) p.y = 0;
                }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(150,178,255,${p.a})`;
                ctx.fill();
            }
        };

        const loop = () => {
            render(true);
            raf = requestAnimationFrame(loop);
        };

        resize();
        seed();
        if (reduce) {
            render(false); // draw once, no motion
        } else {
            raf = requestAnimationFrame(loop);
        }

        const onResize = () => {
            resize();
            seed();
            if (reduce) render(false);
        };
        const onVisibility = () => {
            if (document.hidden) {
                cancelAnimationFrame(raf);
            } else if (!reduce) {
                raf = requestAnimationFrame(loop);
            }
        };

        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    return (
        <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* dot grid */}
            <div className="absolute inset-0 bg-dot-grid" />
            {/* soft glow orbs */}
            <div className="absolute -top-48 right-[6%] w-[540px] h-[540px] rounded-full bg-primary/10 blur-[130px]" />
            <div className="absolute bottom-[-12%] left-[2%] w-[480px] h-[480px] rounded-full bg-teal-400/10 blur-[130px]" />
            {/* drifting particles */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
        </div>
    );
}
